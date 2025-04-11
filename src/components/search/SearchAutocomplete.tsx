"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks";

// Types for search suggestions
interface SearchSuggestion {
  title: string;
  slug: string;
  type: 'article' | 'category';
}

export default function SearchAutocomplete() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Create unique IDs for ARIA relationships
  const searchButtonId = "search-button";
  const searchDialogId = "search-dialog";
  const searchInputId = "search-input";
  const searchSuggestionsId = "search-suggestions";
  const searchStatusId = "search-status";
  
  // Track the currently focused suggestion index for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Handle keyboard navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    
    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }
    // Enter key when a suggestion is focused
    else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const suggestion = suggestions[focusedIndex];
      router.push(suggestion.type === 'article' ? `/${suggestion.slug}` : `/category/${suggestion.slug}`);
      setIsOpen(false);
    }
    // Escape key
    else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Reset focused index when suggestions change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions]);

  return (
    <div ref={searchRef} className="relative">
      <button
        id={searchButtonId}
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={searchDialogId}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-vpn-blue dark:focus:ring-blue-400"
      >
        <Search size={18} aria-hidden="true" />
      </button>

      {isOpen && (
        <div 
          id={searchDialogId}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="search-dialog-title"
        >
          <div className="bg-background dark:bg-gray-800 rounded-md shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b border-border">
              <h2 id="search-dialog-title" className="sr-only">Search</h2>
              <form onSubmit={handleSubmit} role="search">
                <div className="relative">
                  <label htmlFor={searchInputId} className="sr-only">Search for news, articles, topics</label>
                  <input
                    id={searchInputId}
                    type="search"
                    placeholder="Search for news, articles, topics..."
                    className="w-full px-4 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-vpn-blue dark:bg-gray-700 dark:text-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    aria-autocomplete="list"
                    aria-controls={debouncedQuery.length >= 2 ? searchSuggestionsId : undefined}
                    aria-activedescendant={focusedIndex >= 0 ? `suggestion-${focusedIndex}` : undefined}
                    aria-describedby={searchStatusId}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-vpn-gray dark:text-gray-300"
                    aria-label="Submit search"
                  >
                    <Search size={18} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>

            {/* Hidden status for screen readers */}
            <div id={searchStatusId} className="sr-only" aria-live="polite">
              {isLoading 
                ? "Loading search suggestions" 
                : debouncedQuery.length >= 2 
                  ? suggestions.length > 0 
                    ? `${suggestions.length} suggestions found. Use up and down arrow keys to navigate.` 
                    : "No suggestions found for your search." 
                  : "Type at least 2 characters to see suggestions."}
            </div>

            {/* Suggestions */}
            {debouncedQuery.length >= 2 && (
              <div className="p-4 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-4" aria-live="polite">Loading suggestions...</div>
                ) : suggestions.length > 0 ? (
                  <ul 
                    id={searchSuggestionsId} 
                    className="space-y-2" 
                    role="listbox" 
                    aria-label="Search suggestions"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        id={`suggestion-${index}`}
                        role="option" 
                        aria-selected={focusedIndex === index}
                        className={`${focusedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        <Link
                          href={suggestion.type === 'article' ? `/${suggestion.slug}` : `/category/${suggestion.slug}`}
                          className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setIsOpen(false)}
                          onMouseEnter={() => setFocusedIndex(index)}
                          onFocus={() => setFocusedIndex(index)}
                        >
                          <div className="flex items-center">
                            <span className="text-xs uppercase text-vpn-gray-light dark:text-gray-400 mr-2">
                              {suggestion.type}:
                            </span>
                            <span>{suggestion.title}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4" aria-live="polite">No suggestions found</div>
                )}
              </div>
            )}

            {/* Popular searches */}
            <div className="p-4 border-t border-border">
              <h3 id="popular-searches-heading" className="text-sm font-medium mb-2">Popular Searches:</h3>
              <div 
                className="flex flex-wrap gap-2"
                role="group" 
                aria-labelledby="popular-searches-heading"
              >
                {["Crime News", "Court Cases", "Legal Updates", "News"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-vpn-gray dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label={`Search for ${term}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Close button */}
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-vpn-gray dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="Close search dialog"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
