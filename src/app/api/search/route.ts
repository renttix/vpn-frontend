import { NextRequest, NextResponse } from 'next/server';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import { SearchResult, Category, Author } from '@/types/sanity';

/**
 * Enhanced Search API Route
 * 
 * This API route handles search requests with advanced filtering options:
 * - Full-text search across title, excerpt, and body content
 * - Category filtering
 * - Author filtering
 * - Date range filtering
 * - Sorting options
 * - Pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    
    // Required parameters
    const query = searchParams.get('q');
    
    // Optional parameters with defaults
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const categoriesParam = searchParams.get('categories');
    const authorsParam = searchParams.get('authors');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    
    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Parse array parameters
    const categories = categoriesParam ? categoriesParam.split(',') : [];
    const authors = authorsParam ? authorsParam.split(',') : [];
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    let filterConditions = [];
    
    // Base search condition
    const searchCondition = `(title match $searchPattern || excerpt match $searchPattern || pt::text(body) match $searchPattern)`;
    filterConditions.push(searchCondition);
    
    // Category filter
    if (categories.length > 0) {
      filterConditions.push(`count((categories[]->._id)[@ in $categories]) > 0`);
    }
    
    // Author filter
    if (authors.length > 0) {
      filterConditions.push(`author->._id in $authors`);
    }
    
    // Date range filter
    if (dateFrom) {
      filterConditions.push(`publishedAt >= $dateFrom`);
    }
    
    if (dateTo) {
      // Add one day to include the end date
      const dateToObj = new Date(dateTo);
      dateToObj.setDate(dateToObj.getDate() + 1);
      const adjustedDateTo = dateToObj.toISOString().split('T')[0];
      filterConditions.push(`publishedAt < $adjustedDateTo`);
    }
    
    // Combine all filter conditions
    const filterString = filterConditions.join(' && ');
    
    // Determine sort order
    let sortOrder;
    switch (sortBy) {
      case 'date-desc':
        sortOrder = 'publishedAt desc';
        break;
      case 'date-asc':
        sortOrder = 'publishedAt asc';
        break;
      case 'relevance':
      default:
        // For relevance sorting, we use a score based on where the match occurs
        sortOrder = `score desc, publishedAt desc`;
        break;
    }
    
    // Build the search query with all filters
    const searchQuery = groq`{
      "results": *[_type == "post" && ${filterString}] {
        _id,
        title,
        slug,
        mainImage{ asset->{url, alt} },
        author->{_id, name},
        publishedAt,
        excerpt,
        categories[]->{ _id, title, slug },
        // Calculate a relevance score based on where the match occurs
        "score": select(
          title match $searchPattern => 3,
          excerpt match $searchPattern => 2,
          pt::text(body) match $searchPattern => 1,
          0
        )
      } | order(${sortOrder}) [${skip}...${skip + limit}],
      
      // Get total count for pagination
      "total": count(*[_type == "post" && ${filterString}]),
      
      // Get all categories for filters
      "categories": *[_type == "category"] {
        _id,
        title,
        slug
      } | order(title asc),
      
      // Get all authors for filters
      "authors": *[_type == "author"] {
        _id,
        name,
        slug
      } | order(name asc)
    }`;
    
    // Create search pattern with wildcards
    const searchPattern = `*${query}*`;
    
    // Prepare parameters
    const params: Record<string, any> = {
      searchPattern,
      categories,
      authors,
    };
    
    // Add date parameters if provided
    if (dateFrom) {
      params.dateFrom = `${dateFrom}T00:00:00Z`;
    }
    
    if (dateTo) {
      const dateToObj = new Date(dateTo);
      dateToObj.setDate(dateToObj.getDate() + 1);
      params.adjustedDateTo = `${dateToObj.toISOString().split('T')[0]}T00:00:00Z`;
    }
    
    // Execute the query
    const { results, total, categories: allCategories, authors: allAuthors } = await client.fetch(searchQuery, params);
    
    // Return the search results
    return NextResponse.json({
      results: results || [],
      total: total || 0,
      categories: allCategories || [],
      authors: allAuthors || [],
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit)
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while searching' },
      { status: 500 }
    );
  }
}
