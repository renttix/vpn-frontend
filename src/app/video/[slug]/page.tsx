import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import VideoObjectJsonLd from '@/components/seo/VideoObjectJsonLd';
import { Category, VideoPost } from '@/types/sanity';
import { PortableText } from '@portabletext/react';
import { formatDuration } from '@/components/seo/VideoObjectJsonLd';

// Make this page fully dynamic and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely
export const fetchCache = 'force-no-store'; // Ensure fetch requests are not cached

// Define the BreadcrumbItem interface to match what BreadcrumbJsonLd expects
interface BreadcrumbItem {
  name: string;
  item: string;
  position: number;
  image?: string;
}

// Function to fetch video data
async function getVideoData(slug: string): Promise<{ 
  video: VideoPost | null; 
  relatedVideos: VideoPost[];
  allCategories: Category[] 
}> {
  // Fetch video by slug
  const videoQuery = groq`*[_type == "videoPost" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    thumbnailImage{ asset->{url, alt} },
    videoUrl,
    duration,
    author->{
      _id,
      name,
      slug,
      image{ asset->{url, alt} },
      bio,
      role
    },
    publishedAt,
    lastUpdatedAt,
    description,
    categories[]->{
      _id,
      title,
      slug
    },
    tags[]->{
      _id,
      title,
      slug
    }
  }`;

  // Fetch all categories for the header
  const allCategoriesQuery = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;

  // Fetch video and all categories concurrently
  const [video, allCategories] = await Promise.all([
    client.fetch(videoQuery, { slug }),
    client.fetch(allCategoriesQuery)
  ]);

  // If video not found, return null
  if (!video) {
    return { video: null, relatedVideos: [], allCategories: allCategories || [] };
  }

  // Fetch related videos based on categories and tags
  const relatedVideosQuery = groq`*[_type == "videoPost" && _id != $videoId && (
    count((categories[]->_id)[@ in $categoryIds]) > 0 ||
    count((tags[]->_id)[@ in $tagIds]) > 0
  )]{
    _id,
    title,
    slug,
    thumbnailImage{ asset->{url, alt} },
    videoUrl,
    duration,
    author->{name},
    publishedAt
  } | order(publishedAt desc) [0...6]`;

  // Extract category and tag IDs for the related videos query
  const categoryIds = (video.categories || []).map((cat: Category) => cat._id);
  const tagIds = (video.tags || []).map((tag: any) => tag._id);

  // Fetch related videos
  const relatedVideos = await client.fetch(relatedVideosQuery, { 
    videoId: video._id,
    categoryIds,
    tagIds
  });

  return { 
    video, 
    relatedVideos: relatedVideos || [],
    allCategories: allCategories || [] 
  };
}

// Generate Metadata for the page
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const slug = params.slug;
  
  if (!slug) return { title: 'Invalid Request' };
  const { video } = await getVideoData(slug);

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: `${video.title} | VPN News`,
    description: video.description ? 
      typeof video.description === 'string' ? 
        video.description.substring(0, 160) : 
        'Watch this video from VPN News' : 
      'Watch this video from VPN News',
    openGraph: {
      title: video.title,
      description: video.description ? 
        typeof video.description === 'string' ? 
          video.description.substring(0, 160) : 
          'Watch this video from VPN News' : 
        'Watch this video from VPN News',
      type: 'video.other',
      videos: [
        {
          url: video.videoUrl,
          width: 1280,
          height: 720,
          type: video.videoUrl.includes('youtube') ? 'video/mp4' : 'video/mp4',
        },
      ],
      images: [
        {
          url: video.thumbnailImage?.asset?.url || 'https://vpnnews.com/images/default-thumbnail.jpg',
          width: 1200,
          height: 630,
          alt: video.thumbnailImage?.asset?.alt || video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description ? 
        typeof video.description === 'string' ? 
          video.description.substring(0, 160) : 
          'Watch this video from VPN News' : 
        'Watch this video from VPN News',
      images: [video.thumbnailImage?.asset?.url || 'https://vpnnews.com/images/default-thumbnail.jpg'],
    },
  };
}

// Return empty array to make this page fully dynamic
export async function generateStaticParams() {
  // In production builds on Netlify, return empty array to avoid API calls
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    console.log('[VideoPage] Skipping generateStaticParams in production/Netlify environment');
    return [];
  }
  
  try {
    // Get all video slugs
    const videoSlugsQuery = groq`*[_type == "videoPost" && defined(slug.current)][].slug.current`;
    const videoSlugs = await client.fetch<string[]>(videoSlugsQuery);
    
    return videoSlugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('[VideoPage] Error generating static params:', error);
    return []; // Fallback to empty array on error
  }
}

