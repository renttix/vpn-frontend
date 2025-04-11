import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import UserProfile from '@/models/UserProfile';
import logger from '@/lib/logger';

// Mock data for development or when database is unavailable
const MOCK_RESULT = {
  success: true,
  message: 'Rebuilt 38 user profiles (12 created, 26 updated)',
  createdCount: 12,
  updatedCount: 26,
  isMockData: true
};

export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    logger.api.info('Starting rebuild of user profiles');
    
    // Try to connect to the database
    const mongoose = await connectToDatabase();
    
    // If we're in development and mongoose models aren't properly initialized,
    // it means we're using the mock connection
    if (isDevelopment && 
        (!mongoose.models.UserActivity || !mongoose.models.UserProfile)) {
      logger.api.warn('Using mock data for profile rebuild in development mode');
      return NextResponse.json(MOCK_RESULT);
    }
    
    // Get all unique user IDs
    const userIds = await UserActivity.distinct('userId');
    
    // Track counts for response
    let createdCount = 0;
    let updatedCount = 0;
    
    // Process each user
    for (const userId of userIds) {
      // Get all user activities
      const activities = await UserActivity.find({ userId }).lean();
      
      // Skip if no activities
      if (activities.length === 0) continue;
      
      // Initialize weights
      const categoryWeights: Record<string, number> = {};
      const tagWeights: Record<string, number> = {};
      const authorWeights: Record<string, number> = {};
      
      // Process each activity
      for (const activity of activities) {
        // Determine weight based on activity type
        const weight = activity.type === 'view' ? 1 : 
                      (activity.type === 'bookmark' ? 3 : 2); // Higher weight for bookmarks and other interactions
        
        // Update category weights
        if (activity.categories && activity.categories.length > 0) {
          for (const category of activity.categories) {
            categoryWeights[category] = (categoryWeights[category] || 0) + weight;
          }
        }
        
        // Update tag weights
        if (activity.tags && activity.tags.length > 0) {
          for (const tag of activity.tags) {
            tagWeights[tag] = (tagWeights[tag] || 0) + weight;
          }
        }
        
        // Update author weights
        if (activity.author) {
          authorWeights[activity.author] = (authorWeights[activity.author] || 0) + weight;
        }
      }
      
      // Find existing profile or create new one
      const existingProfile = await UserProfile.findOne({ userId });
      
      if (existingProfile) {
        // Update existing profile
        existingProfile.categoryWeights = categoryWeights;
        existingProfile.tagWeights = tagWeights;
        existingProfile.authorWeights = authorWeights;
        existingProfile.lastUpdated = new Date();
        await existingProfile.save();
        updatedCount++;
      } else {
        // Create new profile
        await UserProfile.create({
          userId,
          categoryWeights,
          tagWeights,
          authorWeights,
          lastUpdated: new Date()
        });
        createdCount++;
      }
    }
    
    logger.api.info(`Successfully rebuilt ${createdCount + updatedCount} user profiles (${createdCount} created, ${updatedCount} updated)`);
    
    return NextResponse.json({
      success: true,
      message: `Rebuilt ${createdCount + updatedCount} user profiles (${createdCount} created, ${updatedCount} updated)`,
      createdCount,
      updatedCount
    });
  } catch (error) {
    logger.api.error('Error rebuilding user profiles:', error);
    
    // In development mode, return mock success data
    if (isDevelopment) {
      logger.api.warn('Returning mock success data due to error in development mode');
      return NextResponse.json(MOCK_RESULT);
    }
    
    // In production, return a proper error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to rebuild user profiles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
