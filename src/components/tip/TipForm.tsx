"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TipDisclaimer from "./TipDisclaimer";
import TipThankYou from "./TipThankYou";
import { useGoogleReCaptcha } from "@/hooks/useGoogleReCaptcha";

// Form state type
interface FormData {
  email: string;
  subject: string;
  description: string;
  attachments: File[];
}

// Form state enum
enum FormState {
  DISCLAIMER,
  FORM,
  SUBMITTING,
  THANK_YOU,
  ERROR
}

export default function TipForm() {
  // Form state
  const [formState, setFormState] = useState<FormState>(FormState.DISCLAIMER);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    subject: "",
    description: "",
    attachments: []
  });
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recaptchaContainerId = "tip-recaptcha-container";
  const { setContainer, getRecaptchaToken, resetRecaptcha } = useGoogleReCaptcha();
  
  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    // Set the container for reCAPTCHA
    setContainer(recaptchaContainerId);
  }, [setContainer]);

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = () => {
    setFormState(FormState.FORM);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...filesArray] }));
    }
  };

  // Remove a file from attachments
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
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
      submissionData.append("email", formData.email);
      submissionData.append("subject", formData.subject);
      submissionData.append("description", formData.description);
      submissionData.append("recaptchaToken", tokenToUse);
      submissionData.append("recaptchaVersion", "v2");
      
      // Append files
      formData.attachments.forEach((file, index) => {
        submissionData.append(`attachment_${index}`, file);
      });

      // Submit form
      const response = await fetch("/api/submit-tip", {
        method: "POST",
        body: submissionData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit tip");
      }

      // Show thank you message
      setFormState(FormState.THANK_YOU);
    } catch (err) {
      console.error("Error submitting tip:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setFormState(FormState.ERROR);
      resetRecaptcha();
    }
  };

  // Retry submission after error
  const handleRetry = () => {
    setFormState(FormState.FORM);
    setError("");
  };

  // Render based on form state
  if (formState === FormState.DISCLAIMER) {
    return <TipDisclaimer onAccept={handleDisclaimerAccept} />;
  }

  if (formState === FormState.THANK_YOU) {
    return <TipThankYou />;
  }

  if (formState === FormState.ERROR) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          Error Submitting Tip/Story
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-roboto font-bold text-vpn-gray dark:text-gray-100 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
        Submit a Tip/Story
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Your email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
            placeholder="Brief summary of your tip"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded">
            {/* Editor toolbar - simplified version */}
            <div className="flex items-center p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
                </svg>
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
                </svg>
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                </svg>
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2V2zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z"/>
                </svg>
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                  <path d="M6 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border-0 dark:bg-gray-700 dark:text-white text-sm min-h-[200px]"
              placeholder="Please provide detailed information about your tip..."
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Attachments (optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 dark:text-gray-300">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-vpn-blue hover:text-vpn-blue/90 focus-within:outline-none"
                >
                  <span className="px-2">Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, PDF, DOC up to 10MB each
              </p>
            </div>
          </div>

          {/* File list */}
          {formData.attachments.length > 0 && (
            <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
              {formData.attachments.map((file, index) => (
                <li key={index} className="py-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* reCAPTCHA container */}
        <div className="flex justify-center my-4">
          <div id={recaptchaContainerId}></div>
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
              "Submit Tip/Story"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
