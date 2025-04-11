# Justice Watch Setup Guide

This guide explains how to set up and use the Justice Watch feature, which allows you to showcase YouTube videos from different channels on your website.

## Overview

Justice Watch is a feature that displays YouTube videos organized by channels. It consists of:

1. A main page that lists all channels (`/justice-watch`)
2. Channel pages that list videos from a specific channel (`/justice-watch/[channel]`)
3. Video pages that display a specific video with related information (`/justice-watch/[channel]/[videoId]`)

## Content Structure

The content is organized in Sanity Studio with two main document types:

1. **Justice Watch Channel**: Represents a YouTube channel
   - Title: The name of the channel
   - Slug: URL-friendly identifier (e.g., "vpnldn" or "jasonking")
   - Description: Information about the channel
   - YouTube Custom URL: The channel's custom URL (e.g., "@vpnldn")
   - Thumbnail URL: URL to the channel's thumbnail image

2. **Justice Watch Video**: Represents a YouTube video
   - Title: The title of the video
   - Slug: URL-friendly identifier
   - Description: Information about the video
   - Channel: Reference to the channel this video belongs to
   - YouTube URL: The full YouTube URL (e.g., https://youtu.be/tjfapTxcnfg)
   - YouTube ID: Extracted from the YouTube URL (e.g., "tjfapTxcnfg")
   - Thumbnail URL: URL to the video thumbnail
   - Duration: Length of the video (e.g., "15:30")
   - Published At: When the video was published
   - Status: Draft, Published, or Archived

## Setup Instructions

### 1. Manual Setup in Sanity Studio

1. **Create Channels**:
   - Go to "Justice Watch Channel" in the sidebar
   - Click "Create new"
   - Fill in the details for each channel:
     - VPN London: Slug "vpnldn", Custom URL "@vpnldn"
     - Jason King News: Slug "jasonking", Custom URL "@JasonKingNews"

2. **Create Videos**:
   - Go to "Justice Watch Video" in the sidebar
   - Click "Create new"
   - Fill in the video details
   - For "Channel", select the appropriate channel
   - Enter the YouTube URL
   - Manually enter the YouTube ID (extracted from the URL)
   - Set the status to "Published"

### 2. Automated Setup with Script

For faster setup, you can use the provided script to populate the data:

1. Make sure you have a Sanity API token with write access
2. Add the token to your `.env.local` file:
   ```
   SANITY_API_TOKEN=your-token-here
   ```
3. Run the script:
   ```
   cd frontend
   node scripts/add-justice-watch-data.js
   ```

This script will create:
- Two channels: VPN London and Jason King News
- Sample videos for each channel

## Frontend Pages

The Justice Watch feature includes the following pages:

1. **Main Page** (`/justice-watch`):
   - Lists all channels
   - Shows the latest videos from each channel

2. **Channel Page** (`/justice-watch/[channel]`):
   - Shows channel information
   - Lists all videos from the channel
   - Sorted by publish date (newest first)

3. **Video Page** (`/justice-watch/[channel]/[videoId]`):
   - Displays the embedded YouTube video
   - Shows video information (title, description, etc.)
   - Lists related videos

## Customizing the Feature

### Adding More Channels

To add more channels:
1. Create a new "Justice Watch Channel" document in Sanity Studio
2. Make sure to set a unique slug
3. Add videos to the channel as needed

### Customizing the Layout

The layout and styling can be customized by modifying the following files:
- `src/app/justice-watch/page.tsx`: Main page layout
- `src/app/justice-watch/[channel]/page.tsx`: Channel page layout
- `src/app/justice-watch/[channel]/[videoId]/page.tsx`: Video page layout

## Troubleshooting

### YouTube ID Not Extracting Automatically

If the YouTube ID is not being extracted automatically:
1. Make sure the YouTube URL is in a valid format (e.g., https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID)
2. Manually enter the YouTube ID in the field
3. For the thumbnail URL, use: `https://i.ytimg.com/vi/YOUR_YOUTUBE_ID/maxresdefault.jpg`

### Videos Not Appearing on the Frontend

If videos are not appearing on the frontend:
1. Check that the video's status is set to "Published"
2. Verify that the channel reference is correctly set
3. Make sure the slugs are URL-friendly (no spaces or special characters)
4. Check the browser console for any errors
