"use client";

import { useState } from "react";
import Link from "next/link";
import ArticleCard from "../ui/ArticleCard";
import { Post } from "@/types/sanity";

interface TabbedLatestArticlesProps {
  allPosts: Post[];
  crimePosts: Post[];
  courtPosts: Post[];
  commentaryPosts: Post[];
}

// Convert Post to ArticleProps
function postToArticleProps(post: Post, index: number) {
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
    title: post.title || "Untitled Article",
    slug: post.slug?.current || `untitled-${index}`,
    imageUrl: post.mainImage?.asset?.url || "/images/placeholder-news.jpg",
    imageAlt: post.title || "News article",
    category: categoryName.toUpperCase(),
    categorySlug: categorySlug,
  };
}

export default function TabbedLatestArticles({
  allPosts,
  crimePosts,
  courtPosts,
  commentaryPosts
}: TabbedLatestArticlesProps) {
  const [activeTab, setActiveTab] = useState("all");
  
  // Logic to determine which posts to display based on activeTab
  const displayPosts = 
    activeTab === "all" ? allPosts :
    activeTab === "crime" ? crimePosts :
    activeTab === "court" ? courtPosts :
    commentaryPosts;

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-heading text-yellow-500 dark:text-yellow-300 uppercase mb-6 tracking-wider">
          LATEST
        </h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</TabButton>
          <TabButton active={activeTab === "crime"} onClick={() => setActiveTab("crime")}>Crime</TabButton>
          <TabButton active={activeTab === "court"} onClick={() => setActiveTab("court")}>Court</TabButton>
          <TabButton active={activeTab === "commentary"} onClick={() => setActiveTab("commentary")}>Commentary</TabButton>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.length > 0 ? (
          displayPosts.map((post, index) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <ArticleCard {...postToArticleProps(post, index)} />
            </div>
          ))
        ) : (
          // Fallback for no posts
          <div className="col-span-full text-center py-8">
            <p className="text-vpn-gray dark:text-gray-300">No articles found in this category.</p>
          </div>
        )}
      </div>

        {/* View All Link */}
      <div className="text-center mt-8">
        <Link 
          href={activeTab === "all" ? "/latest" : 
                activeTab === "crime" ? "/category/crime-news" : 
                activeTab === "court" ? "/category/court-news" : 
                "/category/legal-commentary"}
          className="inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700"
        >
          View All {activeTab === "all" ? "Latest" : 
                    activeTab === "crime" ? "Crime" : 
                    activeTab === "court" ? "Court" : 
                    "Commentary"} Articles
        </Link>
      </div>
    </section>
  );
}

// Helper TabButton component
function TabButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
        active 
          ? "bg-vpn-blue text-white dark:bg-blue-700" 
          : "text-vpn-gray hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
