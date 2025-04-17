import { useState, useEffect, useRef, useCallback } from 'react';

// Define the window interface to include the recaptcha object for V2
declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void;
      render: (container: string | HTMLElement, parameters: any) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoaded?: () => void;
  }
}

// The site key should be stored in environment variables
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

// Map to track initialized containers
const initializedContainers = new Map<string, boolean>();

export function useGoogleReCaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetIdRef = useRef<number | null>(null);
  const containerRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Function to initialize reCAPTCHA once the script is loaded
  const initializeReCaptcha = useCallback(() => {
    if (!window.grecaptcha || !containerRef.current) return;
    
    // Check if this container has already been initialized
    if (initializedContainers.get(containerRef.current) || isInitializedRef.current) {
      console.log('reCAPTCHA already initialized for this container');
      setIsLoaded(true);
      return;
    }
    
    try {
      // Render the reCAPTCHA widget
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        'sitekey': RECAPTCHA_SITE_KEY,
        'size': 'normal',
        'theme': 'light',
        'callback': () => {
          // This callback is triggered when the user completes the reCAPTCHA
          console.log('reCAPTCHA completed');
        }
      });
      
      // Mark this container as initialized
      if (containerRef.current) {
        initializedContainers.set(containerRef.current, true);
        isInitializedRef.current = true;
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      // If we get the "already rendered" error, mark as initialized anyway
      if (error instanceof Error && error.message.includes('already been rendered')) {
        if (containerRef.current) {
          initializedContainers.set(containerRef.current, true);
          isInitializedRef.current = true;
        }
        setIsLoaded(true);
      }
    }
  }, []);

  // Load reCAPTCHA script
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Define callback for when the script loads
    window.onRecaptchaLoaded = () => {
      if (containerRef.current) {
        initializeReCaptcha();
      }
    };

    // If reCAPTCHA script is already loaded
    if (window.grecaptcha) {
      if (containerRef.current && !isInitializedRef.current) {
        initializeReCaptcha();
      } else {
        setIsLoaded(true);
      }
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      // Script already exists, just wait for it to load
      if (window.grecaptcha) {
        if (containerRef.current && !isInitializedRef.current) {
          initializeReCaptcha();
        } else {
          setIsLoaded(true);
        }
      }
      return;
    }

    // Load the reCAPTCHA script for V2
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
    script.async = true;
    script.defer = true;
    script.id = 'recaptcha-script';
    
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount as it might be used by other components
      // Just clean up our callback
      window.onRecaptchaLoaded = undefined;
    };
  }, [initializeReCaptcha]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up this instance's state
      if (containerRef.current) {
        // We don't remove from initializedContainers here because the DOM element might still have reCAPTCHA
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Function to get the reCAPTCHA response token
  const getRecaptchaToken = (): string => {
    if (!isLoaded || !window.grecaptcha || widgetIdRef.current === null) {
      console.warn('reCAPTCHA not loaded yet');
      return '';
    }

    try {
      return window.grecaptcha.getResponse(widgetIdRef.current) || '';
    } catch (error) {
      console.error('Error getting reCAPTCHA response:', error);
      return '';
    }
  };

  // Function to reset the reCAPTCHA widget
  const resetRecaptcha = () => {
    if (!isLoaded || !window.grecaptcha || widgetIdRef.current === null) return;
    
    try {
      window.grecaptcha.reset(widgetIdRef.current);
    } catch (error) {
      console.error('Error resetting reCAPTCHA:', error);
    }
  };

  // Function to set the container reference
  const setContainer = (containerId: string) => {
    // If this is the same container, don't reinitialize
    if (containerRef.current === containerId && isInitializedRef.current) {
      return;
    }
    
    containerRef.current = containerId;
    
    // If grecaptcha is already loaded and this container isn't initialized yet, initialize it
    if (window.grecaptcha && containerRef.current && !initializedContainers.get(containerId)) {
      initializeReCaptcha();
    }
  };

  return { 
    isLoaded, 
    setContainer, 
    getRecaptchaToken, 
    resetRecaptcha,
    // Keep the executeReCaptcha function for backward compatibility, but it will now use getRecaptchaToken
    executeReCaptcha: async () => getRecaptchaToken()
  };
}
