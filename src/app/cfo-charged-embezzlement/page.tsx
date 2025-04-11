"use client";

import React from "react";
import Layout from "@/components/layout/Layout";
import ArticleLayout from "@/components/article/ArticleLayout";
import ArticleContent from "@/components/article/ArticleContent";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentSection from "@/components/article/CommentSection";
import SocialShareButtons from "@/components/article/SocialShareButtons";
import AuthorBio from "@/components/article/AuthorBio"; // Import AuthorBio component
import { getArticleBySlug } from "@/lib/articles";
import { getAuthorBySlug } from "@/lib/authors"; // Import function to get author data

export default function CFOEmbezzlementPage() {
  const article = getArticleBySlug("cfo-charged-embezzlement");

  // Get current URL on the client-side - Hooks must be called at the top level
  const [currentUrl, setCurrentUrl] = React.useState("");
  React.useEffect(() => {
    // Ensure window is defined (for SSR safety, though this is 'use client')
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  if (!article) {
    return <div>Article not found</div>;
  }
// Fetch author details using the authorSlug from the article
const author = getAuthorBySlug(article.authorSlug);

// Now article is guaranteed to be defined
  // Now article is guaranteed to be defined
  return ( // Add the return statement back
    <Layout categories={[]}>
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

          {/* Related Articles (now below main content) */}
          <div> {/* Removed col-span */}
            <RelatedArticles currentArticleId={article.id} />
          </div>
        </div>
      </ArticleLayout>
    </Layout>
  );
}
