"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CookieConsent,
  CookieCategory,
  defaultConsent,
  loadConsent,
  saveConsent,
  acceptAllCookies,
  acceptEssentialCookies,
  updateCookieConsent,
  hasConsentBeenGiven
} from '@/lib/cookies';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

// Context interface
interface CookieConsentContextType {
  consent: CookieConsent;
  hasConsented: boolean;
  acceptAll: () => void;
  acceptEssential: () => void;
  updateConsent: (categories: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>) => void;
  isCategoryAllowed: (category: CookieCategory) => boolean;
}

// Create context with default values
const CookieConsentContext = createContext<CookieConsentContextType>({
  consent: defaultConsent,
  hasConsented: false,
  acceptAll: () => {},
  acceptEssential: () => {},
  updateConsent: () => {},
  isCategoryAllowed: () => false
});

// Provider props
interface CookieConsentProviderProps {
  children: ReactNode;
}

// Provider component
export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Initialize on client-side only
  useEffect(() => {
    setIsClient(true);
    const initialConsent = loadConsent();
    setConsent(initialConsent);
    setHasConsented(hasConsentBeenGiven());
  }, []);

  // Accept all cookies
  const acceptAll = () => {
    const updatedConsent = acceptAllCookies();
    setConsent(updatedConsent);
    setHasConsented(true);
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        personalization_storage: 'granted'
      });
    }
  };

  // Accept only essential cookies
  const acceptEssential = () => {
    const updatedConsent = acceptEssentialCookies();
    setConsent(updatedConsent);
    setHasConsented(true);
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        personalization_storage: 'denied'
      });
    }
  };

  // Update specific cookie categories
  const updateConsent = (categories: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>) => {
    const updatedConsent = updateCookieConsent(categories);
    setConsent(updatedConsent);
    setHasConsented(true);
    
    // Update Google Analytics consent based on analytics category
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: categories.analytics ? 'granted' : 'denied',
        ad_storage: categories.marketing ? 'granted' : 'denied',
        personalization_storage: categories.preferences ? 'granted' : 'denied'
      });
    }
  };

  // Check if a specific cookie category is allowed
  const isCategoryAllowed = (category: CookieCategory): boolean => {
    if (category === CookieCategory.ESSENTIAL) {
      return true; // Essential cookies are always allowed
    }
    
    switch (category) {
      case CookieCategory.ANALYTICS:
        return consent.analytics;
      case CookieCategory.MARKETING:
        return consent.marketing;
      case CookieCategory.PREFERENCES:
        return consent.preferences;
      default:
        return false;
    }
  };

  // Initialize Google Analytics consent mode
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.gtag) {
      // Set default consent before GA loads
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      
      // Initialize consent mode with default settings
      gtag('consent', 'default', {
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'personalization_storage': consent.preferences ? 'granted' : 'denied',
        'wait_for_update': 500 // Wait for user input for up to 500ms
      });
      
      // Initialize GA with consent mode
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        'anonymize_ip': true
      });
    }
  }, [consent.analytics, consent.marketing, consent.preferences]);

  // Context value
  const value = {
    consent,
    hasConsented,
    acceptAll,
    acceptEssential,
    updateConsent,
    isCategoryAllowed
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

// Custom hook to use the cookie consent context
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  
  return context;
}
