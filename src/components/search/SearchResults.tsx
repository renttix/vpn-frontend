import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { SearchResult } from '@/types/sanity';
import HighlightedText from './HighlightedText';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Search Results Component
 * 
 * Displays search results with pagination
 */
export default function SearchResults({
  results,
  query,
  currentPage,
  totalPages,
  onPageChange
}: SearchResultsProps) {
  // Generate pagination links
  const generatePaginationLinks = () => {
    const links = [];
    
    // Previous page link
    links.push(
      <button
        key="prev"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-sm ${
          currentPage === 1
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-vpn-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Previous page"
      >
        &laquo;
      </button>
    );
    
    // Page number links
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-sm ${
            i === currentPage
              ? 'bg-vpn-blue text-white'
              : 'bg-white dark:bg-gray-800 text-vpn-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={`Page ${i}`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    
    // Next page link
    links.push(
      <button
        key="next"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-sm ${
          currentPage === totalPages
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-vpn-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Next page"
      >
        &raquo;
      </button>
    );
    
    return links;
  };
  
  return (
    <div className="space-y-8">
      {/* Results Count */}
      <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-2">
          Search Results
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
        </p>
      </div>
      
      {/* Results List */}
      {results.length > 0 ? (
        <div className="space-y-8">
          {results.map((result) => (
            <article 
              key={result._id} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-sm shadow-sm flex flex-col md:flex-row gap-6"
            >
              {/* Article Image */}
              {result.mainImage?.asset?.url ? (
                <div className="md:w-1/4">
                  <Link href={`/${result.slug?.current ?? '#'}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                      <img
                        src={result.mainImage.asset.url}
                        alt={result.mainImage.asset.alt || result.title || 'Article image'}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        width="400"
                        height="225"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                </div>
              ) : null}

              {/* Article Content */}
              <div className={`${result.mainImage?.asset?.url ? 'md:w-3/4' : 'w-full'}`}>
                <Link href={`/${result.slug?.current ?? '#'}`} className="group">
                  <h2 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-xl md:text-2xl leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-2">
                    <HighlightedText 
                      text={result.title || 'Untitled Post'} 
                      highlight={query}
                    />
                  </h2>
                </Link>
                
                {result.excerpt && (
                  <p className="text-vpn-gray dark:text-vpn-gray-dark/80 text-base mb-4">
                    <HighlightedText 
                      text={result.excerpt} 
                      highlight={query}
                    />
                  </p>
                )}
                
                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {result.author?.name && <span className="mr-3">By {result.author.name}</span>}
                  <span className="mr-3">{formatDate(result.publishedAt)}</span>
                  
                  {/* Categories */}
                  {result.categories && result.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {result.categories.map((category: { _id: string; title: string; slug: { current: string } }) => (
                        <Link
                          key={category._id}
                          href={`/category/${category.slug?.current ?? '#'}`}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-vpn-blue dark:text-blue-400 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {category.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/${result.slug?.current ?? '#'}`} 
                  className="text-vpn-blue dark:text-blue-400 font-medium hover:underline"
                >
                  Read full article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">No results found for "{query}"</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try different keywords or check your spelling.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/" 
              className="bg-vpn-blue text-white px-6 py-2 rounded-sm hover:bg-opacity-90"
            >
              Return to Home
            </Link>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {results.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {generatePaginationLinks()}
        </div>
      )}
    </div>
  );
}
