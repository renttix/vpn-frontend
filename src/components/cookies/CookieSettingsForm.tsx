"use client";

import React, { useState, useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CookieCategory } from '@/lib/cookies';

export default function CookieSettingsForm() {
  const { consent, updateConsent } = useCookieConsent();
  
  // Local state for form values
  const [formValues, setFormValues] = useState({
    analytics: false,
    marketing: false,
    preferences: false
  });
  
  // Initialize form values from consent
  useEffect(() => {
    setFormValues({
      analytics: consent.analytics,
      marketing: consent.marketing,
      preferences: consent.preferences
    });
  }, [consent]);
  
  // Handle toggle changes
  const handleToggle = (category: keyof typeof formValues) => {
    setFormValues(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update consent with form values
    updateConsent({
      analytics: formValues.analytics,
      marketing: formValues.marketing,
      preferences: formValues.preferences
    });
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Accept all cookies
  const handleAcceptAll = () => {
    setFormValues({
      analytics: true,
      marketing: true,
      preferences: true
    });
    
    // Submit the form
    updateConsent({
      analytics: true,
      marketing: true,
      preferences: true
    });
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Essential Cookies - Always enabled */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-body font-medium text-vpn-gray dark:text-white">Essential Cookies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Required for the website to function</p>
        </div>
        <Switch checked={true} disabled={true} />
      </div>
      
      {/* Analytics Cookies */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-body font-medium text-vpn-gray dark:text-white">Analytics Cookies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Help us improve our website by collecting anonymous usage data</p>
        </div>
        <Switch 
          checked={formValues.analytics} 
          onCheckedChange={() => handleToggle('analytics')} 
          id="analytics-toggle"
        />
      </div>
      
      {/* Marketing Cookies */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-body font-medium text-vpn-gray dark:text-white">Marketing Cookies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Allow us to provide personalized advertisements</p>
        </div>
        <Switch 
          checked={formValues.marketing} 
          onCheckedChange={() => handleToggle('marketing')} 
          id="marketing-toggle"
        />
      </div>
      
      {/* Preferences Cookies */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-body font-medium text-vpn-gray dark:text-white">Preferences Cookies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Remember your settings and preferences</p>
        </div>
        <Switch 
          checked={formValues.preferences} 
          onCheckedChange={() => handleToggle('preferences')} 
          id="preferences-toggle"
        />
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-3 rounded-md">
          Your cookie preferences have been saved successfully.
        </div>
      )}
      
      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          className="bg-vpn-blue hover:bg-vpn-blue/90 text-white"
        >
          Save Preferences
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAcceptAll}
        >
          Accept All Cookies
        </Button>
      </div>
    </form>
  );
}
