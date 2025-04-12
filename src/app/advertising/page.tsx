import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Advertising',
  'Explore advertising opportunities with Video Production News. Reach our engaged audience of legal and criminal justice professionals.',
  'advertising'
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

export default async function AdvertisingPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Advertising Opportunities</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Advertise with Video Production News to connect with our engaged audience of legal professionals, law enforcement, journalists, and individuals interested in criminal justice news.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Why Advertise with VPN News?</h2>
            <p>
              VPN News offers a unique advertising platform that allows your brand to reach a highly targeted audience in the legal and criminal justice sectors. Our readers are professionals, decision-makers, and engaged citizens who value quality journalism and trusted information.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Targeted Audience:</strong> Reach legal professionals, law enforcement, journalists, and engaged citizens</li>
              <li><strong>Quality Context:</strong> Place your ads alongside trusted, high-quality journalism</li>
              <li><strong>Brand Safety:</strong> Benefit from our commitment to factual, responsible reporting</li>
              <li><strong>Engagement:</strong> Connect with readers who spend significant time engaging with our content</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Advertising Options</h2>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Display Advertising</h3>
            <p>
              Our website offers several premium positions for display advertising:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Leaderboard (728x90):</strong> Prominent placement at the top of all pages</li>
              <li><strong>Sidebar (300x250 or 300x600):</strong> High-visibility placement alongside content</li>
              <li><strong>In-article (various sizes):</strong> Integrated within our most engaging content</li>
              <li><strong>Sticky ads:</strong> Remain visible as users scroll through content</li>
              <li><strong>Mobile-optimized formats:</strong> Reach our growing mobile audience</li>
            </ul>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Newsletter Advertising</h3>
            <p>
              Our newsletters reach thousands of engaged readers who want to stay informed about the latest developments in criminal justice news:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Banner ads:</strong> Prominent placement within our newsletter content</li>
              <li><strong>Sponsored content:</strong> Brief promotional content integrated with our newsletter</li>
              <li><strong>Exclusive newsletter sponsorship:</strong> Be the sole advertiser in a newsletter edition</li>
            </ul>
            
            <h3 className="text-xl font-heading font-bold text-vpn-gray dark:text-gray-300 mt-6 mb-3">Native Advertising</h3>
            <p>
              Create branded content that resonates with our audience while clearly labeled as sponsored:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Sponsored articles:</strong> Informative content related to your brand or services</li>
              <li><strong>Branded content:</strong> Content created in collaboration with our editorial team</li>
              <li><strong>Resource guides:</strong> Useful information sponsored by your organization</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Advertising Specifications</h2>
            <p>
              We accept a variety of ad formats and can work with you to ensure your creative assets meet our specifications:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>File formats:</strong> JPG, PNG, GIF, HTML5</li>
              <li><strong>Maximum file size:</strong> 150KB for standard ads</li>
              <li><strong>Animation:</strong> 15-second maximum, no more than three loops</li>
              <li><strong>Audio:</strong> User-initiated only</li>
            </ul>
            <p>
              For detailed specifications and requirements, please contact our advertising team.
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
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Advertising Policies</h2>
            <p>
              VPN News maintains high standards for advertising to ensure a positive experience for our readers:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>All advertisements must be clearly distinguishable from editorial content</li>
              <li>Advertisements must not be deceptive or misleading</li>
              <li>We reserve the right to reject any advertisement that does not meet our standards</li>
              <li>Advertisements must comply with all applicable laws and regulations</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Contact Us</h2>
            <p>
              To discuss advertising opportunities, request a media kit, or get a quote, please contact our advertising team:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:citydesk@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">citydesk@vpnldn.co.uk</a>
            </p>
            <p>
              <strong>Telephone:</strong> <a href="tel:+442036334699" className="text-vpn-blue dark:text-blue-400 hover:underline">+44 20 3633 4699</a>
            </p>
            <p className="mt-4">
              We look forward to working with you to create an effective advertising campaign that reaches our engaged audience.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
