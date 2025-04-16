import React from 'react';
import Script from 'next/script';

interface ClaimReviewJsonLdProps {
  claimReviewed: string;
  claimDate?: string;
  claimUrl?: string;
  claimAuthor?: {
    name: string;
    url?: string;
    image?: string;
    sameAs?: string[];
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
    alternateName?: string;
    image?: string;
  };
  reviewAuthor: {
    name: string;
    type?: 'Organization' | 'Person';
    url?: string;
    image?: string;
    sameAs?: string[];
  };
  reviewPublisher: {
    name: string;
    url: string;
    logo?: string;
    sameAs?: string[];
  };
  reviewDate: string;
  reviewUrl: string;
  itemReviewed?: {
    type?: string;
    name?: string;
    image?: string;
    url?: string;
    author?: {
      name: string;
      url?: string;
    };
    datePublished?: string;
  };
}

/**
 * ClaimReview Schema Component for Google Rich Results
 * 
 * This component generates structured data for fact-checking content following Google's guidelines.
 * Adding this to fact-check articles can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/factcheck
 */
export default function ClaimReviewJsonLd({
  claimReviewed,
  claimDate,
  claimUrl,
  claimAuthor,
  reviewRating,
  reviewAuthor,
  reviewPublisher,
  reviewDate,
  reviewUrl,
  itemReviewed
}: ClaimReviewJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return dateString; // Return as is if it's already in ISO format
    }
  };

  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    "claimReviewed": claimReviewed,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": reviewRating.ratingValue
    },
    "author": {
      "@type": reviewAuthor.type || "Organization",
      "name": reviewAuthor.name
    },
    "publisher": {
      "@type": "Organization",
      "name": reviewPublisher.name,
      "url": reviewPublisher.url
    },
    "datePublished": formatDate(reviewDate),
    "url": reviewUrl
  };

  // Add optional properties to reviewRating if provided
  if (reviewRating.bestRating !== undefined) jsonLd.reviewRating.bestRating = reviewRating.bestRating;
  if (reviewRating.worstRating !== undefined) jsonLd.reviewRating.worstRating = reviewRating.worstRating;
  if (reviewRating.alternateName) jsonLd.reviewRating.alternateName = reviewRating.alternateName;
  if (reviewRating.image) jsonLd.reviewRating.image = reviewRating.image;

  // Add optional properties to reviewAuthor if provided
  if (reviewAuthor.url) jsonLd.author.url = reviewAuthor.url;
  if (reviewAuthor.image) jsonLd.author.image = reviewAuthor.image;
  if (reviewAuthor.sameAs && reviewAuthor.sameAs.length > 0) jsonLd.author.sameAs = reviewAuthor.sameAs;

  // Add optional properties to reviewPublisher if provided
  if (reviewPublisher.logo) {
    jsonLd.publisher.logo = {
      "@type": "ImageObject",
      "url": reviewPublisher.logo
    };
  }
  if (reviewPublisher.sameAs && reviewPublisher.sameAs.length > 0) jsonLd.publisher.sameAs = reviewPublisher.sameAs;

  // Add claim date if provided
  if (claimDate) jsonLd.claimDate = formatDate(claimDate);

  // Add claim URL if provided
  if (claimUrl) jsonLd.claimUrl = claimUrl;

  // Add claim author if provided
  if (claimAuthor) {
    jsonLd.claimAuthor = {
      "@type": "Person",
      "name": claimAuthor.name
    };

    if (claimAuthor.url) jsonLd.claimAuthor.url = claimAuthor.url;
    if (claimAuthor.image) jsonLd.claimAuthor.image = claimAuthor.image;
    if (claimAuthor.sameAs && claimAuthor.sameAs.length > 0) jsonLd.claimAuthor.sameAs = claimAuthor.sameAs;
  }

  // Add item reviewed if provided
  if (itemReviewed) {
    jsonLd.itemReviewed = {
      "@type": itemReviewed.type || "CreativeWork"
    };

    if (itemReviewed.name) jsonLd.itemReviewed.name = itemReviewed.name;
    if (itemReviewed.image) jsonLd.itemReviewed.image = itemReviewed.image;
    if (itemReviewed.url) jsonLd.itemReviewed.url = itemReviewed.url;
    if (itemReviewed.datePublished) jsonLd.itemReviewed.datePublished = formatDate(itemReviewed.datePublished);

    if (itemReviewed.author) {
      jsonLd.itemReviewed.author = {
        "@type": "Person",
        "name": itemReviewed.author.name
      };

      if (itemReviewed.author.url) jsonLd.itemReviewed.author.url = itemReviewed.author.url;
    }
  }

  return (
    <Script id="claim-review-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
