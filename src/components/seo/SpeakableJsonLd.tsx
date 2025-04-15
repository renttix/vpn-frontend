import React from 'react';
import Script from 'next/script';

interface SpeakableJsonLdProps {
  cssSelectors?: string[];
  xpath?: string[];
  url?: string;
}

/**
 * Speakable Schema Component for Voice Search Optimization
 * 
 * This component generates structured data for speakable content following Google's guidelines.
 * Adding this to pages helps voice assistants identify content that can be read aloud.
 * 
 * @see https://developers.google.com/search/docs/data-types/speakable
 */
export default function SpeakableJsonLd({ 
  cssSelectors = ['h1', '.article-content p:first-of-type', '.article-content h2', '.article-content h3'],
  xpath = [],
  url = ''
}: SpeakableJsonLdProps) {
  // Create the JSON-LD schema with proper typing
  const jsonLd: {
    "@context": string;
    "@type": string;
    "speakable": {
      "@type": string;
      "cssSelector"?: string[];
      "xpath"?: string[];
    };
    "url"?: string;
  } = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification"
    }
  };

  // Add CSS selectors if provided
  if (cssSelectors && cssSelectors.length > 0) {
    jsonLd.speakable.cssSelector = cssSelectors;
  }

  // Add XPath expressions if provided
  if (xpath && xpath.length > 0) {
    jsonLd.speakable.xpath = xpath;
  }

  // Add URL if provided
  if (url) {
    jsonLd.url = url;
  }

  return (
    <Script id="speakable-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

/**
 * Helper function to generate appropriate CSS selectors for speakable content
 * 
 * @param articleType Type of article to generate selectors for
 * @returns Array of CSS selectors targeting the most important content
 */
export function generateSpeakableSelectors(articleType: 'news' | 'feature' | 'opinion' | 'analysis' = 'news'): string[] {
  // Base selectors that apply to all article types
  const baseSelectors = [
    'h1', // Article title
    '.article-content p:first-of-type', // Lead paragraph
  ];

  // Add article-type specific selectors
  switch (articleType) {
    case 'news':
      return [
        ...baseSelectors,
        '.article-content h2', // Section headings
        '.article-content p:nth-of-type(2)', // Second paragraph often contains key information
        '.article-content blockquote', // Important quotes
      ];
    
    case 'feature':
      return [
        ...baseSelectors,
        '.article-content h2', // Section headings
        '.article-content h3', // Subsection headings
        '.article-content blockquote', // Important quotes
      ];
    
    case 'opinion':
      return [
        ...baseSelectors,
        '.article-content p:nth-of-type(2)', // Key opinion statement often in second paragraph
        '.article-content p:last-of-type', // Conclusion often important in opinion pieces
        '.article-content blockquote', // Important quotes
      ];
    
    case 'analysis':
      return [
        ...baseSelectors,
        '.article-content h2', // Analysis sections
        '.article-content h3', // Analysis subsections
        '.article-content strong', // Key points often in bold
        '.article-content p:last-of-type', // Conclusion
      ];
    
    default:
      return baseSelectors;
  }
}
