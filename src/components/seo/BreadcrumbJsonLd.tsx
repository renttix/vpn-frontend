import React from 'react';
import Script from 'next/script';
import { Category } from '@/types/sanity';

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  // Create the JSON-LD schema for breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };

  return (
    <Script id="breadcrumb-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

// Helper function to generate breadcrumb items for an article
export function generateArticleBreadcrumbs(
  articleTitle: string, 
  articleSlug: string, 
  category?: Category
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/'
    }
  ];

  // Add category if available
  if (category) {
    breadcrumbs.push({
      name: category.title,
      item: `https://vpnnews.com/category/${category.slug.current}`
    });
  }

  // Add the article itself
  breadcrumbs.push({
    name: articleTitle,
    item: `https://vpnnews.com/${articleSlug}`
  });

  return breadcrumbs;
}

// Helper function to generate breadcrumb items for a category page
export function generateCategoryBreadcrumbs(category: Category): BreadcrumbItem[] {
  return [
    {
      name: 'Home',
      item: 'https://vpnnews.com/'
    },
    {
      name: category.title,
      item: `https://vpnnews.com/category/${category.slug.current}`
    }
  ];
}
