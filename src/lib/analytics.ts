import { CookieCategory, isCategoryAllowed } from './cookies';

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = 'G-SSXX53P5T4';

// Check if analytics cookies are allowed
export const isAnalyticsAllowed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return isCategoryAllowed(CookieCategory.ANALYTICS);
};

// Initialize Google Analytics
export const initializeGA = (): void => {
  if (typeof window === 'undefined' || !isAnalyticsAllowed()) {
    return;
  }

  // Add the gtag script to the document
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  // Basic configuration
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
};

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Event tracking
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsAllowed()) {
    return;
  }
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Type definitions for gtag are in src/types/gtag.d.ts
