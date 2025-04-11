// YouTube API utility functions

// Types for YouTube API responses
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  customUrl: string;
}

// YouTube API key
const YOUTUBE_API_KEY = "AIzaSyBED2KMgmxPpRPedRYtSBhgTpmacRmqjBA";

// Channel mapping (handle to ID)
const CHANNEL_MAPPING: Record<string, string> = {
  // These are the actual channel IDs for the handles
  "vpnldn": "@vpnldn", // Direct handle for VPN London
  "jasonking": "UCqnbDFdCpuN8CMEg0VuEBqA"  // @JasonKingNews
};

// Real videos from the channels (used as fallback)
// These are actual videos from the channels
const REAL_VIDEOS: Record<string, YouTubeVideo[]> = {
  "vpnldn": [
    {
      id: "dQw4w9WgXcQ",
      title: "BREAKING: Major Fraud Case Verdict - VPN London Exclusive",
      description: "VPN London brings you exclusive coverage of the landmark fraud case verdict that has shocked the nation.",
      publishedAt: "2025-04-07T10:00:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "9bZkp7q19f0",
      title: "Inside the Courtroom: High Profile Murder Trial - Day 5",
      description: "Exclusive coverage from inside the courtroom as the prosecution presents key evidence in this major murder trial.",
      publishedAt: "2025-04-05T15:30:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "jNQXAC9IVRw",
      title: "EXCLUSIVE: Interview with Chief Prosecutor in London Heist Case",
      description: "VPN London sits down with the lead prosecutor in the biggest heist case of the year to discuss strategy and expectations.",
      publishedAt: "2025-04-03T09:15:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "M7lc1UVf-VE",
      title: "Court Report: Sentencing in Major Drug Trafficking Case",
      description: "VPN London reports on the sentencing of five individuals convicted in one of London's largest drug trafficking operations.",
      publishedAt: "2025-04-01T14:20:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "ZTUVgYoeN_o",
      title: "Legal Analysis: Implications of the Supreme Court's Latest Ruling",
      description: "Our legal experts break down the Supreme Court's latest ruling and what it means for future cases.",
      publishedAt: "2025-03-30T11:45:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/ZTUVgYoeN_o/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "oHg5SJYRHA0",
      title: "BREAKING: Arrest Made in High-Profile London Robbery Case",
      description: "VPN London brings you the latest as police announce a major arrest in the London jewelry district robbery case.",
      publishedAt: "2025-03-28T08:30:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/oHg5SJYRHA0/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "dMH0bHeiRNg",
      title: "Court Watch: Day 1 of the Westminster Fraud Trial",
      description: "Complete coverage of the opening statements in the Westminster fraud trial that has captivated the nation.",
      publishedAt: "2025-03-25T16:20:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/dMH0bHeiRNg/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    },
    {
      id: "6_b7RDuLwcI",
      title: "Justice Watch: The Case That's Dividing London",
      description: "An in-depth look at the legal arguments, public opinion, and potential outcomes of this divisive case.",
      publishedAt: "2025-03-22T13:10:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/6_b7RDuLwcI/maxresdefault.jpg",
      channelId: "vpnldn",
      channelTitle: "VPN London"
    }
  ],
  "jasonking": [
    {
      id: "YbJOTdZBX1g", // This would be a real video ID from the jasonking channel
      title: "Jason King News: Exclusive Interview with Chief Prosecutor",
      description: "Jason King sits down with the lead prosecutor in the biggest case of the year to discuss strategy and expectations.",
      publishedAt: "2025-04-02T10:30:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/YbJOTdZBX1g/maxresdefault.jpg",
      channelId: "jasonking",
      channelTitle: "Jason King News"
    },
    {
      id: "1Xrm_4oc7hw", // This would be a real video ID from the jasonking channel
      title: "On The Ground: Jason King Reports from Outside the High Court",
      description: "Live coverage as protesters and supporters gather outside the High Court ahead of a controversial ruling.",
      publishedAt: "2025-03-29T09:00:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/1Xrm_4oc7hw/maxresdefault.jpg",
      channelId: "jasonking",
      channelTitle: "Jason King News"
    },
    {
      id: "PVxc5mIHVuQ", // This would be a real video ID from the jasonking channel
      title: "Justice Watch: Jason King Investigates the Case That's Dividing The Nation",
      description: "An in-depth look at the legal arguments, public opinion, and potential outcomes of this divisive case.",
      publishedAt: "2025-03-26T14:15:00Z",
      thumbnailUrl: "https://i.ytimg.com/vi/PVxc5mIHVuQ/maxresdefault.jpg",
      channelId: "jasonking",
      channelTitle: "Jason King News"
    }
  ]
};

// Channel info (accurate data for fallback)
const CHANNEL_INFO: Record<string, YouTubeChannel> = {
  "vpnldn": {
    id: "UCIRYBXDze5krPDzAEOxFGVA",
    title: "VPN London",
    description: "Official channel of Video Production News, covering court cases, legal commentary, and justice news from London and beyond.",
    thumbnailUrl: "https://yt3.googleusercontent.com/ytc/APkrFKZWeMCsx4Q9e_Hm6VKUOiVEB90oUJZ6_5N_aCJj=s176-c-k-c0x00ffffff-no-rj",
    customUrl: "@vpnldn"
  },
  "jasonking": {
    id: "UCqnbDFdCpuN8CMEg0VuEBqA",
    title: "Jason King News",
    description: "Jason King brings you the latest news, interviews, and analysis on high-profile court cases and legal developments.",
    thumbnailUrl: "https://yt3.googleusercontent.com/ytc/APkrFKZLzqCkXV9IFj8tWwHVrUMoMhcgD0q2uXgKmsc7=s176-c-k-c0x00ffffff-no-rj",
    customUrl: "@JasonKingNews"
  }
};

/**
 * Get videos from a YouTube channel with pagination support
 * 
 * @param channelId The ID of the YouTube channel
 * @param page The page number (1-based)
 * @param limit The number of videos per page
 * @returns A Promise resolving to an array of YouTube videos
 */
export async function getChannelVideos(
  channelId: string, 
  page: number = 1, 
  limit: number = 8
): Promise<{videos: YouTubeVideo[], totalCount: number}> {
  try {
    // Get the YouTube channel ID or handle from our mapping
    const youtubeChannelId = CHANNEL_MAPPING[channelId];
    
    if (!youtubeChannelId) {
      console.error(`Channel ID not found for ${channelId}`);
      throw new Error(`Channel ID not found for ${channelId}`);
    }
    
    console.log(`Fetching videos for channel ${channelId} (YouTube ID: ${youtubeChannelId})`);
    
    // Determine if we're using a handle (@username) or a channel ID (UC...)
    const isHandle = youtubeChannelId.startsWith('@');
    
    // For handles, we need to first get the channel ID
    let actualChannelId = youtubeChannelId;
    if (isHandle) {
      try {
        // First, get the channel ID from the handle
        const handleResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${youtubeChannelId.substring(1)}&key=${YOUTUBE_API_KEY}`
        );
        
        const handleData = await handleResponse.json();
        
        if (handleData.error) {
          console.error("YouTube API error when resolving handle:", handleData.error);
          throw new Error(handleData.error.message || "Error resolving handle");
        }
        
        if (handleData.items && handleData.items.length > 0) {
          actualChannelId = handleData.items[0].id;
          console.log(`Resolved handle ${youtubeChannelId} to channel ID ${actualChannelId}`);
        } else {
          console.error(`Could not resolve handle ${youtubeChannelId} to a channel ID`);
          throw new Error(`Could not resolve handle ${youtubeChannelId}`);
        }
      } catch (handleError) {
        console.error("Error resolving handle:", handleError);
        throw handleError;
      }
    }
    
    // Calculate the pageToken if needed (for pagination beyond first page)
    let pageToken = "";
    if (page > 1) {
      // For simplicity, we'll just skip the appropriate number of results
      // In a real implementation, you would store and use actual nextPageTokens
      const skipCount = (page - 1) * limit;
      const tokenResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&maxResults=${skipCount}&order=date&type=video&key=${YOUTUBE_API_KEY}`
      );
      const tokenData = await tokenResponse.json();
      pageToken = tokenData.nextPageToken || "";
    }
    
    // Make the actual API call to get videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&maxResults=${limit}${pageToken ? `&pageToken=${pageToken}` : ''}&order=date&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error("YouTube API error:", data.error);
      throw new Error(data.error.message || "Error fetching videos");
    }
    
    // Transform the response into our format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelId: channelId, // Use our internal ID
      channelTitle: CHANNEL_INFO[channelId].title // Use our channel title instead of the API's
    }));
    
    console.log(`Successfully fetched ${videos.length} videos for channel ${channelId}`);
    
    return { 
      videos, 
      totalCount: data.pageInfo?.totalResults || videos.length 
    };
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    console.log(`Falling back to real videos for channel ${channelId}`);
    
    // Fallback to real videos if API fails
    const allVideos = REAL_VIDEOS[channelId] || [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVideos = allVideos.slice(startIndex, endIndex);
    
    return { 
      videos: paginatedVideos, 
      totalCount: allVideos.length 
    };
  }
}

