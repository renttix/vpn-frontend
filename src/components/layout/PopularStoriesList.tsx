"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import ArticleCard, { type ArticleProps } from "../ui/ArticleCard";

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
  author?: {
    name: string;
  };
  publishedAt?: string;
  excerpt?: string;
}

interface PopularStoriesListProps {
  posts?: Post[];
}

// Convert Post to ArticleProps
function postToArticleProps(post: Post, index: number): ArticleProps {
  const categoryName = post.categories && post.categories.length > 0 
    ? post.categories[0].title 
    : "News";
    
  const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug && post.categories[0].slug.current
    ? `category/${post.categories[0].slug.current}`
    : post.categories && post.categories.length > 0
      ? `category/${post.categories[0].title.toLowerCase().replace(/\s+/g, '-')}`
      : "category/news";
    
  return {
    id: post._id,
    title: post.title,
    slug: post.slug?.current || `post-${post._id}`, // Add null check and fallback
    tag: "POPULAR",
    imageUrl: post.mainImage?.asset.url || "/images/placeholder-news.jpg",
    imageAlt: post.title,
    category: categoryName.toUpperCase(),
    categorySlug: categorySlug,
    excerpt: post.excerpt,
    author: post.author?.name,
  };
}

// Fetch popular posts (most viewed in the last 30 days)
// In a real implementation, this would use analytics data to determine popularity
async function getPopularPosts(): Promise<Post[]> {
  // For now, we'll just fetch recent posts and assume they're popular
  const query = groq`*[_type == "post"] | order(publishedAt desc)[0...4]{
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
    author->{
      name
    },
    publishedAt,
    excerpt
  }`;
  
  try {
    const posts = await client.fetch(query, {}, {
      cache: 'no-store'
    });
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch popular posts:", error);
    return [];
  }
}

// Fallback articles in case of error or no data
const FALLBACK_ARTICLES: Post[] = [
  {
    _id: "1",
    title: "Andrew Tate: Innocent Until Proven Guilty - The Truth Behind the Controversial Case",
    slug: { current: "andrew-tate-innocent-until-proven-guilty" },
    mainImage: {
      asset: {
        url: "/images/andrew-tate-innocent-until-proven-guilty.jpg"
      }
    },
    excerpt: "An in-depth analysis of the legal proceedings against Andrew Tate and why presumption of innocence matters in high-profile cases.",
    author: {
      name: "Legal Team"
    },
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    categories: [
      {
        _id: "legal-commentary",
        title: "Legal Commentary",
        slug: { current: "legal-commentary" }
      }
    ]
  },
  {
    _id: "2",
    title: "Lord Arleem: Akhmed Yakoob's Rags to Riches Truth Unveiled",
    slug: { current: "akhmed-yakoob-rags-to-riches-truth-unveiled" },
    mainImage: {
      asset: {
        url: "/images/akhmed-yakoob-rags-to-riches-truth-unveiled.png"
      }
    },
    excerpt: "Exclusive investigation into the controversial figure known as Lord Arleem and his rise to prominence in British politics.",
    author: {
      name: "Investigative Team"
    },
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    categories: [
      {
        _id: "politics",
        title: "Politics",
        slug: { current: "politics" }
      }
    ]
  },
  {
    _id: "3",
    title: "Terror Crackdown: Six Arrested in London Raids Linked to Banned Kurdish Rebel Group PKK!",
    slug: { current: "terror-crackdown-six-arrested-in-london-raids" },
    mainImage: {
      asset: {
        url: "/images/terror-crackdown-six-arrested-in-london-raids.png"
      }
    },
    excerpt: "Metropolitan Police counter-terrorism officers have arrested six individuals in coordinated raids across London.",
    author: {
      name: "Crime Desk"
    },
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    categories: [
      {
        _id: "crime-news",
        title: "Crime News",
        slug: { current: "crime-news" }
      }
    ]
  },
  {
    _id: "4",
    title: "Child Groomer Habib-Ur Rehman Jailed for Child Rape",
    slug: { current: "child-groomer-habib-ur-rehman-jailed-for-child-rape" },
    mainImage: {
      asset: {
        url: "/images/child-groomer-habib-ur-rehman-jailed-for-child-rape.png"
      }
    },
    excerpt: "A dangerous predator has been sentenced to 15 years in prison after being found guilty of multiple child sex offenses.",
    author: {
      name: "Court Reporter"
    },
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    categories: [
      {
        _id: "court-news",
        title: "Court News",
        slug: { current: "court-news" }
      }
    ]
  }
];

export default function PopularStoriesList({ posts: propPosts }: PopularStoriesListProps) {
  const [posts, setPosts] = React.useState<Post[]>(propPosts || []);
  const [loading, setLoading] = React.useState<boolean>(!propPosts || propPosts.length === 0);
  
  // Fetch posts if not provided
  React.useEffect(() => {
    if (!propPosts || propPosts.length === 0) {
      const fetchPosts = async () => {
        try {
          const fetchedPosts = await getPopularPosts();
          if (fetchedPosts && fetchedPosts.length > 0) {
            setPosts(fetchedPosts);
          } else {
            setPosts(FALLBACK_ARTICLES);
          }
        } catch (error) {
          console.error("Error fetching popular posts:", error);
          setPosts(FALLBACK_ARTICLES);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPosts();
    }
  }, [propPosts]);
  
  // Create a map of posts by ID for easy lookup
  const postsMap = new Map(posts.map(post => [post._id, post]));
  
  // Filter out posts with missing required fields
  const validPosts = posts.filter(post => post._id && post.title);
  
  // Convert to ArticleProps
  const articleProps = validPosts.map((post, index) => postToArticleProps(post, index));
  
  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
            POPULAR STORIES
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col animate-pulse">
                <div className="relative aspect-[1200/630] bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
          POPULAR STORIES
        </h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articleProps.map((article) => {
            // Get the original post to access properties not in ArticleProps
            const originalPost = postsMap.get(article.id);
            
            return (
              <div key={article.id} className="flex flex-col">
                <div className="aspect-[1200/630] overflow-hidden rounded-md mb-3" style={{ position: 'relative' }}>
                  <Link href={`/${article.slug}`}>
                    <Image
                      src={article.imageUrl || "/images/placeholder-news.jpg"}
                      alt={article.imageAlt || article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                </div>
                
                <div>
                  {article.category && (
                    <Link
                      href={`/${article.categorySlug}`}
                      className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
                    >
                      {article.category}
                    </Link>
                  )}
                  
                  <Link href={`/${article.slug}`} className="group">
                    <h3 className="font-roboto font-bold text-vpn-gray dark:text-gray-100 text-lg leading-tight group-hover:text-vpn-blue dark:group-hover:text-yellow-500 mb-2 transition-colors duration-200" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {article.title}
                    </h3>
                  </Link>
                  
                  {article.excerpt && (
                    <p className="text-vpn-gray dark:text-gray-300 text-sm my-2 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  
                  {article.author && (
                    <span className="text-xs text-vpn-blue dark:text-blue-400 font-medium">
                      By {article.author} • {getTimeAgo(originalPost?.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Helper function to format time ago
function getTimeAgo(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}
