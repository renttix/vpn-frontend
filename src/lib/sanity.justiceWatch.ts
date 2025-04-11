import { client } from './sanity.client';
import { groq } from 'next-sanity';

// Types for Justice Watch data
export interface JusticeWatchChannel {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: string;
  customUrl: string;
  thumbnailUrl?: string;
  channelImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
}

export interface JusticeWatchVideo {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl?: string;
  thumbnailImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  duration?: string;
  publishedAt: string;
  channel: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    customUrl: string;
    thumbnailUrl?: string;
  };
  status: string;
  isBreakingNews?: boolean;
}

/**
 * Fetch all Justice Watch channels
 */
export async function getJusticeWatchChannels(): Promise<JusticeWatchChannel[]> {
  const query = groq`*[_type == "justiceWatchChannel" && defined(slug.current)] {
    _id,
    title,
    slug,
    description,
    customUrl,
    thumbnailUrl,
    channelImage
  }`;
  
  try {
    const channels = await client.fetch(query);
    return channels || [];
  } catch (error) {
    console.error("Failed to fetch Justice Watch channels:", error);
    return [];
  }
}

/**
 * Fetch a specific Justice Watch channel by slug
 */
export async function getJusticeWatchChannelBySlug(slug: string): Promise<JusticeWatchChannel | null> {
  const query = groq`*[_type == "justiceWatchChannel" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    customUrl,
    thumbnailUrl,
    channelImage
  }`;
  
  try {
    const channel = await client.fetch(query, { slug });
    return channel || null;
  } catch (error) {
    console.error(`Failed to fetch Justice Watch channel with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch Justice Watch videos for a specific channel with pagination
 */
export async function getJusticeWatchVideos(
  channelSlug: string,
  page: number = 1,
  limit: number = 8,
  sort: string = "date_desc"
): Promise<{ videos: JusticeWatchVideo[], totalCount: number }> {
  // Determine sort order
  let orderBy = "publishedAt desc";
  if (sort === "date_asc") orderBy = "publishedAt asc";
  else if (sort === "title_asc") orderBy = "title asc";
  else if (sort === "title_desc") orderBy = "title desc";
  
  // Calculate pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  
  const query = groq`{
    "videos": *[_type == "justiceWatchVideo" && defined(slug.current) && channel->slug.current == $channelSlug && status == "published" && defined(youtubeId) && youtubeId != null && youtubeId != ""] | order(${orderBy}) [$start...$end] {
      _id,
      title,
      slug,
      description,
      youtubeUrl,
      youtubeId,
      thumbnailUrl,
      thumbnailImage,
      duration,
      publishedAt,
      "channel": channel->{
        _id,
        title,
        slug,
        customUrl,
        thumbnailUrl
      },
      status,
      isBreakingNews
    },
    "totalCount": count(*[_type == "justiceWatchVideo" && defined(slug.current) && channel->slug.current == $channelSlug && status == "published" && defined(youtubeId) && youtubeId != null && youtubeId != ""])
  }`;
  
  try {
    const result = await client.fetch(query, { channelSlug, start, end });
    return {
      videos: result.videos || [],
      totalCount: result.totalCount || 0
    };
  } catch (error) {
    console.error(`Failed to fetch Justice Watch videos for channel ${channelSlug}:`, error);
    return {
      videos: [],
      totalCount: 0
    };
  }
}

/**
 * Fetch a specific Justice Watch video by ID
 */
export async function getJusticeWatchVideoById(videoId: string): Promise<JusticeWatchVideo | null> {
  // If videoId is null, try to find the video by other means
  if (!videoId || videoId === 'null') {
    console.warn('Attempted to fetch video with null ID, trying to find by other means');
    
    // Try to find the most recent video instead
    const query = groq`*[_type == "justiceWatchVideo" && defined(youtubeId) && youtubeId != null && youtubeId != ""][0...1] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      youtubeUrl,
      youtubeId,
      thumbnailUrl,
      thumbnailImage,
      duration,
      publishedAt,
      "channel": channel->{
        _id,
        title,
        slug,
        customUrl,
        thumbnailUrl
      },
      status,
      isBreakingNews
    }`;
    
    try {
      const videos = await client.fetch(query);
      if (videos && videos.length > 0) {
        return videos[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch fallback Justice Watch video:', error);
      return null;
    }
  }
  
  // Normal case - fetch by YouTube ID
  const query = groq`*[_type == "justiceWatchVideo" && youtubeId == $videoId][0] {
    _id,
    title,
    slug,
    description,
    youtubeUrl,
    youtubeId,
    thumbnailUrl,
    thumbnailImage,
    duration,
    publishedAt,
    "channel": channel->{
      _id,
      title,
      slug,
      customUrl,
      thumbnailUrl
    },
    status,
    isBreakingNews
  }`;
  
  try {
    const video = await client.fetch(query, { videoId });
    return video || null;
  } catch (error) {
    console.error(`Failed to fetch Justice Watch video with ID ${videoId}:`, error);
    return null;
  }
}

/**
 * Extract YouTube video ID from a YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Match patterns like:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Generate YouTube embed URL from a video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  // If videoId is null or undefined, use a fallback ID
  if (!videoId || videoId === 'null') {
    console.warn('Attempted to generate embed URL with null ID, using fallback');
    // Use a default video ID (Rick Roll) as fallback
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&showinfo=0';
  }
  
  return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
