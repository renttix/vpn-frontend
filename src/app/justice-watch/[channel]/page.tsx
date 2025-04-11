import { notFound } from "next/navigation";
import React from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { Play, Calendar, SortAsc, SortDesc } from "lucide-react";
import { getJusticeWatchChannelBySlug, getJusticeWatchVideos, formatDate, JusticeWatchVideo, JusticeWatchChannel } from "@/lib/sanity.justiceWatch";
import { urlForImage } from "@/lib/sanity.image";

// Define types
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

interface ChannelPageProps {
  params: {
    channel: string;
  };
  searchParams: {
    sort?: string;
  };
}

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

// Helper component for rendering sorting links
const SortLink = ({ 
  sortValue, 
  currentSort, 
  children 
}: { 
  sortValue: string; 
  currentSort: string; 
  children: React.ReactNode 
}) => {
  const isActive = sortValue === currentSort;
  
  return (
    <Link 
      href={`?sort=${sortValue}`}
      className={`px-3 py-1 text-xs rounded flex items-center ${isActive ? 'bg-vpn-blue text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
    >
      {children}
    </Link>
  );
};

// Channel page component
export default async function ChannelPage({ params, searchParams }: ChannelPageProps) {
  // Use Promise.all to await all params at once
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);
  
  const { channel } = resolvedParams;
  const sort = resolvedSearchParams?.sort || "date_desc"; // Default sort by date descending
  
  // Fetch data server-side
  const channelInfo = await getJusticeWatchChannelBySlug(channel);
  if (!channelInfo) {
    notFound();
  }
  
  const categories = await getCategories();
  const result = await getJusticeWatchVideos(channel, 1, 12, sort);
  const videos = result.videos;
  const totalVideos = result.totalCount;

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Ad Banner Placeholder - Sticky */}
        <div className="mb-8 sticky top-[56px] z-30">
          <div className="ad-banner-top">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>
        
        {/* Channel Header */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            {channelInfo.channelImage ? (
              <img 
                src={urlForImage(channelInfo.channelImage).width(64).height(64).url()} 
                alt={channelInfo.title}
                className="w-16 h-16 rounded-full"
                width={64}
                height={64}
              />
            ) : (
              <img 
                src={channelInfo.thumbnailUrl || '/images/placeholder-channel.jpg'} 
                alt={channelInfo.title}
                className="w-16 h-16 rounded-full"
                width={64}
                height={64}
              />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-1">
                {channelInfo.title}
              </h1>
              <a 
                href={`https://www.youtube.com/${channelInfo.customUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vpn-red hover:underline"
              >
                {channelInfo.customUrl}
              </a>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {channelInfo.description}
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium mr-2">Sort by:</span>
          <SortLink sortValue="date_desc" currentSort={sort}>
            <Calendar size={14} className="mr-1" />
            <span>Newest</span>
          </SortLink>
          <SortLink sortValue="date_asc" currentSort={sort}>
            <Calendar size={14} className="mr-1" />
            <span>Oldest</span>
          </SortLink>
          <SortLink sortValue="title_asc" currentSort={sort}>
            <SortAsc size={14} className="mr-1" />
            <span>Title (A-Z)</span>
          </SortLink>
          <SortLink sortValue="title_desc" currentSort={sort}>
            <SortDesc size={14} className="mr-1" />
            <span>Title (Z-A)</span>
          </SortLink>
        </div>

        {/* Video Grid - Netflix Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {videos.map((video) => (
            <div 
              key={video._id} 
              className="video-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <Link 
                href={`/justice-watch/${channel}/${video.youtubeId}`}
                className="block"
                aria-label={`Watch ${video.title}`}
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {/* Video Thumbnail */}
                  {video.thumbnailImage ? (
                    <img 
                      src={urlForImage(video.thumbnailImage).width(640).height(360).url()} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                      width={640}
                      height={360}
                      loading="lazy"
                    />
                  ) : (
                    <img 
                      src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      width={640}
                      height={360}
                      loading="lazy"
                    />
                  )}
                  
                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-vpn-red bg-opacity-90 rounded-full p-3 transform transition-transform duration-300 hover:scale-110">
                      <Play size={24} className="text-white" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2 text-vpn-gray dark:text-white line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {videos.length < totalVideos && (
          <div className="text-center mb-8">
            <Link
              href={`/justice-watch/${channel}?page=2&sort=${sort}`}
              className="inline-flex items-center justify-center bg-vpn-blue text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
              aria-label="View more videos"
            >
              <span>View More Videos</span>
            </Link>
          </div>
        )}

        {/* Back to Justice Watch */}
        <div className="text-center mb-8">
          <Link 
            href="/justice-watch"
            className="inline-block bg-vpn-blue text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Back to Justice Watch
          </Link>
        </div>
      </div>
    </Layout>
  );
}
