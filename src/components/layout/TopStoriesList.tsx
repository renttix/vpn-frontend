"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  _id: string;
  title: string;
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
  publishedAt?: string;
  author?: {
    name: string;
  };
}

interface TopStoriesListProps {
  posts: Post[];
}

export default function TopStoriesList({ posts }: TopStoriesListProps) {
  // If no posts are provided, don't render
  if (!posts || posts.length === 0) {
    return null;
  }

  // Function to format time ago
  const formatTimeAgo = (dateString?: string) => {
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
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-roboto text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
          TOP STORIES
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {posts.map((post) => {
          // Format the time if available
          const timeAgo = formatTimeAgo(post.publishedAt);
            
          return (
            <article key={post._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
              <div className="flex items-start space-x-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {post.slug?.current ? (
                    <Link href={`/${post.slug.current}`}>
                      <div className="relative w-20 aspect-[1.9/1] sm:w-24 md:w-28 overflow-hidden rounded">
                        <Image
                          src={post.mainImage?.asset?.url || "/images/placeholder-news.jpg"}
                          alt={post.title || "News article"}
                          width={120}
                          height={63}
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                          className="object-cover object-center"
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="relative w-20 aspect-[1.9/1] sm:w-24 md:w-28 overflow-hidden rounded bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {post.slug?.current ? (
                    <Link href={`/${post.slug.current}`}>
                      <h3 className="font-roboto font-bold text-vpn-gray dark:text-white text-sm sm:text-base leading-tight mb-1 hover:text-vpn-blue dark:hover:text-blue-400" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {post.title || "Untitled Article"}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="font-roboto font-bold text-vpn-gray dark:text-white text-sm sm:text-base leading-tight mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {post.title || "Untitled Article"}
                    </h3>
                  )}
                  
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    {post.author?.name && (
                      <span className="mr-2 truncate">By {post.author.name}</span>
                    )}
                    {timeAgo && (
                      <span className="truncate">{timeAgo}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
