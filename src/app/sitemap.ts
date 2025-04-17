import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';

interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface Post {
  slug: { current: string };
  publishedAt: string;
  _updatedAt?: string;
}

interface Category {
  slug: { current: string };
  _updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the site
  const baseUrl = 'https://www.vpnnews.co.uk';
  
  // Fetch all posts
  const postsQuery = groq`*[_type == "post" && defined(slug.current)] {
    slug,
    publishedAt,
    _updatedAt
  }`;
  
  // Fetch all categories
  const categoriesQuery = groq`*[_type == "category" && defined(slug.current)] {
    slug,
    _updatedAt
  }`;
  
  try {
    // Fetch data in parallel
    const [posts, categories] = await Promise.all([
      client.fetch<Post[]>(postsQuery),
      client.fetch<Category[]>(categoriesQuery)
    ]);
    
    // Static pages
    const staticPages: SitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/contact-us`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/this-week`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9
      }
    ];
    
    // Post pages
    const postPages: SitemapEntry[] = posts.map(post => ({
      url: `${baseUrl}/${post.slug.current}`,
      lastModified: post._updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }));
    
    // AMP versions of post pages
    const ampPages: SitemapEntry[] = posts.map(post => ({
      url: `${baseUrl}/amp/${post.slug.current}`,
      lastModified: post._updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    }));
    
    // Category pages
    const categoryPages: SitemapEntry[] = categories.map(category => ({
      url: `${baseUrl}/category/${category.slug.current}`,
      lastModified: category._updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    }));
    
    // Combine all pages
    return [...staticPages, ...postPages, ...ampPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return minimal sitemap in case of error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      }
    ];
  }
}
