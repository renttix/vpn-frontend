#!/usr/bin/env node

/**
 * This script tests the Netlify build process locally to ensure everything is working correctly
 * before deploying to Netlify.
 * 
 * Usage:
 * 1. Run `node test-netlify-build.js` from the frontend directory
 * 2. The script will build the project and check for common issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}=== Testing Netlify Build Process ===${colors.reset}\n`);

// Check if .env.local exists
console.log(`${colors.blue}Checking for environment variables...${colors.reset}`);
if (!fs.existsSync(path.join(__dirname, '.env.local'))) {
  console.log(`${colors.yellow}Warning: .env.local file not found. Creating a sample one for testing...${colors.reset}`);
  
  // Copy .env.sample to .env.local if it exists
  if (fs.existsSync(path.join(__dirname, '.env.sample'))) {
    fs.copyFileSync(
      path.join(__dirname, '.env.sample'),
      path.join(__dirname, '.env.local')
    );
    console.log(`${colors.green}Created .env.local from .env.sample${colors.reset}`);
  } else {
    console.log(`${colors.red}Error: .env.sample file not found. Please create a .env.local file manually.${colors.reset}`);
    process.exit(1);
  }
}

// Check next.config.js for static export settings
console.log(`${colors.blue}Checking Next.js configuration...${colors.reset}`);
const nextConfig = fs.readFileSync(path.join(__dirname, 'next.config.js'), 'utf8');
if (nextConfig.includes('output: \'export\'') && !nextConfig.includes('// output: \'export\'')) {
  console.log(`${colors.red}Error: Static export mode is enabled in next.config.js. This will break API routes on Netlify.${colors.reset}`);
  console.log(`${colors.yellow}Please comment out the 'output: "export"' line in next.config.js${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}Next.js configuration looks good for Netlify deployment${colors.reset}`);
}

// Check Sanity client configuration
console.log(`${colors.blue}Checking Sanity client configuration...${colors.reset}`);
const sanityClient = fs.readFileSync(path.join(__dirname, 'src', 'lib', 'sanity.client.ts'), 'utf8');
if (sanityClient.includes('useCdn: false') && !sanityClient.includes('useCdn: process.env.NODE_ENV === \'production\'')) {
  console.log(`${colors.yellow}Warning: Sanity client is not using CDN in production. This may impact performance.${colors.reset}`);
} else {
  console.log(`${colors.green}Sanity client configuration looks good${colors.reset}`);
}

// Check netlify.toml configuration
console.log(`${colors.blue}Checking netlify.toml configuration...${colors.reset}`);
if (fs.existsSync(path.join(__dirname, 'netlify.toml'))) {
  const netlifyToml = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
  if (!netlifyToml.includes('@netlify/plugin-nextjs')) {
    console.log(`${colors.yellow}Warning: @netlify/plugin-nextjs is not configured in netlify.toml${colors.reset}`);
  } else {
    console.log(`${colors.green}netlify.toml configuration looks good${colors.reset}`);
  }
} else {
  console.log(`${colors.red}Error: netlify.toml file not found${colors.reset}`);
  process.exit(1);
}

// Run a production build
console.log(`\n${colors.magenta}Running a production build to test for errors...${colors.reset}`);
console.log(`${colors.yellow}This may take a few minutes...${colors.reset}`);

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`\n${colors.green}Build completed successfully!${colors.reset}`);
} catch (error) {
  console.log(`\n${colors.red}Build failed. Please fix the errors above before deploying to Netlify.${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.cyan}=== Netlify Build Test Completed ===${colors.reset}`);
console.log(`\n${colors.green}Your project is ready to be deployed to Netlify!${colors.reset}`);
console.log(`${colors.white}Follow the instructions in NETLIFY_DEPLOYMENT_GUIDE.md to deploy your site.${colors.reset}`);
