import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import UserProfile from '@/models/UserProfile';
import logger from '@/lib/logger';

// Mock data for development or when database is unavailable
const MOCK_DATA = {
  activityCount: 125,
  viewCount: 98,
  uniqueUserCount: 42,
  uniqueArticleCount: 15,
  profileCount: 38,
  recentActivity: Array(10).fill(null).map((_, i) => ({
    userId: `mock-user-${i}`,
    articleId: `mock-article-${i}`,
    type: i % 3 === 0 ? 'view' : i % 3 === 1 ? 'bookmark' : 'like',
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    categories: [`category-${i % 5}`],
    tags: [`tag-${i % 8}`],
    author: `author-${i % 3}`
  })),
  topUsers: Array(10).fill(null).map((_, i) => ({
    _id: `mock-user-${i}`,
    count: 50 - i * 4
  })),
  topArticles: Array(10).fill(null).map((_, i) => ({
    _id: `mock-article-${i}`,
    count: 30 - i * 2
  })),
  isMockData: true // Flag to indicate this is mock data
};

export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    logger.api.info('Fetching recommendation stats');
    
    // Try to connect to the database
    const mongoose = await connectToDatabase();
    
    // If we're in development and mongoose models aren't properly initialized,
    // it means we're using the mock connection
    if (isDevelopment && 
        (!mongoose.models.UserActivity || !mongoose.models.UserProfile)) {
      logger.api.warn('Using mock data for recommendation stats in development mode');
      return NextResponse.json(MOCK_DATA);
    }
    
    // Get activity counts
    const activityCount = await UserActivity.countDocuments();
    const viewCount = await UserActivity.countDocuments({ type: 'view' });
    const uniqueUsers = await UserActivity.distinct('userId');
    const uniqueArticles = await UserActivity.distinct('articleId');
    
    // Get profile count
    const profileCount = await UserProfile.countDocuments();
    
    // Get recent activity
    const recentActivity = await UserActivity.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
    
    // Get top users by activity
    const topUsers = await UserActivity.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top articles by views
    const topArticles = await UserActivity.aggregate([
      { $match: { type: 'view' } },
      { $group: { _id: '$articleId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const responseData = {
      activityCount,
      viewCount,
      uniqueUserCount: uniqueUsers.length,
      uniqueArticleCount: uniqueArticles.length,
      profileCount,
      recentActivity,
      topUsers,
      topArticles
    };
    
    logger.api.info('Successfully fetched recommendation stats');
    return NextResponse.json(responseData);
  } catch (error) {
    logger.api.error('Error fetching recommendation stats:', error);
    
    // In development mode, return mock data instead of an error
    if (isDevelopment) {
      logger.api.warn('Returning mock data due to error in development mode');
      return NextResponse.json(MOCK_DATA);
    }
    
    // In production, return a proper error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch recommendation stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
