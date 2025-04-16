import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

/**
 * HighlightedText Component
 * 
 * This component highlights occurrences of a search term within text.
 * It's used to highlight search terms in search results.
 */
export default function HighlightedText({ text, highlight, className = '' }: HighlightedTextProps) {
  // If no text or highlight, return the original text
  if (!text || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special characters in the search term for use in regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Create a regex pattern that matches the search term (case insensitive)
  const pattern = new RegExp(`(${escapeRegExp(highlight.trim())})`, 'gi');
  
  // Split the text by the search term
  const parts = text.split(pattern);

  // Map the parts to React elements, highlighting the matches
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case insensitive)
        const isMatch = part.toLowerCase() === highlight.toLowerCase();
        
        return isMatch ? (
          <mark 
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800 dark:text-white px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}
