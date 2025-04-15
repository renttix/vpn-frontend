import { CookieCategory, isCategoryAllowed } from './cookies';

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = 'G-SSXX53P5T4';

// Custom dimensions and metrics
export enum CustomDimension {
  AUTHOR = 'author',
  CATEGORY = 'category',
  CONTENT_TYPE = 'content_type',
  PUBLISH_DATE = 'publish_date',
  WORD_COUNT = 'word_count',
  USER_TYPE = 'user_type',
  LOGGED_IN = 'logged_in',
}

// Event names - standardized for consistent tracking
export enum EventName {
  // Engagement events
  SCROLL_MILESTONE = 'scroll_milestone',
  TIME_ON_PAGE = 'time_on_page',
  SHARE = 'share',
  PRINT = 'print',
  COPY = 'copy',
  
  // Content interaction
  VIDEO_START = 'video_start',
  VIDEO_PROGRESS = 'video_progress',
  VIDEO_COMPLETE = 'video_complete',
  DOWNLOAD = 'download',
  OUTBOUND_LINK = 'outbound_link',
  INTERNAL_LINK = 'internal_link',
  
  // Form interactions
  FORM_START = 'form_start',
  FORM_SUBMIT = 'form_submit',
  FORM_ERROR = 'form_error',
  FORM_COMPLETE = 'form_complete',
  
  // User actions
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  
  // Error tracking
  ERROR = 'error',
  
  // Custom events
  ARTICLE_VIEW = 'article_view',
  CATEGORY_VIEW = 'category_view',
  AUTHOR_VIEW = 'author_view',
}

// Event categories
export enum EventCategory {
  ENGAGEMENT = 'engagement',
  CONTENT = 'content',
  NAVIGATION = 'navigation',
  FORM = 'form',
  ERROR = 'error',
  USER = 'user',
  ECOMMERCE = 'ecommerce',
  VIDEO = 'video',
  SEARCH = 'search',
}

// Check if analytics cookies are allowed
export const isAnalyticsAllowed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return isCategoryAllowed(CookieCategory.ANALYTICS);
};

// Initialize Google Analytics with enhanced configuration
export const initializeGA = (): void => {
  if (typeof window === 'undefined' || !isAnalyticsAllowed()) {
    return;
  }

  // Add the gtag script to the document
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize data layer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  // Enhanced configuration
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    send_page_view: false, // We'll handle page views manually for more control
    cookie_domain: 'auto',
    cookie_expires: 63072000, // 2 years in seconds
    custom_map: {
      // Map custom dimensions
      dimension1: CustomDimension.AUTHOR,
      dimension2: CustomDimension.CATEGORY,
      dimension3: CustomDimension.CONTENT_TYPE,
      dimension4: CustomDimension.PUBLISH_DATE,
      dimension5: CustomDimension.WORD_COUNT,
      dimension6: CustomDimension.USER_TYPE,
      dimension7: CustomDimension.LOGGED_IN,
    }
  });
  
  // Set default values for custom dimensions if available
  const userType = getUserType();
  if (userType) {
    setCustomDimension(CustomDimension.USER_TYPE, userType);
    setCustomDimension(CustomDimension.LOGGED_IN, isLoggedIn() ? 'true' : 'false');
  }
};

// Get user type (anonymous, registered, subscriber)
const getUserType = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Check for user in localStorage or session
  // This is a placeholder - implement based on your auth system
  const user = localStorage.getItem('user');
  if (!user) return 'anonymous';
  
  try {
    const userData = JSON.parse(user);
    return userData.subscription ? 'subscriber' : 'registered';
  } catch (e) {
    return 'anonymous';
  }
};

// Check if user is logged in
const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // This is a placeholder - implement based on your auth system
  return !!localStorage.getItem('user');
};

// Set a custom dimension
export const setCustomDimension = (dimension: CustomDimension, value: string): void => {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }
  
  // For GA4, we need to use config to set custom dimensions
  const customParams: Record<string, any> = {};
  customParams[dimension] = value;
  
  window.gtag('config', GA_MEASUREMENT_ID, customParams);
};

// Enhanced page view tracking with additional parameters
export const pageview = (url: string, title?: string, customDimensions?: Record<string, string>) => {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }
  
  // Prepare page view parameters
  const pageViewParams: Record<string, any> = {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  };
  
  // Add any custom dimensions
  if (customDimensions) {
    Object.entries(customDimensions).forEach(([key, value]) => {
      pageViewParams[key] = value;
    });
  }
  
  // Send the page view
  window.gtag('config', GA_MEASUREMENT_ID, pageViewParams);
  
  // Track page load timing
  if (window.performance) {
    const pageLoadTime = Math.round(performance.now());
    event({
      action: 'timing_complete',
      category: EventCategory.ENGAGEMENT,
      label: 'Page Load Time',
      value: pageLoadTime,
      non_interaction: true,
      metric_id: 'page_load_time',
      metric_value: pageLoadTime,
      metric_delta: pageLoadTime,
    });
  }
};

