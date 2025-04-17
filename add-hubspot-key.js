/**
 * Add HubSpot API Key to .env File
 * 
 * This script adds the HubSpot API key to the .env file for local development.
 * It preserves existing environment variables and adds or updates the HUBSPOT_API_KEY.
 * 
 * Usage:
 */

const fs = require('fs');
const path = require('path');

// Get the API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Error: No API key provided');
  console.log('Usage: node add-hubspot-key.js YOUR_API_KEY');
  process.exit(1);
}

// Path to .env file
const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
const envFileExists = fs.existsSync(envFilePath);

// Read existing .env file or create a new one
let envContent = '';
if (envFileExists) {
  envContent = fs.readFileSync(envFilePath, 'utf8');
  console.log('Reading existing .env file...');
} else {
  console.log('No .env file found. Creating a new one...');
}

// Check if HUBSPOT_API_KEY already exists in the file
const keyRegex = /^HUBSPOT_API_KEY=.*/m;
const keyExists = keyRegex.test(envContent);

// Update or add the API key
if (keyExists) {
  console.log('Updating existing HUBSPOT_API_KEY...');
  envContent = envContent.replace(keyRegex, `HUBSPOT_API_KEY=${apiKey}`);
} else {
  console.log('Adding HUBSPOT_API_KEY...');
  // Add a newline if the file doesn't end with one
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += `HUBSPOT_API_KEY=${apiKey}\n`;
}

// Write the updated content back to the .env file
fs.writeFileSync(envFilePath, envContent);

console.log(`✅ Successfully added HUBSPOT_API_KEY to .env file`);
console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('\nYou can now run the local development server or test scripts.');
