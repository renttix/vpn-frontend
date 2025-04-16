"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import Link
import Image from "next/image";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { formatDate, calculateReadingTime } from "@/lib/utils"; // Import reading time utility
import { PortableText } from "@portabletext/react"; // Import PortableText
import { Clock, Volume2 } from "lucide-react"; // Import Clock and Volume2 icons
import TableOfContents, { ensureHeadingIds } from "./TableOfContents"; // Import TableOfContents
import dynamic from 'next/dynamic'; // Import dynamic for client-side only components

// Import TextToSpeech with dynamic import to ensure it only loads on the client side
const TextToSpeech = dynamic(
  () => import("@/components/accessibility/TextToSpeech"),
  { ssr: false } // Disable server-side rendering for this component
);
// Import TextSizeAdjuster with dynamic import to ensure it only loads on the client side
const TextSizeAdjuster = dynamic(
  () => import("@/components/accessibility/TextSizeAdjuster"),
  { ssr: false } // Disable server-side rendering for this component
);

// Define the Sanity Article type (or import if defined elsewhere)
// Ensure this matches the structure fetched in [slug]/page.tsx
interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { _id: string; name: string; slug?: { current: string }; bio?: any; image?: { asset: { url: string; alt?: string } } };
  publishedAt: string;
  lastUpdatedAt?: string; // Date when the post was last updated
  body?: any; // Portable Text type
  subtitle?: string; // Assuming subtitle might exist in your schema
  categories?: { _id: string; title: string; slug: { current: string } }[]; // Assuming categories are fetched like this
  tags?: { _id: string; title: string; slug: { current: string } }[]; // Tags for the article
}

interface ArticleContentProps {
  article: Article; // Use the Sanity Article type
}

// Define custom components for Portable Text rendering
const ptComponents = {
  // Custom block styling for different block types
  block: {
    // Normal paragraph styling
    normal: ({children}: any) => {
      return <p className="font-body text-base md:text-lg leading-relaxed mb-6 text-vpn-gray dark:text-gray-300">{children}</p>;
    },
    // Heading styles
    h1: ({children}: any) => {
      return <h1 className="font-body text-3xl md:text-4xl font-bold mt-8 mb-6 text-vpn-gray dark:text-white">{children}</h1>;
    },
    h2: ({children}: any) => {
      return <h2 className="font-roboto text-2xl md:text-3xl font-bold mt-8 mb-4 text-vpn-gray dark:text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>{children}</h2>;
    },
    h3: ({children}: any) => {
      return <h3 className="font-roboto text-xl md:text-2xl font-bold mt-6 mb-4 text-vpn-gray dark:text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>{children}</h3>;
    },
    h4: ({children}: any) => {
      return <h4 className="font-roboto text-lg md:text-xl font-bold mt-6 mb-3 text-vpn-gray dark:text-white" style={{ fontFamily: 'Roboto, sans-serif' }}>{children}</h4>;
    },
    // Blockquote styling
    blockquote: ({children}: any) => {
      return (
        <blockquote className="pl-4 border-l-4 border-vpn-blue italic my-6 py-2 text-vpn-gray-light dark:text-gray-300 font-body">
          {children}
        </blockquote>
      );
    },
  },
  // Custom list styling
  list: {
    // Bullet list styling
    bullet: ({children}: any) => {
      return <ul className="list-disc pl-6 mb-6 font-body text-vpn-gray dark:text-gray-300 space-y-2">{children}</ul>;
    },
  },
  // Custom list item styling
  listItem: {
    // Bullet list item styling
    bullet: ({children}: any) => {
      return <li className="font-body text-base md:text-lg leading-relaxed">{children}</li>;
    },
  },
  // Custom handling for different content types
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) {
        return null;
      }
      return (
        <div className="my-8">
          <OptimizedImage
            image={value}
            alt={value.alt || 'Article image embedded in content'}
            className="aspect-video rounded-md"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </div>
      );
    },
    youtube: ({ value }: any) => {
      if (!value?.url) {
        return null;
      }
      // Extract YouTube video ID from URL
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYouTubeId(value.url);
      if (!videoId) return null;
      
      return (
        <div className="relative my-8 aspect-video">
          <iframe
            width="100%"
            height="100%"
            style={{ aspectRatio: '16/9' }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-md"
            loading="lazy"
          ></iframe>
        </div>
      );
    }
  },
  marks: {
    // Text formatting
    strong: ({children}: any) => <strong className="font-bold">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
    // Link styling
    link: ({ children, value }: any) => {
      // Check if value and value.href exist
      if (!value || !value.href) {
        return <>{children}</>;
      }
      
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !value.href.startsWith('/') ? '_blank' : undefined;
      return (
        <a href={value.href} rel={rel} target={target} className="text-vpn-blue hover:underline transition-colors">
          {children}
        </a>
      );
    },
    // Internal link handling
    internalLink: ({ children, value }: any) => {
      if (!value?.reference?._ref) {
        return <>{children}</>;
      }
      
      // You would need to resolve the reference to get the actual slug
      // This is simplified - in a real implementation you might need to fetch this data
      return (
        <Link href={`/article/${value.reference._ref}`} className="text-vpn-blue hover:underline transition-colors">
          {children}
        </Link>
      );
    },
  },
};


