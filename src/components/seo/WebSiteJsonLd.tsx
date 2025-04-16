import React from 'react';
import Script from 'next/script';

interface WebSiteJsonLdProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
  potentialActions?: Array<{
    type: string;
    target: string;
    'query-input'?: string;
  }>;
  sameAs?: string[];
  inLanguage?: string;
  copyrightYear?: number;
  copyrightHolder?: string;
  logo?: string;
}

/**
 * WebSite Schema Component for Google Rich Results
 * 
 * This component generates structured data for the website following Google's guidelines.
 * Adding this to the main layout can help search engines understand the site structure.
 * 
 * @see https://developers.google.com/search/docs/data-types/website
 */
export default function WebSiteJsonLd({
  name,
  url,
  description,
  searchUrl,
  potentialActions,
  sameAs,
  inLanguage = 'en-US',
  copyrightYear,
  copyrightHolder,
  logo
}: WebSiteJsonLdProps) {
  // Create the JSON-LD schema
  const jsonLd: {
    "@context": string;
    "@type": string;
    "name": string;
    "url": string;
    "description"?: string;
    "potentialAction"?: Array<{
      "@type": string;
      "target": string;
      "query-input"?: string;
    }>;
    "sameAs"?: string[];
    "inLanguage"?: string;
    "copyrightYear"?: number;
    "copyrightHolder"?: {
      "@type": string;
      "name": string;
    };
    "logo"?: {
      "@type": string;
      "url": string;
    };
  } = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url
  };

  // Add optional properties if provided
  if (description) {
    jsonLd.description = description;
  }

  // Add search action if search URL is provided
  if (searchUrl) {
    const searchAction = {
      "@type": "SearchAction",
      "target": `${searchUrl}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    };
    
    jsonLd.potentialAction = [searchAction];
  }

  // Add custom potential actions if provided
  if (potentialActions && potentialActions.length > 0) {
    if (!jsonLd.potentialAction) {
      jsonLd.potentialAction = [];
    }
    
    potentialActions.forEach(action => {
      jsonLd.potentialAction?.push({
        "@type": action.type,
        "target": action.target,
        "query-input": action["query-input"]
      });
    });
  }

  // Add social media profiles if provided
  if (sameAs && sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  // Add language if provided
  if (inLanguage) {
    jsonLd.inLanguage = inLanguage;
  }

  // Add copyright information if provided
  if (copyrightYear) {
    jsonLd.copyrightYear = copyrightYear;
  }

  if (copyrightHolder) {
    jsonLd.copyrightHolder = {
      "@type": "Organization",
      "name": copyrightHolder
    };
  }

  // Add logo if provided
  if (logo) {
    jsonLd.logo = {
      "@type": "ImageObject",
      "url": logo
    };
  }

  return (
    <Script id="website-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
