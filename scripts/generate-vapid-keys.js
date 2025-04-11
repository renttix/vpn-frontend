#!/usr/bin/env node

/**
 * VAPID Key Generator Script
 * 
 * This script generates VAPID (Voluntary Application Server Identification) keys
 * for use with the Web Push API. These keys are required for sending push notifications.
 * 
 * Usage:
 *   node generate-vapid-keys.js
 * 
 * The script will output:
 * 1. Public key - Add to NEXT_PUBLIC_VAPID_PUBLIC_KEY in .env.local
 * 2. Private key - Add to VAPID_PRIVATE_KEY in .env.local
 * 3. Example .env.local entries
 */

const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);

console.log('\n=== Add to .env.local ===\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_CONTACT_EMAIL=contact@yourdomain.com  # Replace with your email`);

console.log('\n=== Instructions ===\n');
console.log('1. Add the above environment variables to your .env.local file');
console.log('2. Restart your development server');
console.log('3. For production, add these variables to your hosting environment');
console.log('   (e.g., Netlify environment variables or Vercel environment variables)');
console.log('\nNOTE: Keep your private key secure and never commit it to version control!');
