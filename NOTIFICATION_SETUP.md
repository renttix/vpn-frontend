# Notification System Setup

This document provides comprehensive instructions for setting up the notification system for VPN News. The notification system allows users to receive push notifications when new articles are published.

## Overview

The notification system consists of the following components:

1. **Service Worker**: Handles push notifications in the background
2. **Web Push API**: Sends push notifications to subscribed users
3. **Notification UI**: Allows users to subscribe/unsubscribe from notifications
4. **MongoDB Storage**: Stores subscription data securely
5. **Sanity Webhook**: Triggers notifications when new articles are published

## Setup Steps

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for the Web Push API. Generate your own keys using the provided script:

```bash
# Install web-push dependency if not already installed
npm install web-push

# Run the key generation script
node scripts/generate-vapid-keys.js
```

Add the generated keys to your `.env.local` file:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_CONTACT_EMAIL=contact@yourdomain.com
```

### 2. Configure MongoDB Connection

Ensure your MongoDB connection is properly configured. Add the MongoDB URI to your `.env.local` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

The notification system uses MongoDB to store subscription data. The connection is handled by the `mongodb.ts` utility, which includes fallbacks for development mode.

### 3. Set Up API Key for Webhook Security

Add an API key to secure the notification trigger endpoint:

```
NOTIFICATIONS_API_KEY=your_secure_api_key
```

This key will be used to authenticate webhook requests from Sanity.

### 4. Set Up Sanity Webhook

There are multiple ways to set up the webhook that triggers notifications when new articles are published:

#### Option 1: Using the Direct API Script (Recommended)

This approach uses the Sanity Management API directly and doesn't require the Sanity CLI:

```bash
# Run the webhook setup script
node scripts/setup-webhook-direct.js https://yourdomain.com/api/notifications/trigger
```

This script will:
- Use your Sanity project ID and API token from the .env.local file
- Check for existing webhooks
- Create a new webhook or replace an existing one
- Configure it with the proper filter and projection
- Set up the API key authentication

#### Option 2: Using the Sanity CLI

If you have the Sanity CLI installed and are logged in:

```bash
# Set your Sanity auth token
export SANITY_AUTH_TOKEN=your_sanity_auth_token

# Run the webhook setup script
node scripts/setup-notification-webhook.js your_project_id production https://yourdomain.com/api/notifications/trigger
```

#### Option 3: Manual Setup in Sanity Dashboard

You can also set up the webhook manually in the Sanity Studio dashboard:

1. Log in to your Sanity Studio dashboard
2. Go to **API** > **Webhooks**
3. Click **Add webhook**
4. Configure the webhook with the following settings:
   - **Name**: `New Article Notification`
   - **URL**: `https://your-site.com/api/notifications/trigger` (replace with your actual domain)
   - **Dataset**: `production`
   - **Filter**: `_type == "post" && !defined(drafts) && publishedAt > now()-60`
   - **Projection**: `{_id, title, slug, mainImage{asset->{url}}}`
   - **HTTP Method**: `POST`
   - **HTTP Headers**: 
     - `Content-Type: application/json`
     - `x-api-key: your_secure_api_key`
   - **Trigger on**: Select `Create` and `Update`

5. Click **Save**

Any of these methods will create a webhook that triggers whenever a new article is published or an existing article is updated in Sanity.

## Frontend Components

The frontend components are already set up and include:

- Service worker (`/public/sw.js`)
- Notification utility functions (`/src/lib/notifications.ts`)
- Notification UI components:
  - `NotificationBell`: Bell icon in the header for subscribing/unsubscribing
  - `NotificationBanner`: Banner for prompting users to enable notifications

## Admin Interface

An admin interface is available at `/admin/notifications` for managing subscriptions. This interface allows you to:

1. View all subscriptions
2. See subscription statistics (total, active, inactive, by browser, by platform)
3. Send test notifications
4. Delete subscriptions
5. Filter subscriptions by status (active/inactive)

## Database Schema

Subscriptions are stored in MongoDB using the following schema:

```typescript
interface Subscription {
  endpoint: string;        // Push subscription endpoint
  keys: {                  // Encryption keys
    p256dh: string;
    auth: string;
  };
  createdAt: Date;         // When the subscription was created
  lastNotified: Date;      // When the last notification was sent
  lastSeen: Date;          // When the subscription was last seen
  userAgent: string;       // User agent string
  active: boolean;         // Whether the subscription is active
  metadata: {              // Additional metadata
    ip: string;
    browser: string;
    platform: string;
    referrer: string;
  }
}
```

The schema includes a TTL (Time To Live) index on the `lastSeen` field, which automatically removes subscriptions that haven't been seen in 6 months.

## API Endpoints

The notification system includes the following API endpoints:

1. `/api/notifications/vapid-public-key`: Returns the VAPID public key
2. `/api/notifications/subscribe`: Subscribes a user to notifications
3. `/api/notifications/unsubscribe`: Unsubscribes a user from notifications
4. `/api/notifications/trigger`: Triggers notifications (called by Sanity webhook)
5. `/api/admin/subscriptions`: Admin endpoint for managing subscriptions

## Testing

There are several ways to test the notification system:

### Option 1: Using the Test Script (Recommended)

We've provided a script that simulates a webhook call to test notifications:

```bash
# Make sure your Next.js development server is running
npm run dev

# In a separate terminal, run the test script
node scripts/test-notification.js
```

This script will:
- Send a POST request to your notification trigger endpoint
- Include test article data that mimics what Sanity would send
- Use the API key from your .env.local file for authentication

### Option 2: Using the Admin Interface

1. Run the development server: `npm run dev`
2. Navigate to the admin notifications page at `/admin/notifications`
3. Use the "Send Test Notification" feature

### Option 3: Using the Browser

1. Run the development server: `npm run dev`
2. Open the site in a browser that supports push notifications
3. Click the notification bell icon in the header
4. Allow notifications when prompted
5. Publish a new article in Sanity Studio to trigger a notification

### Option 4: Manual API Testing

You can also test the API directly using tools like Postman or curl:

```bash
curl -X POST http://localhost:3000/api/notifications/trigger \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"_id":"test-article","title":"Test Notification","slug":{"current":"test-notification"},"mainImage":{"asset":{"url":"https://example.com/image.jpg"}}}'
```

## Troubleshooting

### Notifications not showing

- Check browser permissions and console for errors
- Verify that the service worker is registered correctly
- Ensure the VAPID keys are correctly set in the environment variables
- Check that the subscription is stored in the database

### Webhook not triggering

- Verify the webhook configuration in Sanity Studio
- Check that the API key matches between the webhook and the environment variable
- Look for errors in the server logs
- Test the webhook manually using a tool like Postman

### Database connection issues

- Verify the MongoDB URI is correct
- Check that the database user has the necessary permissions
- In development mode, the system will use mock data if the database is unavailable

## Security Considerations

- VAPID keys should be kept secure and never committed to version control
- The API key for the webhook should be strong and unique
- Consider implementing rate limiting to prevent abuse
- Validate all incoming data before processing
- Use HTTPS for all communication

## Production Deployment

When deploying to production:

1. Generate new VAPID keys for production
2. Set up the environment variables in your hosting platform
3. Configure the Sanity webhook to point to your production domain
4. Test the notification system in production