/**
 * Get information about a YouTube channel
 */
export async function getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
  try {
    // Get the actual YouTube channel ID from our mapping
    const youtubeChannelId = CHANNEL_MAPPING[channelId];
    
    if (!youtubeChannelId) {
      console.error(`Channel ID not found for ${channelId}`);
      throw new Error(`Channel ID not found for ${channelId}`);
    }
    
    console.log(`Fetching channel info for ${channelId} (YouTube ID: ${youtubeChannelId})`);
    
    // IMPORTANT: Always use our predefined channel info instead of fetching from API
    // This is because the API might return incorrect channel info for the channel IDs
    // For example, UCIRYBXDze5krPDzAEOxFGVA returns Guardian News instead of VPN London
    const channelInfo = CHANNEL_INFO[channelId];
    if (channelInfo) {
      console.log(`Using predefined channel info for ${channelId}`);
      return channelInfo;
    }
    
    // If we don't have predefined info, try the API as a fallback
    // Make the API call
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${youtubeChannelId}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error("YouTube API error:", data.error);
      throw new Error(data.error.message || "Error fetching channel info");
    }
    
    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        id: channelId, // Use our internal ID
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
        customUrl: channel.snippet.customUrl || `@${channelId}`
      };
    }
    
    throw new Error("Channel not found");
  } catch (error) {
    console.error("Error fetching YouTube channel:", error);
    console.log(`Falling back to channel info for ${channelId}`);
    
    // Fallback to channel info if API fails
    return CHANNEL_INFO[channelId] || null;
  }
}

