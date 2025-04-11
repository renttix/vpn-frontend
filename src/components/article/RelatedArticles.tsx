"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getRelatedArticles } from "@/lib/articles";

interface RelatedArticlesProps {
  currentArticleId: string;
  relatedPosts?: any[]; // For Sanity data
}

export default function RelatedArticles({ currentArticleId, relatedPosts }: RelatedArticlesProps) {
  // If relatedPosts is provided (from Sanity), use that
  // Otherwise, use the getRelatedArticles function (for mock data)
  const articles = relatedPosts || getRelatedArticles(currentArticleId);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-md p-4">
      <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Related Stories</h3>
      
      <div className="space-y-4">
        {articles.map((article) => {
          // Handle both Sanity and mock data formats
          const id = article._id || article.id;
          const title = article.title;
          const slug = article.slug?.current || article.slug;
          const imageUrl = article.imageUrl;
          const excerpt = article.excerpt;
          const author = article.author;

          return (
            <div key={id} className="flex gap-3">
              {imageUrl && (
                <div className="flex-shrink-0">
                  <Link href={`/${slug}`}>
                    <div className="relative w-20 aspect-[1.9/1] overflow-hidden rounded">
                      <Image
                        src={imageUrl}
                        alt={title}
                        width={120}
                        height={63}
                        className="object-cover object-center"
                      />
                    </div>
                  </Link>
                </div>
              )}
              
              <div className="flex-1">
                <Link 
                  href={`/${slug}`}
                  className="font-medium font-body text-sm text-foreground hover:text-vpn-blue dark:hover:text-blue-400 line-clamp-2"
                >
                  {title}
                </Link>
                {excerpt && (
                  <p className="font-body text-xs text-foreground/80 mt-1 line-clamp-2">{excerpt}</p>
                )}
                <p className="font-body text-xs text-foreground/70 mt-1">{author}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
