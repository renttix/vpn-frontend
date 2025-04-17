"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleReCaptcha } from "@/hooks/useGoogleReCaptcha";
import { storeUserEmail } from "@/lib/userIdentification";

// Form state type
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

// Form state enum
enum FormState {
  FORM,
  SUBMITTING,
  SUCCESS,
  ERROR
}

interface ContactFormProps {
  formType?: 'contact' | 'enquiry' | 'newsletter';
  title?: string;
  subtitle?: string;
  successMessage?: string;
  className?: string;
}

export default function ContactForm({
  formType = 'contact',
  title = 'Contact Us',
  subtitle = 'Fill out the form below and we\'ll get back to you as soon as possible.',
  successMessage = 'Thank you for your message. We\'ll be in touch shortly.',
  className = ''
}: ContactFormProps) {
  // Form state
  const [formState, setFormState] = useState<FormState>(FormState.FORM);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [error, setError] = useState<string>("");
  const recaptchaContainerId = "recaptcha-container";
  const { setContainer, getRecaptchaToken, resetRecaptcha } = useGoogleReCaptcha();

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    // Set the container for reCAPTCHA
    setContainer(recaptchaContainerId);
  }, [setContainer]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      submissionData.append("formType", formType);
      
      // Add form fields with correct HubSpot field names
      if (formData.firstName) submissionData.append('firstname', formData.firstName);
      if (formData.lastName) submissionData.append('lastname', formData.lastName);
      if (formData.email) submissionData.append('email', formData.email);
      if (formData.phone) submissionData.append('phone', formData.phone);
      if (formData.company) submissionData.append('company', formData.company);
      if (formData.message) submissionData.append('message', formData.message);
      
      // Add reCAPTCHA token and version
      submissionData.append("recaptchaToken", tokenToUse);
      submissionData.append("recaptchaVersion", "v2");

      // Submit form to HubSpot API
      const response = await fetch("/api/hubspot", {
        method: "POST",
        body: submissionData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      // Store user email for tracking
      storeUserEmail(formData.email);
      
      // Show success message
      setFormState(FormState.SUCCESS);
    } catch (err) {
      console.error("Error submitting form:", err);
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
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      message: ""
    });
    resetRecaptcha();
  };

  if (formState === FormState.SUCCESS) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          Message Sent Successfully
        </h2>
        <p className="mb-4">{successMessage}</p>
        <Button 
          onClick={handleReset}
          className="bg-vpn-blue hover:bg-vpn-blue/90 dark:bg-vpn-blue dark:hover:bg-vpn-blue/90 text-white font-medium"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  if (formState === FormState.ERROR) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          Error Submitting Form
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

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      {title && (
        <h1 className="text-3xl font-roboto font-bold text-vpn-gray dark:text-gray-100 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {title}
        </h1>
      )}
      
      {subtitle && (
        <p className="text-vpn-gray dark:text-gray-300 mb-6">
          {subtitle}
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields - Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
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

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="+44 123 456 7890"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company (optional)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="Your Company Ltd"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Message*
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm min-h-[150px]"
            placeholder="Please provide details about your enquiry..."
          />
        </div>

        {/* reCAPTCHA container */}
        <div className="flex justify-center my-4">
          <div id={recaptchaContainerId}></div>
        </div>

        {/* Privacy Policy */}
        <div className="text-sm text-vpn-gray dark:text-vpn-gray-dark/80">
          By submitting this form, you agree to our{' '}
          <a href="/privacy-policy" className="text-vpn-blue hover:underline">
            Privacy Policy
          </a>
          . We'll use your information to respond to your enquiry and may contact you about our products and services.
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
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