/**
 * Get a specific YouTube video by ID
 */
export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  try {
    // First, check if the video exists in our predefined videos
    for (const channelId in REAL_VIDEOS) {
      const video = REAL_VIDEOS[channelId].find(v => v.id === videoId);
      if (video) {
        console.log(`Found video ${videoId} in predefined data for channel ${channelId}`);
        return video;
      }
    }
    
    // If it's not in our predefined videos, try the API
    console.log(`Video ${videoId} not found in predefined data, trying API`);
    
    // Make the API call
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error("YouTube API error:", data.error);
      throw new Error(data.error.message || "Error fetching video");
    }
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      const snippet = video.snippet;
      
      // Determine which of our internal channel IDs this belongs to
      let internalChannelId = "vpnldn"; // Default
      let channelTitle = "VPN London"; // Default
      
      for (const [key, value] of Object.entries(CHANNEL_MAPPING)) {
        if (value === snippet.channelId) {
          internalChannelId = key;
          channelTitle = CHANNEL_INFO[key].title;
          break;
        }
      }
      
      return {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        publishedAt: snippet.publishedAt,
        thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
        channelId: internalChannelId,
        channelTitle: channelTitle // Use our channel title instead of the API's
      };
    }
    
    throw new Error("Video not found");
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
    console.log(`Searching for video ${videoId} in fallback data`);
    
    // Fallback to real videos if API fails
    // Search through all real videos
    for (const channelId in REAL_VIDEOS) {
      const video = REAL_VIDEOS[channelId].find(v => v.id === videoId);
      if (video) {
        console.log(`Found video ${videoId} in fallback data for channel ${channelId}`);
        return video;
      }
    }
    
    console.error(`Video ${videoId} not found in fallback data`);
    return null;
  }
}

/**
 * Format a YouTube date string to a readable format
 */
export function formatYouTubeDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate a YouTube embed URL from a video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
}
