# Enhanced HubSpot Integration Guide for News Sites

This guide explains how to use the enhanced HubSpot integration features, specifically optimized for news sites, including email marketing, content-based contact management, and reader engagement tracking.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Email Marketing](#email-marketing)
4. [Contact Management](#contact-management)
5. [User Tracking](#user-tracking)
6. [API Reference](#api-reference)

## Overview

The enhanced HubSpot integration provides the following features:

- **Email Marketing**: Create and send automated emails to your contacts
- **Contact Management**: Track and manage contacts with enhanced properties
- **User Tracking**: Track user behavior on your website
- **Form Submissions**: Send form submissions to HubSpot with enhanced data

All of these features are available with HubSpot's free plan.

## Setup

To set up the enhanced HubSpot integration:

1. Make sure your HubSpot API key is set in your `.env` file:

```
HUBSPOT_API_KEY=pat-eu1-your-api-key
```

2. Run the setup script to initialize the HubSpot integration:

```bash
node setup-hubspot.js
```

This script will:
- Create contact lists for different form types
- Create a welcome email for newsletter subscribers
- Set up custom contact properties for enhanced contact management

## Email Marketing

### Welcome Email

A welcome email is automatically sent to new newsletter subscribers. The email is created when you run the setup script.

To customize the welcome email:

1. Edit the `createWelcomeEmail` function in `frontend/src/lib/hubspot.ts`
2. Run the setup script again to update the email template

### Contact Lists

The integration creates the following contact lists:

- **Contact Form Submissions**: Contacts who submitted the contact form
- **Enquiry Form Submissions**: Contacts who submitted the enquiry form
- **Newsletter Form Submissions**: Contacts who subscribed to the newsletter

You can use these lists in HubSpot to send targeted emails.

## Contact Management

### Enhanced Contact Properties

The integration adds the following custom properties to contacts:

- **Lead Score**: A score indicating the lead's potential value (0-100)
- **User Interests**: Topics and areas the user has shown interest in
- **Subscription Status**: Current subscription status (subscribed, unsubscribed, pending)
- **Form Submission Count**: Number of forms submitted by this contact
- **Last Form Type**: Type of the last form submitted (contact, enquiry, newsletter)
- **Newsletter Frequency**: Preferred frequency for receiving newsletters (daily, weekly, monthly, breaking)
- **Content Categories**: News categories the reader is interested in
- **Articles Read Count**: Number of articles the reader has viewed
- **Last Article Read**: Title and URL of the most recent article the reader viewed
- **Average Article Time**: Average time in seconds spent reading articles

### Lead Scoring

Leads are automatically scored based on their form submissions:

- **Contact Form**: 50 points (medium priority)
- **Enquiry Form**: 75 points (high priority)
- **Newsletter Form**: 25 points (lower priority but still interested)

You can use these scores in HubSpot to prioritize leads.

## User Tracking

The `UserTracker` component tracks user behavior on your website and sends events to HubSpot.

### News Site-Specific Features

The integration includes several features specifically designed for news sites:

#### Article Reading Tracking

The `UserTracker` component automatically tracks article reading behavior:

- **Article Views**: When a user views an article
- **Article Categories**: The categories of articles viewed
- **Article Authors**: The authors of articles viewed
- **Reading Time**: How long users spend reading articles

This data is stored in the contact's properties and can be used to:
- Send personalized content recommendations based on reading history
- Segment readers by their content preferences
- Identify your most engaged readers
- Understand which topics are most popular with specific audience segments

#### Newsletter Preferences

The enhanced newsletter form allows readers to select:

- **Newsletter Frequency**: How often they want to receive newsletters (daily, weekly, monthly, breaking news only)
- **Content Categories**: Which news categories they're interested in (breaking news, politics, technology, etc.)

These preferences are stored in the contact's properties and can be used to send highly targeted newsletters that match each reader's interests and preferred cadence.

### Usage

Add the `UserTracker` component to your layout:

```tsx
import { UserTracker } from '@/components/hubspot';

export default function Layout({ children }) {
  // Get the user's email from your authentication system
  const email = user?.email;
  
  return (
    <>
      {email && <UserTracker email={email} />}
      {children}
    </>
  );
}
```

### Tracked Events

The `UserTracker` component tracks the following events:

- **Page Views**: When a user views a page
- **Time on Page**: How long a user spends on a page
- **Link Clicks**: When a user clicks a link
- **Button Clicks**: When a user clicks a button

These events are sent to HubSpot and can be used to track user behavior and interests.

## API Reference

### HubSpot Utility Functions

The `frontend/src/lib/hubspot.ts` file provides the following functions:

#### `submitFormToHubSpot(formData, pageUri, pageName)`

Submits form data to HubSpot.

#### `createContactList(listProperties)`

Creates a contact list in HubSpot.

#### `createFormTypeList(formType)`

Creates a contact list for a specific form type.

#### `createEmailCampaign(emailProperties)`

Creates an email campaign in HubSpot.

#### `createWelcomeEmail()`

Creates a welcome email for new subscribers.

#### `trackUserEvent(trackingEvent)`

Tracks a user event in HubSpot.

#### `addEnhancedContactProperties(email, properties)`

Adds enhanced properties to a contact in HubSpot.

### Components

#### `UserTracker`

Tracks user behavior on your website and sends events to HubSpot.

Props:
- `email`: The email of the identified user (required)

### API Endpoints

#### `POST /api/hubspot`

Submits form data to HubSpot with enhanced contact management.

Request body:
- `formType`: The type of form (contact, enquiry, newsletter)
- `email`: The user's email address
- Other form fields

Response:
```json
{
  "success": true,
  "hubspotResponse": { ... },
  "enhanced": true,
  "email_marketing": true
}
```

## Troubleshooting

### API Key Issues

If you encounter issues with the HubSpot API key:

1. Make sure the API key is set in your `.env` file
2. Verify that the API key has the necessary permissions
3. Check the HubSpot API status at https://status.hubspot.com/

### Form Submission Issues

If form submissions are not being sent to HubSpot:

1. Check the browser console for errors
2. Verify that the form is sending the correct data
3. Check the server logs for API errors

### Email Marketing Issues

If welcome emails are not being sent:

1. Make sure the welcome email was created successfully
2. Check that the contact is being added to the newsletter list
3. Verify that the contact has a valid email address
