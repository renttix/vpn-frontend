import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Layout from "@/components/layout/Layout";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { Category } from "@/types/sanity";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Zap, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Membership - VPN News',
  description: 'Become a VPN News member for just £1 per week and enjoy an advertisement-free experience while supporting quality journalism.',
  openGraph: {
    title: 'Membership - VPN News',
    description: 'Become a VPN News member for just £1 per week and enjoy an advertisement-free experience while supporting quality journalism.',
  },
};

// Fetch categories
async function getCategories(): Promise<Category[]> {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  
  try {
    console.log("Fetching categories from Sanity...");
    const categories = await client.fetch(query, {}, {
      cache: 'no-store'
    });
    console.log("Fetched categories:", categories?.length || 0);
    return categories || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Return default categories to prevent UI failures
    return [
      { _id: 'default-news', title: 'News', slug: { current: 'news', _type: 'slug' } },
      { _id: 'default-crime', title: 'Crime News', slug: { current: 'crime-news', _type: 'slug' } },
      { _id: 'default-court', title: 'Court News', slug: { current: 'court-news', _type: 'slug' } },
      { _id: 'default-commentary', title: 'Legal Commentary', slug: { current: 'legal-commentary', _type: 'slug' } }
    ];
  }
}

// Helper function to convert GBP to USD
function getUSDEquivalent(gbpAmount: number): string {
  // Using a fixed exchange rate for simplicity
  // In a production environment, you might want to use an API to get the current exchange rate
  const exchangeRate = 1.25; // Example exchange rate: 1 GBP = 1.25 USD
  const usdAmount = gbpAmount * exchangeRate;
  return usdAmount.toFixed(2);
}

export default async function MembershipPage() {
  // Fetch categories for the header
  const categories = await getCategories();
  
  // Calculate USD equivalent
  const membershipFeeGBP = 1;
  const membershipFeeUSD = getUSDEquivalent(membershipFeeGBP);
  
  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 dark:text-gray-100">Become a VPN News Member</h1>
            <p className="text-xl text-vpn-gray dark:text-gray-300 mb-8">
              Support quality journalism and enjoy an enhanced reading experience
            </p>
            <div className="flex justify-center">
              <Button className="bg-vpn-red hover:bg-vpn-red/90 dark:bg-vpn-red dark:hover:bg-vpn-red/90 text-white px-8 py-6 text-lg rounded-md">
                Join Now for £{membershipFeeGBP} (${membershipFeeUSD}) per week
              </Button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="prose dark:prose-invert max-w-none mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 mb-10">
              <h2 className="text-2xl font-bold mb-6 text-center">Why Become a Member?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="mr-4 text-vpn-blue">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Ad-Free Experience</h3>
                    <p className="text-vpn-gray dark:text-gray-300">
                      Enjoy all our content without any advertisements or distractions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 text-vpn-blue">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Faster Loading</h3>
                    <p className="text-vpn-gray dark:text-gray-300">
                      Pages load faster without ads, giving you a smoother browsing experience.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 text-vpn-blue">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Support Quality Journalism</h3>
                    <p className="text-vpn-gray dark:text-gray-300">
                      Your membership directly supports our team of dedicated journalists.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 text-vpn-blue">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Affordable Price</h3>
                    <p className="text-vpn-gray dark:text-gray-300">
                      For just £{membershipFeeGBP} (${membershipFeeUSD}) per week, you get all these benefits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pricing Section */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md mb-10">
              <h2 className="text-2xl font-bold mb-6 text-center">Simple, Transparent Pricing</h2>
              
              <div className="max-w-md mx-auto">
                <div className="bg-vpn-blue/5 dark:bg-vpn-blue/10 p-6 rounded-lg border border-vpn-blue/20">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold">£{membershipFeeGBP}</span>
                    <span className="text-vpn-gray dark:text-gray-300 ml-2">/ week</span>
                  </div>
                  
                  <div className="text-center text-vpn-gray dark:text-gray-300 mb-6">
                    Approximately ${membershipFeeUSD} USD
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle2 size={18} className="text-green-500 mr-2" />
                      <span>100% Ad-free experience</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 size={18} className="text-green-500 mr-2" />
                      <span>Faster page loading</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 size={18} className="text-green-500 mr-2" />
                      <span>Support independent journalism</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 size={18} className="text-green-500 mr-2" />
                      <span>Cancel anytime</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-vpn-red hover:bg-vpn-red/90 dark:bg-vpn-red dark:hover:bg-vpn-red/90 text-white py-2">
                    Become a Member - £{membershipFeeGBP}/week
                  </Button>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">How does the ad-free experience work?</h3>
                  <p className="text-vpn-gray dark:text-gray-300">
                    Once you become a member, we'll automatically remove all advertisements from the site when you're logged in. This creates a cleaner, faster, and more enjoyable reading experience.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">Can I cancel my membership?</h3>
                  <p className="text-vpn-gray dark:text-gray-300">
                    Yes, you can cancel your membership at any time. There are no long-term commitments or contracts. If you cancel, you'll continue to have access until the end of your current billing period.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
                  <p className="text-vpn-gray dark:text-gray-300">
                    We accept all major credit and debit cards, as well as PayPal. All payments are securely processed and your financial information is never stored on our servers.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-2">How does my membership support VPN News?</h3>
                  <p className="text-vpn-gray dark:text-gray-300">
                    Your membership directly supports our journalism. While advertising provides some revenue, member contributions help us maintain our independence and focus on delivering high-quality, unbiased reporting on legal and court news.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Testimonials Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">What Our Members Say</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="italic mb-4">
                    "The ad-free experience is worth every penny. I can focus on the content without distractions, and the pages load so much faster."
                  </p>
                  <p className="font-bold">— Sarah T., Member since 2024</p>
                </div>
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="italic mb-4">
                    "I'm happy to support quality legal journalism. In today's media landscape, it's important to fund sources you trust."
                  </p>
                  <p className="font-bold">— Michael R., Member since 2023</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="text-center bg-vpn-blue text-white p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Enhance Your Experience?</h2>
            <p className="mb-6">
              Join thousands of readers who enjoy VPN News without advertisements.
            </p>
            <Button className="bg-white text-vpn-blue hover:bg-gray-100 dark:bg-white dark:hover:bg-gray-100 dark:text-vpn-blue px-8 py-2 text-lg">
              Become a Member Today - Just £{membershipFeeGBP}/week
            </Button>
          </div>
          
          <div className="text-center text-sm text-vpn-gray dark:text-gray-400">
            <p>
              Have questions? <Link href="/contact-us" className="text-vpn-blue hover:underline">Contact our support team</Link>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
