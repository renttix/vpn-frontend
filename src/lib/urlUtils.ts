/**
 * URL Utilities
 * 
 * This utility provides functions to generate URLs for various parts of the site.
 * It centralizes URL generation to use environment variables instead of hardcoded domains.
 */

/**
 * Get the base URL for the site
 * 
 * @returns The base URL for the site
 */
export function getBaseUrl(): string {
  // Use the environment variable if available, otherwise fallback to localhost
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Generate a full URL for a path
 * 
 * @param path The path to generate a URL for
 * @returns The full URL
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl();
  
  // Remove trailing slash from base URL if present
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Add leading slash to path if not present
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${normalizedBaseUrl}${normalizedPath}`;
}

/**
 * Generate a URL for an article
 * 
 * @param slug The slug of the article
 * @returns The full URL for the article
 */
export function getArticleUrl(slug: string): string {
  return getFullUrl(slug);
}

/**
 * Generate a URL for a category
 * 
 * @param slug The slug of the category
 * @returns The full URL for the category
 */
export function getCategoryUrl(slug: string): string {
  return getFullUrl(slug);
}

/**
 * Generate a URL for an author
 * 
 * @param slug The slug of the author
 * @returns The full URL for the author
 */
export function getAuthorUrl(slug: string): string {
  return getFullUrl(`author/${slug}`);
}

/**
 * Generate a URL for a series
 * 
 * @param slug The slug of the series
 * @returns The full URL for the series
 */
export function getSeriesUrl(slug: string): string {
  return getFullUrl(`series/${slug}`);
}

/**
 * Generate a URL for a tag
 * 
 * @param slug The slug of the tag
 * @returns The full URL for the tag
 */
export function getTagUrl(slug: string): string {
  return getFullUrl(`tag/${slug}`);
}

/**
 * Generate a URL for an AMP version of an article
 * 
 * @param slug The slug of the article
 * @returns The full URL for the AMP version of the article
 */
export function getAmpUrl(slug: string): string {
  return getFullUrl(`amp/${slug}`);
}

/**
 * Generate a URL for the sitemap
 * 
 * @returns The full URL for the sitemap
 */
export function getSitemapUrl(): string {
  return getFullUrl('sitemap.xml');
}

/**
 * Generate a URL for the RSS feed
 * 
 * @returns The full URL for the RSS feed
 */
export function getRssUrl(): string {
  return getFullUrl('feed.xml');
}

/**
 * Generate a URL for the Atom feed
 * 
 * @returns The full URL for the Atom feed
 */
export function getAtomUrl(): string {
  return getFullUrl('atom.xml');
}

/**
 * Generate a URL for the JSON feed
 * 
 * @returns The full URL for the JSON feed
 */
export function getJsonFeedUrl(): string {
  return getFullUrl('feed.json');
}

/**
 * Generate a URL for the search page
 * 
 * @param query The search query
 * @returns The full URL for the search page
 */
export function getSearchUrl(query?: string): string {
  if (query) {
    return getFullUrl(`search?q=${encodeURIComponent(query)}`);
  }
  return getFullUrl('search');
}

/**
 * Generate a URL for the latest articles page
 * 
 * @returns The full URL for the latest articles page
 */
export function getLatestUrl(): string {
  return getFullUrl('latest');
}

/**
 * Generate a URL for a static asset
 * 
 * @param path The path to the asset
 * @returns The full URL for the asset
 */
export function getAssetUrl(path: string): string {
  return getFullUrl(path);
}

/**
 * Generate a URL for a static page
 * 
 * @param path The path to the page
 * @returns The full URL for the page
 */
export function getPageUrl(path: string): string {
  return getFullUrl(path);
}

/**
 * Generate a canonical URL for the current page
 * 
 * @param path The path of the current page
 * @returns The canonical URL for the current page
 */
export function getCanonicalUrl(path: string): string {
  return getFullUrl(path);
}

/**
 * Generate a URL for the logo
 * 
 * @returns The full URL for the logo
 */
export function getLogoUrl(): string {
  return getFullUrl('logo.png');
}

/**
 * Generate a URL for the favicon
 * 
 * @returns The full URL for the favicon
 */
export function getFaviconUrl(): string {
  return getFullUrl('favicon.ico');
}

/**
 * Generate a URL for the manifest
 * 
 * @returns The full URL for the manifest
 */
export function getManifestUrl(): string {
  return getFullUrl('manifest.json');
}

/**
 * Generate a URL for the robots.txt file
 * 
 * @returns The full URL for the robots.txt file
 */
export function getRobotsUrl(): string {
  return getFullUrl('robots.txt');
}
