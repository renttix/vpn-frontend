"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Create a client-only wrapper component for speech synthesis functionality
const SpeechSynthesisPlayer = dynamic(
  () => import('@/components/accessibility/SpeechSynthesisPlayer'),
  { ssr: false }
);

export default function ListenPage() {
  const searchParams = useSearchParams();
  const articleId = searchParams?.get('id');
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleText, setArticleText] = useState('');
  
  // Fetch article data
  useEffect(() => {
    if (!articleId) {
      setError('No article ID provided');
      setLoading(false);
      return;
    }
    
    const fetchArticle = async () => {
      try {
        const query = groq`*[_type == "post" && _id == $id][0]{
          _id,
          title,
          slug,
          body,
          mainImage {
            asset->{
              url
            }
          },
          author->{
            name
          }
        }`;
        
        const result = await client.fetch(query, { id: articleId });
        
        if (!result) {
          setError('Article not found');
          setLoading(false);
          return;
        }
        
        setArticle(result);
        
        // Extract text from article body
        if (result.body) {
          const extractText = (blocks: any[]): string => {
            return blocks.map(block => {
              // Handle different block types
              if (block._type === 'block' && block.children) {
                return block.children.map((child: any) => child.text || '').join(' ');
              }
              return '';
            }).join('\n\n');
          };
          
          const text = extractText(result.body);
          setArticleText(text);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to fetch article');
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [articleId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn-blue mx-auto"></div>
          <p className="mt-4 text-vpn-gray dark:text-gray-300">Loading article...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-vpn-gray dark:text-white mb-4">Error</h1>
          <p className="text-vpn-gray dark:text-gray-300 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-vpn-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with back button */}
        <div className="mb-8">
          <Link 
            href={`/${article?.slug?.current || ''}`}
            className="inline-flex items-center text-vpn-blue hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Article
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold text-vpn-gray dark:text-white mt-4">
            {article?.title || 'Article'}
          </h1>
          
          {article?.author?.name && (
            <p className="text-vpn-gray-light dark:text-gray-400 mt-2">
              By {article.author.name}
            </p>
          )}
        </div>
        
        {/* Text-to-Speech Player */}
        {articleText && (
          <SpeechSynthesisPlayer 
            text={articleText} 
            title={article?.title} 
            autoPlay={true}
          />
        )}
        
        {/* Article text preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-vpn-gray dark:text-gray-200 mb-4">
            Article Text
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            {articleText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-vpn-gray dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
