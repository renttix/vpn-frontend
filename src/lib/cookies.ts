// Cookie management utilities

// Cookie categories
export enum CookieCategory {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PREFERENCES = 'preferences'
}

// Cookie consent preferences
export interface CookieConsent {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number; // When consent was last updated
}

// Default consent (only essential cookies)
export const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now()
};

// Local storage key for cookie consent
const CONSENT_STORAGE_KEY = 'vpn-cookie-consent';

// Save consent to localStorage
export function saveConsent(consent: CookieConsent): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  }
}

// Load consent from localStorage
export function loadConsent(): CookieConsent {
  if (typeof window === 'undefined') {
    return defaultConsent;
  }

  try {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      return defaultConsent;
    }

    const parsedConsent = JSON.parse(storedConsent) as Partial<CookieConsent>;
    
    // Ensure all fields are present
    return {
      essential: true, // Always true
      analytics: parsedConsent.analytics ?? false,
      marketing: parsedConsent.marketing ?? false,
      preferences: parsedConsent.preferences ?? false,
      timestamp: parsedConsent.timestamp ?? Date.now()
    };
  } catch (error) {
    console.error('Error loading cookie consent:', error);
    return defaultConsent;
  }
}

// Accept all cookies
export function acceptAllCookies(): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    analytics: true,
    marketing: true,
    preferences: true,
    timestamp: Date.now()
  };
  saveConsent(consent);
  return consent;
}

// Accept only essential cookies
export function acceptEssentialCookies(): CookieConsent {
  const consent: CookieConsent = {
    ...defaultConsent,
    timestamp: Date.now()
  };
  saveConsent(consent);
  return consent;
}

// Update specific cookie categories
export function updateCookieConsent(categories: Partial<Omit<CookieConsent, 'essential' | 'timestamp'>>): CookieConsent {
  const currentConsent = loadConsent();
  const updatedConsent: CookieConsent = {
    ...currentConsent,
    ...categories,
    essential: true, // Always true
    timestamp: Date.now()
  };
  saveConsent(updatedConsent);
  return updatedConsent;
}

// Check if a specific cookie category is allowed
export function isCategoryAllowed(category: CookieCategory): boolean {
  const consent = loadConsent();
  
  switch (category) {
    case CookieCategory.ESSENTIAL:
      return true; // Always allowed
    case CookieCategory.ANALYTICS:
      return consent.analytics;
    case CookieCategory.MARKETING:
      return consent.marketing;
    case CookieCategory.PREFERENCES:
      return consent.preferences;
    default:
      return false;
  }
}

// Check if consent has been given (any choice made)
export function hasConsentBeenGiven(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
}

// Set a cookie with the given name, value, and expiration days
export function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Get a cookie by name
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  
  return null;
}

// Delete a cookie by name
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}
