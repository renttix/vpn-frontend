/**
 * Update HubSpot API Key Script
 * 
 * This script updates the HubSpot API key in the .env file.
 * It can be used to quickly update the API key without manually editing the file.
 * 
 * Usage:
 * node update-hubspot-key.js YOUR_NEW_API_KEY
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Get the API key from command line arguments
const newApiKey = process.argv[2];

if (!newApiKey) {
  console.error('❌ ERROR: No API key provided');
  console.log('Usage: node update-hubspot-key.js YOUR_NEW_API_KEY');
  process.exit(1);
}

// Path to .env file
const envFilePath = path.resolve(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error(`❌ ERROR: .env file not found at ${envFilePath}`);
  console.log('Creating a new .env file...');
  
  // Create a new .env file with the HubSpot API key
  fs.writeFileSync(envFilePath, `HUBSPOT_API_KEY=${newApiKey}\n`);
  console.log('✅ Created new .env file with HubSpot API key');
  process.exit(0);
}

// Read the existing .env file
const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

// Update the HubSpot API key
const oldApiKey = envConfig.HUBSPOT_API_KEY;
envConfig.HUBSPOT_API_KEY = newApiKey;

// Convert the updated config back to a string
const updatedEnvContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write the updated content back to the .env file
fs.writeFileSync(envFilePath, updatedEnvContent);

console.log('✅ HubSpot API key updated successfully');
if (oldApiKey) {
  // Only show a few characters of the keys for security
  const maskKey = (key) => {
    if (!key) return 'not set';
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };
  
  console.log(`Old key: ${maskKey(oldApiKey)}`);
  console.log(`New key: ${maskKey(newApiKey)}`);
} else {
  console.log('HubSpot API key was not previously set');
}

// Suggest running the test script
console.log('\n🧪 To verify the new API key, run:');
console.log('node test-hubspot-api.js');
