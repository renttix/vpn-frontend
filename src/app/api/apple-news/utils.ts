/**
 * Utility functions for Apple News integration
 */

import crypto from 'crypto';

/**
 * Generate Apple News API authentication headers
 * @param method HTTP method (GET, POST, DELETE)
 * @param path API path
 * @param apiKey Apple News API key
 * @param apiSecret Apple News API secret
 * @param data Request body (for POST requests)
 * @returns Object containing the required headers
 */
export function generateAppleNewsAuthHeaders(
  method: string,
  path: string,
  apiKey: string,
  apiSecret: string,
  data?: string
) {
  const date = new Date().toUTCString();
  const contentType = data ? 'application/json' : '';
  
  // Create the canonical request
  const canonicalRequest = [
    method,
    path,
    date,
    contentType,
    data || ''
  ].join(';');
  
  // Create the HMAC signature
  const key = Buffer.from(apiSecret, 'base64');
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(canonicalRequest);
  const signature = hmac.digest('base64');
  
  // Return the headers
  return {
    'Authorization': `HHMAC; key=${apiKey}; signature=${signature}; date=${date}`,
    'Content-Type': contentType || undefined,
  };
}

/**
 * Convert Sanity block content to Apple News Format
 * @param blocks Sanity block content
 * @returns Apple News Format components
 */
export function convertBlocksToAppleNewsComponents(blocks: any[]) {
  if (!blocks || !Array.isArray(blocks)) {
    return [];
  }
  
  return blocks.map(block => {
    // Handle different block types
    switch (block._type) {
      case 'block':
        return convertTextBlock(block);
      case 'image':
        return convertImageBlock(block);
      default:
        // For unsupported block types, return a paragraph
        return {
          role: 'body',
          text: 'Unsupported content',
          format: 'html'
        };
    }
  }).filter(Boolean); // Remove any null/undefined components
}

/**
 * Convert a Sanity text block to Apple News Format
 * @param block Sanity text block
 * @returns Apple News Format component
 */
function convertTextBlock(block: any) {
  // Determine the role based on the block style
  let role = 'body';
  if (block.style && block.style.startsWith('h')) {
    const level = parseInt(block.style.substring(1));
    if (level >= 1 && level <= 6) {
      role = `heading${level}`;
    }
  }
  
  // Convert the text with marks to HTML
  let html = '';
  if (block.children && Array.isArray(block.children)) {
    html = block.children.map((child: any) => {
      let text = child.text || '';
      
      // Apply marks (bold, italic, etc.)
      if (child.marks && Array.isArray(child.marks)) {
        child.marks.forEach((mark: string) => {
          switch (mark) {
            case 'strong':
              text = `<b>${text}</b>`;
              break;
            case 'em':
              text = `<i>${text}</i>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            // Add more mark types as needed
          }
        });
      }
      
      return text;
    }).join('');
  }
  
  return {
    role,
    text: html,
    format: 'html'
  };
}

/**
 * Convert a Sanity image block to Apple News Format
 * @param block Sanity image block
 * @returns Apple News Format component
 */
function convertImageBlock(block: any) {
  if (!block.asset || !block.asset._ref) {
    return null;
  }
  
  // Extract the image URL from the asset reference
  // In a real implementation, you would use Sanity's image URL builder
  const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}`;
  
  return {
    role: 'photo',
    URL: imageUrl,
    caption: block.caption || '',
    layout: 'photoLayout'
  };
}

/**
 * Create a complete Apple News Format document
 * @param post Sanity post data
 * @returns Apple News Format document
 */
export function createAppleNewsDocument(post: any) {
  // Define component types
  type AppleNewsComponent = {
    role: string;
    text?: string;
    URL?: string;
    caption?: string;
    format?: string;
    layout?: string;
  };

  // Convert the body blocks to Apple News components and filter out nulls
  const components = post.body ? convertBlocksToAppleNewsComponents(post.body) : [];
  
  // Create components array with proper typing, filtering out any null values
  const appleNewsComponents: AppleNewsComponent[] = components.filter(Boolean) as AppleNewsComponent[];
  
  // Add the title component at the beginning
  appleNewsComponents.unshift({
    role: 'title',
    text: post.title,
    format: 'html',
    layout: 'titleLayout'
  });
  
  // Add the author component
  if (post.author) {
    appleNewsComponents.push({
      role: 'author',
      text: `By ${post.author}`,
      format: 'html',
      layout: 'authorLayout'
    });
  }
  
  // Create the complete document
  return {
    version: '1.1',
    identifier: `post-${post.slug.current}`,
    title: post.title,
    language: 'en',
    layout: {
      columns: 7,
      width: 1024,
      margin: 60,
      gutter: 20
    },
    componentLayouts: {
      titleLayout: {
        columnSpan: 7,
        columnStart: 0,
        margin: {
          top: 30,
          bottom: 10
        }
      },
      authorLayout: {
        columnSpan: 7,
        columnStart: 0,
        margin: {
          top: 10,
          bottom: 30
        }
      },
      photoLayout: {
        columnSpan: 7,
        columnStart: 0,
        margin: {
          top: 20,
          bottom: 20
        }
      }
    },
    components: appleNewsComponents,
    metadata: {
      authors: [post.author],
      canonicalURL: `${process.env.NEXT_PUBLIC_SITE_URL}/${post.slug.current}`,
      datePublished: post.publishedAt,
      excerpt: post.seoDescription,
      keywords: post.categories || [],
      thumbnailURL: post.mainImage?.url,
      title: post.seoTitle || post.title
    },
    documentStyle: {
      backgroundColor: '#FFFFFF'
    },
    textStyle: {
      fontName: 'Helvetica',
      fontSize: 18,
      lineHeight: 24,
      textColor: '#000000'
    }
  };
}
