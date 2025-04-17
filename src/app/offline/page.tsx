import React from 'react';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';

export const dynamic = 'force-dynamic';
// Define metadata for the page
export const metadata: Metadata = {
  title: 'Offline | VPN News',
  description: 'You are currently offline. Some features may be unavailable.',
};

// Fetch categories for the layout
async function getCategories() {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  
  try {
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function OfflinePage() {
  // Fetch categories for the layout
  const categories = await getCategories();
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-vpn-blue dark:text-blue-400 mb-6">
            You're Offline
          </h1>
          
          <div className="text-8xl mb-8">
            📶
          </div>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            It looks like you've lost your internet connection. Some features of VPN News may be unavailable until you're back online.
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-vpn-blue dark:text-blue-400 mb-4">
              While You're Offline
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can still access any previously loaded pages that have been cached by your browser.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Once your connection is restored, you'll be able to access all of VPN News again.
            </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="bg-vpn-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    </Layout>
  );
}
