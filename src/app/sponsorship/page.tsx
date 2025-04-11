import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Sponsorship Opportunities',
  'Explore sponsorship opportunities with Video Production News. Connect with our engaged audience of legal and criminal justice professionals.',
  'sponsorship'
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

export default async function SponsorshipPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Sponsorship Opportunities</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Partner with Video Production News to reach a highly engaged audience of legal professionals, law enforcement, journalists, and individuals interested in criminal justice news.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Why Sponsor VPN News?</h2>
            <p>
              VPN News offers unique sponsorship opportunities that allow your brand to connect with our dedicated audience in meaningful ways. Our readers are professionals and decision-makers in the legal and criminal justice sectors, as well as engaged citizens who care deeply about justice issues.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Targeted Reach:</strong> Connect with legal professionals, law enforcement, journalists, and engaged citizens</li>
              <li><strong>Brand Association:</strong> Align your brand with trusted, high-quality journalism</li>
              <li><strong>Thought Leadership:</strong> Position your organization as a leader in your field</li>
              <li><strong>Community Impact:</strong> Support important reporting on justice issues</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Sponsorship Options</h2>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Content Sponsorship</h3>
            <p>
              Sponsor a series of articles or special reports on topics relevant to your organization. Your brand will be prominently featured as the sponsor of this valuable content.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Series sponsorship (3-5 articles on a specific topic)</li>
              <li>Special report sponsorship</li>
              <li>Monthly category sponsorship</li>
            </ul>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Newsletter Sponsorship</h3>
            <p>
              Our newsletters reach thousands of engaged readers who want to stay informed about the latest developments in criminal justice news. Sponsorship includes prominent branding and a message from your organization.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Weekly newsletter sponsorship</li>
              <li>Breaking news alert sponsorship</li>
              <li>Monthly digest sponsorship</li>
            </ul>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Site Sponsorship</h3>
            <p>
              Gain significant visibility with site-wide sponsorship options that place your brand in front of all our visitors.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Site-wide sponsorship (monthly)</li>
              <li>Category sponsorship</li>
              <li>Special feature sponsorship</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Custom Sponsorship Packages</h2>
            <p>
              We understand that every organization has unique goals and needs. Our team can work with you to create a custom sponsorship package that aligns with your specific objectives and budget.
            </p>
            <p>
              Custom packages may include a combination of content sponsorship, newsletter presence, site visibility, and other promotional opportunities.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Audience</h2>
            <p>
              VPN News reaches a diverse and engaged audience, including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Legal professionals (attorneys, paralegals, judges)</li>
              <li>Law enforcement personnel</li>
              <li>Criminal justice researchers and academics</li>
              <li>Journalists and media professionals</li>
              <li>Policy makers and government officials</li>
              <li>Engaged citizens interested in justice issues</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Contact Us</h2>
            <p>
              To discuss sponsorship opportunities, please contact our business team:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:business@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">business@vpnldn.co.uk</a>
            </p>
            <p>
              <strong>Telephone:</strong> <a href="tel:+442036334699" className="text-vpn-blue dark:text-blue-400 hover:underline">+44 20 3633 4699</a>
            </p>
            <p className="mt-4">
              We look forward to partnering with you to create a sponsorship arrangement that benefits your organization while supporting quality journalism.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
