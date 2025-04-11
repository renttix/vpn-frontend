import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Newsletters',
  'Subscribe to Video Production News newsletters to stay informed about the latest developments in legal and criminal justice news.',
  'newsletters'
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

export default async function NewslettersPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">VPN News Newsletters</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Stay informed with the latest developments in legal and criminal justice news. Subscribe to our newsletters to receive curated content directly in your inbox.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Newsletter Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mb-3">Daily Briefing</h3>
                <p className="mb-4">
                  A comprehensive summary of the day's most important legal and criminal justice news, delivered every weekday evening.
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Top stories of the day</li>
                  <li>News updates</li>
                  <li>Court case summaries</li>
                  <li>Legal analysis</li>
                </ul>
                <div className="mt-4">
                  <a 
                    href="#subscribe-form" 
                    className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
                  >
                    Subscribe
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mb-3">Weekly Roundup</h3>
                <p className="mb-4">
                  A curated selection of the week's most significant stories and developments, delivered every Saturday morning.
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Week's top stories</li>
                  <li>In-depth analysis</li>
                  <li>Exclusive content</li>
                  <li>Weekend reading recommendations</li>
                </ul>
                <div className="mt-4">
                  <a 
                    href="#subscribe-form" 
                    className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
                  >
                    Subscribe
                  </a>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mb-3">News Alerts</h3>
                <p className="mb-4">
                  Be the first to know about major developments in the legal and criminal justice world with our news alerts.
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Major court decisions</li>
                  <li>Significant arrests</li>
                  <li>Important legal developments</li>
                  <li>High-profile case updates</li>
                </ul>
                <div className="mt-4">
                  <a 
                    href="#subscribe-form" 
                    className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
                  >
                    Subscribe
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mb-3">Legal Commentary Digest</h3>
                <p className="mb-4">
                  Expert analysis and commentary on significant legal issues and court cases, delivered twice monthly.
                </p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Expert legal analysis</li>
                  <li>Case law developments</li>
                  <li>Legislative updates</li>
                  <li>Opinion pieces from legal experts</li>
                </ul>
                <div className="mt-4">
                  <a 
                    href="#subscribe-form" 
                    className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
                  >
                    Subscribe
                  </a>
                </div>
              </div>
            </div>
            
            <div id="subscribe-form" className="bg-gray-100 dark:bg-gray-800 p-8 rounded-sm mt-12 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-6">Subscribe to Our Newsletters</h2>
              <p className="mb-6">
                Fill out the form below to subscribe to any of our newsletters. You can select multiple options and update your preferences at any time.
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Your email address"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select newsletters</p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="daily" 
                        name="newsletters" 
                        value="daily" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="daily" className="text-gray-700 dark:text-gray-300">Daily Briefing</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="weekly" 
                        name="newsletters" 
                        value="weekly" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="weekly" className="text-gray-700 dark:text-gray-300">Weekly Roundup</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="breaking" 
                        name="newsletters" 
                        value="breaking" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="breaking" className="text-gray-700 dark:text-gray-300">News Alerts</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        id="commentary" 
                        name="newsletters" 
                        value="commentary" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="commentary" className="text-gray-700 dark:text-gray-300">Legal Commentary Digest</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="bg-vpn-blue text-white px-6 py-3 rounded-sm hover:bg-opacity-90"
                  >
                    Subscribe
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  By subscribing, you agree to our <a href="/privacy-policy" className="text-vpn-blue dark:text-blue-400 hover:underline">Privacy Policy</a> and <a href="/terms-of-use" className="text-vpn-blue dark:text-blue-400 hover:underline">Terms of Use</a>. You can unsubscribe at any time by clicking the unsubscribe link in the footer of our emails.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
