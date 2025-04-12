import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';

// Define Category type
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

// Fetch categories from Sanity
async function getCategories(): Promise<Category[]> {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  
  try {
    const categories = await client.fetch(query);
    return categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Privacy Policy | Video Production News',
  description: 'Learn about how Video Production News handles your personal data and privacy.',
};

export default async function PrivacyPolicyPage() {
  // Fetch categories for the Layout component
  const categories = await getCategories();
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark mb-6">
          Privacy Policy
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p>
            Last updated: April 7, 2025
          </p>
          
          <h2>Introduction</h2>
          <p>
            Video Production News ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website vpnnews.com (the "Site").
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
            please do not access the Site.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in various ways, including:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, 
              and other contact details that you voluntarily give to us when you submit tips, subscribe to our newsletter, 
              or contact us.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our Site, including your browser type, 
              IP address, pages visited, time spent on pages, and other similar information.
            </li>
            <li>
              <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies 
              to track activity on our Site and hold certain information. See our Cookie Policy section below for more details.
            </li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>
            We may use the information we collect about you for various purposes, including:
          </p>
          <ul>
            <li>To provide and maintain our Site</li>
            <li>To notify you about changes to our Site</li>
            <li>To allow you to participate in interactive features when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Site</li>
            <li>To monitor the usage of our Site</li>
            <li>To detect, prevent, and address technical issues</li>
            <li>To fulfill any other purpose for which you provide it</li>
          </ul>
          
          <h2>Cookie Policy</h2>
          <p>
            Cookies are small pieces of data stored on your device (computer or mobile device) when you visit our Site. 
            We use cookies and similar technologies to enhance your experience on our Site.
          </p>
          
          <h3>Types of Cookies We Use</h3>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be 
              switched off in our systems. They are usually only set in response to actions made by you which amount to 
              a request for services, such as setting your privacy preferences, logging in, or filling in forms.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can 
              measure and improve the performance of our site. They help us to know which pages are the most and least 
              popular and see how visitors move around the site.
            </li>
            <li>
              <strong>Marketing Cookies:</strong> These cookies may be set through our site by our advertising partners. 
              They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
            </li>
            <li>
              <strong>Preferences Cookies:</strong> These cookies enable the website to provide enhanced functionality and 
              personalisation. They may be set by us or by third party providers whose services we have added to our pages.
            </li>
          </ul>
          
          <h3>Managing Cookies</h3>
          <p>
            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. 
            You can also manage your cookie preferences on our Site by visiting our{' '}
            <Link href="/cookie-settings" className="text-vpn-blue hover:underline">
              Cookie Settings
            </Link>{' '}
            page.
          </p>
          
          <h2>Third-Party Disclosure</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties 
            except as described in this Privacy Policy. This does not include trusted third parties who assist us in 
            operating our Site, conducting our business, or servicing you, so long as those parties agree to keep this 
            information confidential.
          </p>
          
          <h2>Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites. We have no control over and assume no responsibility 
            for the content, privacy policies, or practices of any third-party sites or services.
          </p>
          
          <h2>Data Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the 
            security of any personal information we process. However, please also remember that we cannot guarantee 
            that the internet itself is 100% secure.
          </p>
          
          <h2>Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as:
          </p>
          <ul>
            <li>The right to access, update, or delete your personal information</li>
            <li>The right to rectification if your information is inaccurate or incomplete</li>
            <li>The right to object to our processing of your personal data</li>
            <li>The right to request that we restrict the processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: citydesk@vpnldn.co.uk<br />
            Address: 123 News Street, London, UK
          </p>
          
          <div className="mt-8">
            <Link href="/cookie-settings" className="text-vpn-blue hover:underline">
              Manage Cookie Settings
            </Link>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
