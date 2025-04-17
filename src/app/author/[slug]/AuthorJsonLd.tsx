import React from 'react';
import Script from 'next/script';
import { Author, Post } from '@/types/sanity';
import { getBaseUrl, getFullUrl } from '@/lib/urlUtils';

interface AuthorJsonLdProps {
  author: Author;
  authorPosts: Post[];
  url: string;
}

export default function AuthorJsonLd({ author, authorPosts, url }: AuthorJsonLdProps) {
  // Create the JSON-LD schema for the author
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "url": url,
    "image": author.image?.asset?.url || null,
    "description": author.bio ? "Author at VPN News" : null,
    "jobTitle": "Journalist",
    "worksFor": {
      "@type": "Organization",
      "name": "VPN News",
      "url": getBaseUrl()
    },
    "knowsAbout": ["news", "journalism", "legal news", "court reporting"],
    "mainEntityOfPage": {
      "@type": "ProfilePage",
      "@id": url
    }
  };

  // Add author's articles if available
  if (authorPosts && authorPosts.length > 0) {
    jsonLd.author = authorPosts.map(post => ({
      "@type": "Article",
      "headline": post.title || "Untitled Article",
      "url": getFullUrl(post.slug?.current || '#'),
      "datePublished": post.publishedAt || new Date().toISOString()
    }));
  }

  return (
    <Script id="author-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
