import React from 'react';
import Script from 'next/script';
import { Category, Post } from '@/types/sanity';
import { getBaseUrl, getFullUrl } from '@/lib/urlUtils';

interface CategoryJsonLdProps {
  category: Category;
  posts: Post[];
  url: string;
}

export default function CategoryJsonLd({ category, posts, url }: CategoryJsonLdProps) {
  // Get the category title, with special handling for certain categories
  const categoryTitle = category.title === 'Video' ? 'Legal Commentary' : category.title;
  
  // Get the category description or create a default one
  const categoryDescription = category.description || `Latest posts in the ${categoryTitle} category from VPN News.`;
  
  // Create an array of items for the ItemList
  const itemListElements = posts.map((post, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Article",
      "headline": post.title,
      "url": getFullUrl(post.slug?.current || ''),
      "image": post.mainImage?.asset?.url || "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
      "datePublished": post.publishedAt || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": post.author?.name || "VPN News Team"
      }
    }
  }));

  // Create the JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": `${categoryTitle} | VPN News`,
    "description": categoryDescription,
    "url": url,
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
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": itemListElements,
      "numberOfItems": itemListElements.length
    },
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": "VPN News",
      "url": getBaseUrl()
    }
  };

  return (
    <Script id="category-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
