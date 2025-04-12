'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Post {
  _id: string;
  title: string;
  slug?: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string; slug?: { current: string } };
  publishedAt: string;
  excerpt?: string;
  categories?: { _id: string; title: string; slug?: { current: string } }[];
  categoryTitles?: string[];
}

interface ArticleCardListProps {
  initialPosts: Post[];
  fetchMorePosts: (skip: number, limit: number) => Promise<Post[]>;
  categoryTitle?: string; // Optional, used for category pages
  initialHasMore?: boolean;
}

export default function ArticleCardList({
  initialPosts,
  fetchMorePosts,
  categoryTitle,
  initialHasMore = true
}: ArticleCardListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);

  // Internal date formatting function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date'; // Handle potential invalid date strings
    }
  };

  const handleShowMore = async () => {
    setIsLoading(true);
    try {
      const morePosts = await fetchMorePosts(posts.length, 12);
      if (morePosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts([...posts, ...morePosts]);
        // If we got fewer than 12 posts, there are no more to load
        if (morePosts.length < 12) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="content-section p-6">
        <div className="grid grid-cols-1 gap-8">
          {/* Iterate through posts and create rows of 2 */}
          {Array.from({ length: Math.ceil(posts.length / 2) }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.slice(rowIndex * 2, rowIndex * 2 + 2).map((post, index) => (
                <article key={`post-${rowIndex}-${index}`} className="article-card flex flex-col h-full">
                  <Link href={`/${post.slug?.current ?? '#'}`} className="block overflow-hidden">
                    {post.mainImage?.asset?.url ? (
                      <div className="relative aspect-[1200/600] overflow-hidden rounded-sm">
                        <img
                          src={post.mainImage.asset.url}
                          alt={post.mainImage.asset.alt || post.title || 'Article image'}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          width="1200"
                          height="600"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      // Placeholder if no image
                      <div className="relative aspect-[1200/600] bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded-sm">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Category tag if available */}
                    {post.categories && post.categories.length > 0 && (
                      <Link
                        href={`/category/${post.categories[0].slug?.current || post.categories[0].title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
                      >
                        {post.categories[0].title}
                      </Link>
                    )}
                    {/* For category pages, show other categories */}
                    {categoryTitle && post.categoryTitles && post.categoryTitles.length > 0 && 
                     post.categoryTitles[0] !== categoryTitle && (
                      <Link
                        href={`/category/${post.categoryTitles[0].toLowerCase().replace(/\s+/g, '-')}`}
                        className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
                      >
                        {post.categoryTitles[0]}
                      </Link>
                    )}
                    
                    <Link href={`/${post.slug?.current ?? '#'}`} className="group">
                      <h3 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-lg md:text-xl leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-3">
                        {post.title || 'Untitled Post'}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="font-body text-vpn-gray dark:text-vpn-gray-dark/80 text-base mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                    )}
                    {/* Footer of card */}
                    <div className="mt-auto font-body text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {post.author?.name && (
                        <span>
                          By {post.author.slug ? (
                            <Link href={`/author/${post.author.slug.current}`} className="hover:text-vpn-blue dark:hover:text-blue-400">
                              {post.author.name}
                            </Link>
                          ) : (
                            post.author.name
                          )} • 
                        </span>
                      )}
                      {formatDate(post.publishedAt)}
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
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleShowMore}
            disabled={isLoading}
            className="bg-vpn-blue hover:bg-vpn-blue/90 text-white font-medium px-8 py-2"
          >
            {isLoading ? 'Loading...' : 'Show More'}
          </Button>
        </div>
      )}
    </div>
  );
}
