import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { createAppleNewsDocument, generateAppleNewsAuthHeaders } from './utils';

// Initialize Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // We need the most recent data
  apiVersion: '2023-05-03',
});

// Apple News API credentials
const APPLE_NEWS_API_KEY = process.env.APPLE_NEWS_API_KEY || '';
const APPLE_NEWS_API_SECRET = process.env.APPLE_NEWS_API_SECRET || '';
const APPLE_NEWS_CHANNEL_ID = process.env.APPLE_NEWS_CHANNEL_ID || '';

/**
 * Webhook handler for publishing to Apple News
 * This endpoint receives a webhook from Sanity when a post is published
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret to ensure it's from Sanity
    const webhookSecret = request.headers.get('sanity-webhook-secret');
    if (webhookSecret !== process.env.SANITY_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the webhook payload
    const payload = await request.json();
    
    // Check if this is a publish event for a post
    if (payload._type !== 'post' || !payload.slug || !payload.publishToAppleNews) {
      // Not a post or not marked for Apple News publishing
      return NextResponse.json({ success: false, message: 'Not applicable for Apple News' }, { status: 200 });
    }

    // Fetch the complete post data from Sanity
    const post = await sanityClient.fetch(
      `*[_id == $id][0]{
        title,
        seoTitle,
        seoDescription,
        slug,
        publishedAt,
        body,
        mainImage,
        "author": author->name,
        "categories": categories[]->title
      }`,
      { id: payload._id }
    );

    if (!post) {
      console.error('Post not found in Sanity');
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    // Convert the post to Apple News Format
    const appleNewsDocument = createAppleNewsDocument(post);

    // Publish to Apple News
    const publishResult = await publishToAppleNews(appleNewsDocument);

    // Update the post in Sanity with the Apple News ID
    if (publishResult.success && publishResult.articleId) {
      await sanityClient.patch(payload._id)
        .set({
          appleNewsId: publishResult.articleId,
          appleNewsRevision: publishResult.revision,
          appleNewsUrl: publishResult.shareUrl
        })
        .commit();
    }

    return NextResponse.json({ success: true, appleNews: publishResult }, { status: 200 });
  } catch (error) {
    console.error('Error in Apple News webhook handler:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * Publish an article to Apple News
 * This is a placeholder implementation - in a real implementation,
 * you would use the Apple News API to publish the article
 */
async function publishToAppleNews(appleNewsDocument: any) {
  try {
    // In a real implementation, you would:
    
    // 1. Generate the authentication headers for Apple News API
    const channelId = APPLE_NEWS_CHANNEL_ID;
    const path = `/channels/${channelId}/articles`;
    const method = 'POST';
    const data = JSON.stringify(appleNewsDocument);
    
    const headers = generateAppleNewsAuthHeaders(
      method,
      path,
      APPLE_NEWS_API_KEY,
      APPLE_NEWS_API_SECRET,
      data
    );
    
    // 2. Send the article to the Apple News API
    // In a real implementation, you would make an actual HTTP request
    // For now, we'll just log the request details
    console.log('Publishing to Apple News:', {
      url: `https://news-api.apple.com${path}`,
      method,
      headers,
      data: '(article data omitted for brevity)'
    });
    
    // 3. Handle the response
    // For demonstration purposes, we'll simulate a successful response
    return {
      success: true,
      articleId: `apple-news-${Date.now()}`,
      revision: '1',
      shareUrl: `https://apple.news/example-${Date.now()}`
    };
  } catch (error) {
    console.error('Error publishing to Apple News:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}
