'use client';

import { useState } from 'react';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';

// Define types
interface VideoPost {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnailImage?: { asset: { url: string; alt?: string } };
  videoUrl: string;
  author?: { name: string };
  publishedAt: string;
  description?: any; // Using any for blockContent
  duration?: string;
}

interface VideoGalleryProps {
  initialVideos: VideoPost[];
  categoryId: string;
  sortOrder: string;
}

export default function VideoGallery({ 
  initialVideos, 
  categoryId,
  sortOrder = 'publishedAt desc' 
}: VideoGalleryProps) {
  const [videos, setVideos] = useState<VideoPost[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVideos.length === 12);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date'; // Handle potential invalid date strings
    }
  };

  // Helper function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper function to extract video ID from Rumble URL
  const getRumbleVideoId = (url: string): string | null => {
    // Extract video ID from Rumble URL patterns
    // Example: https://rumble.com/v2zqpmi-video-title.html
    const regExp = /rumble\.com\/([^-]*)-/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Helper function to determine video platform and get embed URL
  const getVideoEmbedUrl = (videoUrl: string): { platform: string; embedUrl: string } | null => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(videoUrl);
      if (videoId) {
        return {
          platform: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
        };
      }
    } else if (videoUrl.includes('rumble.com')) {
      const videoId = getRumbleVideoId(videoUrl);
      if (videoId) {
        return {
          platform: 'rumble',
          embedUrl: `https://rumble.com/embed/${videoId}/`
        };
      }
    }
    return null;
  };

  const loadMoreVideos = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Calculate the offset based on the current page
      const offset = page * 12;
      
      // Fetch the next batch of videos
      const videosQuery = groq`*[_type == "videoPost" && references($categoryId)]{
        _id,
        title,
        slug,
        thumbnailImage{ asset->{url, alt} },
        videoUrl,
        author->{name},
        publishedAt,
        description,
        duration
      } | order(${sortOrder}) [${offset}...${offset + 12}]`;
      
      const newVideos = await client.fetch<VideoPost[]>(videosQuery, { 
        categoryId
      });
      
      // Update state
      setVideos([...videos, ...newVideos]);
      setPage(page + 1);
      setHasMore(newVideos.length === 12);
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video thumbnail click - now redirects to video page
  const handleVideoClick = (videoId: string, slug: string) => {
    // Instead of playing inline, we'll navigate to the video page
    window.location.href = `/video/${slug}`;
  };

  return (
    <div className="content-section p-6">
      <div className="grid grid-cols-1 gap-8">
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => {
            const videoEmbed = getVideoEmbedUrl(video.videoUrl);
            const isActive = video._id === activeVideoId;
            
            return (
              <div key={video._id} className="video-card flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
                {/* Video Thumbnail or Embed */}
                <div className="relative aspect-video w-full overflow-hidden">
                  {isActive && videoEmbed ? (
                    <iframe
                      src={videoEmbed.embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                    ></iframe>
                  ) : (
                    <div 
                      className="cursor-pointer relative w-full h-full"
                      onClick={() => handleVideoClick(video._id, video.slug.current)}
                    >
                      {video.thumbnailImage?.asset?.url ? (
                        <img
                          src={video.thumbnailImage.asset.url}
                          alt={video.thumbnailImage.asset.alt || video.title || 'Video thumbnail'}
                          className="object-cover w-full h-full"
                          width="600"
                          height="338"
                          loading="lazy"
                        />
                      ) : (
                        // Placeholder if no thumbnail
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Thumbnail</span>
                        </div>
                      )}
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-vpn-blue bg-opacity-80 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-body font-bold text-vpn-gray dark:text-vpn-gray-dark text-lg leading-tight mb-2">
                    {video.title || 'Untitled Video'}
                  </h3>
                  
                  {/* Video metadata */}
                  <div className="mt-auto font-body text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {video.author?.name && <span>By {video.author.name} • </span>}
                    {formatDate(video.publishedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* View More button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreVideos}
              disabled={isLoading}
              className="font-body inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'View More Videos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
