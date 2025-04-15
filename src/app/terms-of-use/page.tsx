import React from 'react';
import Layout from '@/components/layout/Layout';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import type { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Terms of Use',
  'Terms and conditions for using the Video Production News website and services.',
  'terms-of-use'
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

export default async function TermsOfUsePage() {
  const allCategories = await getAllCategories();
  
  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">Terms of Use</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Last Updated: April 6, 2025
            </p>
            
            <p>
              Welcome to Video Production News ("VPN News"). By accessing or using our website, you agree to be bound by these Terms of Use. Please read them carefully.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the VPN News website, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily view the materials on VPN News's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on VPN News's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p>
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by VPN News at any time.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">3. Disclaimer</h2>
            <p>
              The materials on VPN News's website are provided on an 'as is' basis. VPN News makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p>
              Further, VPN News does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">4. Limitations</h2>
            <p>
              In no event shall VPN News or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on VPN News's website, even if VPN News or a VPN News authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on VPN News's website could include technical, typographical, or photographic errors. VPN News does not warrant that any of the materials on its website are accurate, complete, or current. VPN News may make changes to the materials contained on its website at any time without notice. However, VPN News does not make any commitment to update the materials.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">6. Links</h2>
            <p>
              VPN News has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by VPN News of the site. Use of any such linked website is at the user's own risk.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">7. Modifications</h2>
            <p>
              VPN News may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
            
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-gray-200 mt-8 mb-4">9. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:info@vpnldn.co.uk" className="text-vpn-blue dark:text-blue-400 hover:underline">info@vpnldn.co.uk</a>
            </p>
            <p>
              <strong>Postal Address:</strong><br />
              Video Production News<br />
              10 South Grove<br />
              London<br />
              N6 6BS<br />
              United Kingdom
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
