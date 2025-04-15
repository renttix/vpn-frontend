"use client";

import React from 'react';
import { useTextSize, TextSize, TEXT_SIZE_SCALES } from '@/contexts/TextSizeContext';
import { Type } from 'lucide-react';

interface TextSizeAdjusterProps {
  className?: string;
}

export default function TextSizeAdjuster({ className = '' }: TextSizeAdjusterProps) {
  const { textSize, setTextSize } = useTextSize();
  
  const sizes: { value: TextSize; label: string }[] = [
    { value: 'small', label: 'A' },
    { value: 'medium', label: 'A' },
    { value: 'large', label: 'A' },
    { value: 'x-large', label: 'A' }
  ];
  
  // Handle text size change with debugging
  const handleSizeChange = (size: TextSize) => {
    console.log('Changing text size to:', size);
    setTextSize(size);
    // Note: We can't log the updated state immediately as it's async
    setTimeout(() => {
      console.log('Current text size state after change:', textSize);
      console.log('Current CSS variable:', document.documentElement.style.getPropertyValue('--text-size-scale'));
    }, 100);
  };
  
  return (
    <div className={`text-size-adjuster inline-flex items-center bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 py-2 px-3 ${className}`}>
      <Type size={16} className="text-vpn-blue dark:text-blue-400 mr-2" />
      <span className="text-sm font-medium text-vpn-gray dark:text-gray-200 mr-2">Size:</span>
      
      <div className="flex space-x-1">
        {sizes.map((size) => (
          <button
            key={size.value}
            onClick={() => handleSizeChange(size.value)}
            aria-pressed={textSize === size.value}
            className={`px-1.5 py-0.5 text-xs rounded ${
              textSize === size.value 
                ? "bg-vpn-blue text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-vpn-gray dark:text-gray-300"
            }`}
            style={{ fontSize: `${TEXT_SIZE_SCALES[size.value] * 100}%` }}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
