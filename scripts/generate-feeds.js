/**
 * Feed Generator Script for VPN News
 * 
 * This script generates both RSS (feed.xml) and JSON Feed (feed.json) files that include:
 * - Site information
 * - Recent articles
 * 
 * Run this script as part of your build process to ensure the feeds are always up-to-date.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Configure Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'g7f0f6rs',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false, // We want fresh data for the feeds
});

// Base URL for the site
const SITE_URL = 'https://www.vpnnews.co.uk';
const SITE_TITLE = 'Video Production News';
const SITE_DESCRIPTION = 'Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.';
const SITE_LANGUAGE = 'en';
const SITE_COPYRIGHT = `© ${new Date().getFullYear()} Video Production News`;
const SITE_FAVICON = `${SITE_URL}/images/vpn.ico`;
const SITE_LOGO = `${SITE_URL}/images/og-image.jpg`;
const SITE_AUTHOR = {
  name: 'Video Production News Team',
  url: SITE_URL,
  avatar: `${SITE_URL}/images/vpn-logo.png`
};

// Number of articles to include in the feeds
const MAX_ARTICLES = 50;

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
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
 * Format a date as RFC 822 for RSS
 */
function formatRssDate(date) {
  return new Date(date).toUTCString();
}

/**
 * Format a date as ISO 8601 for JSON Feed
 */
function formatJsonDate(date) {
  return new Date(date).toISOString();
}

/**
 * Extract a text excerpt from Portable Text
 */
function extractExcerpt(body, length = 200) {
  if (!body || !Array.isArray(body)) return '';
  
  let text = '';
  
  // Loop through blocks and extract text
  for (const block of body) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child._type === 'span' && child.text) {
          text += child.text + ' ';
        }
      }
    }
  }
  
  // Trim and limit to specified length
  text = text.trim();
  if (text.length > length) {
    text = text.substring(0, length).trim() + '...';
  }
  
  return text;
}

/**
 * Generate RSS feed XML
 */
function generateRssFeed(posts) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">\n';
  xml += '  <channel>\n';
  xml += `    <title>${escapeXml(SITE_TITLE)}</title>\n`;
  xml += `    <description>${escapeXml(SITE_DESCRIPTION)}</description>\n`;
  xml += `    <link>${SITE_URL}</link>\n`;
  xml += `    <language>${SITE_LANGUAGE}</language>\n`;
  xml += `    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>\n`;
  xml += `    <copyright>${escapeXml(SITE_COPYRIGHT)}</copyright>\n`;
  xml += `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n`;
  xml += `    <image>\n`;
  xml += `      <url>${SITE_LOGO}</url>\n`;
  xml += `      <title>${escapeXml(SITE_TITLE)}</title>\n`;
  xml += `      <link>${SITE_URL}</link>\n`;
  xml += `    </image>\n`;
  
  // Add items
  posts.forEach(post => {
    const postUrl = `${SITE_URL}/${post.slug}`;
    const pubDate = post.publishedAt ? formatRssDate(post.publishedAt) : formatRssDate(new Date());
    const excerpt = post.excerpt || extractExcerpt(post.body);
    
    xml += '    <item>\n';
    xml += `      <title>${escapeXml(post.title)}</title>\n`;
    xml += `      <link>${postUrl}</link>\n`;
    xml += `      <guid isPermaLink="true">${postUrl}</guid>\n`;
    xml += `      <pubDate>${pubDate}</pubDate>\n`;
    xml += `      <description>${escapeXml(excerpt)}</description>\n`;
    
    // Add author if available
    if (post.author && post.author.name) {
      xml += `      <dc:creator>${escapeXml(post.author.name)}</dc:creator>\n`;
    }
    
    // Add categories if available
    if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
      post.categories.forEach(category => {
        if (category && category.title) {
          xml += `      <category>${escapeXml(category.title)}</category>\n`;
        }
      });
    }
    
    // Add tags if available
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
      post.tags.forEach(tag => {
        if (tag && tag.title) {
          xml += `      <category>${escapeXml(tag.title)}</category>\n`;
        }
      });
    }
    
    // Add image if available
    if (post.mainImage && post.mainImage.asset && post.mainImage.asset.url) {
      xml += `      <media:content url="${post.mainImage.asset.url}" medium="image" />\n`;
    }
    
    xml += '    </item>\n';
  });
  
  xml += '  </channel>\n';
  xml += '</rss>';
  
  return xml;
}

