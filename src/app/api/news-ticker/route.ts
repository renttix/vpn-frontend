import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Cache control - increased to 15 minutes for better performance
const CACHE_MAX_AGE = 15 * 60; // 15 minutes in seconds
let cachedData: any = null;
let lastFetchTime = 0;
let fetchInProgress = false;
let fetchPromise: Promise<any> | null = null;
let fetchErrors = 0;
const MAX_FETCH_ERRORS = 5;

// Fallback headlines for when external API fails
const FALLBACK_HEADLINES = [
  { title: "Latest updates on major court cases" },
  { title: "New legislation proposed for criminal justice reform" },
  { title: "Supreme Court ruling impacts legal precedent" },
  { title: "Legal experts weigh in on controversial verdict" },
  { title: "High-profile trial begins with unexpected testimony" },
  { title: "Police investigation reveals new evidence in ongoing case" },
  { title: "Landmark ruling changes interpretation of key law" },
  { title: "Justice minister announces plans for prison reform" },
  { title: "Court of Appeal overturns controversial conviction" },
  { title: "Legal aid changes impact access to justice, experts say" }
];

// Static headlines that will always work even if all else fails
const STATIC_HEADLINES = [
  { title: "Welcome to VPN London News - Your source for legal news and updates" },
  { title: "Reporting the Truth from the Courtroom Out" },
  { title: "Follow us for the latest legal news and updates" }
];

// Function to extract title from XML item, handling CDATA sections
function extractTitle(item: string): string | null {
  try {
    // First try to match title with CDATA
    const cdataMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    if (cdataMatch) {
      return cdataMatch[1];
    }
    
    // Fall back to regular title matching
    const titleMatch = item.match(/<title>(.*?)<\/title>/);
    return titleMatch ? titleMatch[1] : null;
  } catch (error) {
    console.error('Error extracting title:', error);
    return null;
  }
}

// Function to extract link from XML item, handling CDATA sections
function extractLink(item: string): string | null {
  try {
    // First try to match link with CDATA
    const cdataMatch = item.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/);
    if (cdataMatch) {
      return cdataMatch[1];
    }
    
    // Fall back to regular link matching
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    return linkMatch ? linkMatch[1] : null;
  } catch (error) {
    console.error('Error extracting link:', error);
    return null;
  }
}

