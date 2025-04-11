"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface Category {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
}

interface Author {
  _id: string;
  name: string;
  slug?: {
    current: string;
  };
}

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
  categories?: Category[];
  author?: Author;
  publishedAt?: string;
  excerpt?: string;
  body?: any[];
}

interface LatestNewsSectionProps {
  posts: Post[];
  initialCount?: number;
  incrementCount?: number;
}

// Helper function to get the first paragraph of text from the body
function getFirstParagraph(body?: any[]): string {
  if (!body || body.length === 0) return "";
  
  // Look for the first paragraph block
  const firstParagraph = body.find(block => 
    block._type === 'block' && 
    block.style === 'normal' && 
    block.children && 
    block.children.length > 0
  );
  
  if (firstParagraph && firstParagraph.children) {
    // Extract text from the children
    return firstParagraph.children
      .filter((child: any) => child._type === 'span' && child.text)
      .map((child: any) => child.text)
      .join('');
  }
  
  return "";
}

// Helper function to get excerpt or first paragraph
function getExcerptText(post: Post): string {
  // If there's an explicit excerpt, use that
  if (post.excerpt) return post.excerpt;
  
  // Otherwise try to get the first paragraph from the body
  const firstParagraph = getFirstParagraph(post.body);
  if (firstParagraph) return firstParagraph;
  
  // Fallback
  return "";
}

export default function LatestNewsSection({ 
  posts, 
  initialCount = 12, 
  incrementCount = 12 
}: LatestNewsSectionProps) {
  const [displayCount, setDisplayCount] = useState(initialCount);
  
  // If no posts are provided, don't render
  if (!posts || posts.length === 0) {
    return null;
  }
  
  // Get the posts to display based on current count
  const displayedPosts = posts.slice(0, displayCount);
  
  // Check if there are more posts to load
  const hasMorePosts = displayCount < posts.length;
  
  // Handle "Show More" button click
  const handleShowMore = () => {
    setDisplayCount(prevCount => prevCount + incrementCount);
  };
  
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold uppercase mb-8 tracking-wider text-vpn-blue dark:text-yellow-500">
          LATEST NEWS
        </h2>
        
        {/* Two-column layout: News content and Ad space */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content column - 75% width on desktop */}
          <div className="lg:w-3/4 space-y-8">
            {displayedPosts.map((post) => {
              const excerpt = getExcerptText(post);
              const categoryTitle = post.categories && post.categories.length > 0 
                ? post.categories[0].title 
                : "News";
              const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug
                ? post.categories[0].slug.current
                : "news";
                
              return (
                <article key={post._id} className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-transparent dark:border-gray-700">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="md:w-1/3 lg:w-1/4">
                      <Link href={`/${post.slug.current}`} className="block">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={post.mainImage?.asset.url || "/images/placeholder-news.jpg"}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>
                    </div>
                    
                    {/* Content */}
                    <div className="md:w-2/3 lg:w-3/4">
                      {/* Category */}
                      <Link 
                        href={`/category/${categorySlug}`}
                        className="inline-block bg-yellow-400 text-black text-xs px-2 py-1 mb-2 font-medium"
                      >
                        {categoryTitle}
                      </Link>
                      
                      {/* Title */}
                      <h3 className="font-headline text-xl md:text-2xl font-bold mb-2 leading-tight text-vpn-gray dark:text-gray-100">
                        <Link href={`/${post.slug.current}`} className="hover:text-vpn-blue dark:hover:text-yellow-500 transition-colors duration-200">
                          {post.title}
                        </Link>
                      </h3>
                      
                      {/* Excerpt */}
                      {excerpt && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                          "{excerpt}"
                        </p>
                      )}
                      
                      {/* Author and date */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {post.author?.name && (
                          <span className="font-medium text-vpn-gray dark:text-gray-300">{post.author.name}</span>
                        )}
                        {post.author?.name && post.publishedAt && (
                          <span className="mx-1">/</span>
                        )}
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt}>
                            {formatDate(post.publishedAt)}
                          </time>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            
            {/* Show More button */}
            {hasMorePosts && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="bg-vpn-blue text-white font-bold py-2 px-6 rounded hover:bg-opacity-90 dark:bg-blue-700 dark:hover:bg-blue-600 transition text-sm uppercase"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
          
          {/* Ad space column - 25% width on desktop */}
          <div className="lg:w-1/4 lg:min-h-[600px]">
            {/* No placeholder as requested */}
          </div>
        </div>
      </div>
    </section>
  );
}
