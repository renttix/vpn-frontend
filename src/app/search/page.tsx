'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import { SearchResult, Category, Author } from '@/types/sanity';
import { 
  loadFilters, 
  saveFilters, 
  parseUrlParams, 
  mergeFilters, 
  SearchFilterState 
} from '@/lib/searchFilterStorage';
import { 
  trackSearchQuery, 
  trackFilterUsage, 
  trackSearchResults, 
  trackFailedSearch,
  trackPagination,
  storeSearchQuery
} from '@/lib/searchAnalytics';

// Define the page props
interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Define the search state
interface SearchState {
  query: string;
  results: SearchResult[];
  categories: Category[];
  authors: Author[];
  selectedCategories: string[];
  selectedAuthors: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
}

// Results per page
const RESULTS_PER_PAGE = 10;

// Search Page Component
export default function SearchPage({ searchParams }: SearchPageProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  // Get search query from URL
  const query = typeof urlSearchParams.get('q') === 'string' ? urlSearchParams.get('q') || '' : '';
  
  // If no query provided, return 404
  if (!query) {
    notFound();
  }
  
  // Parse other search parameters
  const page = parseInt(urlSearchParams.get('page') || '1', 10);
  const categoriesParam = urlSearchParams.get('categories') || '';
  const authorsParam = urlSearchParams.get('authors') || '';
  const dateFrom = urlSearchParams.get('dateFrom') || undefined;
  const dateTo = urlSearchParams.get('dateTo') || undefined;
  const sortBy = urlSearchParams.get('sortBy') || 'relevance';
  
  // Parse array parameters
  const selectedCategories = categoriesParam ? categoriesParam.split(',') : [];
  const selectedAuthors = authorsParam ? authorsParam.split(',') : [];
  
  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query,
    results: [],
    categories: [],
    authors: [],
    selectedCategories,
    selectedAuthors,
    dateFrom,
    dateTo,
    sortBy,
    currentPage: page,
    totalPages: 1,
    isLoading: true,
    error: undefined
  });
  
  // Load saved filters on initial render
  useEffect(() => {
    // Load saved filters from local storage
    const savedFilters = loadFilters();
    
    // Parse URL parameters
    const urlParams = parseUrlParams(new URLSearchParams(window.location.search));
    
    // Merge URL parameters with saved filters, prioritizing URL parameters
    const mergedFilters = mergeFilters(urlParams, savedFilters);
    
    // Update search state with merged filters
    setSearchState(prev => ({
      ...prev,
      selectedCategories: mergedFilters.selectedCategories,
      selectedAuthors: mergedFilters.selectedAuthors,
      dateFrom: mergedFilters.dateFrom,
      dateTo: mergedFilters.dateTo,
      sortBy: mergedFilters.sortBy,
    }));
  }, []);
  
  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      setSearchState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      // Store search query for analytics and autocomplete
      storeSearchQuery(query);
      
      try {
        // Build the API URL with all search parameters
        const apiUrl = new URL('/api/search', window.location.origin);
        apiUrl.searchParams.append('q', query);
        apiUrl.searchParams.append('page', searchState.currentPage.toString());
        apiUrl.searchParams.append('limit', RESULTS_PER_PAGE.toString());
        
        if (searchState.selectedCategories.length > 0) {
          apiUrl.searchParams.append('categories', searchState.selectedCategories.join(','));
        }
        
        if (searchState.selectedAuthors.length > 0) {
          apiUrl.searchParams.append('authors', searchState.selectedAuthors.join(','));
        }
        
        if (searchState.dateFrom) {
          apiUrl.searchParams.append('dateFrom', searchState.dateFrom);
        }
        
        if (searchState.dateTo) {
          apiUrl.searchParams.append('dateTo', searchState.dateTo);
        }
        
        apiUrl.searchParams.append('sortBy', searchState.sortBy);
        
        // Fetch search results
        const response = await fetch(apiUrl.toString());
        
        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update search state with results
        setSearchState(prev => ({
          ...prev,
          results: data.results || [],
          categories: data.categories || [],
          authors: data.authors || [],
          totalPages: Math.ceil(data.total / RESULTS_PER_PAGE),
          isLoading: false
        }));
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred while searching'
        }));
      }
    };
    
    fetchSearchResults();
  }, [
    query,
    searchState.currentPage,
    searchState.selectedCategories,
    searchState.selectedAuthors,
    searchState.dateFrom,
    searchState.dateTo,
    searchState.sortBy
  ]);
  
  // Handle query change
  const handleQueryChange = (newQuery: string) => {
    setSearchState(prev => ({
      ...prev,
      query: newQuery
    }));
  };
  
  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    // Track search query
    trackSearchQuery(searchQuery, 0); // We don't know the result count yet
    
    // Update URL with new query
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('q', searchQuery);
    
    // Reset page to 1
    newUrl.searchParams.set('page', '1');
    
    // Update URL and reload the page
    router.push(newUrl.toString());
  };
  
  // Handle filter changes
  const handleApplyFilters = (filters: {
    categories: string[];
    authors: string[];
    dateFrom?: string;
    dateTo?: string;
    sortBy: string;
  }) => {
    // Save filters to local storage
    saveFilters({
      selectedCategories: filters.categories,
      selectedAuthors: filters.authors,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy
    });
    
    // Track filter usage
    if (filters.categories.length > 0) {
      trackFilterUsage('categories', filters.categories.join(','));
    }
    
    if (filters.authors.length > 0) {
      trackFilterUsage('authors', filters.authors.join(','));
    }
    
    if (filters.dateFrom) {
      trackFilterUsage('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      trackFilterUsage('dateTo', filters.dateTo);
    }
    
    trackFilterUsage('sortBy', filters.sortBy);
    
    // Update search state
    setSearchState(prev => ({
      ...prev,
      selectedCategories: filters.categories,
      selectedAuthors: filters.authors,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy,
      currentPage: 1 // Reset to first page when filters change
    }));
    
    // Update URL with new filters
    const newUrl = new URL(window.location.href);
    
    // Update or remove category parameter
    if (filters.categories.length > 0) {
      newUrl.searchParams.set('categories', filters.categories.join(','));
    } else {
      newUrl.searchParams.delete('categories');
    }
    
    // Update or remove author parameter
    if (filters.authors.length > 0) {
      newUrl.searchParams.set('authors', filters.authors.join(','));
    } else {
      newUrl.searchParams.delete('authors');
    }
    
    // Update or remove date parameters
    if (filters.dateFrom) {
      newUrl.searchParams.set('dateFrom', filters.dateFrom);
    } else {
      newUrl.searchParams.delete('dateFrom');
    }
    
    if (filters.dateTo) {
      newUrl.searchParams.set('dateTo', filters.dateTo);
    } else {
      newUrl.searchParams.delete('dateTo');
    }
    
    // Update sort parameter
    newUrl.searchParams.set('sortBy', filters.sortBy);
    
    // Reset page to 1
    newUrl.searchParams.set('page', '1');
    
    // Update URL without reloading the page
    router.replace(newUrl.toString(), { scroll: false });
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Update search state
    setSearchState(prev => ({
      ...prev,
      currentPage: page
    }));
    
    // Update URL with new page
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', page.toString());
    
    // Update URL without reloading the page
    router.replace(newUrl.toString(), { scroll: false });
    
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <Layout categories={searchState.categories}>
      <div className="container mx-auto px-4 py-8">
        {/* Search Box */}
        <div className="mb-8">
          <SearchAutocomplete
            query={searchState.query}
            onQueryChange={handleQueryChange}
            onSearch={handleSearch}
          />
        </div>
        
        {/* Grid for Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <SearchFilters
              categories={searchState.categories}
              authors={searchState.authors}
              selectedCategories={searchState.selectedCategories}
              selectedAuthors={searchState.selectedAuthors}
              dateFrom={searchState.dateFrom}
              dateTo={searchState.dateTo}
              sortBy={searchState.sortBy}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          
          {/* Search Results */}
          <div className="md:col-span-3">
            {searchState.isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn-blue"></div>
              </div>
            ) : searchState.error ? (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {searchState.error}</span>
              </div>
            ) : (
              <SearchResults
                results={searchState.results}
                query={query}
                currentPage={searchState.currentPage}
                totalPages={searchState.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
