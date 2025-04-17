import React from 'react';
import { Metadata } from 'next';
import { ContactForm } from '@/components/forms';
import Layout from '@/components/layout/Layout';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import type { Category } from '@/types/sanity';

export const metadata: Metadata = {
  title: 'Contact Us | VPN News',
  description: 'Get in touch with the VPN News team. We welcome your feedback, questions, and news tips.',
  keywords: ['contact', 'feedback', 'questions', 'news tips', 'vpn news'],
  openGraph: {
    title: 'Contact Us | VPN News',
    description: 'Get in touch with the VPN News team. We welcome your feedback, questions, and news tips.',
    url: 'https://www.vpnnews.co.uk/contact-us',
    siteName: 'VPN News',
    locale: 'en_GB',
    type: 'website',
  },
};

// Fetch categories for the Layout component
async function getCategories() {
  const categoriesQuery = groq`*[_type == "category"]{ _id, title, slug }`;
  try {
    const categories = await client.fetch<Category[]>(categoriesQuery);
    return categories || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function ContactPage() {
  // Fetch categories for the Layout component
  const categories = await getCategories();
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-6">
            Contact Us
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="col-span-2">
              <ContactForm 
                title="Send Us a Message"
                subtitle="Have a question or comment? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible."
              />
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg h-fit">
              <h2 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-vpn-gray dark:text-gray-300">Email</h3>
                  <p className="text-vpn-gray-light dark:text-gray-400">
                    <a href="mailto:contact@vpnnews.co.uk" className="hover:text-vpn-blue dark:hover:text-blue-400">
                      contact@vpnnews.co.uk
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-vpn-gray dark:text-gray-300">News Tips</h3>
                  <p className="text-vpn-gray-light dark:text-gray-400">
                    Have a news tip or story idea? Submit it through our{' '}
                    <a href="/submit-tip" className="text-vpn-blue hover:underline dark:text-blue-400">
                      secure tip form
                    </a>.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-vpn-gray dark:text-gray-300">Business Enquiries</h3>
                  <p className="text-vpn-gray-light dark:text-gray-400">
                    For advertising and partnership opportunities:{' '}
                    <a href="mailto:business@vpnnews.co.uk" className="hover:text-vpn-blue dark:hover:text-blue-400">
                      business@vpnnews.co.uk
                    </a>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-vpn-gray dark:text-gray-300">Address</h3>
                  <p className="text-vpn-gray-light dark:text-gray-400">
                    VPN News<br />
                    123 Fleet Street<br />
                    London, EC4A 2BB<br />
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-vpn-gray dark:text-gray-300 mb-2">
                  How quickly will I receive a response?
                </h3>
                <p className="text-vpn-gray-light dark:text-gray-400">
                  We aim to respond to all enquiries within 1-2 business days. For urgent matters, please indicate this in the subject line of your message.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-vpn-gray dark:text-gray-300 mb-2">
                  How can I submit a correction to an article?
                </h3>
                <p className="text-vpn-gray-light dark:text-gray-400">
                  If you've spotted an error in one of our articles, please use this contact form and include "Correction" in the subject line, along with the article URL and details of the correction needed.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-vpn-gray dark:text-gray-300 mb-2">
                  How can I pitch a story idea?
                </h3>
                <p className="text-vpn-gray-light dark:text-gray-400">
                  We welcome story ideas from our readers. Please use our contact form with "Story Pitch" in the subject line, or email our editorial team directly at editorial@vpnnews.co.uk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
