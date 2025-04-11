"use client";

import { useState, useEffect } from 'react';
import { 
  isPushNotificationSupported, 
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  NOTIFICATIONS_ENABLED
} from '@/lib/notifications';

interface NotificationBannerProps {
  className?: string;
}

export default function NotificationBanner({ className = '' }: NotificationBannerProps) {
  // Don't render the banner if notifications are disabled
  if (!NOTIFICATIONS_ENABLED) {
    return null;
  }
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bannerState, setBannerState] = useState<'initial' | 'success' | 'error'>('initial');
  
  // Check if we should show the banner
  useEffect(() => {
    // Don't show the banner if notifications are not supported
    if (!isPushNotificationSupported()) {
      return;
    }
    
    // Get the current permission state
    const permission = getNotificationPermission();
    
    // Only show the banner if permission is not granted or denied
    if (permission === 'default') {
      // Check if we've shown the banner before
      const hasShownBanner = localStorage.getItem('notification-banner-shown');
      
      // Only show the banner if we haven't shown it before
      if (!hasShownBanner) {
        // Wait a bit before showing the banner
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 5000); // Show after 5 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, []);
  
  // Handle subscribing to notifications
  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      // Request permission
      const permissionGranted = await requestNotificationPermission();
      
      if (permissionGranted) {
        // Register service worker
        const registration = await registerServiceWorker();
        
        if (registration) {
          // Subscribe to push notifications
          const subscription = await subscribeToPushNotifications(registration);
          
          if (subscription) {
            // Success!
            setBannerState('success');
            
            // Hide the banner after a delay
            setTimeout(() => {
              setIsVisible(false);
            }, 3000);
          } else {
            // Error subscribing
            setBannerState('error');
          }
        } else {
          // Error registering service worker
          setBannerState('error');
        }
      } else {
        // Permission denied
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setBannerState('error');
    } finally {
      setIsLoading(false);
      
      // Mark the banner as shown
      localStorage.setItem('notification-banner-shown', 'true');
    }
  };
  
  // Handle dismissing the banner
  const handleDismiss = () => {
    setIsVisible(false);
    
    // Mark the banner as shown
    localStorage.setItem('notification-banner-shown', 'true');
  };
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-4 right-4 max-w-md z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4">
        {bannerState === 'initial' && (
          <>
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-vpn-blue dark:text-blue-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Stay Updated
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get notified when we publish new articles. You can unsubscribe at any time.
                </p>
                <div className="mt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-vpn-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vpn-blue'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg 
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          ></circle>
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Enable Notifications'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vpn-blue dark:focus:ring-blue-400"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vpn-blue dark:focus:ring-blue-400"
                  onClick={handleDismiss}
                >
                  <span className="sr-only">Close</span>
                  <svg 
                    className="h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
        
        {bannerState === 'success' && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 text-green-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notifications enabled!
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You'll now receive notifications when we publish new articles.
              </p>
            </div>
          </div>
        )}
        
        {bannerState === 'error' && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 text-red-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We couldn't enable notifications. Please try again later.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-vpn-blue dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vpn-blue dark:focus:ring-blue-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
