"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import type { Post } from "@/types/sanity";

// Format date to "Apr 8, 2025" format
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Fetch latest posts with author information
async function getLatestPosts(): Promise<Post[]> {
  // Modified query to include all posts except those in "Justice Watch" and "Commentary" categories
  // This ensures the Headlines section only shows news articles, not commentary/analysis
  const query = groq`*[_type == "post" && count(categories[]) > 0 && 
    !("Justice Watch" in categories[]->title) && 
    !("Commentary" in categories[]->title) && 
    !("Legal Commentary" in categories[]->title)] | 
    order(publishedAt desc)[0...6]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    author->{
      _id,
      name,
      image {
        asset->{
          url,
          alt
        }
      }
    },
    publishedAt,
    categories[]->{
      _id,
      title,
      slug
    }
  }`;
  
  try {
    const posts = await client.fetch(query, {}, {
      // Add cache: 'no-store' to ensure fresh data
      cache: 'no-store'
    });
    console.log("HeadlinesSection - Fetched posts:", posts?.length || 0);
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch latest posts:", error);
    return [];
  }
}

// Featured Article Component
function FeaturedArticle({ article }: { article: Post }) {
  if (!article) return null;
  
  return (
    <article className="group">
      <Link href={`/${article.slug.current}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden mb-4">
          <Image
            src={article.mainImage?.asset.url || "/images/placeholder-news.jpg"}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
        <h2 className="font-roboto text-2xl md:text-3xl leading-tight mb-2 tracking-wide text-white dark:text-gray-100 transition-colors duration-200 group-hover:text-yellow-500 dark:group-hover:text-yellow-300" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {article.title}
        </h2>
      </Link>
      <div className="flex items-center text-sm text-vpn-gray-light dark:text-gray-400">
        {article.author?.name && (
          <span className="font-bold mr-2">{article.author.name}</span>
        )}
        {article.publishedAt && (
          <span>/ {formatDate(article.publishedAt)}</span>
        )}
      </div>
    </article>
  );
}

// Small Article Card Component
function SmallArticleCard({ article }: { article: Post }) {
  if (!article) return null;
  
  return (
    <article className="group flex items-start space-x-4">
      {article.mainImage?.asset.url && (
        <Link href={`/${article.slug.current}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 overflow-hidden">
            <Image
              src={article.mainImage.asset.url}
              alt={article.title}
              fill
              sizes="96px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      )}
      <div className="flex-1">
        <Link href={`/${article.slug.current}`}>
          <h3 className="font-roboto text-base leading-tight mb-2 tracking-wide text-white dark:text-gray-100 transition-colors duration-200 group-hover:text-yellow-500 dark:group-hover:text-yellow-300" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center text-xs text-vpn-gray-light dark:text-gray-400">
          {article.author?.name && (
            <span className="font-bold mr-2">{article.author.name}</span>
          )}
          {article.publishedAt && (
            <span>/ {formatDate(article.publishedAt)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function HeadlinesSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getLatestPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching headlines:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  // If still loading, show a loading state
  if (loading) {
    return (
      <section className="bg-vpn-blue dark:bg-gray-900 text-white dark:text-gray-100 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
            HEADLINES
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured article loading skeleton */}
            <div className="lg:col-span-7">
              <div className="animate-pulse">
                <div className="relative aspect-[16/9] bg-gray-700 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
            
            {/* Smaller articles loading skeleton */}
            <div className="lg:col-span-5">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 animate-pulse">
                    <div className="relative w-24 h-24 bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  // If no posts are found, don't render the section
  if (!posts || posts.length === 0) {
    return null;
  }
  
  // Split posts into featured and smaller articles
  const featuredArticle = posts[0];
  const smallerArticles = posts.slice(1, 6);
  
  return (
    <section className="bg-vpn-blue dark:bg-gray-900 text-white dark:text-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* HEADLINES title */}
        <h1 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
          NEWS HEADLINES
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured article - 7 columns */}
          <div className="lg:col-span-7">
            <FeaturedArticle article={featuredArticle} />
          </div>
          
          {/* Smaller articles list - 5 columns */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {smallerArticles.map(article => (
                <SmallArticleCard key={article._id} article={article} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
