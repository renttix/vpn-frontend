import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import Link from "next/link";

// Define VideoPost type
interface VideoPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  thumbnailImage?: {
    asset: {
      url: string;
      alt?: string;
    };
  };
  videoUrl: string;
  author?: {
    name: string;
    slug?: {
      current: string;
    };
  };
  publishedAt: string;
  duration?: string;
}

// Fetch random videos from the Watch category
async function getRandomVideos(count: number = 3): Promise<VideoPost[]> {
  // First, try to get the Watch category ID
  const categoryQuery = groq`*[_type == "category" && title == "Watch"][0]._id`;
  
  try {
    console.log("Fetching Watch category ID...");
    const categoryId = await client.fetch(categoryQuery, {}, {
      cache: 'no-store'
    });
    
    console.log("Found Watch category ID:", categoryId || "Not found");
    
    // If category ID is not found, use the hardcoded ID as fallback
    const watchCategoryId = categoryId || "821b6fe2-4408-4ea9-8dee-e90f4640c84e";
    
    // Use a more flexible query that will work with either videoPost or post types
    const query = groq`*[(_type == "videoPost" || (_type == "post" && defined(videoUrl))) && references($watchCategoryId)]{
      _id,
      title,
      slug,
      thumbnailImage {
        asset->{
          url,
          alt
        }
      },
      videoUrl,
      author->{
        name,
        slug
      },
      publishedAt,
      duration
    } | order(publishedAt desc)`;
    
    try {
      console.log(`Fetching videos from Watch category (ID: ${watchCategoryId})...`);
      const videos = await client.fetch(query, { watchCategoryId }, {
        cache: 'no-store'
      });
      
      if (!videos || videos.length === 0) {
        console.warn("No videos found in Watch category");
        
        // Try a fallback query without category reference
        console.log("Trying fallback query for any videos...");
        const fallbackQuery = groq`*[_type == "videoPost" || (_type == "post" && defined(videoUrl))][0...${count}]{
          _id,
          title,
          slug,
          thumbnailImage {
            asset->{
              url,
              alt
            }
          },
          videoUrl,
          author->{
            name,
            slug
          },
          publishedAt,
          duration
        } | order(publishedAt desc)`;
        
        const fallbackVideos = await client.fetch(fallbackQuery, {}, {
          cache: 'no-store'
        });
        
        console.log(`Found ${fallbackVideos?.length || 0} videos with fallback query`);
        
        if (fallbackVideos && fallbackVideos.length > 0) {
          return fallbackVideos;
        }
        
        return [];
      }
      
      // If we have fewer videos than requested, return all of them
      if (videos.length <= count) {
        return videos;
      }
      
      // Select random videos without duplicates
      const selectedVideos: VideoPost[] = [];
      const indices = new Set<number>();
      
      while (selectedVideos.length < count && indices.size < videos.length) {
        const randomIndex = Math.floor(Math.random() * videos.length);
        if (!indices.has(randomIndex)) {
          indices.add(randomIndex);
          selectedVideos.push(videos[randomIndex]);
        }
      }
      
      return selectedVideos;
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch Watch category ID:", error);
    return [];
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
}

// Assign appropriate tag based on index (similar to HeroSection)
function getTagForIndex(index: number): string {
  if (index === 0) return "FEATURED";
  if (index === 1) return "EXCLUSIVE";
  if (index === 2) return "ANALYSIS";
  return "";
}

export default async function FeaturedVideoSection() {
  // Fetch 3 random videos
  const randomVideos = await getRandomVideos(3);
  
  // If no videos are found, return null or a fallback UI
  if (randomVideos.length === 0) {
    console.log("No videos found for FeaturedVideoSection, returning null");
    return null;
  }
  
  console.log(`Rendering FeaturedVideoSection with ${randomVideos.length} videos`);

  return (
    <section className="bg-vpn-bg dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
          FEATURED VIDEOS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {randomVideos.map((video, index) => (
            <div key={video._id} className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <article className="group relative">
                <Link 
                  className="block overflow-hidden" 
                  href={`/video/${video.slug.current}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      alt={video.title} 
                      loading="lazy" 
                      decoding="async" 
                      data-nimg="fill" 
                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      style={{position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent'}} 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                      src={video.thumbnailImage?.asset.url || "/images/placeholder-video.jpg"}
                    />
                    
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
                  
                  <span className="absolute top-0 left-0 bg-vpn-red text-white text-xs px-2 py-1 uppercase font-bold">
                    {getTagForIndex(index)}
                  </span>
                </Link>
                
                <div className="mt-3">
                  <Link className="uppercase text-xs font-bold text-vpn-blue dark:text-blue-400 mb-1 block transition-colors duration-200" href="/category/watch">
                    WATCH
                  </Link>
                  <Link className="group" href={`/video/${video.slug.current}`}>
                    <h3 className="font-roboto font-bold text-vpn-gray dark:text-gray-100 text-base md:text-lg leading-tight group-hover:text-vpn-blue dark:group-hover:text-yellow-500 transition-colors duration-200 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {video.title}
                    </h3>
                  </Link>
                  
                  {/* Author and date */}
                  <div className="text-sm text-vpn-gray dark:text-gray-400">
                    {video.author?.name && (
                      <span className="font-medium">
                        By {video.author.name} • 
                      </span>
                    )}
                    <span> {formatDate(video.publishedAt)}</span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link 
            className="inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700" 
            href="/category/watch"
          >
            View All Videos
          </Link>
        </div>
      </div>
    </section>
  );
}
