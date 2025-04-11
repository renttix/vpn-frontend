import { notFound } from "next/navigation";
import AmpArticle from "@/components/amp/AmpArticle";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import type { Post } from "@/types/sanity";
import { Metadata } from 'next';
import { generateArticleMetadata } from '@/lib/metadata';

// --- Types ---
interface PageProps {
  params: { slug: string };
}

// --- Data Fetching ---
async function getArticleData(slug: string): Promise<Post | null> {
  console.log(`[AMP] Fetching article data for slug: ${slug}`);
  
  const articleQuery = groq`*[_type == "post" && slug.current == $slug][0]{
    _id, title, slug, mainImage{ asset->{url, alt} },
    author->{_id, name, slug, bio, image{asset->{url, alt}}},
    publishedAt, body, "categories": categories[]->{_id, title, slug},
    excerpt
  }`;
  
  try {
    const article = await client.fetch<Post | null>(articleQuery, { slug });
    return article;
  } catch (error) {
    console.error(`[AMP] Error fetching article data for slug: ${slug}`, error);
    return null;
  }
}

// --- Metadata Generation ---
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // Access params directly - it's not a Promise
  const slug = params.slug;
  
  if (!slug) {
    return { title: 'Invalid Request' };
  }
  
  const article = await getArticleData(slug);
  
  if (!article) {
    return { title: 'Article Not Found' };
  }
  
  // Get base metadata from helper function
  const metadata = generateArticleMetadata(article);
  
  // Return with canonical URL for AMP page
  return {
    ...metadata,
    alternates: {
      canonical: `https://vpnnews.com/${article.slug.current}`
    }
  };
}

// --- Make this page fully dynamic ---
export const dynamic = 'force-dynamic';

// Return empty array to make this page fully dynamic
export async function generateStaticParams() {
  // In production builds on Netlify, return empty array to avoid API calls
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    console.log('[AMP] Skipping generateStaticParams in production/Netlify environment');
    return [];
  }
  
  try {
    // Get all article slugs
    const slugsQuery = groq`*[_type == "post" && defined(slug.current)][].slug.current`;
    const slugs = await client.fetch<string[]>(slugsQuery);
    
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('[AMP] Error generating static params:', error);
    return []; // Fallback to empty array on error
  }
}

// --- Page Component ---
export default async function AmpPage({ params }: any) {
  // Access params directly - it's not a Promise
  const slug = params.slug;
  
  if (!slug) {
    notFound();
  }
  
  const article = await getArticleData(slug);
  
  if (!article) {
    notFound();
  }
  
  const canonicalUrl = `https://vpnnews.com/${article.slug.current}`;
  
  return <AmpArticle article={article} canonicalUrl={canonicalUrl} />;
}
