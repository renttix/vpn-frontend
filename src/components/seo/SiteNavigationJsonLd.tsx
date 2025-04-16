import React from 'react';
import Script from 'next/script';

interface NavigationItem {
  name: string;
  url: string;
}

interface SiteNavigationJsonLdProps {
  items: NavigationItem[];
  siteUrl?: string;
}

/**
 * SiteNavigation Schema Component for SEO
 * 
 * This component generates structured data for website navigation following Google's guidelines.
 * Adding this helps search engines understand your site structure and navigation.
 * 
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export default function SiteNavigationJsonLd({ 
  items, 
  siteUrl = 'https://www.vpnnews.co.uk'
}: SiteNavigationJsonLdProps) {
  // Don't render if no items provided
  if (!items || items.length === 0) {
    return null;
  }

  // Create the JSON-LD schema with proper typing
  const jsonLd: {
    "@context": string;
    "@type": string;
    "@id": string;
    "url": string;
    "name": string;
    "potentialAction": Array<{
      "@type": string;
      "target": string;
    }>;
    "hasPart": Array<{
      "@type": string;
      "name": string;
      "url": string;
      "potentialAction": {
        "@type": string;
        "target": string;
      };
    }>;
  } = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": "Video Production News",
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
      }
    ],
    "hasPart": items.map(item => ({
      "@type": "SiteNavigationElement",
      "name": item.name,
      "url": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
      "potentialAction": {
        "@type": "Action",
        "target": item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
      }
    }))
  };

  return (
    <Script id="site-navigation-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

/**
 * Helper function to generate navigation items from categories
 * 
 * @param categories Array of category objects
 * @returns Array of NavigationItem objects
 */
export function generateNavigationItems(categories: any[]): NavigationItem[] {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }

  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      url: '/'
    }
  ];

  // Add categories to navigation items
  categories.forEach(category => {
    if (category.title && category.slug?.current) {
      // Special case for Justice Watch
      if (category.title.toLowerCase() === 'justice watch') {
        navigationItems.push({
          name: 'Watch',
          url: '/justice-watch'
        });
      } else {
        navigationItems.push({
          name: category.title,
          url: `/category/${category.slug.current}`
        });
      }
    }
  });

  // Add standard pages
  navigationItems.push(
    {
      name: 'About Us',
      url: '/about'
    },
    {
      name: 'Contact',
      url: '/contact-us'
    },
    {
      name: 'Marketplace',
      url: '/marketplace'
    }
  );

  return navigationItems;
}
