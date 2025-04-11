#!/usr/bin/env node

/**
 * Sanity Webhook Setup Script for Notifications
 * 
 * This script helps set up a webhook in Sanity Studio to trigger notifications
 * when new articles are published.
 * 
 * Prerequisites:
 * - Sanity CLI installed: npm install -g @sanity/cli
 * - Logged in to Sanity: sanity login
 * - SANITY_AUTH_TOKEN environment variable set
 * 
 * Usage:
 *   node setup-notification-webhook.js <projectId> <dataset> <webhookUrl>
 * 
 * Example:
 *   node setup-notification-webhook.js abc123 production https://yourdomain.com/api/notifications/trigger
 */

const https = require('https');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get command line arguments
const args = process.argv.slice(2);
const projectId = args[0];
const dataset = args[1] || 'production';
const webhookUrl = args[2];

// Validate arguments
if (!projectId || !webhookUrl) {
  console.log('\nMissing required arguments.');
  console.log('Usage: node setup-notification-webhook.js <projectId> <dataset> <webhookUrl>');
  console.log('\nExample:');
  console.log('node setup-notification-webhook.js abc123 production https://yourdomain.com/api/notifications/trigger\n');
  rl.close();
  process.exit(1);
}

// Get auth token
const authToken = process.env.SANITY_AUTH_TOKEN;
if (!authToken) {
  console.log('\nError: SANITY_AUTH_TOKEN environment variable not set.');
  console.log('Please set the SANITY_AUTH_TOKEN environment variable with your Sanity auth token.');
  console.log('You can get a token by running: sanity debug --secrets\n');
  rl.close();
  process.exit(1);
}

// Webhook configuration
const webhookName = 'New Article Notification';
const webhookConfig = {
  name: webhookName,
  url: webhookUrl,
  dataset: dataset,
  projectId: projectId,
  filter: '_type == "post" && !defined(drafts) && publishedAt > now()-60',
  projection: '{_id, title, slug, mainImage{asset->{url}}}',
  httpMethod: 'POST',
  headers: [
    {
      name: 'Content-Type',
      value: 'application/json'
    },
    {
      name: 'x-api-key',
      value: process.env.NOTIFICATIONS_API_KEY || 'sanity-webhook'
    }
  ],
  includeDrafts: false,
  enabled: true
};

// Function to create webhook
function createWebhook() {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.sanity.io',
      port: 443,
      path: `/v2021-03-25/hooks/${projectId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status Code: ${res.statusCode}, Response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(webhookConfig));
    req.end();
  });
}

// Function to list existing webhooks
function listWebhooks() {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.sanity.io',
      port: 443,
      path: `/v2021-03-25/hooks/${projectId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status Code: ${res.statusCode}, Response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Function to delete a webhook
function deleteWebhook(id) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.sanity.io',
      port: 443,
      path: `/v2021-03-25/hooks/${projectId}/${id}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : { success: true });
        } else {
          reject(new Error(`Status Code: ${res.statusCode}, Response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('\n=== Setting up Sanity Webhook for Notifications ===\n');
    console.log(`Project ID: ${projectId}`);
    console.log(`Dataset: ${dataset}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    
    // Check for existing webhooks
    console.log('\nChecking for existing webhooks...');
    const webhooks = await listWebhooks();
    
    // Find existing notification webhook
    const existingWebhook = webhooks.find(webhook => webhook.name === webhookName);
    
    if (existingWebhook) {
      console.log(`\nFound existing webhook: ${existingWebhook.name} (${existingWebhook.id})`);
      
      // Ask to replace
      rl.question('Do you want to replace it? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log(`\nDeleting existing webhook...`);
          await deleteWebhook(existingWebhook.id);
          
          console.log(`\nCreating new webhook...`);
          const newWebhook = await createWebhook();
          
          console.log(`\nWebhook created successfully!`);
          console.log(`ID: ${newWebhook.id}`);
          console.log(`Name: ${newWebhook.name}`);
          console.log(`URL: ${newWebhook.url}`);
          
          console.log('\n=== Next Steps ===');
          console.log('1. Make sure your notification API is properly configured');
          console.log('2. Set the NOTIFICATIONS_API_KEY environment variable to secure your webhook');
          console.log('3. Test the webhook by publishing a new article in Sanity Studio');
        } else {
          console.log('\nWebhook setup cancelled.');
        }
        
        rl.close();
      });
    } else {
      console.log('\nNo existing notification webhook found.');
      console.log('\nCreating new webhook...');
      
      const newWebhook = await createWebhook();
      
      console.log('\nWebhook created successfully!');
      console.log(`ID: ${newWebhook.id}`);
      console.log(`Name: ${newWebhook.name}`);
      console.log(`URL: ${newWebhook.url}`);
      
      console.log('\n=== Next Steps ===');
      console.log('1. Make sure your notification API is properly configured');
      console.log('2. Set the NOTIFICATIONS_API_KEY environment variable to secure your webhook');
      console.log('3. Test the webhook by publishing a new article in Sanity Studio');
      
      rl.close();
    }
  } catch (error) {
    console.error('\nError setting up webhook:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the main function
main();
