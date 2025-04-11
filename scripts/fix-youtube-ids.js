/**
 * Script to fix missing YouTube IDs in Justice Watch videos
 * 
 * This script checks all videos in the database and updates any that have
 * missing YouTube IDs by extracting them from the YouTube URLs.
 * 
 * Usage:
 * node scripts/fix-youtube-ids.js
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Create Sanity client
const client = createClient({
  projectId: 'g7f0f6rs',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Function to extract YouTube ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null
  
  // Match patterns like:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  const match = url.match(regex)
  
  return match ? match[1] : null
}

// Function to generate thumbnail URL from YouTube ID
const generateThumbnailUrl = (youtubeId) => {
  return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
}

// Fix videos with missing YouTube IDs
async function fixYoutubeIds() {
  console.log('Checking for videos with missing YouTube IDs...')
  
  try {
    // Get all videos
    const videos = await client.fetch(`*[_type == "justiceWatchVideo"]`)
    console.log(`Found ${videos.length} videos in total`)
    
    // Filter videos with missing or null YouTube IDs but valid YouTube URLs
    const videosToFix = videos.filter(video => 
      (!video.youtubeId || video.youtubeId === null || video.youtubeId === '') && 
      video.youtubeUrl
    )
    
    console.log(`Found ${videosToFix.length} videos with missing YouTube IDs`)
    
    // Update each video with missing YouTube ID
    for (const video of videosToFix) {
      const youtubeId = extractYouTubeId(video.youtubeUrl)
      
      if (youtubeId) {
        console.log(`Fixing video: ${video.title} (${video._id})`)
        console.log(`YouTube URL: ${video.youtubeUrl}`)
        console.log(`Extracted YouTube ID: ${youtubeId}`)
        
        // Generate thumbnail URL if needed
        const thumbnailUrl = video.thumbnailUrl || generateThumbnailUrl(youtubeId)
        
        // Update the video
        await client
          .patch(video._id)
          .set({
            youtubeId: youtubeId,
            thumbnailUrl: thumbnailUrl
          })
          .commit()
        
        console.log(`Updated video: ${video.title} with YouTube ID: ${youtubeId}`)
      } else {
        console.error(`Failed to extract YouTube ID for video: ${video.title} (${video._id})`)
        console.error(`YouTube URL: ${video.youtubeUrl}`)
      }
    }
    
    console.log('Finished fixing videos with missing YouTube IDs')
    
    // Check for any remaining videos with missing YouTube IDs
    const remainingVideosToFix = await client.fetch(`*[_type == "justiceWatchVideo" && (youtubeId == null || youtubeId == "")]`)
    
    if (remainingVideosToFix.length > 0) {
      console.log(`Warning: There are still ${remainingVideosToFix.length} videos with missing YouTube IDs`)
      console.log('These videos may have invalid YouTube URLs:')
      
      for (const video of remainingVideosToFix) {
        console.log(`- ${video.title} (${video._id}): ${video.youtubeUrl || 'No URL'}`)
      }
    } else {
      console.log('All videos now have valid YouTube IDs!')
    }
  } catch (error) {
    console.error('Error fixing YouTube IDs:', error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('Starting YouTube ID fix...')
    await fixYoutubeIds()
    console.log('YouTube ID fix completed successfully!')
  } catch (error) {
    console.error('Error in YouTube ID fix:', error)
    process.exit(1)
  }
}

// Run the script
main()
