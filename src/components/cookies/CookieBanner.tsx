"use client";

import React from 'react';
import Link from 'next/link';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const { hasConsented, acceptAll, acceptEssential } = useCookieConsent();

  // Don't show the banner if the user has already given consent
  if (hasConsented) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              This website uses cookies to enhance user experience and to analyze performance and traffic on our website. 
              We also share information about your use of our site with our social media, advertising and analytics partners. 
              For more information, please see our{' '}
              <Link href="/privacy-policy" className="text-vpn-blue hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              onClick={acceptEssential}
              variant="outline"
              className="text-sm whitespace-nowrap"
            >
              Essential Only
            </Button>
            <Button
              onClick={acceptAll}
              className="bg-vpn-blue hover:bg-vpn-blue/90 text-white text-sm whitespace-nowrap"
            >
              Accept All
            </Button>
            <Link href="/cookie-settings" passHref>
              <Button
                variant="ghost"
                className="text-sm whitespace-nowrap"
              >
                Manage Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
