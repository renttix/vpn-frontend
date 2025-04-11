"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

interface NewsTickerProps {
  className?: string;
}

export default function NewsTicker({ className = "" }: NewsTickerProps) {
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    const fetchHeadlines = async () => {
      // Don't set states if component unmounted
      if (!isMounted) return;
      
      let timeoutId: NodeJS.Timeout | null = null;
      let controller: AbortController | null = null;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Add cache-busting parameter to prevent browser caching
        const timestamp = new Date().getTime();
        
        // Create an abort controller for timeout
        controller = new AbortController();
        
        // Set a longer timeout (15 seconds instead of 8)
        timeoutId = setTimeout(() => {
          if (controller) controller.abort();
        }, 15000);
        
        // Use a more robust fetch with retry logic
        let retries = 0;
        const maxRetries = 3;
        let response = null;
        
        while (retries < maxRetries && !response) {
          try {
            response = await fetch(`/api/news-ticker?t=${timestamp}`, {
              // Add a timeout to prevent hanging requests
              signal: controller.signal,
              // Ensure we're not using cached responses
              cache: 'no-store',
              headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
              }
            });
            
            // Break out of retry loop if successful
            if (response.ok) break;
            
          } catch (fetchError) {
            // If this is the last retry, throw the error to be caught by outer catch
            if (retries === maxRetries - 1) throw fetchError;
            
            // Otherwise increment retry count and try again
            retries++;
            // Wait longer between each retry (exponential backoff)
            await new Promise(r => setTimeout(r, 1000 * retries));
          }
        }
        
        // Clear the timeout as soon as response is received
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // If we still don't have a response, throw an error
        if (!response) {
          throw new Error('Failed to fetch after multiple retries');
        }
        
        // Even if response is not ok, we'll try to parse it
        // as our API now always returns 200 with fallback data
        const data = await response.json();
        
        // Don't update state if component unmounted
        if (!isMounted) return;
        
        if (data.headlines && Array.isArray(data.headlines)) {
          setHeadlines(data.headlines);
          // Reset retry count on success
          setRetryCount(0);
        } else {
          console.warn('Unexpected API response format:', data);
          // Use fallback headlines instead of empty array
          setHeadlines([
            { title: "Latest updates on major court cases", link: "#", pubDate: new Date().toUTCString() },
            { title: "New legislation proposed for criminal justice reform", link: "#", pubDate: new Date().toUTCString() },
            { title: "Supreme Court ruling impacts legal precedent", link: "#", pubDate: new Date().toUTCString() }
          ]);
        }
      } catch (err: any) {
        // Don't update state if component unmounted
        if (!isMounted) return;
        
        // Clear timeout if it exists
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Handle AbortError specifically
        if (err.name === 'AbortError') {
          console.warn('News ticker request timed out');
          setError('Request timed out');
        } else {
          console.error('Error fetching headlines:', err);
          setError('Failed to load latest news');
        }
        
          // Use fallback headlines when there's an error
          setHeadlines([
            { title: "Latest updates on major court cases", link: "#", pubDate: new Date().toUTCString() },
            { title: "New legislation proposed for criminal justice reform", link: "#", pubDate: new Date().toUTCString() },
            { title: "Supreme Court ruling impacts legal precedent", link: "#", pubDate: new Date().toUTCString() }
          ]);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // If we've tried 3 times and still failing, stop retrying
        if (retryCount < 3) {
          // Try again after a short delay with exponential backoff
          const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
          setTimeout(fetchHeadlines, delay);
        }
      } finally {
        // Don't update state if component unmounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch headlines immediately
    fetchHeadlines();
    
    // Set up interval to refresh headlines every 5 minutes
    intervalId = setInterval(fetchHeadlines, 5 * 60 * 1000);
    
    // Clean up on component unmount
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [retryCount, router]);

  // Format headlines for display
  const tickerText = headlines.length > 0
    ? headlines.map(item => item.title).join('          •          ')
    : isLoading
      ? 'Loading latest headlines...'
      : error || 'No headlines available at this time';

  // Handle click on ticker to open the first headline
  const handleTickerClick = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    if (headlines.length > 0 && headlines[0].link && headlines[0].link !== '#') {
      window.open(headlines[0].link, '_blank');
    }
  };

  // Create a unique ID for ARIA relationships
  const tickerId = "news-ticker";
  const tickerStatusId = "news-ticker-status";

  return (
    <div 
      className={`bg-vpn-red text-white text-xs sm:text-sm py-1 px-2 sm:px-4 ${className}`}
      role="complementary"
      aria-label="News ticker"
      aria-describedby={tickerStatusId}
    >
      <div className="container mx-auto flex items-center overflow-hidden">
        <span className="font-bold mr-1 sm:mr-2 whitespace-nowrap" id={tickerId}>LIVE:</span>
        <div 
          className="overflow-hidden whitespace-nowrap relative w-full cursor-pointer"
          onClick={handleTickerClick}
          onKeyDown={(e) => {
            // Handle multiple keys for better keyboard accessibility
            if (e.key === 'Enter' || e.key === 'Space') {
              e.preventDefault(); // Prevent page scroll on space
              handleTickerClick();
            }
          }}
          tabIndex={0}
          role="button"
          aria-labelledby={tickerId}
          aria-describedby={tickerStatusId}
          aria-live="polite"
          aria-atomic="true"
          aria-busy={isLoading}
        >
          <span className="animate-marquee inline-block">
            {tickerText}
          </span>
        </div>
      </div>
      
      {/* Hidden status for screen readers */}
      <div id={tickerStatusId} className="sr-only" aria-live="polite">
        {isLoading 
          ? "Loading latest headlines..." 
          : error 
            ? `Error loading headlines: ${error}` 
            : headlines.length > 0 
              ? `${headlines.length} latest headlines available. Press Enter to view the first headline.` 
              : "No headlines available at this time."}
      </div>
    </div>
  );
}
