"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ScrollTracker from "@/components/analytics/ScrollTracker";

interface ArticleLayoutProps {
  children: ReactNode;
  articleId: string;
  articleTitle?: string;
}

export default function ArticleLayout({ 
  children, 
  articleId,
  articleTitle = "Article" 
}: ArticleLayoutProps) {
  // Track article view
  React.useEffect(() => {
    // Import dynamically to avoid SSR issues
    import("@/lib/analytics").then(({ event }) => {
      event({
        action: "view_article",
        category: "content",
        label: articleTitle,
      });
    });
  }, [articleId, articleTitle]);
  return (
    <div className="bg-background">
      {/* Track scroll depth */}
      <ScrollTracker contentId={articleId} contentType="article" />
      
      {/* Main Content with Side Ads */}
      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-8"></div>

        {/* Grid for Content and Right Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Content - First on mobile */}
          <div className="col-span-1 lg:col-span-9 order-1">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-200 dark:border-gray-700 rounded-sm">
              <ErrorBoundary componentName={`Article-${articleId}`}>
                {children}
              </ErrorBoundary>
            </div>
            
          </div>

          {/* Right Ad Column - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-3 order-2">
            <div className="sticky top-[220px]">
              {/* Empty space for sidebar layout */}
              <div className="w-full"></div>
              
              {/* RelatedArticles will be rendered by the parent component */}
            </div>
          </div>
        </div>

        {/* Empty space for bottom margin */}
        <div className="mt-8"></div>
      </div>
    </div>
  );
}
