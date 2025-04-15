import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import FeedSubscription from '@/components/layout/FeedSubscription';
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { Category } from "@/types/sanity";

export const metadata: Metadata = {
  title: 'Subscribe to VPN News Feeds',
  description: 'Subscribe to VPN News via RSS, JSON Feed, or your favorite feed reader to stay updated with our latest legal news, court reports, and expert analysis.',
  openGraph: {
    title: 'Subscribe to VPN News Feeds',
    description: 'Subscribe to VPN News via RSS, JSON Feed, or your favorite feed reader to stay updated with our latest legal news, court reports, and expert analysis.',
  },
};

// Fetch categories
async function getCategories(): Promise<Category[]> {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  
  try {
    console.log("Fetching categories from Sanity...");
    const categories = await client.fetch(query, {}, {
      cache: 'no-store'
    });
    console.log("Fetched categories:", categories?.length || 0);
    return categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Return default categories to prevent UI failures
    return [
      { _id: 'default-news', title: 'News', slug: { current: 'news', _type: 'slug' } },
      { _id: 'default-crime', title: 'Crime News', slug: { current: 'crime-news', _type: 'slug' } },
      { _id: 'default-court', title: 'Court News', slug: { current: 'court-news', _type: 'slug' } },
      { _id: 'default-commentary', title: 'Legal Commentary', slug: { current: 'legal-commentary', _type: 'slug' } }
    ];
  }
}

export default async function SubscribePage() {
  // Fetch categories for the header
  const categories = await getCategories();
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Subscribe to VPN News</h1>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="lead text-xl">
              Stay updated with the latest legal news, court reports, and expert analysis from Video Production News.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Feed Options</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">RSS Feed</h3>
                <p className="mb-4">
                  Our RSS feed provides updates in the standard RSS 2.0 format, compatible with virtually all feed readers.
                </p>
                <div className="flex items-center mb-4">
                  <code className="bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded text-sm flex-grow overflow-x-auto">
                    https://vpnnews.com/feed.xml
                  </code>
                  <a 
                    href="/feed.xml" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
                  >
                    View
                  </a>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Includes article titles, publication dates, summaries, and links to full content.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">JSON Feed</h3>
                <p className="mb-4">
                  Our JSON Feed follows the JSON Feed 1.1 specification, offering a modern alternative to RSS.
                </p>
                <div className="flex items-center mb-4">
                  <code className="bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded text-sm flex-grow overflow-x-auto">
                    https://vpnnews.com/feed.json
                  </code>
                  <a 
                    href="/feed.json" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                  >
                    View
                  </a>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Includes rich metadata, author information, and article images in an easy-to-parse JSON format.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Popular Feed Readers</h2>
            
            <p>
              You can subscribe to our feeds using any feed reader. Here are some popular options:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 my-6">
              <a 
                href="https://feedly.com/i/subscription/feed/https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-bold mb-2">Feedly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A popular web-based feed reader with mobile apps for iOS and Android.
                </p>
              </a>
              
              <a 
                href="https://www.inoreader.com/?add_feed=https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-bold mb-2">Inoreader</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A comprehensive feed reader with powerful organization features.
                </p>
              </a>
              
              <a 
                href="https://newsblur.com/?url=https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-bold mb-2">NewsBlur</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  An intelligent feed reader with social sharing features.
                </p>
              </a>
            </div>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Other Ways to Follow Us</h2>
            
            <p>
              In addition to our feeds, you can also follow us on:
            </p>
            
            <ul className="list-disc pl-6 my-4">
              <li>
                <Link href="/newsletters" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Email Newsletters
                </Link> - Get our top stories delivered to your inbox
              </li>
              <li>
                <a href="https://twitter.com/vpnldn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  X (Twitter)
                </a> - Follow us for breaking news and updates
              </li>
              <li>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Facebook
                </a> - Join our community for discussions and more
              </li>
            </ul>
          </div>
          
          <div className="mt-8">
            <FeedSubscription className="max-w-md mx-auto" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
