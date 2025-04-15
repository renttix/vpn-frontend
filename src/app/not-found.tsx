import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import type { Post } from '@/types/sanity';

// Define metadata for the 404 page
export const metadata: Metadata = {
  title: 'Page Not Found | VPN News',
  description: 'The page you are looking for does not exist or has been moved.',
  robots: {
    index: false,
    follow: true,
  },
};

// Fetch categories for the header
async function getCategories() {
  try {
    const query = groq`*[_type == "category"] { _id, title, slug }`;
    const categories = await client.fetch(query);
    return categories || [];
  } catch (error) {
    console.error('Failed to fetch categories for 404 page:', error);
    return [];
  }
}

// Fetch some popular articles to suggest to the user
async function getPopularArticles() {
  try {
    const query = groq`*[_type == "post"] | order(publishedAt desc)[0...4]{
      _id,
      title,
      slug,
      publishedAt
    }`;
    const articles = await client.fetch<Post[]>(query);
    return articles || [];
  } catch (error) {
    console.error('Failed to fetch popular articles for 404 page:', error);
    return [];
  }
}

export default async function NotFound() {
  const categories = await getCategories();
  const popularArticles = await getPopularArticles();
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-16 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-6xl font-bold text-vpn-blue dark:text-blue-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-vpn-gray dark:text-gray-200 mb-6">Page Not Found</h2>
          
          <p className="text-vpn-gray-light dark:text-gray-300 mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="mb-8">
            <Link 
              href="/" 
              className="bg-vpn-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
          
          {popularArticles.length > 0 && (
            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-xl font-semibold text-vpn-gray dark:text-gray-200 mb-4">
                You might be interested in:
              </h3>
              <ul className="space-y-3">
                {popularArticles.map((article: Post) => (
                  <li key={article._id}>
                    <Link 
                      href={`/${article.slug?.current || '#'}`}
                      className="text-vpn-blue dark:text-blue-400 hover:underline"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
