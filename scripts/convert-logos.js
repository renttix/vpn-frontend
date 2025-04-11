/**
 * Logo Conversion Script
 * 
 * This script helps convert and optimize logo images for the VPN News website.
 * It takes the source logo images and converts them to the correct format and dimensions.
 * 
 * Usage:
 * 1. Place your source logo images in the 'source-logos' directory
 * 2. Run this script with Node.js: node convert-logos.js
 * 3. The optimized logo images will be placed in the 'public/images' directory
 * 
 * Requirements:
 * - Node.js
 * - sharp package (install with: npm install sharp)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create source-logos directory if it doesn't exist
const sourceDir = path.join(__dirname, 'source-logos');
if (!fs.existsSync(sourceDir)) {
  fs.mkdirSync(sourceDir);
  console.log('Created source-logos directory. Please place your logo images here.');
  console.log('Required images:');
  console.log('1. black-logo.png - Black logo for light mode');
  console.log('2. white-logo.png - White logo for dark mode and footer');
  process.exit(0);
}

// Check if source logo images exist
const blackLogoPath = path.join(sourceDir, 'black-logo.png');
const whiteLogoPath = path.join(sourceDir, 'white-logo.png');

if (!fs.existsSync(blackLogoPath)) {
  console.error('Error: black-logo.png not found in source-logos directory');
  process.exit(1);
}

if (!fs.existsSync(whiteLogoPath)) {
  console.error('Error: white-logo.png not found in source-logos directory');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Define the output paths
const blackLogoOutputPath = path.join(outputDir, 'vpn-logo-black.png');
const whiteLogoOutputPath = path.join(outputDir, 'vpn-logo-white.png');

// Process the black logo
sharp(blackLogoPath)
  .resize(200, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toFile(blackLogoOutputPath)
  .then(() => {
    console.log('Successfully created vpn-logo-black.png');
  })
  .catch(err => {
    console.error('Error processing black logo:', err);
  });

// Process the white logo
sharp(whiteLogoPath)
  .resize(200, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toFile(whiteLogoOutputPath)
  .then(() => {
    console.log('Successfully created vpn-logo-white.png');
  })
  .catch(err => {
    console.error('Error processing white logo:', err);
  });

console.log('Processing logo images...');
console.log('Note: You may need to install the sharp package if not already installed:');
console.log('npm install sharp');