export default function ArticleContent({ article }: ArticleContentProps) {
  const [articleText, setArticleText] = useState<string>("");
  
  // Ensure all headings have IDs for the table of contents
  useEffect(() => {
    ensureHeadingIds('h2, h3, h4');
  }, []);
  
  // Extract text from article body for text-to-speech
  useEffect(() => {
    if (article.body) {
      // Extract text from Portable Text blocks
      const extractText = (blocks: any[]): string => {
        return blocks.map(block => {
          // Handle different block types
          if (block._type === 'block' && block.children) {
            return block.children.map((child: any) => child.text || '').join(' ');
          }
          return '';
        }).join('\n\n');
      };
      
      setArticleText(extractText(article.body));
    }
  }, [article.body]);
  // Calculate reading time if article body exists
  const readingTime = article.body ? calculateReadingTime(article.body) : 1;
  
  // Debug information
  console.log("ArticleContent - Article:", article);
  console.log("ArticleContent - Article body exists:", !!article.body);
  if (article.body) {
    console.log("ArticleContent - Article body type:", typeof article.body);
    console.log("ArticleContent - Article body is array:", Array.isArray(article.body));
    console.log("ArticleContent - Article body length:", Array.isArray(article.body) ? article.body.length : 'N/A');
    if (Array.isArray(article.body) && article.body.length > 0) {
      console.log("ArticleContent - First body item:", article.body[0]);
      console.log("ArticleContent - First body item type:", article.body[0]._type);
      if (article.body[0].children) {
        console.log("ArticleContent - First body item has children:", article.body[0].children.length);
      }
    }
  }
  
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none article-content">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-body font-bold text-vpn-gray dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Use subtitle from Sanity if available */}
        {article.subtitle && (
          <p className="text-xl md:text-2xl text-vpn-gray-light dark:text-gray-300 font-roboto mb-6 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {article.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center text-sm text-vpn-gray-light dark:text-gray-400 mb-6">
          {/* Use author data from Sanity */}
          {article.author ? (
            <>
              {/* Link to author page if slug exists */}
              <span className="mr-2">By {article.author.slug?.current ? (
                  <Link href={`/author/${article.author.slug.current}`} className="font-medium text-vpn-blue dark:text-blue-400 hover:underline">
                    {article.author.name}
                  </Link>
                ) : (
                  <span className="font-medium">{article.author.name}</span>
                )}
              </span>
              <span className="mx-2 hidden sm:inline">•</span>
            </>
          ) : (
            <span className="mr-2">By VPN News Team</span> // Fallback if no author
          )}
          {/* Use publishedAt from Sanity - Enhanced for Google News */}
          <time dateTime={article.publishedAt} className="text-vpn-gray-light dark:text-gray-400 font-medium" itemProp="datePublished">
            {formatDate(article.publishedAt)}
          </time>
          
          {/* Show last updated date if available and different from published date */}
          {article.lastUpdatedAt && new Date(article.lastUpdatedAt).getTime() > new Date(article.publishedAt).getTime() + 86400000 && (
            <>
              <span className="mx-2 hidden sm:inline">•</span>
              <span className="text-vpn-gray-light dark:text-gray-400">
                <time dateTime={article.lastUpdatedAt} itemProp="dateModified">
                  Updated: {formatDate(article.lastUpdatedAt)}
                </time>
              </span>
            </>
          )}
          
          {/* Reading time */}
          <span className="mx-2 hidden sm:inline">•</span>
          <div className="flex items-center text-vpn-gray-light dark:text-gray-400">
            <Clock size={14} className="mr-1" />
            <span>{readingTime} min read</span>
          </div>
          
          {/* Categories inline for desktop */}
          {article.categories && article.categories.length > 0 && (
            <>
              <span className="mx-2 hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center space-x-2">
                {article.categories.map((category, index) => (
                  <React.Fragment key={category._id}>
                    {index > 0 && <span className="text-xs">•</span>}
                    <Link 
                      href={`/category/${category.slug?.current ?? '#'}`}
                      className="text-vpn-blue dark:text-blue-400 hover:underline"
                    >
                      {category.title}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Accessibility Tools */}
      <div className="accessibility-tools flex flex-wrap items-center gap-2 mb-4">
        {/* Text-to-Speech Component */}
        {articleText && (
          <TextToSpeech text={articleText} title={article.title} />
        )}
        
        {/* Text Size Adjuster */}
        <TextSizeAdjuster />
      </div>
      
      {/* Hero Image - Use mainImage from Sanity with OptimizedImage */}
      {article.mainImage?.asset && (
        <div className="mb-8 rounded-sm overflow-hidden shadow-md">
          <OptimizedImage
            image={article.mainImage}
            alt={article.mainImage.asset.alt || article.title}
            fill
            className="aspect-[1.9/1]"
            priority // Keep priority for LCP
            fetchPriority="high" // Add fetchPriority for better LCP
            sizes="(max-width: 768px) 100vw, 800px" // Provide sizes prop
          />
        </div>
      )}
      
      {/* Table of Contents - Only show for very long articles, initially collapsed */}
      {article.body && article.body.length > 15 && (
        <TableOfContents 
          title="Jump to section"
          minHeadings={4}
          className="mt-2 mb-6"
          collapsible={true}
          initiallyCollapsed={true}
        />
      )}

      {/* Article Lead Paragraph - First paragraph styled differently */}
      {article.body && article.body[0]?.children?.[0]?.text && (
        <p className="text-lg md:text-xl text-vpn-gray dark:text-gray-200 font-medium leading-relaxed mb-8">
          {article.body[0].children[0].text}
        </p>
      )}

      {/* Render Portable Text Content - Skip first paragraph which is handled above */}
      {article.body ? (
        <div className="article-content text-vpn-gray dark:text-gray-300 leading-relaxed">
          {/* First few paragraphs without content-visibility */}
          <div>
            <PortableText 
              value={article.body.length > 1 ? article.body.slice(1, Math.min(4, article.body.length)) : []} 
              components={ptComponents} 
            />
          </div>
          
          {/* Rest of the content with content-visibility for better performance */}
          {article.body.length > 4 && (
            <div style={{ contentVisibility: 'auto', containIntrinsicSize: '1000px' }}>
              <PortableText 
                value={article.body.slice(4)} 
                components={ptComponents} 
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-vpn-gray dark:text-gray-300">Article content is missing.</p>
      )}

      {/* Advertisement section removed */}

      {/* Tags/Categories - Mobile only since we show them inline on desktop */}
      {article.categories && article.categories.length > 0 && (
        <div className="sm:hidden mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold font-body mb-2 text-vpn-gray-light dark:text-gray-400">Filed Under:</h3>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug?.current ?? '#'}`}
                className="font-body px-3 py-1 bg-gray-100 dark:bg-gray-800 text-vpn-gray dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Share buttons section removed as requested */}
    </article>
  );
}