/**
 * Generate JSON Feed
 */
function generateJsonFeed(posts) {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_TITLE,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    icon: SITE_FAVICON,
    favicon: SITE_FAVICON,
    authors: [
      {
        name: SITE_AUTHOR.name,
        url: SITE_AUTHOR.url,
        avatar: SITE_AUTHOR.avatar
      }
    ],
    language: SITE_LANGUAGE,
    items: []
  };
  
  // Add items
  posts.forEach(post => {
    const postUrl = `${SITE_URL}/${post.slug}`;
    const datePublished = post.publishedAt ? formatJsonDate(post.publishedAt) : formatJsonDate(new Date());
    const dateModified = post.lastUpdatedAt ? formatJsonDate(post.lastUpdatedAt) : datePublished;
    const excerpt = post.excerpt || extractExcerpt(post.body);
    
    const item = {
      id: postUrl,
      url: postUrl,
      title: post.title,
      content_html: excerpt,
      summary: excerpt,
      date_published: datePublished,
      date_modified: dateModified,
      authors: []
    };
    
    // Add author if available
    if (post.author && post.author.name) {
      item.authors.push({
        name: post.author.name,
        url: post.author.slug ? `${SITE_URL}/author/${post.author.slug.current}` : undefined,
        avatar: post.author.image && post.author.image.asset ? post.author.image.asset.url : undefined
      });
    }
    
    // Add tags if available
    if (post.categories || post.tags) {
      item.tags = [];
      
      if (post.categories && Array.isArray(post.categories)) {
        post.categories.forEach(category => {
          if (category && category.title) item.tags.push(category.title);
        });
      }
      
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && tag.title) item.tags.push(tag.title);
        });
      }
    }
    
    // Add image if available
    if (post.mainImage && post.mainImage.asset && post.mainImage.asset.url) {
      item.image = post.mainImage.asset.url;
      item.banner_image = post.mainImage.asset.url;
    }
    
    // Add to items array
    feed.items.push(item);
  });
  
  return JSON.stringify(feed, null, 2);
}

/**
 * Main function to generate the feeds
 */
async function generateFeeds() {
  try {
    console.log('Generating RSS and JSON feeds...');
    
    // Fetch recent articles (posts)
    const posts = await client.fetch(`
      *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...${MAX_ARTICLES}] {
        title,
        "slug": slug.current,
        publishedAt,
        lastUpdatedAt,
        excerpt,
        body,
        mainImage {
          asset-> {
            url
          }
        },
        "author": author-> {
          name,
          "slug": slug.current,
          image {
            asset-> {
              url
            }
          }
        },
        "categories": categories[]-> {
          title,
          "slug": slug.current
        },
        "tags": tags[]-> {
          title,
          "slug": slug.current
        }
      }
    `);
    console.log(`Found ${posts.length} articles for feeds`);
    
    // Generate RSS feed
    const rssXml = generateRssFeed(posts);
    
    // Generate JSON feed
    const jsonFeed = generateJsonFeed(posts);
    
    // Write the feeds to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'feed.xml'), rssXml);
    fs.writeFileSync(path.join(publicDir, 'feed.json'), jsonFeed);
    
    console.log('Feeds generated successfully!');
    
  } catch (error) {
    console.error('Error generating feeds:', error);
  }
}

// Run the generator
generateFeeds();
