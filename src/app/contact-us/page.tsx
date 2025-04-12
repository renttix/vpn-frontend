import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Contact Us',
  'Get in touch with the Video Production News team. We welcome your feedback, questions, and news tips.',
  'contact-us'
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

export default async function ContactUsPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Contact Us</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              We value your feedback and are always eager to hear from our readers. Whether you have a question, comment, or news tip, we're here to listen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">General Inquiries</h2>
                <p>
                  For general questions, feedback, or information about VPN News, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> <a href="mailto:citydesk@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">citydesk@vpnldn.co.uk</a>
                </p>
                <p>
                  <strong>Telephone:</strong> <a href="tel:+442036334699" className="text-vpn-blue dark:text-blue-400 hover:underline">+44 20 3633 4699</a>
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">News Tips</h2>
                <p>
                  Have a news tip or story idea? We'd love to hear from you. You can submit tips through our secure platform:
                </p>
                <p className="mt-4">
                  <a 
                    href="https://buymeacoffee.com/videoproductionnews" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-vpn-blue text-white px-4 py-2 rounded-sm hover:bg-opacity-90 inline-block"
                  >
                    Submit a Tip
                  </a>
                </p>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Your identity will be kept confidential unless you specify otherwise.
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">Postal Address</h2>
              <address className="not-italic">
                <p>Video Production News</p>
                <p>10 South Grove</p>
                <p>London</p>
                <p>N6 6BS</p>
                <p>United Kingdom</p>
              </address>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">Advertising & Sponsorship</h2>
              <p>
                For information about advertising and sponsorship opportunities with VPN News, please visit our 
                <a href="/advertising" className="text-vpn-blue dark:text-blue-400 hover:underline mx-1">Advertising</a>
                and
                <a href="/sponsorship" className="text-vpn-blue dark:text-blue-400 hover:underline mx-1">Sponsorship</a>
                pages or contact our business team at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> <a href="mailto:citydesk@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">citydesk@vpnldn.co.uk</a>
              </p>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mb-4">Response Time</h2>
              <p>
                We strive to respond to all inquiries within 48 hours during business days. For urgent matters, please indicate this in your message subject line.
              </p>
            </div>
            
            <p className="mt-8 text-vpn-gray dark:text-gray-300 italic">
              Thank you for your interest in VPN News. We look forward to hearing from you.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
