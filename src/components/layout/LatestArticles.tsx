import React from "react";
import Link from "next/link";
import ArticleCard, { type ArticleProps } from "../ui/ArticleCard";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

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
}

// Get a random subset of posts
function getRandomPosts(posts: Post[], count: number): Post[] {
  // If we have fewer posts than requested, return all posts
  if (posts.length <= count) return posts;
  
  // Create a copy of the posts array to avoid modifying the original
  const shuffled = [...posts];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the first 'count' posts
  return shuffled.slice(0, count);
}

// Get tag based on category or index
function getTagForPost(post: Post, index: number): string {
  // If post has categories, use the first category title
  if (post.categories && post.categories.length > 0) {
    return post.categories[0].title.toUpperCase();
  }
  
  // Fallback tags based on position
  const fallbackTags = ["FEATURED", "TRENDING", "LATEST"];
  return fallbackTags[index] || "NEWS";
}

// Convert Post to ArticleProps
function postToArticleProps(post: Post, index: number): ArticleProps {
  const categoryName = post.categories && post.categories.length > 0 
    ? post.categories[0].title 
    : "News";
    
  const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug
    ? `category/${post.categories[0].slug.current}`
    : post.categories && post.categories.length > 0
      ? `category/${post.categories[0].title.toLowerCase().replace(/\s+/g, '-')}`
      : "category/news";
    
  return {
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    tag: getTagForPost(post, index),
    imageUrl: post.mainImage?.asset.url || "/images/placeholder-news.jpg",
    imageAlt: post.title,
    category: categoryName.toUpperCase(),
    categorySlug: categorySlug,
  };
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
    publishedAt
  }`;
  
  try {
    const posts = await client.fetch(query, { fromDate: formattedDate });
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch posts from the last 7 days:", error);
    return [];
  }
}

// Fallback articles in case of error or no data
const FALLBACK_ARTICLES: ArticleProps[] = [
  {
    id: "4",
    title: "Federal Judge Dismisses Class Action Against Social Media Giant",
    slug: "federal-judge-dismisses-class-action-against-social-media-giant",
    tag: "FEATURED",
    imageUrl: "/images/placeholder-news.jpg",
    imageAlt: "Gavel on legal documents",
    category: "COURT NEWS",
  },
  {
    id: "5",
    title: "New Video Evidence Emerges in High-Profile Corporate Fraud Case",
    slug: "new-video-evidence-emerges-in-high-profile-corporate-fraud-case",
    tag: "TRENDING",
    imageUrl: "/images/placeholder-news.jpg",
    imageAlt: "Digital evidence on computer screen",
    category: "CRIME NEWS",
  },
  {
    id: "6",
    title: "Legal Experts Weigh In On Controversial Surveillance Ruling",
    slug: "legal-experts-weigh-in-on-controversial-surveillance-ruling",
    tag: "LATEST",
    imageUrl: "/images/placeholder-news.jpg",
    imageAlt: "Security cameras on building",
    category: "COURT NEWS",
  },
];

export default async function LatestArticles() {
  // Fetch posts from the last 7 days
  let articles: ArticleProps[] = FALLBACK_ARTICLES;
  
  try {
    const posts = await getLastWeekPosts();
    
    if (posts && posts.length > 0) {
      // Get 3 random posts
      const randomPosts = getRandomPosts(posts, 3);
      
      // Convert to ArticleProps
      articles = randomPosts.map((post, index) => 
        postToArticleProps(post, index)
      );
    }
  } catch (error) {
    console.error("Error in LatestArticles component:", error);
    // Use fallback articles
  }

  return (
    <section className="bg-vpn-bg dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider">
          THIS WEEK AT VPN
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article.id} className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <ArticleCard {...article} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/this-week" 
            className="inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700"
          >
            View All This Week's Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
