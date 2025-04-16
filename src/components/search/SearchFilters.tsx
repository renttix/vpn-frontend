import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Author } from '@/types/sanity';
import { formatDate } from '@/lib/utils';

interface SearchFiltersProps {
  categories: Category[];
  authors: Author[];
  selectedCategories: string[];
  selectedAuthors: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
  onApplyFilters: (filters: {
    categories: string[];
    authors: string[];
    dateFrom?: string;
    dateTo?: string;
    sortBy: string;
  }) => void;
}

/**
 * Search Filters Component
 * 
 * Provides faceted search functionality with filters for:
 * - Categories
 * - Authors
 * - Date range
 * - Sort options
 */
export default function SearchFilters({
  categories,
  authors,
  selectedCategories,
  selectedAuthors,
  dateFrom,
  dateTo,
  sortBy,
  onApplyFilters
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local state for filter values
  const [localCategories, setLocalCategories] = React.useState<string[]>(selectedCategories);
  const [localAuthors, setLocalAuthors] = React.useState<string[]>(selectedAuthors);
  const [localDateFrom, setLocalDateFrom] = React.useState<string>(dateFrom || '');
  const [localDateTo, setLocalDateTo] = React.useState<string>(dateTo || '');
  const [localSortBy, setLocalSortBy] = React.useState<string>(sortBy || 'relevance');
  
  // Handle category checkbox change
  const handleCategoryChange = (categoryId: string) => {
    setLocalCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Handle author checkbox change
  const handleAuthorChange = (authorId: string) => {
    setLocalAuthors(prev => {
      if (prev.includes(authorId)) {
        return prev.filter(id => id !== authorId);
      } else {
        return [...prev, authorId];
      }
    });
  };
  
  // Handle apply filters button click
  const handleApplyFilters = () => {
    onApplyFilters({
      categories: localCategories,
      authors: localAuthors,
      dateFrom: localDateFrom || undefined,
      dateTo: localDateTo || undefined,
      sortBy: localSortBy
    });
  };
  
  // Handle clear filters button click
  const handleClearFilters = () => {
    setLocalCategories([]);
    setLocalAuthors([]);
    setLocalDateFrom('');
    setLocalDateTo('');
    setLocalSortBy('relevance');
    
    onApplyFilters({
      categories: [],
      authors: [],
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'relevance'
    });
  };
  
  // Get the current search query
  const query = searchParams.get('q') || '';
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-sm shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-vpn-gray dark:text-vpn-gray-dark">Refine Results</h2>
      
      {/* Categories Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-vpn-gray dark:text-vpn-gray-dark">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <div key={category._id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category._id}`}
                checked={localCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
                className="h-4 w-4 text-vpn-blue focus:ring-vpn-blue border-gray-300 rounded"
              />
              <label 
                htmlFor={`category-${category._id}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {category.title}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Authors Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-vpn-gray dark:text-vpn-gray-dark">Authors</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {authors.map(author => (
            <div key={author._id} className="flex items-center">
              <input
                type="checkbox"
                id={`author-${author._id}`}
                checked={localAuthors.includes(author._id)}
                onChange={() => handleAuthorChange(author._id)}
                className="h-4 w-4 text-vpn-blue focus:ring-vpn-blue border-gray-300 rounded"
              />
              <label 
                htmlFor={`author-${author._id}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {author.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Date Range Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-vpn-gray dark:text-vpn-gray-dark">Date Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="date-from" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <input
              type="date"
              id="date-from"
              value={localDateFrom}
              onChange={(e) => setLocalDateFrom(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <input
              type="date"
              id="date-to"
              value={localDateTo}
              onChange={(e) => setLocalDateTo(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
      
      {/* Sort By Section */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-vpn-gray dark:text-vpn-gray-dark">Sort By</h3>
        <select
          value={localSortBy}
          onChange={(e) => setLocalSortBy(e.target.value)}
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="relevance">Relevance</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-vpn-blue text-white py-2 px-4 rounded-sm hover:bg-opacity-90 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-sm hover:bg-opacity-90 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
