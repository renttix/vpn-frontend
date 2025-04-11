import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { Play } from "lucide-react";
import { getJusticeWatchChannels } from "@/lib/sanity.justiceWatch";
import { urlForImage } from "@/lib/sanity.image";

// Define types
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

// Define metadata for the Justice Watch page
export const metadata: Metadata = {
  title: "Justice Watch | Video Production News",
  description: "Watch videos from our YouTube channels covering legal commentary, court cases, and justice news.",
  openGraph: {
    title: "Justice Watch | Video Production News",
    description: "Watch videos from our YouTube channels covering legal commentary, court cases, and justice news.",
    url: "/justice-watch",
    type: "website",
  },
};

// Fetch categories for the layout
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

export default async function JusticeWatchPage() {
  // Fetch categories for layout
  const categories = await getCategories();
  
  // Fetch Justice Watch channels from Sanity
  const channels = await getJusticeWatchChannels();

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Ad Banner Placeholder - Sticky */}
        <div className="mb-8 sticky top-[56px] z-30">
          <div className="ad-banner-top">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>
        
        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
            Justice Watch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Watch videos from our YouTube channels covering legal commentary, court cases, and justice news.
          </p>
        </div>

        {/* Channel Grid - Netflix Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {channels.map((channel) => (
            <div 
              key={channel._id} 
              className="channel-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Link 
                href={`/justice-watch/${channel.slug.current}`}
                className="block h-full"
                aria-label={`View videos from ${channel.title}`}
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {/* Channel Thumbnail */}
                  <div 
                    className="absolute inset-0 bg-center bg-cover"
                    style={{ 
                      backgroundImage: channel.channelImage 
                        ? `url(${urlForImage(channel.channelImage).url()})` 
                        : `url(${channel.thumbnailUrl || '/images/placeholder-channel.jpg'})` 
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-vpn-red bg-opacity-90 rounded-full p-4 transform transition-transform duration-300 hover:scale-110">
                      <Play size={32} className="text-white" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-vpn-gray dark:text-white">
                    {channel.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {channel.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-vpn-blue dark:text-blue-400 font-medium">
                      View Channel
                    </span>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                      YouTube
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-vpn-gray dark:text-white">
            About Justice Watch
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Justice Watch brings you video content from our trusted YouTube channels, covering court cases, legal commentary, and justice news. Our videos provide in-depth analysis and reporting on important legal developments.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            All videos comply with our content policies and are embedded directly from YouTube. Subscribe to our channels for the latest updates.
          </p>
        </div>
      </div>
    </Layout>
  );
}
