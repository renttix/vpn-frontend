import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// Skip static generation for this API route
export const config = {
  api: {
    bodyParser: true,
  },
};
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Parse the subscription data
    let subscription;
    try {
      subscription = await request.json();
    } catch (error) {
      logger.api.error('Failed to parse unsubscribe data', { error });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate the subscription object
    if (!subscription || !subscription.endpoint) {
      logger.api.warn('Invalid unsubscribe request', { 
        subscription: subscription ? JSON.stringify(subscription).substring(0, 100) : 'null' 
      });
      return NextResponse.json(
        { error: 'Invalid subscription object: missing endpoint' },
        { status: 400 }
      );
    }

    // Connect to the database
    try {
      await connectToDatabase();
    } catch (error) {
      logger.api.error('Failed to connect to database for unsubscribe', { error });
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Option 1: Hard delete - Find and remove the subscription
    let result;
    try {
      result = await Subscription.deleteOne({ 
        endpoint: subscription.endpoint 
      });
    } catch (error) {
      logger.api.error('Error removing subscription', { 
        endpoint: subscription.endpoint.substring(0, 30) + '...',
        error 
      });
      return NextResponse.json(
        { error: 'Failed to remove subscription from database' },
        { status: 500 }
      );
    }

    const removed = result.deletedCount > 0;
    
    if (removed) {
      logger.api.info('Subscription removed from database', {
        endpoint: subscription.endpoint.substring(0, 30) + '...'
      });
    } else {
      // Option 2: Soft delete - If not found for hard delete, try to mark as inactive
      try {
        const updateResult = await Subscription.updateOne(
          { endpoint: subscription.endpoint },
          { 
            $set: { 
              active: false,
              lastSeen: new Date()
            } 
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          logger.api.info('Subscription marked as inactive', {
            endpoint: subscription.endpoint.substring(0, 30) + '...'
          });
          return NextResponse.json({ 
            success: true, 
            removed: false,
            deactivated: true
          });
        } else {
          logger.api.info('Subscription not found in database', {
            endpoint: subscription.endpoint.substring(0, 30) + '...'
          });
        }
      } catch (error) {
        logger.api.warn('Error marking subscription as inactive', { error });
        // Continue with the response even if this fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      removed,
      deactivated: false
    });
  } catch (error: any) {
    logger.api.error('Unexpected error unsubscribing', { 
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
