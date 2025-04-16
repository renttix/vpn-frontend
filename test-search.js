/**
 * Search Functionality Test Script
 * 
 * This script tests the enhanced search functionality by making requests to the search API
 * with various filter combinations and verifying the responses.
 * 
 * Usage:
 * 1. Start the development server: npm run dev
 * 2. Run this script: npm run test:search
 */

const fetch = require('node-fetch');

// Base URL for the search API
const BASE_URL = 'http://localhost:3000/api/search';

// Test cases
const TEST_CASES = [
  {
    name: 'Basic Search',
    params: { q: 'crime' },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime"`);
      return data.results && data.results.length > 0;
    }
  },
  {
    name: 'Category Filter',
    params: { q: 'crime', categories: 'CATEGORY_ID_HERE' }, // Replace with an actual category ID
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime" in the specified category`);
      return data.results && data.results.length > 0;
    }
  },
  {
    name: 'Author Filter',
    params: { q: 'crime', authors: 'AUTHOR_ID_HERE' }, // Replace with an actual author ID
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime" by the specified author`);
      return true; // May return 0 results if the author hasn't written about crime
    }
  },
  {
    name: 'Date Range Filter',
    params: { 
      q: 'crime', 
      dateFrom: '2024-01-01', 
      dateTo: '2025-04-15' 
    },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime" in the date range`);
      return true; // May return 0 results depending on the date range
    }
  },
  {
    name: 'Sort by Date (Newest First)',
    params: { q: 'crime', sortBy: 'date-desc' },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime" sorted by newest first`);
      if (data.results && data.results.length >= 2) {
        const firstDate = new Date(data.results[0].publishedAt);
        const secondDate = new Date(data.results[1].publishedAt);
        return firstDate >= secondDate;
      }
      return true;
    }
  },
  {
    name: 'Sort by Date (Oldest First)',
    params: { q: 'crime', sortBy: 'date-asc' },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime" sorted by oldest first`);
      if (data.results && data.results.length >= 2) {
        const firstDate = new Date(data.results[0].publishedAt);
        const secondDate = new Date(data.results[1].publishedAt);
        return firstDate <= secondDate;
      }
      return true;
    }
  },
  {
    name: 'Pagination',
    params: { q: 'crime', page: 2, limit: 5 },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for "crime", showing page 2 with 5 results per page`);
      return data.results && data.results.length <= 5;
    }
  },
  {
    name: 'Combined Filters',
    params: { 
      q: 'crime', 
      categories: 'CATEGORY_ID_HERE', // Replace with an actual category ID
      dateFrom: '2024-01-01', 
      sortBy: 'relevance',
      page: 1,
      limit: 10
    },
    expectedStatus: 200,
    validate: (data) => {
      console.log(`Found ${data.total} results for combined filters`);
      return true;
    }
  },
  {
    name: 'Missing Query Parameter',
    params: {},
    expectedStatus: 400,
    validate: (data) => {
      console.log(`Received error response for missing query parameter: ${data.error}`);
      return data.error && data.error.includes('required');
    }
  }
];

/**
 * Build a URL with query parameters
 */
function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

/**
 * Run a test case
 */
async function runTest(testCase) {
  console.log(`\n=== Running Test: ${testCase.name} ===`);
  
  try {
    const url = buildUrl(BASE_URL, testCase.params);
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url);
    const status = response.status;
    
    console.log(`Response Status: ${status}`);
    
    if (status !== testCase.expectedStatus) {
      console.error(`❌ Test Failed: Expected status ${testCase.expectedStatus}, got ${status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (testCase.validate(data)) {
      console.log(`✅ Test Passed: ${testCase.name}`);
      return true;
    } else {
      console.error(`❌ Test Failed: Validation failed for ${testCase.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Test Failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all test cases
 */
async function runAllTests() {
  console.log('=== Starting Search API Tests ===\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n=== Test Results ===');
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ ${failed} test(s) failed.`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Error running tests:', error);
});
