import React from 'react';
import { Metadata } from 'next';
import { NewsletterForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Subscribe to Our Newsletters | VPN News',
  description: 'Subscribe to VPN News newsletters to stay informed about the latest developments in legal and criminal justice news.',
  keywords: ['subscribe', 'newsletter', 'email updates', 'legal news', 'criminal justice news'],
  openGraph: {
    title: 'Subscribe to Our Newsletters | VPN News',
    description: 'Subscribe to VPN News newsletters to stay informed about the latest developments in legal and criminal justice news.',
    url: 'https://www.vpnnews.co.uk/subscribe',
    siteName: 'VPN News',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function SubscribePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-6">
          Subscribe to Our Newsletters
        </h1>
        
        <p className="text-lg mb-6">
          Stay informed with the latest developments in legal and criminal justice news. Subscribe to our newsletters to receive curated content directly in your inbox.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
              Daily Briefing
            </h2>
            <p className="text-vpn-gray-light dark:text-gray-400 mb-4">
              Our most popular newsletter. Get the day's top stories delivered to your inbox every weekday morning.
            </p>
            <div className="mt-4">
              <a
                href="#subscribe-form"
                className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
              >
                Subscribe Now
              </a>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
              Weekly Roundup
            </h2>
            <p className="text-vpn-gray-light dark:text-gray-400 mb-4">
              A comprehensive summary of the week's most important stories, delivered every Friday afternoon.
            </p>
            <div className="mt-4">
              <a
                href="#subscribe-form"
                className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
              >
                Subscribe Now
              </a>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
              Breaking News Alerts
            </h2>
            <p className="text-vpn-gray-light dark:text-gray-400 mb-4">
              Be the first to know about major developments as they happen with our breaking news alerts.
            </p>
            <div className="mt-4">
              <a
                href="#subscribe-form"
                className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
              >
                Subscribe Now
              </a>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">
              Special Reports
            </h2>
            <p className="text-vpn-gray-light dark:text-gray-400 mb-4">
              Receive our in-depth special reports and investigations on important legal and criminal justice issues.
            </p>
            <div className="mt-4">
              <a
                href="#subscribe-form"
                className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
        
        <div id="subscribe-form" className="bg-gray-100 dark:bg-gray-800 p-8 rounded-sm mt-12 border border-gray-200 dark:border-gray-700">
          <NewsletterForm 
            title="Subscribe to Our Newsletters"
            subtitle="Fill out the form below to subscribe to any of our newsletters. You can select multiple options and update your preferences at any time."
            successMessage="Thank you for subscribing! You'll receive a confirmation email shortly. Please confirm your subscription to start receiving our newsletters."
          />
          
          <div className="mt-8 text-sm text-vpn-gray-light dark:text-gray-400">
            <p className="mb-2">
              <strong>Privacy Notice:</strong> We respect your privacy and will never share your email address with third parties.
            </p>
            <p className="text-vpn-gray dark:text-gray-300">
              You can unsubscribe at any time by clicking the unsubscribe link in the footer of any email you receive from us, or by contacting us at contact@vpnnews.co.uk. For more information about our privacy practices, please review our <a href="/privacy-policy" className="text-vpn-blue hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
