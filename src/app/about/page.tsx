import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'About Us',
  'Learn more about Video Production News, our mission, and our commitment to reporting the truth from the courtroom out.',
  'about'
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

export default async function AboutPage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">About VPN News</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Video Production News (VPN) is dedicated to providing accurate, timely, and insightful coverage of legal and criminal justice news across the United Kingdom.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Mission</h2>
            <p>
              At VPN News, our mission is to report the truth from the courtroom out. We believe in the importance of transparent, factual reporting on matters of justice, law enforcement, and legal proceedings. Our goal is to inform the public about significant legal developments and criminal cases while maintaining the highest standards of journalistic integrity.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Approach</h2>
            <p>
              We approach our reporting with a commitment to accuracy, fairness, and depth. Our team works diligently to provide context and analysis that helps our readers understand the complexities of the legal system and criminal justice processes. We strive to present information in a clear, accessible manner without sensationalism or bias.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Coverage</h2>
            <p>
              VPN News covers a wide range of topics including:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Criminal cases and court proceedings</li>
              <li>Legal analysis and commentary</li>
              <li>Law enforcement activities</li>
              <li>Criminal justice reform</li>
              <li>Breaking news related to crime and justice</li>
            </ul>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Our Team</h2>
            <p>
              Our team consists of experienced journalists, legal experts, and researchers who are passionate about justice and committed to ethical reporting. We work together to bring you comprehensive coverage of the most important legal and criminal justice stories.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">Contact Us</h2>
            <p>
              We value your feedback and are always open to hearing from our readers. If you have questions, comments, or tips, please don't hesitate to <a href="/contact-us" className="text-vpn-blue dark:text-blue-400 hover:underline">contact us</a>.
            </p>
            
            <p className="mt-8 text-vpn-gray dark:text-gray-300 italic">
              Thank you for choosing VPN News as your source for legal and criminal justice information.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
