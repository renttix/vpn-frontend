import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import webpush from 'web-push';
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import logger from '@/lib/logger';

// Get VAPID keys from environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLBz5U0ynWG4O3RsQKR-eLmEt0srZSIVM8k-RgFawuO5fFX8PQYCvnE0xKOV9wbVP6j9RK1NKl_rNzFdPeUJUAA';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'QD0GhRTY0qgYT0eeXTTYrfj7A7Q9QKsXYP_YrxpnQQA';
const CONTACT_EMAIL = process.env.VAPID_CONTACT_EMAIL || 'contact@vpnldn.co.uk';

// Only configure web-push with VAPID keys in a browser environment
// This prevents errors during build time
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NETLIFY_LOCAL;

if (!isBuildTime) {
  try {
    webpush.setVapidDetails(
      `mailto:${CONTACT_EMAIL}`,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.error('Error setting VAPID details:', error);
    // Continue without web push during build
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key in the request headers
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.NOTIFICATIONS_API_KEY;
    
    if (!apiKey || apiKey !== validApiKey) {
      logger.api.warn('Unauthorized notification trigger attempt', { 
        ip: request.headers.get('x-forwarded-for') || 'unknown' 
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the article data from the webhook request
    let article;
    try {
      article = await request.json();
    } catch (error) {
      logger.api.error('Failed to parse webhook payload', { error });
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate the article data
    if (!article || !article.title || !article.slug?.current) {
      logger.api.warn('Invalid article data received', { article });
      return NextResponse.json(
        { error: 'Invalid article data: missing title or slug' },
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
    
    // Get all subscriptions from the database
    let subscriptions = [];
    try {
      subscriptions = await Subscription.find({});
      logger.api.info(`Found ${subscriptions.length} subscriptions to notify`);
    } catch (error) {
      logger.api.error('Failed to fetch subscriptions', { error });
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }
    
    if (subscriptions.length === 0) {
      logger.api.info('No subscriptions to notify');
      return NextResponse.json({ 
        success: true,
        message: 'No subscriptions to notify'
      });
    }
    
    // Prepare the notification payload
    const payload = JSON.stringify({
      title: 'New Article Published',
      body: article.title,
      icon: article.mainImage?.asset?.url || 'https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg',
      url: `/${article.slug.current}`,
      timestamp: new Date().toISOString(),
    });

    // Track notification results
    const results = {
      success: 0,
      failed: 0,
      removed: 0
    };

    // Send notifications to all subscribers
    const notifications = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          }
        }, payload);
        
        // Update the lastNotified timestamp
        await Subscription.updateOne(
          { _id: subscription._id },
          { $set: { lastNotified: new Date() } }
        );
        
        results.success++;
      } catch (error: any) {
        results.failed++;
        logger.api.warn('Error sending notification', { 
          error: error.message,
          statusCode: error.statusCode,
          endpoint: subscription.endpoint.substring(0, 30) + '...'
        });
        
        // If the subscription is no longer valid, remove it
        if (error.statusCode === 404 || error.statusCode === 410) {
          try {
            await Subscription.deleteOne({ _id: subscription._id });
            results.removed++;
            logger.api.info(`Invalid subscription removed from database`, {
              id: subscription._id
            });
          } catch (dbError) {
            logger.api.error('Failed to remove invalid subscription', { 
              id: subscription._id,
              error: dbError 
            });
          }
        }
      }
    });

    await Promise.all(notifications);
    logger.api.info(`Notifications sent`, { results });

    return NextResponse.json({ 
      success: true,
      results
    });
  } catch (error: any) {
    logger.api.error('Error triggering notifications', { 
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to trigger notifications' },
      { status: 500 }
    );
  }
}
