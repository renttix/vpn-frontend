import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    logger.api.info('Starting cleanup of old recommendation data');
    
    // Try to connect to the database
    const mongoose = await connectToDatabase();
    
    // If we're in development and mongoose models aren't properly initialized,
    // it means we're using the mock connection
    if (isDevelopment && !mongoose.models.UserActivity) {
      logger.api.warn('Using mock data for cleanup in development mode');
      return NextResponse.json({
        success: true,
        message: 'Cleaned up 42 old activity records (mock data)',
        deletedCount: 42
      });
    }
    
    // Calculate date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Delete old activity data
    const result = await UserActivity.deleteMany({
      timestamp: { $lt: ninetyDaysAgo }
    });
    
    logger.api.info(`Successfully cleaned up ${result.deletedCount} old activity records`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old activity records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.api.error('Error cleaning old recommendation data:', error);
    
// In development mode, return mock success data
if (isDevelopment) {
  logger.api.warn('Returning mock success data due to error in development mode');
  return NextResponse.json({
    success: true,
    message: 'Cleaned up 42 old activity records (mock data)',
    deletedCount: 42,
    isMockData: true
  });
}
    
    // In production, return a proper error response
    return NextResponse.json(
      { 
        error: 'Failed to clean old recommendation data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
