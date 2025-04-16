import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPopularSearchTerms, getSearchHistory } from '@/lib/searchAnalytics';

interface SearchAutocompleteProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
}

/**
 * Search Autocomplete Component
 * 
 * Provides autocomplete suggestions for the search input:
 * - Popular search terms
 * - User's search history
 * - Fuzzy matching for typo tolerance
 */
export default function SearchAutocomplete({
  query,
  onQueryChange,
  onSearch
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        // Get popular search terms
        const popularTerms = await getPopularSearchTerms(10);
        
        // Get user's search history
        const searchHistory = getSearchHistory().map(item => item.query);
        
        // Combine and deduplicate
        const allTerms = [...new Set([...popularTerms, ...searchHistory])];
        
        // Filter terms that match the query (case-insensitive)
        const exactMatches = allTerms.filter(term => 
          term.toLowerCase().includes(query.toLowerCase())
        );
        
        // Add fuzzy matching for typo tolerance
        const fuzzyMatches = allTerms.filter(term => {
          // Skip terms that are already exact matches
          if (exactMatches.includes(term)) return false;
          
          // Simple Levenshtein distance calculation (for terms of similar length)
          return calculateLevenshteinDistance(query.toLowerCase(), term.toLowerCase()) <= 2;
        });
        
        // Combine exact and fuzzy matches, prioritizing exact matches
        const combinedSuggestions = [...exactMatches, ...fuzzyMatches].slice(0, 5);
        
        setSuggestions(combinedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };
    
    fetchSuggestions();
  }, [query]);
  
  // Show suggestions when input is focused
  const handleFocus = () => {
    setShowSuggestions(true);
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
    setActiveSuggestionIndex(-1);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter key
    if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        // Select the active suggestion
        onQueryChange(suggestions[activeSuggestionIndex]);
        onSearch(suggestions[activeSuggestionIndex]);
      } else {
        // Search with the current query
        onSearch(query);
      }
      setShowSuggestions(false);
      return;
    }
    
    // Escape key
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      return;
    }
    
    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      return;
    }
    
    // Arrow up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : -1
      );
      return;
    }
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Calculate Levenshtein distance for fuzzy matching
  const calculateLevenshteinDistance = (a: string, b: string): number => {
    // Skip calculation for strings with large length difference
    if (Math.abs(a.length - b.length) > 3) return Infinity;
    
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search articles..."
          className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vpn-blue"
          aria-label="Search"
          autoComplete="off"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  index === activeSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">{suggestion}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
