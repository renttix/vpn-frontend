"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackUserEvent, addEnhancedContactProperties } from '@/lib/hubspot';

interface UserTrackerProps {
  email?: string;
}

/**
 * UserTracker Component
 * 
 * This component tracks user behavior on the website and sends events to HubSpot.
 * It should be included in the layout component when a user is logged in or identified.
 * 
 * @param email The email of the identified user (if available)
 */
export default function UserTracker({ email }: UserTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lastPathname, setLastPathname] = useState<string>('');
  
  // Track page views and article reading
  useEffect(() => {
    // Skip if no email is provided or if the pathname hasn't changed
    if (!email || pathname === lastPathname) return;
    
    // Check if HubSpot API key is configured
    const isHubSpotConfigured = () => {
      try {
        // This is a client-side check that won't actually access the API key
        // but will prevent unnecessary API calls if we know tracking is disabled
        return process.env.NEXT_PUBLIC_HUBSPOT_TRACKING_ENABLED === 'true';
      } catch (error) {
        console.warn('HubSpot tracking disabled or not configured');
        return false;
      }
    };
    
    // Skip tracking if HubSpot is not configured
    if (!isHubSpotConfigured()) {
      console.log('HubSpot tracking is disabled. Skipping user tracking.');
      return;
    }
    
    // Update last pathname
    setLastPathname(pathname);
    
    // Check if this is an article page
    const isArticlePage = pathname.startsWith('/') && 
                         !pathname.includes('/category/') && 
                         !pathname.includes('/author/') && 
                         !pathname.includes('/search') &&
                         !pathname.includes('/contact-us') &&
                         !pathname.includes('/subscribe');
    
    // Track page view event
    const trackPageView = async () => {
      try {
        // Basic page view tracking
        await trackUserEvent({
          email,
          eventName: 'page_view',
          properties: {
            page_path: pathname,
            page_url: window.location.href,
            page_title: document.title,
            timestamp: new Date().toISOString()
          }
        }).catch(err => {
          // Silently catch errors to prevent breaking the user experience
          console.warn('Error in page view tracking:', err);
        });
        
        // Additional tracking for article pages
        if (isArticlePage) {
          try {
            // Track article view
            await trackUserEvent({
              email,
              eventName: 'article_view',
              properties: {
                article_title: document.title,
                article_url: window.location.href,
                article_category: getArticleCategory(),
                article_author: getArticleAuthor(),
                timestamp: new Date().toISOString()
              }
            });
            
            // Update article reading count - wrapped in try/catch to handle API key errors
            try {
              await addEnhancedContactProperties(email, {
                articles_read_count: '1', // This will be incremented by HubSpot
                last_article_read: `${document.title} (${window.location.href})`
              });
            } catch (contactError) {
              console.warn('Error updating contact properties:', contactError);
              // Continue execution despite this error
            }
          } catch (articleError) {
            console.warn('Error tracking article view:', articleError);
            // Continue execution despite this error
          }
        }
      } catch (error) {
        // Log error but don't throw to prevent breaking the user experience
        console.warn('Error in user tracking:', error);
      }
    };
    
    // Execute tracking but catch any errors to prevent breaking the user experience
    trackPageView().catch(err => {
      console.warn('Unhandled error in user tracking:', err);
    });
  }, [email, pathname, searchParams, lastPathname]);
  
  // Helper function to get article category
  const getArticleCategory = (): string => {
    // Try to find category meta tag
    const categoryMeta = document.querySelector('meta[property="article:section"]');
    if (categoryMeta) {
      return categoryMeta.getAttribute('content') || 'Uncategorized';
    }
    
    // Try to find category in breadcrumbs
    const breadcrumbs = document.querySelectorAll('.breadcrumbs a');
    if (breadcrumbs.length > 0) {
      return breadcrumbs[0].textContent || 'Uncategorized';
    }
    
    return 'Uncategorized';
  };
  
  // Helper function to get article author
  const getArticleAuthor = (): string => {
    // Try to find author meta tag
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta) {
      return authorMeta.getAttribute('content') || 'Unknown';
    }
    
    // Try to find author in byline
    const byline = document.querySelector('.byline, .author-name');
    if (byline) {
      return byline.textContent || 'Unknown';
    }
    
    return 'Unknown';
  };
  
  // Track time spent on page
  useEffect(() => {
    if (!email) return;
    
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const timeSpentMs = endTime - startTime;
      const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
      
      // Only track if the user spent at least 5 seconds on the page
      if (timeSpentSeconds >= 5) {
        trackUserEvent({
          email,
          eventName: 'time_on_page',
          properties: {
            page_path: pathname,
            seconds: timeSpentSeconds.toString(),
            timestamp: new Date().toISOString()
          }
        }).catch(error => {
          console.error('Error tracking time on page:', error);
        });
      }
    };
  }, [email, pathname]);
  
  // Track clicks on important elements
  useEffect(() => {
    if (!email) return;
    
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Track clicks on links
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        const href = link?.getAttribute('href') || '';
        const text = link?.textContent?.trim() || '';
        
        trackUserEvent({
          email,
          eventName: 'link_click',
          properties: {
            link_url: href,
            link_text: text,
            page_path: pathname,
            timestamp: new Date().toISOString()
          }
        }).catch(error => {
          console.error('Error tracking link click:', error);
        });
      }
      
      // Track clicks on buttons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const text = button?.textContent?.trim() || '';
        const id = button?.id || '';
        const className = button?.className || '';
        
        trackUserEvent({
          email,
          eventName: 'button_click',
          properties: {
            button_text: text,
            button_id: id,
            button_class: className,
            page_path: pathname,
            timestamp: new Date().toISOString()
          }
        }).catch(error => {
          console.error('Error tracking button click:', error);
        });
      }
    };
    
    // Add click event listener
    document.addEventListener('click', handleClick);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [email, pathname]);
  
  // This component doesn't render anything
  return null;
}
