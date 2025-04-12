'use server';

import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import { getSortOrder, validateSortParam } from '@/lib/sorting';

// Define types
interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string; slug?: { current: string } };
  publishedAt: string;
  excerpt?: string;
  categories?: Category[];
  categoryTitles?: string[]; // For category pages
}

// Fetch more posts for the Latest page
export async function fetchMoreLatestPosts(skip: number, limit: number, sortBy: string = 'date_desc'): Promise<Post[]> {
  // Validate and get sort order
  const validSortBy = validateSortParam(sortBy);
  const postOrder = getSortOrder(validSortBy);

  // Fetch posts with pagination
  const postsQuery = groq`*[_type == "post"]{
    _id,
    title,
    slug,
    mainImage{ asset->{url, alt} },
    author->{name, slug},
    publishedAt,
    excerpt,
    categories[]->{
      _id,
      title,
      slug
    }
  } | order(${postOrder}) [${skip}...${skip + limit}]`;

  try {
    const posts = await client.fetch<Post[]>(postsQuery, {}, { cache: 'no-store' });
    return posts || [];
  } catch (error) {
    console.error('Error fetching more latest posts:', error);
    return [];
  }
}

// Fetch more posts for a specific category
export async function fetchMoreCategoryPosts(
  categorySlug: string,
  skip: number,
  limit: number,
  sortBy: string = 'date_desc'
): Promise<Post[]> {
  // First, get the category by slug
  const categoryQuery = groq`*[_type == "category" && slug.current == $slug][0]{
    _id,
    title
  }`;

  // Try to find category by slug
  let category = await client.fetch<Category | null>(categoryQuery, { slug: categorySlug });

  // If not found by slug, try to find by title matching the slug pattern
  if (!category) {
    const titlePattern = categorySlug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const titleFromSlugQuery = groq`*[_type == "category" && title match $titlePattern][0]{
      _id,
      title
    }`;
    category = await client.fetch<Category | null>(titleFromSlugQuery, { titlePattern: `^${titlePattern}$` });
  }

  // If category still not found, return empty array
  if (!category) {
    console.error(`Category not found for slug: ${categorySlug}`);
    return [];
  }

  // Validate and get sort order
  const validSortBy = validateSortParam(sortBy);
  const postOrder = getSortOrder(validSortBy);

  // Fetch posts for the category with pagination
  const postsQuery = groq`*[_type == "post" && $categoryTitle in categories[]->title]{
    _id,
    title,
    slug,
    mainImage{ asset->{url, alt} },
    author->{name},
    publishedAt,
    excerpt,
    "categoryTitles": categories[]->title
  } | order(${postOrder}) [${skip}...${skip + limit}]`;

  try {
    const posts = await client.fetch<Post[]>(postsQuery, { 
      categoryId: category._id,
      categoryTitle: category.title 
    }, { cache: 'no-store' });
    return posts || [];
  } catch (error) {
    console.error(`Error fetching more posts for category ${category.title}:`, error);
    return [];
  }
}
