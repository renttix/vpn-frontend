import React from 'react';
import Layout from '@/components/layout/Layout';
import CookieSettingsForm from '@/components/cookies/CookieSettingsForm';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import type { Category } from '@/types/sanity';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Settings | VPN News',
  description: 'Manage your cookie preferences and privacy settings for VPN News.',
  robots: {
    index: false,
    follow: true,
  },
};

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

export default async function CookieSettingsPage() {
  const categories = await getCategories();

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">
            Cookie Settings
          </h1>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 mb-8">
            <h2 className="text-xl font-body font-bold text-vpn-gray dark:text-white mb-4">
              Manage Your Privacy
            </h2>
            
            <p className="font-body text-vpn-gray dark:text-gray-300 mb-6">
              We use cookies and similar technologies to help personalize content, enhance your experience, 
              and analyze our traffic. You can choose which categories of cookies you want to allow.
              Please note that essential cookies are always enabled as they are necessary for the website to function properly.
            </p>
            
            <CookieSettingsForm />
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
            <h2 className="text-xl font-body font-bold text-vpn-gray dark:text-white mb-4">
              About Our Cookies
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-body font-semibold text-vpn-gray dark:text-white mb-2">
                  Essential Cookies
                </h3>
                <p className="font-body text-vpn-gray dark:text-gray-300">
                  These cookies are necessary for the website to function properly and cannot be disabled. 
                  They are usually only set in response to actions made by you which amount to a request for services, 
                  such as setting your privacy preferences, logging in, or filling in forms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-body font-semibold text-vpn-gray dark:text-white mb-2">
                  Analytics Cookies
                </h3>
                <p className="font-body text-vpn-gray dark:text-gray-300">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                  of our site. They help us to know which pages are the most and least popular and see how visitors move 
                  around the site. All information these cookies collect is aggregated and anonymous.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-body font-semibold text-vpn-gray dark:text-white mb-2">
                  Marketing Cookies
                </h3>
                <p className="font-body text-vpn-gray dark:text-gray-300">
                  These cookies may be set through our site by our advertising partners. They may be used by those companies 
                  to build a profile of your interests and show you relevant adverts on other sites. They do not store 
                  directly personal information, but are based on uniquely identifying your browser and internet device.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-body font-semibold text-vpn-gray dark:text-white mb-2">
                  Preferences Cookies
                </h3>
                <p className="font-body text-vpn-gray dark:text-gray-300">
                  These cookies enable the website to provide enhanced functionality and personalization. They may be set 
                  by us or by third party providers whose services we have added to our pages. If you do not allow these 
                  cookies then some or all of these services may not function properly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
