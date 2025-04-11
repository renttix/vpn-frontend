import { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import { ArrowLeft, Calendar, ThumbsUp, MessageSquare } from "lucide-react";
import ShareButton from "@/components/video/ShareButton";
import { getJusticeWatchVideoById, getJusticeWatchChannelBySlug, formatDate, getYouTubeEmbedUrl } from "@/lib/sanity.justiceWatch";
import { urlForImage } from "@/lib/sanity.image";

// Define types
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

interface VideoPageProps {
  params: {
    channel: string;
    videoId: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { videoId, channel } = resolvedParams;
  
  const video = await getJusticeWatchVideoById(videoId);
  
  if (!video) {
    return {
      title: "Video Not Found | Justice Watch",
      description: "The requested video could not be found.",
    };
  }
  
  return {
    title: `${video.title} | Justice Watch`,
    description: video.description,
    openGraph: {
      title: `${video.title} | Justice Watch`,
      description: video.description,
      url: `/justice-watch/${channel}/${videoId}`,
      type: "video.other",
      videos: [
        {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          width: 1280,
          height: 720,
          type: "application/x-shockwave-flash",
        },
      ],
      images: [
        {
          url: video.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          width: 1280,
          height: 720,
          alt: video.title,
        },
      ],
    },
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

// Video page component
export default async function VideoPage({ params }: VideoPageProps) {
  // Await params
  const resolvedParams = await params;
  const { channel, videoId } = resolvedParams;
  
  // Fetch video info from Sanity
  const video = await getJusticeWatchVideoById(videoId);
  if (!video) {
    notFound();
  }
  
  // Fetch channel info from Sanity
  const channelInfo = await getJusticeWatchChannelBySlug(channel);
  if (!channelInfo) {
    notFound();
  }
  
  // Fetch categories for layout
  const categories = await getCategories();
  
  // Generate YouTube embed URL
  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Ad Banner Placeholder - Sticky */}
        <div className="mb-8 sticky top-[56px] z-30">
          <div className="ad-banner-top">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/justice-watch/${channel}`}
            className="inline-flex items-center text-vpn-blue hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to {channelInfo.title}</span>
          </Link>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              loading="lazy"
              aria-label={`YouTube video: ${video.title}`}
            ></iframe>
          </div>
        </div>

        {/* Video Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-vpn-gray dark:text-white mb-4">
            {video.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>{formatDate(video.publishedAt)}</span>
            </div>
            <div className="flex items-center">
              {channelInfo.channelImage ? (
                <img 
                  src={urlForImage(channelInfo.channelImage).width(20).height(20).url()} 
                  alt={channelInfo.title}
                  className="w-5 h-5 rounded-full mr-2"
                  width={20}
                  height={20}
                />
              ) : (
                <img 
                  src={channelInfo.thumbnailUrl || '/images/placeholder-channel.jpg'} 
                  alt={channelInfo.title}
                  className="w-5 h-5 rounded-full mr-2"
                  width={20}
                  height={20}
                />
              )}
              <span>{channelInfo.title}</span>
            </div>
            {video.duration && (
              <div className="flex items-center">
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                  {video.duration}
                </span>
              </div>
            )}
          </div>
          
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <a 
                href={video.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-vpn-blue hover:underline"
                aria-label="Watch on YouTube"
              >
                <ThumbsUp size={16} className="mr-1" />
                <span>Watch on YouTube</span>
              </a>
              <ShareButton 
                title={video.title}
                description={video.description}
                videoId={videoId}
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-bold mb-2 text-vpn-gray dark:text-white">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {video.description}
            </p>
          </div>
        </div>

        {/* Back to Channel */}
        <div className="text-center mb-8">
          <Link 
            href={`/justice-watch/${channel}`}
            className="inline-block bg-vpn-blue text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            More Videos from {channelInfo.title}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
