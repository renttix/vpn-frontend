"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface Article {
  _id: string;
  title: string;
  slug: string;
  mainImage?: string;
  publishedAt: string;
  categories?: string[];
  categorySlug?: string[];
  author?: string;
  authorSlug?: string;
}

interface RecommendedArticlesProps {
  currentArticleId?: string;
}

export default function RecommendedArticles({ currentArticleId }: RecommendedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        
        // Build URL with current article ID if available
        const url = currentArticleId 
          ? `/api/recommendations?currentArticleId=${currentArticleId}`
          : '/api/recommendations';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [currentArticleId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md p-4 mt-8">
        <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Recommended For You</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
              <div className="flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return null; // Don't show anything if there's an error or no recommendations
  }

  return (
    <div className="bg-card border border-border rounded-md p-4 mt-8">
      <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Recommended For You</h3>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article._id} className="flex gap-3">
            {article.mainImage && (
              <div className="flex-shrink-0">
                <Link href={`/${article.slug}`}>
                  <div className="relative w-20 h-20 overflow-hidden rounded">
                    <Image
                      src={article.mainImage}
                      alt={article.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
            )}
            
            <div>
              <Link 
                href={`/${article.slug}`}
                className="font-medium text-sm text-foreground hover:text-vpn-blue dark:hover:text-blue-400 line-clamp-2"
              >
                {article.title}
              </Link>
              <div className="flex justify-between text-xs text-foreground/70 mt-1">
                <span>{article.author}</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              {article.categories && article.categories[0] && (
                <span className="inline-block bg-gray-100 dark:bg-gray-800 text-xs px-2 py-0.5 rounded mt-1">
                  {article.categories[0]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
