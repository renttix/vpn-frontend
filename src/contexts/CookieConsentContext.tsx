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
  };

  // Accept only essential cookies
  const acceptEssential = () => {
    const updatedConsent = acceptEssentialCookies();
    setConsent(updatedConsent);
    setHasConsented(true);
  };

  // Update specific cookie categories
  const updateConsent = (categories: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>) => {
    const updatedConsent = updateCookieConsent(categories);
    setConsent(updatedConsent);
    setHasConsented(true);
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
