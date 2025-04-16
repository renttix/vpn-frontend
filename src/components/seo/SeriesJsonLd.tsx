import React from 'react';
import Script from 'next/script';
import { Series, Post } from '@/types/sanity';

interface SeriesJsonLdProps {
  series: Series;
  seriesUrl: string;
  article: Post;
  articleUrl: string;
  partNumber: number;
  totalParts?: number;
  articleList: Array<{
    title: string;
    url: string;
    partNumber: number;
  }>;
}

/**
 * SeriesJsonLd Component
 * 
 * This component generates structured data for article series, helping search engines
 * understand the relationship between articles in a series.
 * 
 * @see https://developers.google.com/search/docs/data-types/article
 */
export default function SeriesJsonLd({
  series,
  seriesUrl,
  article,
  articleUrl,
  partNumber,
  totalParts,
  articleList
}: SeriesJsonLdProps) {
  try {
    // Create the JSON-LD schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "headline": article.title,
      "image": article.mainImage?.asset?.url 
        ? [article.mainImage.asset.url]
        : undefined,
      "datePublished": article.publishedAt,
      "dateModified": article.lastUpdatedAt || article.publishedAt,
      "author": article.author ? {
        "@type": "Person",
        "name": article.author.name,
        "url": article.author.slug ? `https://www.vpnnews.co.uk/author/${article.author.slug.current}` : undefined
      } : undefined,
      "publisher": {
        "@type": "Organization",
        "name": "Video Production News",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.vpnnews.co.uk/images/logo.png",
          "width": 600,
          "height": 60
        }
      },
      "isPartOf": {
        "@type": "CreativeWorkSeries",
        "name": series.title,
        "url": seriesUrl,
        "position": partNumber,
        "numberOfItems": totalParts || series.totalPlannedParts
      },
      "hasPart": articleList.map(article => ({
        "@type": "Article",
        "headline": article.title,
        "url": article.url,
        "position": article.partNumber
      }))
    };

    return (
      <Script id="series-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
    );
  } catch (error) {
    console.error('Error generating SeriesJsonLd:', error);
    return null;
  }
}

/**
 * Helper function to generate article list for series
 * 
 * @param articles Array of articles in the series
 * @param baseUrl Base URL for the site
 * @returns Formatted article list for the SeriesJsonLd component
 */
export function formatSeriesArticles(
  articles: Post[],
  baseUrl: string = 'https://www.vpnnews.co.uk'
): Array<{ title: string; url: string; partNumber: number }> {
  if (!articles || !Array.isArray(articles)) return [];
  
  return articles
    .filter(article => article && article.slug && article.title)
    .map(article => ({
      title: article.title,
      url: `${baseUrl}/${article.slug.current}`,
      partNumber: article.series?.partNumber || 0
    }))
    .sort((a, b) => a.partNumber - b.partNumber);
}
