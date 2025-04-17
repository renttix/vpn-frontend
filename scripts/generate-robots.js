/**
 * Robots.txt Generator Script for VPN News
 * 
 * This script generates a robots.txt file with the correct domain from the environment variable.
 * Run this script as part of your build process to ensure the robots.txt file is always up-to-date.
 */

const fs = require('fs');
const path = require('path');

// For robots.txt, we always want to use the production URL
// This is because robots.txt is only relevant for the production site
const SITE_URL = 'https://www.vpnnews.co.uk';

/**
 * Main function to generate the robots.txt file
 */
function generateRobotsTxt() {
  try {
    console.log('Generating robots.txt...');
    
    // Create the robots.txt content
    const robotsTxt = `# robots.txt for VPN News

# Allow all crawlers
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /api/
Disallow: /_next/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Feed locations
# RSS Feed
Feed: ${SITE_URL}/feed.xml
# JSON Feed
Feed: ${SITE_URL}/feed.json

# Google News specific
User-agent: Googlebot-News
Allow: /
Disallow: /about
Disallow: /contact
Disallow: /privacy-policy
Disallow: /terms-of-service

# Bing specific
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex specific
User-agent: Yandex
Allow: /
Crawl-delay: 1

# Baidu specific
User-agent: Baiduspider
Allow: /
Crawl-delay: 1
`;
    
    // Write the robots.txt to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    console.log('robots.txt generated successfully!');
    
  } catch (error) {
    console.error('Error generating robots.txt:', error);
  }
}

// Run the generator
generateRobotsTxt();
