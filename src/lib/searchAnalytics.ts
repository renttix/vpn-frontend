/**
 * Search Analytics Module
 * 
 * This module provides functions for tracking search analytics:
 * - Track search queries
 * - Track filter usage
 * - Track search results
 * - Track failed searches
 * - Track search result clicks
 */

import { event, EventCategory } from './analytics';

// Define search event actions
const SEARCH_EVENTS = {
  SEARCH_QUERY: 'search_query',
  FILTER_USAGE: 'search_filter_usage',
  SEARCH_RESULTS: 'search_results',
  FAILED_SEARCH: 'failed_search',
  RESULT_CLICK: 'search_result_click',
  PAGINATION: 'search_pagination',
};

/**
 * Track a search query
 */
export function trackSearchQuery(query: string, resultsCount: number) {
  event({
    action: SEARCH_EVENTS.SEARCH_QUERY,
    category: EventCategory.SEARCH,
    label: query,
    value: resultsCount,
  });
}

/**
 * Track filter usage
 */
export function trackFilterUsage(filterType: string, filterValue: string) {
  event({
    action: SEARCH_EVENTS.FILTER_USAGE,
    category: EventCategory.SEARCH,
    label: `${filterType}:${filterValue}`,
  });
}

/**
 * Track search results
 */
export function trackSearchResults(query: string, resultsCount: number, filters: Record<string, any>) {
  event({
    action: SEARCH_EVENTS.SEARCH_RESULTS,
    category: EventCategory.SEARCH,
    label: query,
    value: resultsCount,
    filters: filters, // Include filters in the event data
  });
}

/**
 * Track failed searches (no results)
 */
export function trackFailedSearch(query: string, filters: Record<string, any>) {
  event({
    action: SEARCH_EVENTS.FAILED_SEARCH,
    category: EventCategory.SEARCH,
    label: query,
    filters: filters, // Include filters in the event data
  });
}

/**
 * Track search result clicks
 */
export function trackResultClick(query: string, resultId: string, position: number) {
  event({
    action: SEARCH_EVENTS.RESULT_CLICK,
    category: EventCategory.SEARCH,
    label: query,
    value: position,
    resultId: resultId, // Include result ID in the event data
  });
}

/**
 * Track pagination usage
 */
export function trackPagination(query: string, page: number) {
  event({
    action: SEARCH_EVENTS.PAGINATION,
    category: EventCategory.SEARCH,
    label: query,
    value: page,
  });
}

/**
 * Get popular search terms
 * 
 * This function would typically fetch popular search terms from an analytics API,
 * but for now we'll return a static list of popular terms.
 */
export async function getPopularSearchTerms(limit: number = 5): Promise<string[]> {
  // In a real implementation, this would fetch data from an analytics API
  // For now, return a static list of popular terms
  return [
    'Tommy Robinson',
    'tate',
    'ECHR',
    'Barton',
    'justice',
    'law',
    'legal',
    'murder',
    'robbery',
    'fraud',
  ].slice(0, limit);
}

/**
 * Store search query in local storage for analytics
 */
export function storeSearchQuery(query: string) {
  try {
    // Get existing search history
    const searchHistory = getSearchHistory();
    
    // Add the new query to the beginning of the array
    searchHistory.unshift({
      query,
      timestamp: new Date().toISOString(),
    });
    
    // Limit the history to 20 items
    const limitedHistory = searchHistory.slice(0, 20);
    
    // Store the updated history
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error storing search query:', error);
  }
}

/**
 * Get search history from local storage
 */
export function getSearchHistory(): Array<{ query: string; timestamp: string }> {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
  try {
    localStorage.removeItem('searchHistory');
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}