// Enhanced event tracking with additional parameters
export const event = ({ 
  action, 
  category, 
  label, 
  value,
  non_interaction = false,
  ...customParams
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  non_interaction?: boolean;
  [key: string]: any;
}) => {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }
  
  // Prepare event parameters
  const eventParams: Record<string, any> = {
    event_category: category,
    non_interaction: non_interaction,
  };
  
  // Add optional parameters if provided
  if (label) eventParams.event_label = label;
  if (value !== undefined) eventParams.value = value;
  
  // Add any custom parameters
  Object.entries(customParams).forEach(([key, value]) => {
    eventParams[key] = value;
  });
  
  // Send the event
  window.gtag('event', action, eventParams);
};

// Track scroll depth
export const trackScrollDepth = (milestones = [25, 50, 75, 90, 100]) => {
  if (typeof window === 'undefined' || !isAnalyticsAllowed()) {
    return;
  }
  
  let maxScrollPercentage = 0;
  const trackedMilestones = new Set<number>();
  
  const calculateScrollPercentage = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    if (documentHeight <= windowHeight) {
      return 100; // Page is shorter than viewport
    }
    
    const scrollableDistance = documentHeight - windowHeight;
    return Math.round((scrollTop / scrollableDistance) * 100);
  };
  
  const checkScrollMilestones = () => {
    const scrollPercentage = calculateScrollPercentage();
    
    if (scrollPercentage > maxScrollPercentage) {
      maxScrollPercentage = scrollPercentage;
      
      // Check if we've hit any milestones
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          
          // Track the milestone
          event({
            action: EventName.SCROLL_MILESTONE,
            category: EventCategory.ENGAGEMENT,
            label: `Scrolled ${milestone}%`,
            value: milestone,
            non_interaction: true,
            scroll_depth: milestone
          });
        }
      });
    }
  };
  
  // Add scroll event listener
  window.addEventListener('scroll', checkScrollMilestones, { passive: true });
  
  // Also check on page unload to capture final scroll depth
  window.addEventListener('beforeunload', () => {
    checkScrollMilestones();
    
    // Track time on page
    const timeOnPage = Math.round((Date.now() - performance.timing.navigationStart) / 1000);
    event({
      action: EventName.TIME_ON_PAGE,
      category: EventCategory.ENGAGEMENT,
      label: 'Time on Page',
      value: timeOnPage,
      non_interaction: true,
      time_on_page: timeOnPage
    });
  });
};

// Track outbound links
export const trackOutboundLinks = () => {
  if (typeof window === 'undefined' || !isAnalyticsAllowed()) {
    return;
  }
  
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link) return;
    
    const href = link.getAttribute('href') || '';
    const isExternal = href.indexOf('http') === 0 && !href.includes(window.location.hostname);
    
    if (isExternal) {
      event({
        action: EventName.OUTBOUND_LINK,
        category: EventCategory.NAVIGATION,
        label: href,
        non_interaction: false,
        outbound_link: href
      });
    }
  });
};

// Track article views with enhanced data
export const trackArticleView = (article: any) => {
  if (!article || !isAnalyticsAllowed()) return;
  
  // Extract article data
  const {
    title,
    slug,
    author,
    categories = [],
    publishedAt,
    body
  } = article;
  
  // Calculate word count if body is available
  let wordCount = 0;
  if (body && Array.isArray(body)) {
    // This assumes body is an array of blocks with text content
    // Adjust based on your actual content structure
    wordCount = body.reduce((count, block) => {
      if (block.children && Array.isArray(block.children)) {
        return count + block.children.reduce((textCount: number, child: any) => {
          if (child.text) {
            return textCount + child.text.split(/\s+/).length;
          }
          return textCount;
        }, 0);
      }
      return count;
    }, 0);
  }
  
  // Set custom dimensions
  const customDimensions: Record<string, string> = {};
  
  if (author?.name) {
    customDimensions[CustomDimension.AUTHOR] = author.name;
  }
  
  if (categories.length > 0) {
    customDimensions[CustomDimension.CATEGORY] = categories[0].title;
  }
  
  customDimensions[CustomDimension.CONTENT_TYPE] = 'article';
  
  if (publishedAt) {
    const publishDate = new Date(publishedAt);
    customDimensions[CustomDimension.PUBLISH_DATE] = publishDate.toISOString().split('T')[0];
  }
  
  if (wordCount > 0) {
    customDimensions[CustomDimension.WORD_COUNT] = wordCount.toString();
  }
  
  // Track the article view
  event({
    action: EventName.ARTICLE_VIEW,
    category: EventCategory.CONTENT,
    label: title,
    non_interaction: true,
    article_id: slug?.current,
    article_title: title,
    article_author: author?.name,
    article_category: categories.length > 0 ? categories[0].title : 'Uncategorized',
    article_publish_date: publishedAt,
    article_word_count: wordCount,
    ...customDimensions
  });
  
  // Start tracking scroll depth for this article
  trackScrollDepth();
  
  // Track outbound links
  trackOutboundLinks();
};

// Type definitions for gtag are in src/types/gtag.d.ts
