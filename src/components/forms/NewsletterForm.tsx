"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleReCaptcha } from "@/hooks/useGoogleReCaptcha";
import { storeUserEmail } from "@/lib/userIdentification";

// Form state type
interface FormData {
  email: string;
  firstName?: string;
  lastName?: string;
  newsletterFrequency: string;
  contentCategories: string[];
}

// Form state enum
enum FormState {
  FORM,
  SUBMITTING,
  SUCCESS,
  ERROR
}

interface NewsletterFormProps {
  title?: string;
  subtitle?: string;
  successMessage?: string;
  className?: string;
  compact?: boolean;
}

export default function NewsletterForm({
  title = 'Subscribe to Our Newsletter',
  subtitle = 'Stay updated with the latest news and articles.',
  successMessage = 'Thank you for subscribing to our newsletter!',
  className = '',
  compact = false
}: NewsletterFormProps) {
  // Form state
  const [formState, setFormState] = useState<FormState>(FormState.FORM);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    newsletterFrequency: "weekly", // Default to weekly
    contentCategories: [] // Empty array by default
  });
  const [error, setError] = useState<string>("");
  const recaptchaContainerId = "newsletter-recaptcha-container";
  const { setContainer, getRecaptchaToken, resetRecaptcha } = useGoogleReCaptcha();

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    // Set the container for reCAPTCHA
    setContainer(recaptchaContainerId);
  }, [setContainer]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update the form data with the input value
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(FormState.SUBMITTING);
    setError("");

    try {
      // Get reCAPTCHA token
      const recaptchaToken = getRecaptchaToken();
      
      // In development mode, allow empty tokens for testing
      if (!recaptchaToken && process.env.NODE_ENV === 'production') {
        throw new Error("Please complete the reCAPTCHA verification");
      }
      
      // Use a fallback token in development if needed
      const tokenToUse = recaptchaToken || (process.env.NODE_ENV !== 'production' ? 'dev-token' : '');

      // Create form data for submission
      const submissionData = new FormData();
      
      // Add form type
      submissionData.append("formType", "newsletter");
      
      // Add form fields with correct HubSpot field names
      if (formData.firstName) submissionData.append('firstname', formData.firstName);
      if (formData.lastName) submissionData.append('lastname', formData.lastName);
      if (formData.email) submissionData.append('email', formData.email);
      if (formData.newsletterFrequency) submissionData.append('newsletterFrequency', formData.newsletterFrequency);
      
      // Add content categories as a comma-separated string
      if (formData.contentCategories.length > 0) {
        submissionData.append('contentCategories', formData.contentCategories.join(','));
      }
      
      // Add reCAPTCHA token
      submissionData.append("recaptchaToken", tokenToUse);
      submissionData.append("recaptchaVersion", "v2");

      // Submit form to HubSpot API
      const response = await fetch("/api/hubspot", {
        method: "POST",
        body: submissionData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to subscribe");
      }

      // Store user email for tracking
      storeUserEmail(formData.email);
      
      // Show success message
      setFormState(FormState.SUCCESS);
    } catch (err) {
      console.error("Error subscribing to newsletter:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setFormState(FormState.ERROR);
      
      // Reset reCAPTCHA on error
      resetRecaptcha();
    }
  };

  // Retry submission after error
  const handleRetry = () => {
    setFormState(FormState.FORM);
    setError("");
    resetRecaptcha();
  };

  // Reset form after success
  const handleReset = () => {
    setFormState(FormState.FORM);
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      newsletterFrequency: "weekly",
      contentCategories: []
    });
    resetRecaptcha();
  };

  if (formState === FormState.SUCCESS) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          Subscription Successful
        </h2>
        <p className="mb-4">{successMessage}</p>
        <Button 
          onClick={handleReset}
          className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium"
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  if (formState === FormState.ERROR) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          Subscription Error
        </h2>
        <p className="mb-4">{error}</p>
        <Button 
          onClick={handleRetry}
          className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Compact form (just email field)
  if (compact) {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-xl font-bold text-vpn-gray dark:text-gray-100 mb-2">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-sm text-vpn-gray dark:text-gray-300 mb-4">
            {subtitle}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="Your email address"
          />
          
          <Button
            type="submit"
            disabled={formState === FormState.SUBMITTING}
            className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium"
          >
            {formState === FormState.SUBMITTING ? (
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
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
        
        <p className="text-xs text-vpn-gray dark:text-vpn-gray-dark/80 mt-2">
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="text-vpn-blue hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    );
  }

  // Full form with name fields
  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-vpn-gray dark:text-gray-100 mb-2">
          {title}
        </h2>
      )}
      
      {subtitle && (
        <p className="text-vpn-gray dark:text-gray-300 mb-6">
          {subtitle}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name (optional)
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name (optional)
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="john.doe@example.com"
          />
        </div>

        {/* Newsletter Frequency */}
        <div>
          <label htmlFor="newsletterFrequency" className="block text-sm font-medium mb-1">
            Newsletter Frequency
          </label>
          <select
            id="newsletterFrequency"
            name="newsletterFrequency"
            value={formData.newsletterFrequency}
            onChange={(e) => setFormData(prev => ({ ...prev, newsletterFrequency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
          >
            <option value="daily">Daily - Get the latest news every day</option>
            <option value="weekly">Weekly - A summary of the week's top stories</option>
            <option value="monthly">Monthly - Our best content from the month</option>
            <option value="breaking">Breaking News Only - Just the major stories</option>
          </select>
        </div>

        {/* Content Categories */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Content Categories (Select all that interest you)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['breaking', 'politics', 'technology', 'business', 'health', 'science', 'entertainment', 'sports', 'opinion'].map(category => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  name={`category-${category}`}
                  checked={formData.contentCategories.includes(category)}
                  onChange={(e) => {
                    const updatedCategories = e.target.checked
                      ? [...formData.contentCategories, category]
                      : formData.contentCategories.filter(c => c !== category);
                    setFormData(prev => ({ ...prev, contentCategories: updatedCategories }));
                  }}
                  className="mr-2 h-4 w-4 text-vpn-blue focus:ring-vpn-blue border-gray-300 rounded"
                />
                <label htmlFor={`category-${category}`} className="text-sm text-vpn-gray dark:text-vpn-gray-dark/80">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* reCAPTCHA container */}
        <div className="flex justify-center my-4">
          <div id={recaptchaContainerId}></div>
        </div>

        {/* Privacy Policy */}
        <div className="text-sm text-vpn-gray dark:text-vpn-gray-dark/80">
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="text-vpn-blue hover:underline">
            Privacy Policy
          </a>
          . We'll send you our newsletter and occasional updates about our services.
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={formState === FormState.SUBMITTING}
            className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium px-8 py-2"
          >
            {formState === FormState.SUBMITTING ? (
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
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
