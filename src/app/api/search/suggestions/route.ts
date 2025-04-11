import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Create search pattern with wildcards
    const searchPattern = `*${query}*`;

    // Query for articles matching the search term
    const articlesQuery = groq`*[_type == "post" && (
      title match $searchPattern || 
      excerpt match $searchPattern
    )][0...5]{
      "title": title,
      "slug": slug.current,
      "type": "article"
    }`;

    // Query for categories matching the search term
    const categoriesQuery = groq`*[_type == "category" && (
      title match $searchPattern
    )][0...3]{
      "title": title,
      "slug": slug.current,
      "type": "category"
    }`;

    // Fetch results concurrently
    const [articles, categories] = await Promise.all([
      client.fetch(articlesQuery, { searchPattern }),
      client.fetch(categoriesQuery, { searchPattern })
    ]);

    // Combine and return results
    const suggestions = [...(articles || []), ...(categories || [])];
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
