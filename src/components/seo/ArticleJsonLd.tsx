import React from 'react';
import Script from 'next/script';
import { Post, Author, Category } from '@/types/sanity';

interface ArticleJsonLdProps {
  article: Post;
  url: string;
}

export default function ArticleJsonLd({ article, url }: ArticleJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toISOString();
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  // Get the first category name or default to "News"
  const categoryName = article.categories && article.categories.length > 0
    ? article.categories[0].title
    : "News";

  // Get the author name or default to "VPN Editorial Team"
  const authorName = article.author?.name || "VPN Editorial Team";

  // Create the JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "name": article.title,
    "description": article.excerpt || `Read the latest on ${article.title}`,
    "image": article.mainImage?.asset?.url 
      ? [
          article.mainImage.asset.url,
          // Add multiple sizes for better SEO
          article.mainImage.asset.url.replace(/(\.\w+)$/, '-800x450$1'),
          article.mainImage.asset.url.replace(/(\.\w+)$/, '-600x338$1'),
          article.mainImage.asset.url.replace(/(\.\w+)$/, '-400x225$1')
        ] 
      : ["https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"],
    "datePublished": formatDate(article.publishedAt),
    "dateModified": formatDate(article.publishedAt), // Use published date if no modified date available
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": article.author?.slug ? `https://vpnnews.com/author/${article.author.slug.current}` : "https://vpnnews.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
        "width": 600,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": categoryName,
    "isAccessibleForFree": "True",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".article-body"]
    },
    // Google News specific properties
    "inLanguage": "en-US",
    "copyrightYear": new Date(article.publishedAt || new Date()).getFullYear(),
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Video Production News"
    },
    "keywords": article.categories ? article.categories.map((cat: any) => cat.title).join(', ') : categoryName,
    "printSection": categoryName,
    "printEdition": new Date(article.publishedAt || new Date()).toISOString().split('T')[0],
    "isPartOf": {
      "@type": "PublicationIssue",
      "datePublished": formatDate(article.publishedAt),
      "isPartOf": {
        "@type": "Periodical",
        "name": "Video Production News",
        "issn": "2767-5874" // Example ISSN, replace with actual if available
      }
    }
  };

  return (
    <Script id="article-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
