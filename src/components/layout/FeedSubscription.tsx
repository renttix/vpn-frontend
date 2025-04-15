import React from 'react';
import { RssIcon } from 'lucide-react';

interface FeedSubscriptionProps {
  className?: string;
}

/**
 * FeedSubscription Component
 * 
 * Displays subscription buttons for RSS and JSON feeds.
 * This component can be placed in the sidebar or footer of the website.
 */
export default function FeedSubscription({ className = '' }: FeedSubscriptionProps) {
  return (
    <div className={`feed-subscription ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-sm">
        <h3 className="font-heading font-bold text-lg mb-3">Subscribe to Updates</h3>
        <p className="font-body text-sm text-gray-600 dark:text-gray-400 mb-4">
          Stay updated with our latest news and articles through your favorite feed reader.
        </p>
        
        <div className="flex flex-col space-y-2">
          <a 
            href="/feed.xml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
            aria-label="Subscribe via RSS Feed"
          >
            <RssIcon className="w-4 h-4 mr-2" />
            <span className="font-body text-sm font-medium">RSS Feed</span>
          </a>
          
          <a 
            href="/feed.json" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            aria-label="Subscribe via JSON Feed"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z" />
            </svg>
            <span className="font-body text-sm font-medium">JSON Feed</span>
          </a>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>Add to your favorite reader:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <a 
                href="https://feedly.com/i/subscription/feed/https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                Feedly
              </a>
              <a 
                href="https://www.inoreader.com/?add_feed=https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                Inoreader
              </a>
              <a 
                href="https://newsblur.com/?url=https://vpnnews.com/feed.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded"
              >
                NewsBlur
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
