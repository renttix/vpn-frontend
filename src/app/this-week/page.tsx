import { Metadata } from "next";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { generateStaticPageMetadata } from "@/lib/metadata";

// Define Post type
interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: {
    _id: string;
    title: string;
    slug?: {
      current: string;
    };
  }[];
  publishedAt?: string;
  excerpt?: string;
}

// Define Category type
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

// Fetch categories
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

// Fetch posts from the last 7 days
async function getLastWeekPosts(): Promise<Post[]> {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const formattedDate = sevenDaysAgo.toISOString();
  
  const query = groq`*[_type == "post" && publishedAt >= $fromDate] | order(publishedAt desc){
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title,
      slug
    },
    publishedAt,
    excerpt
  }`;
  
  try {
    console.log("Fetching posts from the last 7 days for This Week page...");
    const posts = await client.fetch(query, { fromDate: formattedDate });
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch posts from the last 7 days:", error);
    return [];
  }
}

// Format date for display
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  "This Week at VPN",
  "Browse all articles published in the last 7 days at Video Production News.",
  "this-week"
);

export default async function ThisWeekPage() {
  // Fetch categories and posts
  const categories = await getCategories();
  const posts = await getLastWeekPosts();
  
  return (
    <Layout categories={categories}>
      {/* Top Advertisement Banner */}
      <div className="container mx-auto px-4 py-2">
        <div className="w-full h-[90px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
          Top Advertisement Banner
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">
          This Week at VPN
        </h1>
        
        <p className="text-vpn-gray dark:text-vpn-gray-dark mb-8">
          Browse all articles published in the last 7 days.
        </p>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const categoryName = post.categories && post.categories.length > 0 
                ? post.categories[0].title 
                : "News";
              
              const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug
                ? post.categories[0].slug.current
                : post.categories && post.categories.length > 0
                  ? post.categories[0].title.toLowerCase().replace(/\s+/g, '-')
                  : "news";
                  
              return (
                <div key={post._id} className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <article className="group relative">
                    <a className="block overflow-hidden" href={`/${post.slug.current}`}>
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img 
                          alt={post.title} 
                          loading="lazy" 
                          decoding="async" 
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                          src={post.mainImage?.asset.url || "/images/placeholder-news.jpg"}
                        />
                      </div>
                      <span className="absolute top-0 left-0 bg-vpn-red text-white text-xs px-2 py-1 uppercase font-bold">
                        {categoryName.toUpperCase()}
                      </span>
                    </a>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <Link href={`/category/${categorySlug}`} className="uppercase text-xs font-bold text-vpn-blue dark:text-blue-400">
                          {categoryName}
                        </Link>
                        <span className="text-xs text-vpn-gray dark:text-vpn-gray-dark">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <Link href={`/${post.slug.current}`} className="group">
                        <h2 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-base md:text-lg leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-2">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-vpn-gray dark:text-vpn-gray-dark/80 text-sm my-2 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-vpn-gray dark:text-vpn-gray-dark">No articles published in the last 7 days.</p>
          </div>
        )}
        
        {/* Horizontal Ad Banner */}
        <div className="mt-8 mb-8">
          <div className="w-full h-[90px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>
        
        {/* Side Ad Banner for larger screens */}
        {posts.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.slice(3, 7).map((post) => {
                  const categoryName = post.categories && post.categories.length > 0 
                    ? post.categories[0].title 
                    : "News";
                  
                  const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug
                    ? post.categories[0].slug.current
                    : post.categories && post.categories.length > 0
                      ? post.categories[0].title.toLowerCase().replace(/\s+/g, '-')
                      : "news";
                      
                  return (
                    <div key={post._id} className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <article className="group relative">
                        <a className="block overflow-hidden" href={`/${post.slug.current}`}>
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <img 
                              alt={post.title} 
                              loading="lazy" 
                              decoding="async" 
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                              src={post.mainImage?.asset.url || "/images/placeholder-news.jpg"}
                            />
                          </div>
                          <span className="absolute top-0 left-0 bg-vpn-red text-white text-xs px-2 py-1 uppercase font-bold">
                            {categoryName.toUpperCase()}
                          </span>
                        </a>
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <Link href={`/category/${categorySlug}`} className="uppercase text-xs font-bold text-vpn-blue dark:text-blue-400">
                              {categoryName}
                            </Link>
                            <span className="text-xs text-vpn-gray dark:text-vpn-gray-dark">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                          <Link href={`/${post.slug.current}`} className="group">
                            <h2 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-base md:text-lg leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-2">
                              {post.title}
                            </h2>
                          </Link>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="md:col-span-1">
              {/* Vertical Ad Banner */}
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-300 text-sm">Vertical Advertisement</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-2">(e.g., 300x600)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
