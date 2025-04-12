import { Metadata } from 'next';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';
import CookieSettingsClient from './CookieSettingsClient';

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
  title: 'Cookie Settings | Video Production News',
  description: 'Manage your cookie preferences for Video Production News.',
};

export default async function CookieSettingsPage() {
  // Fetch categories for the Layout component
  const categories = await getCategories();
  
  return (
    <Layout categories={categories}>
      <CookieSettingsClient />
    </Layout>
  );
}
