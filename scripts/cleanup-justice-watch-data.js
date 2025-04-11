/**
 * Script to clean up duplicate Justice Watch data in Sanity
 * 
 * This script:
 * 1. Finds all Justice Watch channels
 * 2. Keeps one instance of each channel (VPN London and Jason King News)
 * 3. Deletes the duplicates
 * 4. Updates the videos to reference the remaining channels
 * 
 * Usage:
 * node scripts/cleanup-justice-watch-data.js
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

// Clean up duplicate channels
async function cleanupChannels() {
  console.log('Cleaning up duplicate channels...')
  
  try {
    // Find all VPN London channels
    const vpnLondonChannels = await client.fetch(
      `*[_type == "justiceWatchChannel" && title == "VPN London"] | order(_createdAt asc)`
    )
    
    // Find all Jason King News channels
    const jasonKingChannels = await client.fetch(
      `*[_type == "justiceWatchChannel" && title == "Jason King News"] | order(_createdAt asc)`
    )
    
    console.log(`Found ${vpnLondonChannels.length} VPN London channels`)
    console.log(`Found ${jasonKingChannels.length} Jason King News channels`)
    
    // Keep the first instance of each channel and delete the rest
    const keepVpnLondonId = vpnLondonChannels.length > 0 ? vpnLondonChannels[0]._id : null
    const keepJasonKingId = jasonKingChannels.length > 0 ? jasonKingChannels[0]._id : null
    
    console.log(`Keeping VPN London channel with ID: ${keepVpnLondonId}`)
    console.log(`Keeping Jason King News channel with ID: ${keepJasonKingId}`)
    
    // Update videos to reference the remaining channels
    if (keepVpnLondonId) {
      // Find all videos referencing any VPN London channel
      for (let i = 1; i < vpnLondonChannels.length; i++) {
        const channelId = vpnLondonChannels[i]._id
        
        // Find videos referencing this channel
        const videos = await client.fetch(
          `*[_type == "justiceWatchVideo" && channel._ref == $channelId]`,
          { channelId }
        )
        
        console.log(`Found ${videos.length} videos referencing VPN London channel ${channelId}`)
        
        // Update videos to reference the remaining channel
        for (const video of videos) {
          await client.patch(video._id)
            .set({ channel: { _type: 'reference', _ref: keepVpnLondonId } })
            .commit()
          
          console.log(`Updated video ${video._id} to reference VPN London channel ${keepVpnLondonId}`)
        }
        
        // Delete the duplicate channel
        await client.delete(channelId)
        console.log(`Deleted duplicate VPN London channel ${channelId}`)
      }
    }
    
    if (keepJasonKingId) {
      // Find all videos referencing any Jason King News channel
      for (let i = 1; i < jasonKingChannels.length; i++) {
        const channelId = jasonKingChannels[i]._id
        
        // Find videos referencing this channel
        const videos = await client.fetch(
          `*[_type == "justiceWatchVideo" && channel._ref == $channelId]`,
          { channelId }
        )
        
        console.log(`Found ${videos.length} videos referencing Jason King News channel ${channelId}`)
        
        // Update videos to reference the remaining channel
        for (const video of videos) {
          await client.patch(video._id)
            .set({ channel: { _type: 'reference', _ref: keepJasonKingId } })
            .commit()
          
          console.log(`Updated video ${video._id} to reference Jason King News channel ${keepJasonKingId}`)
        }
        
        // Delete the duplicate channel
        await client.delete(channelId)
        console.log(`Deleted duplicate Jason King News channel ${channelId}`)
      }
    }
    
    console.log('Channels cleanup completed successfully!')
  } catch (error) {
    console.error('Error cleaning up channels:', error)
    throw error
  }
}

// Clean up duplicate videos
async function cleanupVideos() {
  console.log('Cleaning up duplicate videos...')
  
  try {
    // Get all videos
    const allVideos = await client.fetch(
      `*[_type == "justiceWatchVideo"]{_id, youtubeId}`
    )
    
    // Group videos by YouTube ID
    const videosByYoutubeId = {}
    
    for (const video of allVideos) {
      if (!video.youtubeId) continue
      
      if (!videosByYoutubeId[video.youtubeId]) {
        videosByYoutubeId[video.youtubeId] = []
      }
      
      videosByYoutubeId[video.youtubeId].push(video._id)
    }
    
    // Process each group of videos with the same YouTube ID
    for (const youtubeId in videosByYoutubeId) {
      const videoIds = videosByYoutubeId[youtubeId]
      
      if (videoIds.length > 1) {
        console.log(`Found ${videoIds.length} videos with YouTube ID ${youtubeId}`)
        
        // Keep the first video and delete the rest
        const keepVideoId = videoIds[0]
        console.log(`Keeping video with ID: ${keepVideoId}`)
        
        for (let i = 1; i < videoIds.length; i++) {
          const videoId = videoIds[i]
          await client.delete(videoId)
          console.log(`Deleted duplicate video ${videoId}`)
        }
      }
    }
    
    console.log('Videos cleanup completed successfully!')
  } catch (error) {
    console.error('Error cleaning up videos:', error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('Starting Justice Watch data cleanup...')
    await cleanupChannels()
    await cleanupVideos()
    console.log('Justice Watch data cleanup completed successfully!')
  } catch (error) {
    console.error('Error in Justice Watch data cleanup:', error)
    process.exit(1)
  }
}

// Run the script
main()
