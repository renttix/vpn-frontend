import React from 'react';
import Script from 'next/script';
import { Post, Author, Category } from '@/types/sanity';

interface NewsArticleJsonLdProps {
  article: Post;
  url: string;
  isGoogleNews?: boolean; // Flag to include Google News specific properties
}

/**
 * NewsArticle Schema Component optimized for Google News
 * 
 * This component generates structured data specifically optimized for Google News inclusion.
 * It includes all required properties for Google News and follows their best practices.
 * 
 * @see https://developers.google.com/search/docs/data-types/article
 * @see https://support.google.com/news/publisher-center/answer/9545420
 */
export default function NewsArticleJsonLd({ article, url, isGoogleNews = true }: NewsArticleJsonLdProps) {
  try {
    // Ensure article is not null before proceeding
    if (!article) {
      console.warn('NewsArticleJsonLd received null or undefined article');
      return null;
    }

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
    const categoryName = article.categories && article.categories.length > 0 && article.categories[0].title
      ? article.categories[0].title
      : "News";

    // Get the author name or default to "VPN Editorial Team"
    const authorName = article.author?.name || "VPN Editorial Team";
    
    // Calculate word count if available
    const wordCount = article.wordCount || (article.body ? 
      (Array.isArray(article.body) ? 
        article.body.reduce((count, block) => {
          if (block && block._type === 'block' && block.children) {
            return count + block.children.reduce((c: number, child: any) => 
              c + (child && child.text ? child.text.split(/\s+/).length : 0), 0);
          }
          return count;
        }, 0) : 0) : 0);

    // Extract tags from the article
    const tags = article.tags?.map(tag => tag?.title || '').filter(Boolean) || [];
    
    // Add categories to keywords
    const categories = article.categories?.map(cat => cat?.title || '').filter(Boolean) || [];
    const keywords = [...categories, ...tags].filter(Boolean);

    // Create the JSON-LD schema with proper typing
    const jsonLd: {
    "@context": string;
    "@type": string;
    "headline": string;
    "name": string;
    "description": string;
    "image": string[];
    "datePublished": string;
    "dateModified": string;
    "author": {
      "@type": string;
      "name": string;
      "url"?: string;
      "jobTitle"?: string;
      "description"?: string;
      "knowsAbout"?: string[];
      "sameAs"?: string[];
    };
    "publisher": {
      "@type": string;
      "name": string;
      "logo": {
        "@type": string;
        "url": string;
        "width": number;
        "height": number;
      };
      "url"?: string;
      "sameAs"?: string[];
      "foundingDate"?: string;
      "publishingPrinciples"?: string;
      "diversityPolicy"?: string;
      "ethicsPolicy"?: string;
      "correctionsPolicy"?: string;
    };
    "mainEntityOfPage": {
      "@type": string;
      "@id": string;
    };
    "articleSection": string;
    "articleBody"?: string;
    "wordCount"?: number;
    "isAccessibleForFree": string;
    "speakable"?: {
      "@type": string;
      "cssSelector": string[];
    };
    "inLanguage"?: string;
    "copyrightYear"?: number;
    "copyrightHolder"?: {
      "@type": string;
      "name": string;
    };
    "keywords"?: string;
    "printSection"?: string;
    "printEdition"?: string;
    "isPartOf"?: {
      "@type": string;
      "datePublished": string;
      "isPartOf": {
        "@type": string;
        "name": string;
        "issn"?: string;
      };
    };
    "accessibilityAPI"?: string;
    "accessibilityControl"?: string[];
    "accessibilityFeature"?: string[];
    "accessibilityHazard"?: string[];
    "alternativeHeadline"?: string;
    "audience"?: {
      "@type": string;
      "audienceType": string;
      "geographicArea"?: {
        "@type": string;
        "name": string;
      };
    };
    "citation"?: Array<{
      "@type": string;
      "name": string;
      "url": string;
    }>;
    "backstory"?: string;
    "educationalUse"?: string;
    "timeRequired"?: string;
    "archivedAt"?: string;
    "thumbnailUrl"?: string;
    "reportingPrinciples"?: string;
    "sdDatePublished"?: string;
    "sdPublisher"?: {
      "@type": string;
      "name": string;
      "logo"?: {
        "@type": string;
        "url": string;
      };
    };
    "sdLicense"?: string;
    } = {
      "@context": "https://schema.org",
      "@type": "NewsArticle", // Specifically use NewsArticle for Google News
      "headline": article.title || "News Article",
      "name": article.title || "News Article",
      "description": article.excerpt || `Read the latest news from VPN News`,
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
        "url": article.author?.slug?.current ? `https://www.vpnnews.co.uk/author/${article.author.slug.current}` : "https://www.vpnnews.co.uk/about",
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
    "articleBody": article.excerpt || "News article from VPN News.",
    "wordCount": wordCount,
    "isAccessibleForFree": "True",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".article-content", "p.lead"]
    }
  };

  // Add Google News specific properties if requested
  if (isGoogleNews) {
    // Required for Google News
    jsonLd.inLanguage = "en-US";
    jsonLd.copyrightYear = new Date(article.publishedAt ? article.publishedAt : new Date()).getFullYear();
    jsonLd.copyrightHolder = {
      "@type": "Organization",
      "name": "Video Production News"
    };
    jsonLd.keywords = keywords.length > 0 ? keywords.join(', ') : "News, Current Events";
    jsonLd.printSection = categoryName;
    jsonLd.printEdition = new Date(article.publishedAt || new Date()).toISOString().split('T')[0];
    jsonLd.isPartOf = {
      "@type": "PublicationIssue",
      "datePublished": formatDate(article.publishedAt),
      "isPartOf": {
        "@type": "Periodical",
        "name": "Video Production News",
        "issn": "2767-5874" // Example ISSN, replace with actual if available
      }
    };
    
    // Add standout property for breaking news
    if (article.isBreakingNews) {
      // Use type assertion to add the standout property
      (jsonLd as any).standout = true;
    }
    
    // Additional properties for Google News
    jsonLd.accessibilityAPI = "ARIA";
    jsonLd.accessibilityControl = ["fullKeyboardControl", "fullMouseControl"];
    jsonLd.accessibilityFeature = [
      "alternativeText",
      "readingOrder",
      "structuralNavigation",
      "tableOfContents",
      "highContrast"
    ];
    jsonLd.accessibilityHazard = ["noFlashingHazard", "noMotionSimulationHazard", "noSoundHazard"];
    jsonLd.alternativeHeadline = article.subtitle || article.title || "News Article";
    jsonLd.audience = {
      "@type": "Audience",
      "audienceType": "Public",
      "geographicArea": {
        "@type": "AdministrativeArea",
        "name": "United Kingdom"
      }
    };
    
    // Add citations if available
    if (article.sources && article.sources.length > 0) {
      jsonLd.citation = article.sources.map(source => ({
        "@type": "CreativeWork",
        "name": source.name,
        "url": source.url
      }));
    }
    
    // Add backstory if available
    if (article.backstory) {
      jsonLd.backstory = article.backstory;
    }
    
    // Add educational use
    jsonLd.educationalUse = "Research";
    
    // Add time required to read
    jsonLd.timeRequired = `PT${Math.max(1, Math.ceil(wordCount / 200))}M`;
    
      // Add archived URL
      jsonLd.archivedAt = `https://web.archive.org/web/*/https://www.vpnnews.co.uk/${article.slug?.current || ''}`;
      
      // Add thumbnail URL
      if (article.mainImage?.asset?.url) {
        jsonLd.thumbnailUrl = article.mainImage.asset.url.replace(/(\.\w+)$/, '-400x225$1');
      }
    
    // Add reporting principles
    jsonLd.reportingPrinciples = "https://www.vpnnews.co.uk/reporting-standards";
    
    // Add structured data publication date
    jsonLd.sdDatePublished = formatDate(article.publishedAt);
    
    // Add structured data publisher
    jsonLd.sdPublisher = {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
      }
    };
    
    // Add structured data license
    jsonLd.sdLicense = "https://www.vpnnews.co.uk/content-license";
  }

    return (
      <Script id="news-article-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
    );
  } catch (error) {
    console.error('Error generating NewsArticleJsonLd:', error);
    return null;
  }
}
