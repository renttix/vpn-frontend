# HubSpot Integration Guide

This document provides information about the HubSpot integration for VPN News. The integration allows form submissions from the website to be sent to HubSpot, where they can be managed and processed.

## Overview

The HubSpot integration uses the free tier of HubSpot to collect and manage form submissions from the website. This includes:

- Contact form submissions
- Enquiry form submissions
- Newsletter subscriptions

## Setup

### 1. Create a HubSpot Account

If you don't already have a HubSpot account, you can create a free account at [HubSpot](https://www.hubspot.com/).

### 2. Get HubSpot Private Access Token (PAT)

1. Log in to your HubSpot account
2. Go to Settings > Account Setup > Integrations > Private Apps
3. Click "Create private app"
4. Name your app (e.g., "VPN News Integration")
5. Select the required scopes:
   - `forms` (required)
   - `contacts` (required)
   - `crm.objects.contacts.read` (recommended)
   - `crm.objects.contacts.write` (recommended)
6. Click "Create app" and note your Private Access Token

### 3. Configure Environment Variables

Add the following environment variable to your `.env` file for local development:

```
HUBSPOT_API_KEY=your-private-access-token
```

You can use the provided script to add the API key to your `.env` file:

```bash
node frontend/add-hubspot-key.js $HUBSPOT_API_KEY
```

This script will add or update the `HUBSPOT_API_KEY` in your `.env` file while preserving other environment variables.

For production, add this variable to your Vercel environment variables in the Vercel dashboard.

## Components

The integration includes the following components:

### 1. HubSpot Utility

The `frontend/src/lib/hubspot.ts` file contains utility functions for interacting with the HubSpot API, including:

- `submitToHubSpotForm`: Submits data to a HubSpot form
- `createOrUpdateContact`: Creates or updates a contact in HubSpot
- `formatFormDataForHubSpot`: Formats form data for HubSpot submission
- `submitFormToHubSpot`: A wrapper function for submitting a form to HubSpot

### 2. API Endpoint

The `frontend/src/app/api/hubspot/route.ts` file contains an API endpoint for submitting form data to HubSpot. This endpoint handles:

- Validating form data
- Verifying reCAPTCHA tokens
- Formatting data for HubSpot
- Submitting data to HubSpot

### 3. Form Components

The following form components are available:

- `ContactForm`: A form for general contact inquiries
- `EnquiryForm`: A form for specific enquiries
- `NewsletterForm`: A form for newsletter subscriptions

## Usage

### Contact Form

```tsx
import { ContactForm } from '@/components/forms';

export default function ContactPage() {
  return (
    <ContactForm 
      title="Send Us a Message"
      subtitle="Have a question or comment? We'd love to hear from you."
    />
  );
}
```

### Enquiry Form

```tsx
import { EnquiryForm } from '@/components/forms';

export default function EnquiryPage() {
  return (
    <EnquiryForm 
      title="Send an Enquiry"
      subtitle="Have a question about our services?"
    />
  );
}
```

### Newsletter Form

```tsx
import { NewsletterForm } from '@/components/forms';

export default function NewsletterPage() {
  return (
    <NewsletterForm 
      title="Subscribe to Our Newsletter"
      subtitle="Stay updated with the latest news and articles."
      compact={false} // Set to true for a compact version
    />
  );
}
```

## Form Data Mapping

The form data is mapped to HubSpot properties as follows:

### Contact Form

- `firstName` → `firstname`
- `lastName` → `lastname`
- `email` → `email`
- `phone` → `phone`
- `company` → `company`
- `message` → `message`

### Newsletter Form

- `email` → `email`
- `firstName` → `firstname` (optional)
- `lastName` → `lastname` (optional)

## Customization

### Form Types

The `formType` parameter is used to identify the type of form being submitted. This can be used to route submissions to different forms in HubSpot or to apply different processing rules. The available form types are:

- `contact`: General contact form
- `enquiry`: Specific enquiry form
- `newsletter`: Newsletter subscription form

### Form Properties

Each form component accepts the following properties:

- `title`: The title of the form
- `subtitle`: A subtitle or description for the form
- `successMessage`: A message to display when the form is successfully submitted
- `className`: Additional CSS classes to apply to the form

The `NewsletterForm` component also accepts a `compact` property, which can be set to `true` to display a compact version of the form.

## Troubleshooting

### Form Submission Errors

If you encounter errors when submitting forms, check the following:

1. Ensure the HubSpot API Key (Private Access Token) is correctly set in the environment variables
2. Check the browser console for any JavaScript errors
3. Check the network tab in the browser developer tools for API errors
4. Verify that the reCAPTCHA is configured correctly

### HubSpot API Errors

If you encounter errors from the HubSpot API, check the following:

1. Ensure the HubSpot API Key is valid and has not expired
2. Verify that the API Key has the required scopes (forms, contacts)
3. Check if you've reached any API rate limits
4. Verify that the contact properties exist in your HubSpot account
5. Check the HubSpot API documentation for any changes to the API

## Testing the Integration

We've provided several tools to help you test the HubSpot integration:

### 1. Web-based Test Interface

A simple HTML page is available to test the connection to HubSpot:

```
frontend/test-hubspot.html
```

To use this test interface:
1. Make sure your local development server is running
2. Add your HubSpot API key to your `.env` file
3. Open the HTML file in your browser or navigate to `/test-hubspot.html`
4. Click the "Test Connection" button

This will test the connection to HubSpot and display information about your account, as well as test access to the CRM and Forms APIs.

### 2. Command-line Test Script

A Node.js script is available to test the connection from the command line:

```
frontend/test-hubspot-connection.js
```

To use this script:
1. Add your HubSpot API key to your `.env` file
2. Run the script with Node.js:
   ```
   node frontend/test-hubspot-connection.js
   ```

### 3. API Test Endpoint

A Next.js API endpoint is available to test the connection programmatically:

```
/api/hubspot-test
```

This endpoint returns a JSON response with information about your HubSpot account and API access.

## Resources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot Forms API](https://developers.hubspot.com/docs/api/marketing/forms)
- [HubSpot Contacts API](https://developers.hubspot.com/docs/api/crm/contacts)
- [HubSpot Private Apps](https://developers.hubspot.com/docs/api/private-apps)
