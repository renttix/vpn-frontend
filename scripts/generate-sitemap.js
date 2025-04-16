/**
 * Sitemap Generator Script for VPN News
 * 
 * This script generates a sitemap.xml file that includes:
 * - Static pages (home, about, contact, etc.)
 * - All category pages
 * - All article pages
 * 
 * Run this script as part of your build process to ensure the sitemap is always up-to-date.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Configure Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'g7f0f6rs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false, // We want fresh data for the sitemap
});

// Base URL for the site
const SITE_URL = 'https://www.vpnnews.co.uk';

// Static pages to include in the sitemap
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', changefreq: 'monthly', priority: '0.7' },
  { url: '/privacy-policy', changefreq: 'monthly', priority: '0.5' },
  { url: '/terms-of-service', changefreq: 'monthly', priority: '0.5' },
];

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(page, includeNews = false, newsData = null, ampUrl = null) {
  let xml = `  <url>\n`;
  xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
  
  if (page.lastmod) {
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
  }
  
  if (page.changefreq) {
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
  }
  
  if (page.priority) {
    xml += `    <priority>${page.priority}</priority>\n`;
  }
  
  // Add AMP link if available
  if (ampUrl) {
    xml += `    <xhtml:link rel="amphtml" href="${SITE_URL}${ampUrl}" />\n`;
  }
  
  // Add Google News specific tags if this is a news article
  if (includeNews && newsData) {
    xml += `    <news:news>\n`;
    xml += `      <news:publication>\n`;
    xml += `        <news:name>VPN News</news:name>\n`;
    xml += `        <news:language>en</news:language>\n`;
    xml += `      </news:publication>\n`;
    xml += `      <news:publication_date>${newsData.pubDate}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(newsData.title)}</news:title>\n`;
    xml += `    </news:news>\n`;
  }
  
  xml += `  </url>\n`;
  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Main function to generate the sitemap
 */
async function generateSitemap() {
  try {
    console.log('Generating sitemap.xml...');
    
    // Fetch all categories
    const categories = await client.fetch(`
      *[_type == "category" && defined(slug.current)] {
        title,
        "slug": slug.current
      }
    `);
    console.log(`Found ${categories.length} categories`);
    
    // Fetch all articles (posts)
    const posts = await client.fetch(`
      *[_type == "post" && defined(slug.current)] {
        title,
        "slug": slug.current,
        publishedAt,
        lastUpdatedAt
      }
    `);
    console.log(`Found ${posts.length} articles`);
    
    // Start building the XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Add static pages
    staticPages.forEach(page => {
      xml += generateUrlEntry(page);
    });
    
    // Add category pages
    categories.forEach(category => {
      const categoryPage = {
        url: `/${category.slug}`,
        changefreq: 'daily',
        priority: '0.8'
      };
      xml += generateUrlEntry(categoryPage);
    });
    
    // Add article pages
    posts.forEach(post => {
      // Use lastUpdatedAt if available, otherwise use publishedAt
      const pubDate = post.publishedAt ? formatDate(post.publishedAt) : formatDate(new Date());
      const lastModDate = post.lastUpdatedAt ? formatDate(post.lastUpdatedAt) : pubDate;
      
      const articlePage = {
        url: `/${post.slug}`,
        lastmod: lastModDate, // Use the last modified date
        changefreq: 'monthly',
        priority: '0.7'
      };
      
      const newsData = {
        pubDate: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
        title: post.title
      };
      
      // Add regular article URL with AMP link
      const ampUrl = `/amp/${post.slug}`;
      xml += generateUrlEntry(articlePage, true, newsData, ampUrl);
      
      // Add AMP version of the article
      const ampPage = {
        url: ampUrl,
        lastmod: lastModDate, // Use the same last modified date for AMP version
        changefreq: 'monthly',
        priority: '0.6'
      };
      xml += generateUrlEntry(ampPage, false, null);
    });
    
    // Close the XML
    xml += '</urlset>';
    
    // Write the sitemap to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log('Sitemap generated successfully!');
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the generator
generateSitemap();
