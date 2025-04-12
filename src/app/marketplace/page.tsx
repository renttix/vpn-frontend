import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Marketplace - Coming Soon',
  'The VPN News Marketplace is coming soon. Stay tuned for our new marketplace features and offerings.',
  'marketplace'
);

// Fetch all categories for the header
async function getAllCategories() {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  
  return client.fetch(query);
}

export default async function MarketplacePage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-16 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Marketplace</h1>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-lg shadow-md border-2 border-vpn-blue">
            <h2 className="text-3xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-6">Coming Soon</h2>
            
            <div className="max-w-none mx-auto text-vpn-gray dark:text-gray-300">
              <p className="text-xl mb-6 font-bold">
                We're working on something exciting for you!
              </p>
              
              <p className="text-lg mb-8">
                The VPN News Marketplace will be launching soon, offering a range of services and products related to legal news, court reporting, and justice information.
              </p>
              
              <div className="w-24 h-1 bg-vpn-blue mx-auto my-8"></div>
              
              <p className="text-lg">
                Check back soon for updates or <a href="/newsletters" className="text-vpn-blue dark:text-blue-400 hover:underline font-bold">subscribe to our newsletter</a> to be notified when we launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
