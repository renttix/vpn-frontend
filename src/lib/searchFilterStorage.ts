/**
 * Search Filter Storage Module
 * 
 * This module provides functions for storing and retrieving search filters in local storage.
 * It enables filter persistence across sessions for a better user experience.
 */

// Define the filter state interface
export interface SearchFilterState {
  selectedCategories: string[];
  selectedAuthors: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
}

// Local storage key
const STORAGE_KEY = 'vpn-search-filters';

/**
 * Save search filters to local storage
 */
export function saveFilters(filters: SearchFilterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving search filters to local storage:', error);
  }
}

/**
 * Load search filters from local storage
 */
export function loadFilters(): SearchFilterState | null {
  try {
    const storedFilters = localStorage.getItem(STORAGE_KEY);
    if (!storedFilters) return null;
    
    return JSON.parse(storedFilters) as SearchFilterState;
  } catch (error) {
    console.error('Error loading search filters from local storage:', error);
    return null;
  }
}

/**
 * Clear search filters from local storage
 */
export function clearFilters(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search filters from local storage:', error);
  }
}

/**
 * Get default filter state
 */
export function getDefaultFilters(): SearchFilterState {
  return {
    selectedCategories: [],
    selectedAuthors: [],
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'relevance',
  };
}

/**
 * Merge URL parameters with stored filters
 * 
 * This function merges filters from URL parameters with stored filters,
 * prioritizing URL parameters when both are present.
 */
export function mergeFilters(
  urlParams: Partial<SearchFilterState>,
  storedFilters: SearchFilterState | null
): SearchFilterState {
  // Start with default filters
  const defaultFilters = getDefaultFilters();
  
  // If no stored filters, use URL params or defaults
  if (!storedFilters) {
    return {
      ...defaultFilters,
      ...urlParams,
    };
  }
  
  // Merge stored filters with URL params, prioritizing URL params
  return {
    selectedCategories: urlParams.selectedCategories || storedFilters.selectedCategories || defaultFilters.selectedCategories,
    selectedAuthors: urlParams.selectedAuthors || storedFilters.selectedAuthors || defaultFilters.selectedAuthors,
    dateFrom: urlParams.dateFrom || storedFilters.dateFrom || defaultFilters.dateFrom,
    dateTo: urlParams.dateTo || storedFilters.dateTo || defaultFilters.dateTo,
    sortBy: urlParams.sortBy || storedFilters.sortBy || defaultFilters.sortBy,
  };
}

/**
 * Convert URL search params to filter state
 */
export function parseUrlParams(searchParams: URLSearchParams): Partial<SearchFilterState> {
  const filters: Partial<SearchFilterState> = {};
  
  // Parse categories
  const categoriesParam = searchParams.get('categories');
  if (categoriesParam) {
    filters.selectedCategories = categoriesParam.split(',');
  }
  
  // Parse authors
  const authorsParam = searchParams.get('authors');
  if (authorsParam) {
    filters.selectedAuthors = authorsParam.split(',');
  }
  
  // Parse date range
  const dateFrom = searchParams.get('dateFrom');
  if (dateFrom) {
    filters.dateFrom = dateFrom;
  }
  
  const dateTo = searchParams.get('dateTo');
  if (dateTo) {
    filters.dateTo = dateTo;
  }
  
  // Parse sort order
  const sortBy = searchParams.get('sortBy');
  if (sortBy) {
    filters.sortBy = sortBy;
  }
  
  return filters;
}

/**
 * Convert filter state to URL search params
 */
export function filtersToUrlParams(filters: SearchFilterState): URLSearchParams {
  const params = new URLSearchParams();
  
  // Add categories
  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    params.set('categories', filters.selectedCategories.join(','));
  }
  
  // Add authors
  if (filters.selectedAuthors && filters.selectedAuthors.length > 0) {
    params.set('authors', filters.selectedAuthors.join(','));
  }
  
  // Add date range
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }
  
  // Add sort order
  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }
  
  return params;
}
