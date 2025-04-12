'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PaginatedArticlesProps<T> {
  initialPosts: T[];
  fetchMorePosts: (skip: number, limit: number) => Promise<T[]>;
  renderItem: (post: T) => React.ReactNode;
  initialHasMore?: boolean;
}

export default function PaginatedArticles<T>({ 
  initialPosts, 
  fetchMorePosts, 
  renderItem,
  initialHasMore = true
}: PaginatedArticlesProps<T>) {
  const [posts, setPosts] = useState(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  
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
                <div key={`post-${rowIndex}-${index}`}>
                  {renderItem(post)}
                </div>
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
