"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define text size options
export type TextSize = 'small' | 'medium' | 'large' | 'x-large';

// Map text sizes to scale factors
export const TEXT_SIZE_SCALES: Record<TextSize, number> = {
  'small': 0.9,
  'medium': 1,
  'large': 1.2,
  'x-large': 1.4
};

// Context type definition
type TextSizeContextType = {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
};

// Create context with default values
const TextSizeContext = createContext<TextSizeContextType>({
  textSize: 'medium',
  setTextSize: () => {},
});

// Custom hook for using the text size context
export const useTextSize = () => useContext(TextSizeContext);

// Provider component
export function TextSizeProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available, otherwise use 'medium'
  const [textSize, setTextSize] = useState<TextSize>('medium');
  
  // Load saved preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem('vpn-text-size') as TextSize;
      if (savedSize && Object.keys(TEXT_SIZE_SCALES).includes(savedSize)) {
        setTextSize(savedSize);
      }
    }
  }, []);
  
  // Update localStorage and apply CSS variable when text size changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vpn-text-size', textSize);
      
      // Apply the scale factor as a CSS variable to the document root
      document.documentElement.style.setProperty(
        '--text-size-scale', 
        TEXT_SIZE_SCALES[textSize].toString()
      );
      
      // Also add a class to the body for easier targeting
      document.body.className = document.body.className
        .replace(/text-size-(small|medium|large|x-large)/g, '')
        .trim();
      document.body.classList.add(`text-size-${textSize}`);
      
      console.log('Text size updated:', textSize, 'Scale:', TEXT_SIZE_SCALES[textSize]);
    }
  }, [textSize]);
  
  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}
