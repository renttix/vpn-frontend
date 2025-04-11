import React from 'react';
import Head from 'next/head';
import { Post } from '@/types/sanity';

interface SocialMetaTagsProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  type?: 'article' | 'website';
  article?: Post;
}

export default function SocialMetaTags({
  title,
  description,
  url,
  imageUrl = 'https://vpnnews.com/images/logo.png',
  type = 'website',
  article
}: SocialMetaTagsProps) {
  // Format the date in ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return '';
    }
  };

  return (
    <Head>
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Video Production News" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vpnnews" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content={article?.author?.name ? `@${article.author.name.replace(/\s+/g, '')}` : '@vpnnews'} />

      {/* Article-specific tags */}
      {type === 'article' && article && (
        <>
          <meta property="article:published_time" content={formatDate(article.publishedAt)} />
          <meta property="article:modified_time" content={formatDate(article.publishedAt)} />
          <meta property="article:author" content={`https://vpnnews.com/author/${article.author?.slug?.current || ''}`} />
          <meta property="article:publisher" content="https://vpnnews.com" />
          {article.categories?.map((category, index) => (
            <meta key={index} property="article:section" content={category.title} />
          ))}
          {/* You could add article:tag properties here if you have tags in your schema */}
        </>
      )}
    </Head>
  );
}
