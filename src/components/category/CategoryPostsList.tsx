'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';

// Define types
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string };
  publishedAt: string;
  excerpt?: string;
  categoryTitles?: string[];
}

interface CategoryPostsListProps {
  initialPosts: Post[];
  categoryId: string;
  categoryTitle: string;
  sortOrder: string;
}

export default function CategoryPostsList({ 
  initialPosts, 
  categoryId, 
  categoryTitle,
  sortOrder = 'publishedAt desc' 
}: CategoryPostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 12);
  
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date'; // Handle potential invalid date strings
    }
  };

  const loadMorePosts = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Calculate the offset based on the current page
      const offset = page * 12;
      
      // Fetch the next batch of posts
      const postsQuery = groq`*[_type == "post" && $categoryTitle in categories[]->title]{
        _id,
        title,
        slug,
        mainImage{ asset->{url, alt} },
        author->{name},
        publishedAt,
        excerpt,
        "categoryTitles": categories[]->title
      } | order(${sortOrder}) [${offset}...${offset + 12}]`;
      
      const newPosts = await client.fetch<Post[]>(postsQuery, { 
        categoryId,
        categoryTitle
      });
      
      // Update state
      setPosts([...posts, ...newPosts]);
      setPage(page + 1);
      setHasMore(newPosts.length === 12);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-section p-6">
      <div className="grid grid-cols-1 gap-8"> {/* Outer grid for spacing between rows */}
        {/* Iterate through posts and create rows of 2 */}
        {Array.from({ length: Math.ceil(posts.length / 2) }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.slice(rowIndex * 2, rowIndex * 2 + 2).map(p => (
              <article key={p._id} className="article-card flex flex-col h-full">
                <Link href={`/${p.slug?.current ?? '#'}`} className="block overflow-hidden">
                  {p.mainImage?.asset?.url ? (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                      <img
                        src={p.mainImage.asset.url}
                        alt={p.mainImage.asset.alt || p.title || 'Article image'}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        width="600"
                        height="338"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    // Placeholder if no image
                    <div className="relative aspect-[16/9] bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded-sm">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  {/* Add category tag if available */}
                  {p.categoryTitles && p.categoryTitles.length > 0 && p.categoryTitles[0] !== categoryTitle && (
                    <Link
                      href={`/category/${p.categoryTitles[0].toLowerCase().replace(/\s+/g, '-')}`}
                      className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
                    >
                      {p.categoryTitles[0]}
                    </Link>
                  )}
                  <Link href={`/${p.slug?.current ?? '#'}`} className="group">
                    <h3 className="font-body font-bold text-vpn-gray dark:text-vpn-gray-dark text-lg md:text-xl leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-3">
                      {p.title || 'Untitled Post'}
                    </h3>
                  </Link>
                  {p.excerpt && (
                    <p className="font-body text-vpn-gray dark:text-vpn-gray-dark/80 text-base mb-4 line-clamp-3 flex-grow">
                      {p.excerpt}
                    </p>
                  )}
                  {/* Footer of card */}
                  <div className="mt-auto font-body text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {p.author?.name && <span>By {p.author.name} • </span>}
                    {formatDate(p.publishedAt)}
                  </div>
                </div>
              </article>
            ))}
            {/* Add placeholders if the last row doesn't have 2 items */}
            {posts.slice(rowIndex * 2, rowIndex * 2 + 2).length < 2 &&
              Array.from({ length: 2 - posts.slice(rowIndex * 2, rowIndex * 2 + 2).length }).map((_, placeholderIndex) => (
                <div key={`placeholder-${rowIndex}-${placeholderIndex}`} className="hidden md:block"></div> // Empty div to maintain grid structure
              ))
            }
          </div>
        ))}
      </div>
      
      {/* View More button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMorePosts}
            disabled={isLoading}
            className="font-body inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'View More'}
          </button>
        </div>
      )}
    </div>
  );
}
