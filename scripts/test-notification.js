#!/usr/bin/env node

/**
 * Test Notification Script
 * 
 * This script sends a test notification to all subscribed users.
 * It directly calls the notification trigger API endpoint with test data.
 * 
 * Usage:
 *   node test-notification.js
 */

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

// Get API key from environment variables
const apiKey = process.env.NOTIFICATIONS_API_KEY;

if (!apiKey) {
  console.error('Error: NOTIFICATIONS_API_KEY environment variable not set.');
  console.error('Please set this variable in your .env.local file.');
  process.exit(1);
}

// Test article data
const testArticle = {
  _id: 'test-article-' + Date.now(),
  title: 'Test Notification Article',
  slug: {
    current: 'test-notification'
  },
  mainImage: {
    asset: {
      url: 'https://via.placeholder.com/800x450'
    }
  },
  publishedAt: new Date().toISOString()
};

// Function to send test notification
async function sendTestNotification() {
  return new Promise((resolve, reject) => {
    // Determine if we're using localhost or a remote URL
    const isLocalhost = true; // Change to false if testing with a remote URL
    
    const options = {
      hostname: isLocalhost ? 'localhost' : 'your-domain.com',
      port: isLocalhost ? 3000 : 443, // Use 3000 for Next.js dev server, 443 for HTTPS
      path: '/api/notifications/trigger',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    };
    
    // Choose http or https module based on hostname
    const requestModule = isLocalhost ? http : https;
    
    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (e) {
            resolve({ success: true, message: data });
          }
        } else {
          reject(new Error(`Status Code: ${res.statusCode}, Response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(testArticle));
    req.end();
  });
}

// Main function
async function main() {
  console.log('\n=== Sending Test Notification ===\n');
  
  try {
    console.log('Sending notification with test article data...');
    const result = await sendTestNotification();
    
    console.log('\nNotification sent successfully!');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n=== Next Steps ===');
    console.log('1. Check your browser for the notification');
    console.log('2. If no notification appears, check the following:');
    console.log('   - Browser permissions for notifications');
    console.log('   - Browser console for any errors');
    console.log('   - Server logs for any errors');
    console.log('   - Make sure you have subscribed to notifications');
  } catch (error) {
    console.error('\nError sending notification:', error.message);
    
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your Next.js development server is running');
    console.log('2. Check that the notification API endpoint is working');
    console.log('3. Verify that the API key is correct');
    console.log('4. Check server logs for more detailed error information');
  }
}

// Run the main function
main();
