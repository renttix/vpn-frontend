"use client";

import React from "react";
import ArticleCard from "@/components/ui/ArticleCard";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  categorySlug?: string;
  tag?: string;
  author?: string;
  authorSlug?: string;
  authorImageUrl?: string;
  isFeature?: boolean;
  isOpinion?: boolean;
  isExclusive?: boolean;
}

interface CategoryLayoutProps {
  title: string;
  description?: string;
  articles: Article[];
}

export default function CategoryLayout({ title, description, articles }: CategoryLayoutProps) {
  return (
    <div className="bg-background">
      {/* Category Header */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{title}</h1>
        {description && (
          <p className="font-body text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      {/* Top Ad Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="w-full h-[90px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm font-body border border-border">
          Advertisement - Google AdWords Banner
        </div>
      </div>

      {/* Main Content with Side Ads */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Ad Column - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm font-body border border-border">
                <div className="transform -rotate-90">Advertisement</div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="col-span-1 lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  imageUrl={article.imageUrl}
                  category={article.category}
                  categorySlug={article.categorySlug}
                  tag={article.tag}
                  author={article.author}
                  authorSlug={article.authorSlug}
                  slug={article.slug}
                  isFeature={article.isFeature}
                />
              ))}
            </div>
          </div>

          {/* Right Ad Column - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm font-body border border-border">
                <div className="transform -rotate-90">Advertisement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad Banner */}
      <div className="container mx-auto px-4 mb-8">
        <div className="w-full h-[250px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm font-body border border-border">
          Advertisement - Google AdWords Banner
        </div>
      </div>
    </div>
  );
}
