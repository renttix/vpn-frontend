"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ArticleLayout from "@/components/article/ArticleLayout";
import ArticleContent from "@/components/article/ArticleContent";
import RelatedArticles from "@/components/article/RelatedArticles";
import RecommendedArticles from "@/components/article/RecommendedArticles";
import CommentSection from "@/components/article/CommentSection";
import SocialShareButtons from "@/components/article/SocialShareButtons";
import AuthorBio from "@/components/article/AuthorBio";
import { getUserId, trackArticleView } from "@/lib/userActivity";
import { type ArticleType } from "@/lib/articles";
import { type AuthorType } from "@/lib/authors";

interface ArticlePageClientProps {
  article: ArticleType;
  author: AuthorType | null;
  categories: any[]; // Add categories prop
}

export default function ArticlePageClient({ article, author, categories }: ArticlePageClientProps) {
  // Get current URL on the client-side
  const [currentUrl, setCurrentUrl] = useState("");
  
  useEffect(() => {
    // Ensure window is defined (for SSR safety)
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      
      // Track article view for recommendations
      const userId = getUserId();
      if (userId) {
        // Track in MongoDB for personalized recommendations
        trackArticleView(userId, article.id, {
          categories: [article.categorySlug],
          tags: article.tags,
          author: article.authorSlug,
        });
        
        // Also increment pageViews counter in Sanity for popular articles
        fetch(`/api/articles/${article.id}/view`, { method: 'POST' })
          .catch(err => console.error('Error tracking article view in Sanity:', err));
      }
    }
  }, [article]);

  return (
    <Layout categories={categories}>
      <ArticleLayout 
        articleId={article.id}
        articleTitle={article.title}
      >
        <div className="space-y-8"> {/* Changed from grid to vertical stack */}
          {/* Main content area */}
          <div> {/* Removed col-span */}
            <ArticleContent article={article as any} />
            {/* Add Social Share Buttons below content */}
            {currentUrl && <SocialShareButtons url={currentUrl} title={article.title} />}
            {/* Add Author Bio section if author data exists */}
            {author && <AuthorBio author={author as any} />}
            <CommentSection articleId={article.id} />
          </div>

          {/* Related and Recommended Articles */}
          <div className="space-y-8">
            <RelatedArticles currentArticleId={article.id} />
            <RecommendedArticles currentArticleId={article.id} />
          </div>
        </div>
      </ArticleLayout>
    </Layout>
  );
}
