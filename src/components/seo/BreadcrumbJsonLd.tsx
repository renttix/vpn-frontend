import React from 'react';
import Script from 'next/script';
import { Category, Tag, Author } from '@/types/sanity';

interface BreadcrumbItem {
  name: string;
  item: string;
  image?: string; // Optional image URL for the breadcrumb item
  position: number; // Position in the breadcrumb trail
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  // Create the JSON-LD schema for breadcrumbs with enhanced properties
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => {
      const position = item.position || index + 1;
      const listItem: any = {
        "@type": "ListItem",
        "position": position,
        "name": item.name,
        "item": item.item
      };
      
      // Add image if provided
      if (item.image) {
        listItem.image = item.image;
      }
      
      return listItem;
    })
  };

  return (
    <Script id="breadcrumb-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

// Enhanced helper function to generate breadcrumb items for an article
export function generateArticleBreadcrumbs(
  articleTitle: string, 
  articleSlug: string, 
  categories?: Category[],
  tags?: Tag[],
  author?: Author,
  mainImageUrl?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    }
  ];

  let position = 2;

  // Add primary category if available
  if (categories && categories.length > 0) {
    const primaryCategory = categories[0];
    
    if (primaryCategory) {
      // Check if this is a parent category or has a parent
      if (primaryCategory.parent && primaryCategory.parent.title) {
        // Add parent category first - with null check for slug
        const parentSlug = primaryCategory.parent.slug?.current || 'category';
        breadcrumbs.push({
          name: primaryCategory.parent.title,
          item: `https://vpnnews.com/${parentSlug}`,
          position: position++
        });
      }
      
      // Then add child/primary category - with null check for slug
      if (primaryCategory.title) {
        const categorySlug = primaryCategory.slug?.current || 'category';
        breadcrumbs.push({
          name: primaryCategory.title,
          item: `https://vpnnews.com/${categorySlug}`,
          position: position++
        });
      }
      
      // Add a second category if it exists and is different from the first
      if (categories.length > 1 && categories[1] && categories[1]._id !== primaryCategory._id) {
        const secondCategory = categories[1];
        if (secondCategory.title) {
          const secondCategorySlug = secondCategory.slug?.current || 'category';
          breadcrumbs.push({
            name: secondCategory.title,
            item: `https://vpnnews.com/${secondCategorySlug}`,
            position: position++
          });
        }
      }
    }
  }
  
  // Add primary tag if available and relevant
  if (tags && tags.length > 0 && tags[0]) {
    const primaryTag = tags[0];
    if (primaryTag.title) {
      const tagSlug = primaryTag.slug?.current || 'tag';
      breadcrumbs.push({
        name: primaryTag.title,
        item: `https://vpnnews.com/tag/${tagSlug}`,
        position: position++
      });
    }
  }

  // Add the article itself
  breadcrumbs.push({
    name: articleTitle,
    item: `https://vpnnews.com/${articleSlug}`,
    image: mainImageUrl, // Add the main image URL if available
    position: position
  });

  return breadcrumbs;
}

// Enhanced helper function to generate breadcrumb items for a category page
export function generateCategoryBreadcrumbs(category: Category): BreadcrumbItem[] {
  const breadcrumbs = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    }
  ];
  
  let position = 2;
  
  // Add "Categories" section
  breadcrumbs.push({
    name: 'Categories',
    item: 'https://vpnnews.com/categories',
    position: position++
  });
  
  // If this is a child category, add the parent first
  if (category.parent && category.parent.title) {
    const parentSlug = category.parent.slug?.current || 'category';
    breadcrumbs.push({
      name: category.parent.title,
      item: `https://vpnnews.com/${parentSlug}`,
      position: position++
    });
  }
  
  // Add the category itself
  const categorySlug = category.slug?.current || 'category';
  breadcrumbs.push({
    name: category.title || 'Category',
    item: `https://vpnnews.com/${categorySlug}`,
    position: position
  });
  
  return breadcrumbs;
}

// Enhanced helper function to generate breadcrumb items for an author page
export function generateAuthorBreadcrumbs(author: Author): BreadcrumbItem[] {
  const breadcrumbs = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    },
    {
      name: 'Authors',
      item: 'https://vpnnews.com/authors',
      position: 2
    }
  ];
  
  let position = 3;
  
  // Add author role/specialty if available
  if (author.role) {
    const roleSlug = author.role.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({
      name: author.role,
      item: `https://vpnnews.com/authors/${roleSlug}`,
      position: position++
    });
  }
  
  // Add the author
  if (author.slug?.current) {
    const authorBreadcrumb: BreadcrumbItem = {
      name: author.name || 'Author',
      item: `https://vpnnews.com/author/${author.slug.current}`,
      position: position
    };
    
    // Add image if available
    if (author.image?.asset?.url) {
      authorBreadcrumb.image = author.image.asset.url;
    }
    
    breadcrumbs.push(authorBreadcrumb);
  } else {
    breadcrumbs.push({
      name: author.name || 'Author',
      item: `https://vpnnews.com/authors`,
      position: position
    });
  }
  
  return breadcrumbs;
}

// Enhanced helper function to generate breadcrumb items for a tag page
export function generateTagBreadcrumbs(tag: Tag, parentCategory?: Category): BreadcrumbItem[] {
  const breadcrumbs = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    }
  ];
  
  let position = 2;
  
  // Add "Tags" section
  breadcrumbs.push({
    name: 'Tags',
    item: 'https://vpnnews.com/tags',
    position: position++
  });
  
  // Add parent category if available
  if (parentCategory && parentCategory.title) {
    const parentCategorySlug = parentCategory.slug?.current || 'category';
    breadcrumbs.push({
      name: parentCategory.title,
      item: `https://vpnnews.com/${parentCategorySlug}`,
      position: position++
    });
  }
  
  // Add the tag
  const tagSlug = tag.slug?.current || 'tag';
  breadcrumbs.push({
    name: tag.title || 'Tag',
    item: `https://vpnnews.com/tag/${tagSlug}`,
    position: position
  });
  
  return breadcrumbs;
}

// New helper function to generate breadcrumb items for search results
export function generateSearchBreadcrumbs(query: string): BreadcrumbItem[] {
  return [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    },
    {
      name: 'Search',
      item: 'https://vpnnews.com/search',
      position: 2
    },
    {
      name: `Results for "${query}"`,
      item: `https://vpnnews.com/search?q=${encodeURIComponent(query)}`,
      position: 3
    }
  ];
}

// New helper function to generate breadcrumb items for legal/static pages
export function generateStaticPageBreadcrumbs(pageTitle: string, pageSlug: string, section?: string, sectionSlug?: string): BreadcrumbItem[] {
  const breadcrumbs = [
    {
      name: 'Home',
      item: 'https://vpnnews.com/',
      position: 1
    }
  ];
  
  let position = 2;
  
  // Add section if available
  if (section && sectionSlug) {
    breadcrumbs.push({
      name: section,
      item: `https://vpnnews.com/${sectionSlug}`,
      position: position++
    });
  }
  
  // Add the page
  breadcrumbs.push({
    name: pageTitle,
    item: `https://vpnnews.com/${pageSlug}`,
    position: position
  });
  
  return breadcrumbs;
}
