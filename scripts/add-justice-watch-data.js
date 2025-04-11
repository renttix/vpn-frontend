/**
 * Script to add Justice Watch data to Sanity
 * 
 * This script creates two channels (VPN London and Jason King News)
 * and adds sample videos to each channel.
 * 
 * Usage:
 * node scripts/add-justice-watch-data.js
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
  
  console.log(`Extracting YouTube ID from URL: ${url}`);
  console.log(`Extracted ID: ${match ? match[1] : 'null'}`);
  
  return match ? match[1] : null
}

// Function to generate thumbnail URL from YouTube ID
const generateThumbnailUrl = (youtubeId) => {
  return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
}

// Create or get existing channels
async function createChannels() {
  console.log('Creating channels...')
  
  // VPN London Channel
  const vpnLondonChannel = {
    _type: 'justiceWatchChannel',
    title: 'VPN London',
    slug: { _type: 'slug', current: 'vpnldn' },
    description: 'Official channel of Video Production News, covering court cases, legal commentary, and justice news from London and beyond.',
    customUrl: '@vpnldn',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/APkrFKZWeMCsx4Q9e_Hm6VKUOiVEB90oUJZ6_5N_aCJj=s176-c-k-c0x00ffffff-no-rj',
  }
  
  // Jason King News Channel
  const jasonKingChannel = {
    _type: 'justiceWatchChannel',
    title: 'Jason King News',
    slug: { _type: 'slug', current: 'jasonking' },
    description: 'Jason King brings you the latest news, interviews, and analysis on high-profile court cases and legal developments.',
    customUrl: '@JasonKingNews',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/APkrFKZLzqCkXV9IFj8tWwHVrUMoMhcgD0q2uXgKmsc7=s176-c-k-c0x00ffffff-no-rj',
  }
  
  try {
    // Check if VPN London channel already exists
    const existingVpnLondon = await client.fetch(
      `*[_type == "justiceWatchChannel" && slug.current == "vpnldn"][0]`
    )
    
    // Check if Jason King News channel already exists
    const existingJasonKing = await client.fetch(
      `*[_type == "justiceWatchChannel" && slug.current == "jasonking"][0]`
    )
    
    let vpnLondonId, jasonKingId
    
    // Create or use existing VPN London channel
    if (existingVpnLondon) {
      console.log(`Using existing VPN London channel with ID: ${existingVpnLondon._id}`)
      vpnLondonId = existingVpnLondon._id
    } else {
      const vpnLondonResult = await client.create(vpnLondonChannel)
      console.log(`Created VPN London channel with ID: ${vpnLondonResult._id}`)
      vpnLondonId = vpnLondonResult._id
    }
    
    // Create or use existing Jason King News channel
    if (existingJasonKing) {
      console.log(`Using existing Jason King News channel with ID: ${existingJasonKing._id}`)
      jasonKingId = existingJasonKing._id
    } else {
      const jasonKingResult = await client.create(jasonKingChannel)
      console.log(`Created Jason King News channel with ID: ${jasonKingResult._id}`)
      jasonKingId = jasonKingResult._id
    }
    
    return {
      vpnLondonId,
      jasonKingId
    }
  } catch (error) {
    console.error('Error creating channels:', error)
    throw error
  }
}

// Create or get existing videos
async function createVideos(channelIds) {
  console.log('Creating videos...')
  
  const { vpnLondonId, jasonKingId } = channelIds
  
  // Sample videos for VPN London
  const vpnLondonVideos = [
    {
      title: 'Street Stabbing In Sparkhill Caught On Camera!',
      description: 'Shocking footage shows a street stabbing in Sparkhill, Birmingham. Warning: This video contains graphic content that some viewers may find disturbing.',
      youtubeUrl: 'https://www.youtube.com/watch?v=xdFcnNsYQvU',
      duration: '2:15',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Exclusive: Interview with Former Metropolitan Police Detective',
      description: 'In this exclusive interview, a former Metropolitan Police detective shares insights on the rising knife crime in London and what can be done to address it.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '15:30',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ]
  
  // Sample videos for Jason King News
  const jasonKingVideos = [
    {
      title: 'Breaking: Major Court Ruling on Privacy Case',
      description: 'Jason King reports on a landmark court ruling that will have significant implications for privacy laws in the UK.',
      youtubeUrl: 'https://www.youtube.com/watch?v=tjfapTxcnfg',
      duration: '8:45',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'The Truth About UK Sentencing Guidelines',
      description: 'An in-depth analysis of UK sentencing guidelines and how they impact justice outcomes.',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      duration: '22:10',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
  ]
  
  try {
    // Process VPN London videos
    for (const videoData of vpnLondonVideos) {
      const youtubeId = extractYouTubeId(videoData.youtubeUrl)
      const thumbnailUrl = youtubeId ? generateThumbnailUrl(youtubeId) : null
      
      console.log(`Processing video: ${videoData.title}`);
      console.log(`YouTube URL: ${videoData.youtubeUrl}`);
      console.log(`YouTube ID: ${youtubeId}`);
      console.log(`Thumbnail URL: ${thumbnailUrl}`);
      
      if (!youtubeId) {
        console.error(`Failed to extract YouTube ID for video: ${videoData.title}`);
        continue;
      }
      
      // Generate slug
      const slug = videoData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
      
      // Check if video already exists
      const existingVideo = await client.fetch(
        `*[_type == "justiceWatchVideo" && youtubeId == $youtubeId][0]`,
        { youtubeId }
      );
      
      if (existingVideo) {
        console.log(`Video with YouTube ID ${youtubeId} already exists with ID: ${existingVideo._id}`);
        continue;
      }
      
      const video = {
        _type: 'justiceWatchVideo',
        title: videoData.title,
        slug: { _type: 'slug', current: slug },
        description: videoData.description,
        channel: { _type: 'reference', _ref: vpnLondonId },
        youtubeUrl: videoData.youtubeUrl,
        youtubeId: youtubeId,
        thumbnailUrl: thumbnailUrl,
        duration: videoData.duration,
        publishedAt: videoData.publishedAt,
        status: 'published',
      }
      
      const result = await client.create(video)
      console.log(`Created VPN London video: ${videoData.title} with ID: ${result._id}`)
    }
    
    // Process Jason King News videos
    for (const videoData of jasonKingVideos) {
      const youtubeId = extractYouTubeId(videoData.youtubeUrl)
      const thumbnailUrl = youtubeId ? generateThumbnailUrl(youtubeId) : null
      
      console.log(`Processing video: ${videoData.title}`);
      console.log(`YouTube URL: ${videoData.youtubeUrl}`);
      console.log(`YouTube ID: ${youtubeId}`);
      console.log(`Thumbnail URL: ${thumbnailUrl}`);
      
      if (!youtubeId) {
        console.error(`Failed to extract YouTube ID for video: ${videoData.title}`);
        continue;
      }
      
      // Generate slug
      const slug = videoData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
      
      // Check if video already exists
      const existingVideo = await client.fetch(
        `*[_type == "justiceWatchVideo" && youtubeId == $youtubeId][0]`,
        { youtubeId }
      );
      
      if (existingVideo) {
        console.log(`Video with YouTube ID ${youtubeId} already exists with ID: ${existingVideo._id}`);
        continue;
      }
      
      const video = {
        _type: 'justiceWatchVideo',
        title: videoData.title,
        slug: { _type: 'slug', current: slug },
        description: videoData.description,
        channel: { _type: 'reference', _ref: jasonKingId },
        youtubeUrl: videoData.youtubeUrl,
        youtubeId: youtubeId,
        thumbnailUrl: thumbnailUrl,
        duration: videoData.duration,
        publishedAt: videoData.publishedAt,
        status: 'published',
      }
      
      const result = await client.create(video)
      console.log(`Created Jason King News video: ${videoData.title} with ID: ${result._id}`)
    }
    
    console.log('All videos created successfully!')
  } catch (error) {
    console.error('Error creating videos:', error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('Starting Justice Watch data import...')
    const channelIds = await createChannels()
    await createVideos(channelIds)
    console.log('Justice Watch data import completed successfully!')
  } catch (error) {
    console.error('Error in Justice Watch data import:', error)
    process.exit(1)
  }
}

// Run the script
main()
