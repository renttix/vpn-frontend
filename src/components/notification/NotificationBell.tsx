"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  getNotificationPermission, 
  unsubscribeFromPushNotifications,
  registerServiceWorker,
  subscribeToPushNotifications,
  getSubscription,
  NOTIFICATIONS_ENABLED
} from '@/lib/notification';
import Portal from "@/components/ui/Portal";

export default function NotificationBell() {
  // Don't render the bell if notifications are disabled
  if (!NOTIFICATIONS_ENABLED) {
    return null;
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check notification status on mount - only on client side
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined') return;
    
    const checkNotificationStatus = async () => {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        setPermissionState('unsupported');
        return;
      }

      // Get the current permission state
      const permission = getNotificationPermission();
      setPermissionState(permission);

      // If permission is granted, check if subscribed
      if (permission === 'granted') {
        const subscription = await getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    checkNotificationStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      // Unsubscribe from notifications
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsSubscribed(false);
      }
    } else {
      // Subscribe to notifications
      const registration = await registerServiceWorker();
      if (registration) {
        const subscription = await subscribeToPushNotifications(registration);
        setIsSubscribed(!!subscription);
      }
    }
  };

  // Don't render if notifications are not supported
  // During SSR, we'll render the component, but it will update once mounted on client
  if (typeof window !== 'undefined' && permissionState === 'unsupported') {
    return null;
  }

  // Create unique IDs for ARIA relationships
  const notificationBellId = "notification-bell";
  const notificationMenuId = "notification-menu";
  const notificationStatusId = "notification-status";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        id={notificationBellId}
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-vpn-blue dark:focus:ring-blue-400 transition-colors relative"
        aria-label="Notification settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={notificationMenuId}
        aria-describedby={notificationStatusId}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-vpn-gray dark:text-vpn-gray-dark"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Notification status indicator */}
        {isSubscribed && (
          <span 
            className="absolute top-1 right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
            aria-hidden="true"
          ></span>
        )}
      </button>

      {/* Hidden status for screen readers */}
      <span id={notificationStatusId} className="sr-only">
        {permissionState === 'denied' 
          ? "Notifications are blocked in your browser settings." 
          : isSubscribed 
            ? "Notifications are enabled. You will receive updates when new articles are published." 
            : "Notifications are disabled. Enable them to receive updates."}
      </span>

      {/* Dropdown Menu */}
      {isOpen && (
        <Portal>
          <div 
            id={notificationMenuId}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 z-999"
            role="dialog"
            aria-labelledby="notification-settings-title"
            aria-modal="true"
          >
            <div className="p-4">
              <h3 
                id="notification-settings-title"
                className="text-lg font-bold text-vpn-gray dark:text-vpn-gray-dark mb-3"
              >
                Notification Settings
              </h3>
              
              {permissionState === 'denied' ? (
                <div 
                  className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                  role="alert"
                >
                  <p className="mb-2">
                    Notifications are blocked. Please update your browser settings to enable notifications.
                  </p>
                  <a 
                    href="https://support.google.com/chrome/answer/3220216?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-vpn-blue dark:text-blue-400 hover:underline"
                  >
                    Learn how to enable notifications
                  </a>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="text-sm text-gray-600 dark:text-gray-400" 
                      id="notification-toggle-label"
                    >
                      Article notifications
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isSubscribed}
                        onChange={handleToggleNotifications}
                        disabled={permissionState !== 'granted'}
                        aria-labelledby="notification-toggle-label"
                        aria-describedby="notification-toggle-description"
                      />
                      <div 
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-vpn-blue dark:peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-vpn-blue"
                        role="switch"
                        aria-checked={isSubscribed}
                      ></div>
                    </label>
                  </div>
                  <p 
                    className="text-xs text-gray-500 dark:text-gray-400" 
                    id="notification-toggle-description"
                  >
                    {isSubscribed 
                      ? "You'll receive notifications when new articles are published." 
                      : "Enable notifications to stay updated with the latest news."}
                  </p>
                </>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
