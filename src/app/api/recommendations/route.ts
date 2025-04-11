import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';
import connectToDatabase from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or request cookies
    const { searchParams } = new URL(request.url);
    
    let userId = searchParams.get('userId');
    if (!userId) {
      // Get from request cookies directly
      userId = request.cookies.get('vpn_user_id')?.value || '';
    }
    
    // Get current article ID from query params (if any)
    const currentArticleId = searchParams.get('currentArticleId');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get user profile
    const profile = userId ? await UserProfile.findOne({ userId }) : null;
    
    // If no profile exists yet, return popular articles instead
    if (!profile) {
      return NextResponse.json(await getPopularArticles(currentArticleId));
    }
    
    // Extract top interests
    const topCategories = getTopWeights(profile.categoryWeights, 3);
    const topTags = getTopWeights(profile.tagWeights, 5);
    const topAuthors = getTopWeights(profile.authorWeights, 2);
    
    // Build Sanity query based on user interests
    let query = groq`*[_type == "post"`;
    
    // Add filters
    const filters = [];
    
    if (topCategories.length > 0) {
      filters.push(`categories[]->slug.current in [${topCategories.map(c => `"${c}"`).join(', ')}]`);
    }
    
    if (topTags.length > 0) {
      filters.push(`tags[]->slug.current in [${topTags.map(t => `"${t}"`).join(', ')}]`);
    }
    
    if (topAuthors.length > 0) {
      filters.push(`author->slug.current in [${topAuthors.map(a => `"${a}"`).join(', ')}]`);
    }
    
    // Exclude current article if provided
    if (currentArticleId) {
      query += ` && _id != "${currentArticleId}"`;
    }
    
    // Add filters to query if any exist
    if (filters.length > 0) {
      query += ` && (${filters.join(' || ')})`;
    }
    
    // Close query and add projection, ordering and limit
    query += `] | order(publishedAt desc)[0...6]{
      _id,
      title,
      "slug": slug.current,
      "mainImage": mainImage.asset->url,
      publishedAt,
      "categories": categories[]->title,
      "categorySlug": categories[]->slug.current,
      "author": author->name,
      "authorSlug": author->slug.current
    }`;
    
    // Execute query
    const articles = await client.fetch(query);
    
    // If we don't have enough recommendations, supplement with popular articles
    if (articles.length < 3) {
      const popularArticles = await getPopularArticles(currentArticleId, 6 - articles.length);
      
      // Combine and deduplicate articles
      const combinedArticles = [...articles];
      
      for (const article of popularArticles.articles) {
        if (!combinedArticles.some(a => a._id === article._id)) {
          combinedArticles.push(article);
        }
        
        if (combinedArticles.length >= 6) break;
      }
      
      return NextResponse.json({ articles: combinedArticles });
    }
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Fallback to popular articles in case of error
    const popularArticles = await getPopularArticles(null);
    return NextResponse.json(popularArticles);
  }
}

// Helper function to get top weighted items
function getTopWeights(weights: Record<string, number>, count: number): string[] {
  if (!weights) return [];
  
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}

// Fallback to popular articles if no user profile
async function getPopularArticles(currentArticleId: string | null, limit: number = 6) {
  let query = groq`*[_type == "post"`;
  
  if (currentArticleId) {
    query += ` && _id != "${currentArticleId}"`;
  }
  
  query += `] | order(pageViews desc, publishedAt desc)[0...${limit}]{
    _id,
    title,
    "slug": slug.current,
    "mainImage": mainImage.asset->url,
    publishedAt,
    "categories": categories[]->title,
    "categorySlug": categories[]->slug.current,
    "author": author->name,
    "authorSlug": author->slug.current
  }`;
  
  const articles = await client.fetch(query);
  return { articles };
}
