/**
 * Script to add reCAPTCHA keys to the .env file
 * 
 * Usage:
 * node add-recaptcha-keys.js <secret-key> <site-key>
 * 
 * Example:
 * node add-recaptcha-keys.js 6LcmIhsrAAAANuULsraMaZzVeInmm4TTat9kLG2 6LcmIhsrAAAAAJkayB_tuSZKgW_PhAjzp0Ze9iNa
 */

const fs = require('fs');
const path = require('path');

// Get the reCAPTCHA keys from command line arguments
const secretKey = process.argv[2];
const siteKey = process.argv[3];

if (!secretKey || !siteKey) {
  console.error('Error: Both secret key and site key are required.');
  console.log('Usage: node add-recaptcha-keys.js <secret-key> <site-key>');
  process.exit(1);
}

// Path to the .env file
const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('Error: .env file not found. Please create one first.');
  console.log('You can copy .env.sample to .env as a starting point.');
  process.exit(1);
}

// Read the current .env file
let envContent = fs.readFileSync(envFilePath, 'utf8');

// Check if reCAPTCHA keys already exist
const secretKeyExists = envContent.includes('RECAPTCHA_SECRET_KEY=');
const siteKeyExists = envContent.includes('NEXT_PUBLIC_RECAPTCHA_SITE_KEY=');

// Update or add the reCAPTCHA keys
if (secretKeyExists) {
  // Replace existing secret key
  envContent = envContent.replace(
    /RECAPTCHA_SECRET_KEY=.*/,
    `RECAPTCHA_SECRET_KEY=${secretKey}`
  );
} else {
  // Add new secret key
  envContent += `\n# reCAPTCHA Integration\nRECAPTCHA_SECRET_KEY=${secretKey}\n`;
}

if (siteKeyExists) {
  // Replace existing site key
  envContent = envContent.replace(
    /NEXT_PUBLIC_RECAPTCHA_SITE_KEY=.*/,
    `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${siteKey}`
  );
} else {
  // Add new site key (only if we didn't just add the section header)
  if (secretKeyExists) {
    envContent += `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${siteKey}\n`;
  } else {
    // The section header was already added when adding the secret key
    envContent += `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${siteKey}\n`;
  }
}

// Write the updated content back to the .env file
fs.writeFileSync(envFilePath, envContent);

console.log('reCAPTCHA keys added to .env file successfully!');
console.log(`Secret Key: ${secretKey}`);
console.log(`Site Key: ${siteKey}`);
console.log('\nRemember to add these keys to your Vercel environment variables for production.');
