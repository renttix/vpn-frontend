"use client";

import React from "react";
import FeaturedCarousel from "./FeaturedCarousel";
import TopStoriesList from "./TopStoriesList";

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

interface FeaturedContentSplitProps {
  posts: Post[];
}

export default function FeaturedContentSplit({ posts }: FeaturedContentSplitProps) {
  // If no posts are provided, don't render
  if (!posts || posts.length === 0) {
    return null;
  }

  // Split posts for the two components
  const carouselPosts = posts.slice(0, 4); // First 4 posts for carousel
  const listPosts = posts.slice(0, 5);     // First 5 posts for the list

  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-4 sm:py-6">
      <div className="container mx-auto px-4">
        {/* Mobile-first grid - starts as single column, expands on larger screens */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Featured Carousel - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2">
            <FeaturedCarousel posts={carouselPosts} />
          </div>
          
          {/* Top Stories List - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1 mt-4 lg:mt-0">
            <TopStoriesList posts={listPosts} />
          </div>
        </div>
      </div>
    </div>
  );
}