// Helper function to extract video ID from YouTube URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to extract video ID from Rumble URL
function getRumbleVideoId(url: string): string | null {
  // Extract video ID from Rumble URL patterns
  // Example: https://rumble.com/v2zqpmi-video-title.html
  const regExp = /rumble\.com\/([^-]*)-/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Helper function to determine video platform and get embed URL
function getVideoEmbedUrl(videoUrl: string): { platform: string; embedUrl: string } | null {
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
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
}

// Helper function to format dates
function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date'; // Handle potential invalid date strings
  }
}

// The Video Page Component
export default async function VideoPage({ params }: any) {
  const slug = params.slug;
  
  if (!slug) {
    notFound(); // If no slug, trigger 404
  }
  
  const { video, relatedVideos, allCategories } = await getVideoData(slug);

  // If video fetch returned null, trigger 404
  if (!video) {
    notFound();
  }
  
  // Get video embed URL
  const videoEmbed = getVideoEmbedUrl(video.videoUrl);
  
  // Generate the page URL for structured data
  const pageUrl = `https://vpnnews.com/video/${slug}`;

  // Generate breadcrumbs for BreadcrumbJsonLd
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', item: 'https://vpnnews.com', position: 1 },
    { name: 'Videos', item: 'https://vpnnews.com/category/watch', position: 2 },
    { name: video.title, item: pageUrl, position: 3 }
  ];

  // Parse duration for VideoObjectJsonLd if available
  let parsedDuration = '';
  if (video.duration) {
    // If duration is already in ISO 8601 format (PT1H30M15S), use it directly
    if (video.duration.startsWith('PT')) {
      parsedDuration = video.duration;
    } else {
      // If duration is in format like "10:30" (mm:ss) or "1:30:45" (hh:mm:ss)
      const parts = video.duration.split(':').map(Number);
      if (parts.length === 2) {
        // mm:ss format
        parsedDuration = formatDuration(0, parts[0], parts[1]);
      } else if (parts.length === 3) {
        // hh:mm:ss format
        parsedDuration = formatDuration(parts[0], parts[1], parts[2]);
      }
    }
  }

  return (
    <Layout categories={allCategories}>
      {/* Add structured data for SEO */}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      
      {/* Add VideoObjectJsonLd for video SEO */}
      <VideoObjectJsonLd
        name={video.title}
        description={typeof video.description === 'string' ? video.description : 'Watch this video from VPN News'}
        thumbnailUrl={video.thumbnailImage?.asset?.url || 'https://vpnnews.com/images/default-thumbnail.jpg'}
        uploadDate={video.publishedAt}
        contentUrl={video.videoUrl}
        embedUrl={videoEmbed?.embedUrl}
        duration={parsedDuration}
        // Add more properties as available
      />

      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-4"></div>
        
        {/* Breadcrumbs Navigation */}
        <nav className="text-sm mb-6">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-vpn-blue hover:underline">Home</Link>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/category/watch" className="text-vpn-blue hover:underline">Videos</Link>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-500 truncate max-w-xs">{video.title}</li>
          </ol>
        </nav>
        
        {/* Video Title */}
        <h1 className="text-3xl md:text-4xl font-body font-bold text-vpn-blue dark:text-blue-400 mb-4">
          {video.title}
        </h1>
        
        {/* Video Metadata */}
        <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          {video.author && (
            <span className="mr-4 mb-2">
              By {video.author.name}
            </span>
          )}
          <span className="mr-4 mb-2">
            {formatDate(video.publishedAt)}
          </span>
          {video.duration && (
            <span className="mb-2">
              Duration: {video.duration}
            </span>
          )}
        </div>
        
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {/* Video Player */}
            <div className="aspect-video w-full mb-6 bg-black">
              {videoEmbed ? (
                <iframe
                  src={videoEmbed.embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  Video format not supported
                </div>
              )}
            </div>
            
            {/* Categories and Tags */}
            {((video.categories && video.categories.length > 0) || (video.tags && video.tags.length > 0)) && (
              <div className="mb-6">
                {video.categories && video.categories.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold mr-2">Categories:</span>
                    {video.categories.map((category, index) => (
                      <span key={category._id}>
                        <Link 
                          href={`/category/${category.slug.current}`}
                          className="text-vpn-blue hover:underline"
                        >
                          {category.title}
                        </Link>
                        {index < (video.categories?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                
                {video.tags && video.tags.length > 0 && (
                  <div>
                    <span className="font-semibold mr-2">Tags:</span>
                    {video.tags.map((tag: any, index: number) => (
                      <span key={tag._id}>
                        <Link 
                          href={`/tag/${tag.slug.current}`}
                          className="text-vpn-blue hover:underline"
                        >
                          {tag.title}
                        </Link>
                        {index < (video.tags?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Video Description */}
            {video.description && (
              <div className="prose dark:prose-invert max-w-none mb-8">
                {typeof video.description === 'string' ? (
                  <p>{video.description}</p>
                ) : (
                  <div>
                    {Array.isArray(video.description) && video.description.map((block: any, index: number) => {
                      // Simple rendering of text blocks
                      if (block._type === 'block' && block.children) {
                        return (
                          <p key={index} className="mb-4">
                            {block.children.map((child: any, childIndex: number) => (
                              <span key={childIndex}>{child.text}</span>
                            ))}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Social Sharing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Share This Video</h3>
              <div className="flex space-x-4">
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(video.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1DA1F2] text-white p-2 rounded-full hover:bg-opacity-90"
                  aria-label="Share on Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] text-white p-2 rounded-full hover:bg-opacity-90"
                  aria-label="Share on Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(video.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0A66C2] text-white p-2 rounded-full hover:bg-opacity-90"
                  aria-label="Share on LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(`Check out this video: ${pageUrl}`)}`}
                  className="bg-gray-600 text-white p-2 rounded-full hover:bg-opacity-90"
                  aria-label="Share via Email"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Author Information */}
            {video.author && (
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-8">
                <div className="flex items-start">
                  {video.author.image?.asset?.url && (
                    <img 
                      src={video.author.image.asset.url} 
                      alt={video.author.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/author/${video.author.slug?.current || ''}`} className="hover:text-vpn-blue">
                        {video.author.name}
                      </Link>
                    </h3>
                    {video.author.role && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{video.author.role}</p>
                    )}
                    {video.author.bio && (
                      <div className="prose dark:prose-invert text-sm">
                        {typeof video.author.bio === 'string' ? (
                          <p>{video.author.bio}</p>
                        ) : (
                          <div>
                            {Array.isArray(video.author.bio) && video.author.bio.map((block: any, index: number) => {
                              // Simple rendering of text blocks
                              if (block._type === 'block' && block.children) {
                                return (
                                  <p key={index} className="mb-4">
                                    {block.children.map((child: any, childIndex: number) => (
                                      <span key={childIndex}>{child.text}</span>
                                    ))}
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Related Videos</h3>
                <div className="space-y-4">
                  {relatedVideos.map(relatedVideo => (
                    <div key={relatedVideo._id} className="flex flex-col">
                      <Link href={`/video/${relatedVideo.slug.current}`} className="group">
                        <div className="relative aspect-video w-full mb-2 overflow-hidden">
                          {relatedVideo.thumbnailImage?.asset?.url ? (
                            <img
                              src={relatedVideo.thumbnailImage.asset.url}
                              alt={relatedVideo.thumbnailImage.asset.alt || relatedVideo.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              width="300"
                              height="169"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Thumbnail</span>
                            </div>
                          )}
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-vpn-blue bg-opacity-80 flex items-center justify-center group-hover:bg-opacity-100 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Duration badge */}
                          {relatedVideo.duration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {relatedVideo.duration}
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-base line-clamp-2 group-hover:text-vpn-blue transition-colors">
                          {relatedVideo.title}
                        </h4>
                      </Link>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {relatedVideo.author?.name && <span>{relatedVideo.author.name} • </span>}
                        {formatDate(relatedVideo.publishedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Categories Box */}
            <div className="content-section p-5 mb-8 bg-gray-100 dark:bg-gray-800 rounded">
              <h3 className="text-xl font-semibold mb-4">Video Categories</h3>
              <ul className="space-y-2">
                {allCategories
                  .filter(cat => cat.title === 'Watch' || cat.title === 'Video')
                  .map(cat => (
                    <li key={cat._id} className="font-medium">
                      <Link 
                        href={`/category/${cat.slug?.current}`}
                        className="text-vpn-blue hover:underline"
                      >
                        {cat.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
