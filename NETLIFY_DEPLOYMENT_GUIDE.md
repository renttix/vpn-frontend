# Netlify Deployment Guide for VPN London

This guide provides step-by-step instructions for deploying the VPN London website to Netlify.

## Prerequisites

- A Netlify account
- Access to the GitHub repository containing the VPN London codebase
- Sanity API token with read permissions
- VAPID keys for web push notifications (already in the codebase)

## Deployment Steps

### 1. Connect Your Repository to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Authenticate with GitHub and select your repository
5. Configure the build settings:
   - **Branch to deploy**: `main` (or your preferred branch)
   - **Base directory**: `frontend` (important!)
   - **Build command**: `bun run build` (this is already configured in netlify.toml)
   - **Publish directory**: `.next` (this is already configured in netlify.toml)
6. Click "Deploy site"

### 2. Configure Environment Variables

After the initial deployment, you need to set up environment variables:

1. Go to Site settings > Build & deploy > Environment
2. Add the following environment variables:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=g7f0f6rs
SANITY_API_TOKEN=your_sanity_api_token_here
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLBz5U0ynWG4O3RsQKR-eLmEt0srZSIVM8k-RgFawuO5fFX8PQYCvnE0xKOV9wbVP6j9RK1NKl_rNzFdPeUJUAA
VAPID_PRIVATE_KEY=QD0GhRTY0qgYT0eeXTTYrfj7A7Q9QKsXYP_YrxpnQQA
NEXT_PUBLIC_SITE_URL=https://your-netlify-domain.netlify.app
```

Replace `your-netlify-domain.netlify.app` with your actual Netlify domain.

### 3. Configure Sanity CORS Settings

1. Go to [https://www.sanity.io/manage/personal/project/g7f0f6rs/api](https://www.sanity.io/manage/personal/project/g7f0f6rs/api)
2. Under CORS Origins, add your Netlify domain (e.g., `https://your-netlify-domain.netlify.app`)
3. Make sure to check "Allow credentials" if your site uses authenticated requests to Sanity

### 4. Set Up Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain with Netlify

### 5. Enable HTTPS

HTTPS should be enabled by default with Netlify's SSL certificate. Ensure it's working correctly:

1. Go to Site settings > Domain management > HTTPS
2. Verify that "Netlify managed certificate" is enabled

### 6. Configure Redirects and Headers

The necessary redirects and headers are already configured in the `netlify.toml` file, including:

- Cache control for static assets
- Security headers
- Redirects for API routes

### 7. Trigger a New Deployment

After configuring all settings:

1. Go to the Deploys tab
2. Click "Trigger deploy" > "Deploy site"

## Troubleshooting

### API Routes Not Working

If API routes aren't working, ensure:

1. You're not using static export mode (the `output: 'export'` line should be commented out in `next.config.js`)
2. The Netlify Next.js plugin is correctly installed (it should be configured in `netlify.toml`)

### Images Not Loading

If images from Sanity aren't loading:

1. Check that the Sanity project ID is correct
2. Verify that the Sanity API token has read permissions
3. Ensure the Sanity CORS settings include your Netlify domain

### Push Notifications Not Working

If push notifications aren't working:

1. Verify that the VAPID keys are correctly set in the environment variables
2. Check that the service worker is registered correctly
3. Ensure your site is served over HTTPS

## Monitoring and Analytics

After deployment, you can monitor your site using:

1. Netlify Analytics (if enabled on your account)
2. Google Analytics (already configured in the codebase)

## Continuous Deployment

Netlify automatically deploys when changes are pushed to your connected Git repository. You can configure additional deployment settings:

1. Go to Site settings > Build & deploy > Continuous Deployment
2. Configure build hooks, deploy contexts, and other settings as needed

## Support

If you encounter issues with the deployment, check:

1. Netlify deployment logs
2. Browser console for client-side errors
3. Netlify Functions logs for server-side errors