// Function to extract pubDate from XML item, handling CDATA sections
function extractPubDate(item: string): string | null {
  try {
    // First try to match pubDate with CDATA
    const cdataMatch = item.match(/<pubDate><!\[CDATA\[(.*?)\]\]><\/pubDate>/);
    if (cdataMatch) {
      return cdataMatch[1];
    }
    
    // Fall back to regular pubDate matching
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    return dateMatch ? dateMatch[1] : null;
  } catch (error) {
    console.error('Error extracting pubDate:', error);
    return null;
  }
}

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  try {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x2f;/g, '/')
      .replace(/&#x5C;/g, '\\')
      .replace(/&#x5c;/g, '\\')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/&#8211;/g, '-')
      .replace(/&#8212;/g, '-')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"');
  } catch (error) {
    console.error('Error decoding HTML entities:', error);
    return text; // Return original text if decoding fails
  }
}

// Function to fetch data from news sources with timeout
async function fetchWithTimeout(url: string, timeout: number = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_MAX_AGE }, // Use Next.js cache
      headers: {
        'User-Agent': 'VPN News/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal,
      cache: 'no-store' // Ensure we're not using browser cache
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Function to fetch headlines from multiple sources
async function fetchHeadlines(): Promise<any> {
  // Try multiple news sources in case one fails
  const newsSources = [
    'https://feeds.bbci.co.uk/news/uk/rss.xml',
    'https://www.theguardian.com/uk/rss',
    'https://feeds.skynews.com/feeds/rss/uk.xml',
    'https://rss.cnn.com/rss/edition_world.rss',
    'https://www.independent.co.uk/news/uk/rss',
    'https://www.telegraph.co.uk/rss.xml',
    'https://www.dailymail.co.uk/news/index.rss',
    'https://www.mirror.co.uk/news/uk-news/rss.xml'
  ];
  
  let xmlData = '';
  let sourceSuccess = false;
  
  // Try each source until one succeeds
  for (const source of newsSources) {
    try {
      // Use a longer timeout (15 seconds)
      const response = await fetchWithTimeout(source, 15000);
      
      if (response.ok) {
        xmlData = await response.text();
        
        // Verify that we got valid XML data
        if (xmlData && xmlData.includes('<item>')) {
          sourceSuccess = true;
          console.log(`Successfully fetched news from ${source}`);
          break;
        } else {
          console.warn(`Received invalid XML from ${source}`);
        }
      }
    } catch (sourceError) {
      console.error(`Error fetching from ${source}:`, sourceError);
      // Continue to next source
    }
  }
  
  // If all sources failed, throw error to use fallback
  if (!sourceSuccess) {
    throw new Error('All news sources failed');
  }
  
  // Simple XML parsing to extract items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = [];
  let match;
  
  try {
    while ((match = itemRegex.exec(xmlData)) !== null) {
      const itemContent = match[1];
      const title = extractTitle(itemContent);
      const link = extractLink(itemContent);
      const pubDate = extractPubDate(itemContent);
      
      if (title) {
        // Decode HTML entities
        const decodedTitle = decodeHtmlEntities(title);
        
        items.push({ 
          title: decodedTitle,
          link: link || '#',
          pubDate: pubDate || new Date().toUTCString()
        });
      }
    }
  } catch (parseError) {
    console.error('Error parsing XML:', parseError);
    throw parseError;
  }
  
  // Format the data
  const headlines = items.slice(0, 10);
  
  // If no headlines were extracted, use fallback
  if (headlines.length === 0) {
    throw new Error('No headlines extracted from XML');
  }
  
  // Reset error counter on success
  fetchErrors = 0;
  
  return { headlines };
}

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // Return cached data if it's still fresh
    if (cachedData && currentTime - lastFetchTime < CACHE_MAX_AGE * 1000) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        },
      });
    }
    
    // If a fetch is already in progress, wait for it to complete
    if (fetchInProgress && fetchPromise) {
      try {
        const result = await fetchPromise;
        return NextResponse.json(result, {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
          },
        });
      } catch (error) {
        // If the ongoing fetch fails, continue to fetch new data
        console.error('Ongoing fetch failed:', error);
      }
    }
    
    // If we've had too many consecutive errors, use static headlines
    if (fetchErrors >= MAX_FETCH_ERRORS) {
      console.warn(`Too many fetch errors (${fetchErrors}), using static headlines`);
      return NextResponse.json(
        { 
          headlines: STATIC_HEADLINES.map(h => ({ 
            ...h, 
            link: '#',
            pubDate: new Date().toUTCString()
          }))
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }
    
    // Start a new fetch
    fetchInProgress = true;
    fetchPromise = fetchHeadlines();
    
    try {
      // Wait for fetch to complete
      const result = await fetchPromise;
      
      // Update cache
      cachedData = result;
      lastFetchTime = currentTime;
      
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        },
      });
    } catch (error) {
      console.error('Error fetching news ticker data:', error);
      
      // Increment error counter
      fetchErrors++;
      
      // Return cached data if available, otherwise use fallback headlines
      return NextResponse.json(
        cachedData || { 
          headlines: FALLBACK_HEADLINES.map(h => ({ 
            ...h, 
            link: '#',
            pubDate: new Date().toUTCString()
          }))
        },
        { 
          status: 200, // Always return 200 to prevent client errors
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    } finally {
      fetchInProgress = false;
      fetchPromise = null;
    }
  } catch (error) {
    console.error('Unexpected error in news ticker route:', error);
    
    // Increment error counter
    fetchErrors++;
    
    // Return fallback headlines as a last resort
    return NextResponse.json(
      { 
        headlines: FALLBACK_HEADLINES.map(h => ({ 
          ...h, 
          link: '#',
          pubDate: new Date().toUTCString()
        }))
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
