# reCAPTCHA Integration Guide

This document provides information about the reCAPTCHA integration for VPN News. The integration helps protect forms and comments from spam and abuse.

## Overview

Google reCAPTCHA v3 is integrated into the website to:

1. Protect comment submissions from spam
2. Secure contact and enquiry forms
3. Prevent abuse of newsletter subscriptions
4. Enhance security without disrupting user experience

reCAPTCHA v3 works in the background without requiring users to solve puzzles or click checkboxes, providing a seamless experience while still protecting against bots.

## Setup

### 1. Create a reCAPTCHA Account

If you don't already have a reCAPTCHA account, you can create one at [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).

### 2. Register a New Site

1. Log in to the reCAPTCHA admin console
2. Click the "+" button to add a new site
3. Enter a label for your site (e.g., "VPN News")
4. Choose reCAPTCHA v3 as the type
5. Add your domains (e.g., vpnnews.co.uk, www.vpnnews.co.uk, and localhost for testing)
6. Accept the Terms of Service
7. Click "Submit"

### 3. Get Your reCAPTCHA Keys

After registering your site, you'll receive:

- **Site Key**: Used in the frontend code
- **Secret Key**: Used in the backend API routes

### 4. Configure Environment Variables

Add the following environment variables to your `.env` file for local development:

```
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

You can use the provided script to add the keys to your `.env` file:

```bash
node frontend/add-recaptcha-keys.js your_secret_key your_site_key
```

For production, add these variables to your Vercel environment variables in the Vercel dashboard.

## Implementation Details

### Backend Verification

The reCAPTCHA verification is implemented in the following API routes:

1. `frontend/src/app/api/comments/route.ts`: Verifies reCAPTCHA tokens for comment submissions
2. `frontend/src/app/api/hubspot/route.ts`: Verifies reCAPTCHA tokens for form submissions

The verification function checks if the token is valid and has a score above 0.5 (on a scale of 0.0 to 1.0, where 1.0 is very likely a good interaction).

```typescript
async function verifyRecaptcha(token: string): Promise<boolean> {
  // If no token is provided, fail verification in production
  if (!token) {
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // If no secret key is configured, skip verification in development
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not set');
      return process.env.NODE_ENV !== 'production';
    }

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' }
    );

    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}
```

### Frontend Integration

The reCAPTCHA Site Key is used in the frontend components to generate tokens that are sent with form submissions:

1. `frontend/src/components/article/CommentSection.tsx`: For comment submissions
2. `frontend/src/components/forms/ContactForm.tsx`: For contact form submissions
3. `frontend/src/components/forms/EnquiryForm.tsx`: For enquiry form submissions
4. `frontend/src/components/forms/NewsletterForm.tsx`: For newsletter subscriptions

The reCAPTCHA script is loaded in the layout component, and tokens are generated when forms are submitted.

## Development vs. Production

The system is designed to work differently in development and production environments:

- **Development**: reCAPTCHA verification is skipped if the secret key is not set, allowing for easier local development
- **Production**: reCAPTCHA verification is required, and submissions will be rejected if verification fails

This approach ensures that you can develop and test the application locally without needing to set up reCAPTCHA, while still maintaining security in production.

## Troubleshooting

### reCAPTCHA Verification Failing

If reCAPTCHA verification is failing in production:

1. Check that the `RECAPTCHA_SECRET_KEY` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variables are set correctly
2. Verify that the domains in your reCAPTCHA settings match the domains you're using
3. Check the browser console for any JavaScript errors
4. Check the server logs for any verification errors

### Local Development Issues

If you're having issues with reCAPTCHA in local development:

1. Make sure you've added `localhost` to the domains in your reCAPTCHA settings
2. Set the environment variables in your `.env` file
3. If you want to skip reCAPTCHA verification locally, you can leave the `RECAPTCHA_SECRET_KEY` unset

## Security Considerations

- reCAPTCHA helps protect against automated spam and abuse, but it's not a complete security solution
- Always validate and sanitize user input on the server side
- Consider implementing rate limiting for API endpoints
- Regularly monitor for suspicious activity

## Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA FAQ](https://developers.google.com/recaptcha/docs/faq)
