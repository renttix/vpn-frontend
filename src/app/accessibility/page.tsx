import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Accessibility',
  'Learn about Video Production News\'s commitment to accessibility and how we strive to make our content available to all users.',
  'accessibility'
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

export default async function AccessibilityPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Accessibility Statement</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Last Updated: April 6, 2025
            </p>
            
            <p>
              Video Production News (VPN News) is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Commitment</h2>
            <p>
              We strive to ensure that our website complies with best practices and standards as defined by the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone.
            </p>
            <p>
              The guidelines have three levels of accessibility (A, AA, and AAA). We've chosen Level AA as our target.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Accessibility Features</h2>
            <p>
              Our website includes the following accessibility features:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Semantic HTML structure for better screen reader navigation</li>
              <li>Keyboard navigation support</li>
              <li>Text alternatives for non-text content</li>
              <li>Sufficient color contrast</li>
              <li>Resizable text without loss of content or functionality</li>
              <li>Dark mode for reduced eye strain</li>
              <li>Clear and consistent navigation</li>
              <li>Descriptive link text</li>
              <li>ARIA landmarks for improved screen reader navigation</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Compatibility with Browsers and Assistive Technology</h2>
            <p>
              We aim to support the widest array of browsers and assistive technologies as possible, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Recent versions of major browsers (Chrome, Firefox, Safari, Edge)</li>
              <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
              <li>Zoom and magnification tools</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Known Limitations</h2>
            <p>
              Despite our best efforts to ensure accessibility, there may be some limitations. The following are known accessibility issues that we are working to resolve:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Some older content may not fully meet our accessibility standards</li>
              <li>Some third-party content or functionality may not be fully accessible</li>
              <li>Some complex visualizations or interactive elements may have limited accessibility</li>
            </ul>
            <p>
              We are working to address these issues and improve the accessibility of our website continuously.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Feedback and Contact Information</h2>
            <p>
              We welcome your feedback on the accessibility of the VPN News website. Please let us know if you encounter any accessibility barriers:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:accessibility@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">accessibility@vpnldn.co.uk</a>
            </p>
            <p>
              <strong>Postal Address:</strong><br />
              Video Production News<br />
              10 South Grove<br />
              London<br />
              N6 6BS<br />
              United Kingdom
            </p>
            <p>
              We try to respond to feedback within 5 business days.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Assessment and Compliance</h2>
            <p>
              The accessibility of our website is evaluated in the following ways:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Self-evaluation by our development team</li>
              <li>Automated testing tools</li>
              <li>User feedback and testing</li>
            </ul>
            <p>
              This statement was created on April 6, 2025, using the W3C Accessibility Statement Generator Tool.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
