/**
 * Script to update Justice Watch channels in Sanity
 * 
 * This script updates the existing channels to use the correct field name (customUrl)
 * 
 * Usage:
 * node scripts/update-justice-watch-channels.js
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

// Update channels
async function updateChannels() {
  console.log('Updating Justice Watch channels...')
  
  try {
    // Find all Justice Watch channels
    const channels = await client.fetch(
      `*[_type == "justiceWatchChannel"]`
    )
    
    console.log(`Found ${channels.length} Justice Watch channels`)
    
    // Update each channel
    for (const channel of channels) {
      // Check if the channel has youtubeCustomUrl but not customUrl
      if (channel.youtubeCustomUrl && !channel.customUrl) {
        console.log(`Updating channel ${channel.title} (${channel._id})...`)
        
        // Update the channel to use customUrl instead of youtubeCustomUrl
        await client.patch(channel._id)
          .set({ customUrl: channel.youtubeCustomUrl })
          .unset(['youtubeCustomUrl'])
          .commit()
        
        console.log(`Updated channel ${channel.title} (${channel._id})`)
      } else {
        console.log(`Channel ${channel.title} (${channel._id}) already has the correct field name`)
      }
    }
    
    console.log('All channels updated successfully!')
  } catch (error) {
    console.error('Error updating channels:', error)
    throw error
  }
}

// Main function
async function main() {
  try {
    console.log('Starting Justice Watch channels update...')
    await updateChannels()
    console.log('Justice Watch channels update completed successfully!')
  } catch (error) {
    console.error('Error in Justice Watch channels update:', error)
    process.exit(1)
  }
}

// Run the script
main()
