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
      logger.api.error('Failed to parse subscription data', { error });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate the subscription object
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      logger.api.warn('Invalid subscription object received', { 
        subscription: subscription ? JSON.stringify(subscription).substring(0, 100) : 'null' 
      });
      return NextResponse.json(
        { error: 'Invalid subscription object: missing endpoint or keys' },
        { status: 400 }
      );
    }

    // Validate keys
    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      logger.api.warn('Invalid subscription keys', { 
        keys: subscription.keys 
      });
      return NextResponse.json(
        { error: 'Invalid subscription keys: missing p256dh or auth' },
        { status: 400 }
      );
    }

    // Connect to the database
    try {
      await connectToDatabase();
    } catch (error) {
      logger.api.error('Failed to connect to database', { error });
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Check if this subscription already exists
    let existingSubscription;
    try {
      existingSubscription = await Subscription.findOne({ 
        endpoint: subscription.endpoint 
      });
    } catch (error) {
      logger.api.error('Error checking for existing subscription', { error });
      return NextResponse.json(
        { error: 'Failed to check for existing subscription' },
        { status: 500 }
      );
    }

    if (!existingSubscription) {
      // Store the subscription
      try {
        const userAgent = request.headers.get('user-agent') || '';
        const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
        
        await Subscription.create({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent,
          createdAt: new Date(),
          // Store additional metadata
          metadata: {
            ip: clientIp,
            browser: getBrowserInfo(userAgent),
            platform: getPlatformInfo(userAgent)
          }
        });
        
        logger.api.info('New subscription added to database', {
          endpoint: subscription.endpoint.substring(0, 30) + '...',
          browser: getBrowserInfo(userAgent),
          platform: getPlatformInfo(userAgent)
        });
      } catch (error) {
        logger.api.error('Failed to save subscription to database', { error });
        return NextResponse.json(
          { error: 'Failed to save subscription to database' },
          { status: 500 }
        );
      }
    } else {
      logger.api.info('Subscription already exists in database', {
        endpoint: subscription.endpoint.substring(0, 30) + '...'
      });
      
      // Update the existing subscription's last seen timestamp
      try {
        await Subscription.updateOne(
          { _id: existingSubscription._id },
          { $set: { lastSeen: new Date() } }
        );
      } catch (error) {
        logger.api.warn('Failed to update existing subscription timestamp', { error });
        // Continue anyway since this is not critical
      }
    }

    return NextResponse.json({ 
      success: true,
      isNew: !existingSubscription
    });
  } catch (error: any) {
    logger.api.error('Unexpected error saving subscription', { 
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// Helper functions to extract browser and platform info
function getBrowserInfo(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
  if (userAgent.includes('Edge/') || userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) return 'Opera';
  
  return 'Other';
}

function getPlatformInfo(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) return 'iOS';
  
  return 'Other';
}
