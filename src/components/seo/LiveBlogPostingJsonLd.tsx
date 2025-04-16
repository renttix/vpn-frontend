import React from 'react';
import Script from 'next/script';

interface LiveBlogUpdate {
  headline?: string;
  datePublished: string;
  dateModified?: string;
  url?: string;
  author?: {
    name: string;
    url?: string;
  };
  image?: string;
  coverageStartTime?: string;
  coverageEndTime?: string;
  description?: string;
  articleBody: string;
}

interface LiveBlogPostingJsonLdProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  image: string | string[];
  coverageStartTime: string;
  coverageEndTime?: string;
  publisher: {
    name: string;
    logo: string;
    url?: string;
  };
  author: {
    name: string;
    url?: string;
  };
  liveBlogUpdates: LiveBlogUpdate[];
  url: string;
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
}

/**
 * LiveBlogPosting Schema Component for Google Rich Results
 * 
 * This component generates structured data for live blogs following Google's guidelines.
 * Adding this to live blog pages can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/article#live-blog
 */
export default function LiveBlogPostingJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  image,
  coverageStartTime,
  coverageEndTime,
  publisher,
  author,
  liveBlogUpdates,
  url,
  articleBody,
  keywords,
  articleSection,
  inLanguage,
  isAccessibleForFree
}: LiveBlogPostingJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return dateString; // Return as is if it's already in ISO format
    }
  };

  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "LiveBlogPosting",
    "headline": headline,
    "description": description,
    "datePublished": formatDate(datePublished),
    "image": Array.isArray(image) ? image : [image],
    "coverageStartTime": formatDate(coverageStartTime),
    "publisher": {
      "@type": "Organization",
      "name": publisher.name,
      "logo": {
        "@type": "ImageObject",
        "url": publisher.logo
      }
    },
    "author": {
      "@type": "Person",
      "name": author.name
    },
    "url": url
  };

  // Add optional properties if provided
  if (dateModified) jsonLd.dateModified = formatDate(dateModified);
  if (coverageEndTime) jsonLd.coverageEndTime = formatDate(coverageEndTime);
  if (publisher.url) jsonLd.publisher.url = publisher.url;
  if (author.url) jsonLd.author.url = author.url;
  if (articleBody) jsonLd.articleBody = articleBody;
  if (keywords && keywords.length > 0) jsonLd.keywords = keywords.join(", ");
  if (articleSection) jsonLd.articleSection = articleSection;
  if (inLanguage) jsonLd.inLanguage = inLanguage;
  if (isAccessibleForFree !== undefined) jsonLd.isAccessibleForFree = isAccessibleForFree;

  // Add live blog updates if provided
  if (liveBlogUpdates && liveBlogUpdates.length > 0) {
    jsonLd.liveBlogUpdate = liveBlogUpdates.map(update => {
      const updateObj: any = {
        "@type": "BlogPosting",
        "datePublished": formatDate(update.datePublished),
        "articleBody": update.articleBody
      };

      if (update.headline) updateObj.headline = update.headline;
      if (update.dateModified) updateObj.dateModified = formatDate(update.dateModified);
      if (update.url) updateObj.url = update.url;
      if (update.image) updateObj.image = update.image;
      if (update.coverageStartTime) updateObj.coverageStartTime = formatDate(update.coverageStartTime);
      if (update.coverageEndTime) updateObj.coverageEndTime = formatDate(update.coverageEndTime);
      if (update.description) updateObj.description = update.description;

      if (update.author) {
        updateObj.author = {
          "@type": "Person",
          "name": update.author.name
        };

        if (update.author.url) updateObj.author.url = update.author.url;
      }

      return updateObj;
    });
  }

  return (
    <Script id="live-blog-posting-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
