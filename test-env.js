/**
 * Test Environment Variables
 * 
 * This script tests if environment variables are being loaded correctly.
 * It prints out the value of HUBSPOT_API_KEY and other environment variables.
 */

// Import required modules
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(process.cwd(), 'frontend', '.env') });

console.log('Testing environment variables...');
console.log('HUBSPOT_API_KEY:', process.env.HUBSPOT_API_KEY ? `${process.env.HUBSPOT_API_KEY.substring(0, 8)}...${process.env.HUBSPOT_API_KEY.substring(process.env.HUBSPOT_API_KEY.length - 4)}` : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'Not set');
console.log('NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'Not set');

// Print the current working directory
console.log('Current working directory:', process.cwd());

// Print the .env file path
const envPath = path.resolve(process.cwd(), 'frontend', '.env');
console.log('.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

// If the .env file exists, print its contents
if (fs.existsSync(envPath)) {
  console.log('.env file contents:');
  const envContents = fs.readFileSync(envPath, 'utf8');
  // Print only the HUBSPOT_API_KEY line (with the key partially masked)
  const lines = envContents.split('\n');
  for (const line of lines) {
    if (line.startsWith('HUBSPOT_API_KEY=')) {
      const key = line.split('=')[1];
      console.log(`HUBSPOT_API_KEY=${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
    } else if (!line.includes('API_KEY') && !line.includes('SECRET') && !line.includes('TOKEN')) {
      console.log(line);
    } else {
      console.log('[REDACTED]');
    }
  }
}
