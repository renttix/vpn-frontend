"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function CookieSettingsClient() {
  const { consent, updateConsent, acceptAll } = useCookieConsent();
  
  // Local state for form
  const [formState, setFormState] = useState({
    analytics: false,
    marketing: false,
    preferences: false,
  });
  
  // Initialize form state from consent
  useEffect(() => {
    setFormState({
      analytics: consent.analytics,
      marketing: consent.marketing,
      preferences: consent.preferences,
    });
  }, [consent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConsent(formState);
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Handle switch toggle
  const handleToggle = (category: keyof typeof formState) => {
    setFormState(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark mb-6">
          Cookie Settings
        </h1>
        
        {showSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-6">
            <p className="text-green-700 dark:text-green-400">
              Your cookie preferences have been saved.
            </p>
          </div>
        )}
        
        <div className="prose dark:prose-invert max-w-none mb-8">
          <p>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. You can manage your cookie preferences here.
          </p>
          <p>
            For more information about how we use cookies and your personal data, please read our{' '}
            <Link href="/privacy-policy" className="text-vpn-blue hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Essential Cookies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Essential Cookies</h3>
              <Switch checked={true} disabled />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These cookies are necessary for the website to function and cannot be switched off. 
              They are usually only set in response to actions made by you which amount to a request for services, 
              such as setting your privacy preferences, logging in or filling in forms.
            </p>
          </div>
          
          {/* Analytics Cookies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Analytics Cookies</h3>
              <Switch 
                checked={formState.analytics} 
                onCheckedChange={() => handleToggle('analytics')} 
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
              They help us to know which pages are the most and least popular and see how visitors move around the site.
            </p>
          </div>
          
          {/* Marketing Cookies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Marketing Cookies</h3>
              <Switch 
                checked={formState.marketing} 
                onCheckedChange={() => handleToggle('marketing')} 
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These cookies may be set through our site by our advertising partners. 
              They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
            </p>
          </div>
          
          {/* Preferences Cookies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Preferences Cookies</h3>
              <Switch 
                checked={formState.preferences} 
                onCheckedChange={() => handleToggle('preferences')} 
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These cookies enable the website to provide enhanced functionality and personalisation. 
              They may be set by us or by third party providers whose services we have added to our pages.
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormState({
                  analytics: false,
                  marketing: false,
                  preferences: false,
                });
              }}
            >
              Reject All
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={acceptAll}
            >
              Accept All
            </Button>
            <Button
              type="submit"
              className="bg-vpn-blue hover:bg-vpn-blue/90 text-white"
            >
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
