import React from 'react';
import Script from 'next/script';
import { Post, Author, Category } from '@/types/sanity';
import { calculateReadingTime } from '@/lib/utils';

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

  // Calculate word count and reading time
  const wordCount = article.body ? calculateReadingTime(article.body) * 200 : 0; // Estimate based on reading time
  
  // Extract tags from the article
  const tags = article.tags?.map(tag => tag.title) || [];
  
  // Add categories to keywords
  const categories = article.categories?.map(cat => cat.title) || [];
  const keywords = [...categories, ...tags].filter(Boolean);
  
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
    "dateModified": article.lastUpdatedAt ? formatDate(article.lastUpdatedAt) : formatDate(article.publishedAt),
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": article.author?.slug ? `https://www.vpnnews.co.uk/author/${article.author.slug.current}` : "https://www.vpnnews.co.uk/about",
      "jobTitle": article.author?.jobTitle || "Journalist",
      "description": article.author?.bio ? "Legal journalist and analyst" : undefined,
      "knowsAbout": categories.length > 0 ? categories : ["Legal News", "Crime Reporting"],
      "sameAs": article.author?.socialLinks || []
    },
    "publisher": {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
        "width": 600,
        "height": 60
      },
      "url": "https://www.vpnnews.co.uk",
      "sameAs": [
        "https://twitter.com/vpnnews",
        "https://facebook.com/vpnnews",
        "https://linkedin.com/company/vpnnews"
      ],
      "foundingDate": "2020-01-01",
      "publishingPrinciples": "https://www.vpnnews.co.uk/editorial-standards",
      "diversityPolicy": "https://www.vpnnews.co.uk/diversity-policy",
      "ethicsPolicy": "https://www.vpnnews.co.uk/ethics-policy",
      "correctionsPolicy": "https://www.vpnnews.co.uk/corrections-policy"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": categoryName,
    "articleBody": article.excerpt || "",
    "wordCount": wordCount,
    "isAccessibleForFree": "True",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".article-content", "p.lead"]
    },
    // Google News specific properties
    "inLanguage": "en-US",
    "copyrightYear": new Date(article.publishedAt || new Date()).getFullYear(),
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Video Production News"
    },
    "keywords": keywords.join(', '),
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
    },
    // Additional properties for Google News
    "accessibilityAPI": "ARIA",
    "accessibilityControl": ["fullKeyboardControl", "fullMouseControl"],
    "accessibilityFeature": [
      "alternativeText",
      "readingOrder",
      "structuralNavigation",
      "tableOfContents",
      "highContrast"
    ],
    "accessibilityHazard": ["noFlashingHazard", "noMotionSimulationHazard", "noSoundHazard"],
    "alternativeHeadline": article.subtitle || article.title,
    "audience": {
      "@type": "Audience",
      "audienceType": "Public",
      "geographicArea": {
        "@type": "AdministrativeArea",
        "name": "United Kingdom"
      }
    },
    "citation": article.sources?.map((source: any) => ({
      "@type": "CreativeWork",
      "name": source.name,
      "url": source.url
    })) || [],
    "backstory": article.backstory || undefined,
    "educationalUse": "Research",
    "timeRequired": `PT${Math.max(1, Math.ceil(wordCount / 200))}M`,
    "archivedAt": `https://web.archive.org/web/*/https://www.vpnnews.co.uk/${article.slug?.current || ''}`
  };

  return (
    <Script id="article-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
