import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';

// Define types
interface SearchResult {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string };
  publishedAt: string;
  excerpt?: string;
  categories?: { _id: string; title: string; slug: { current: string } }[];
}

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Function to fetch search results and categories
async function getSearchResults(query: string): Promise<{ results: SearchResult[]; allCategories: Category[] }> {
  // Fetch all categories for the header
  const allCategoriesQuery = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;

  // Search query - search in title, excerpt, and body content
  const searchQuery = groq`*[_type == "post" && (
    title match $searchPattern || 
    excerpt match $searchPattern || 
    pt::text(body) match $searchPattern
  )]{
    _id,
    title,
    slug,
    mainImage{ asset->{url, alt} },
    author->{name},
    publishedAt,
    excerpt,
    categories[]->{ _id, title, slug }
  } | order(publishedAt desc) [0...20]`; // Limit to 20 results

  // Create search pattern with wildcards
  const searchPattern = `*${query}*`;

  // Fetch search results and categories concurrently
  const [results, allCategories] = await Promise.all([
    client.fetch<SearchResult[]>(searchQuery, { searchPattern }),
    client.fetch<Category[]>(allCategoriesQuery)
  ]);

  return { 
    results: results || [], 
    allCategories: allCategories || [] 
  };
}

// Generate metadata for the page
export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  // Access searchParams directly - it's not a Promise
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  
  return {
    ...defaultMetadata,
    title: query ? `Search results for "${query}"` : 'Search',
    description: `Search results for "${query}" on VPN News - Video Production News`,
    alternates: {
      canonical: `/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: query ? `Search results for "${query}" - VPN News` : 'Search - VPN News',
      url: `/search?q=${encodeURIComponent(query)}`,
    },
    robots: {
      index: false,
      follow: true,
    }
  };
}

// Search Page Component
export default async function SearchPage({ searchParams }: any) {
  // Access searchParams directly - it's not a Promise
  // Get search query from URL
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  
  // If no query provided, return 404
  if (!query) {
    notFound();
  }

  // Fetch search results and categories
  const { results, allCategories } = await getSearchResults(query);

  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Ad Banner Placeholder - Sticky */}
        <div className="mb-6 sticky top-[120px] z-30">
          <div className="w-full h-[90px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>

        {/* Search Header */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-2">
            Search Results
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
          </p>
        </div>

        {/* Grid for Content and Right Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search Results - Middle Column - First on mobile */}
          <div className="col-span-1 lg:col-span-8 order-1">
            <div className="grid grid-cols-1 gap-8">
              {results.length > 0 ? (
                results.map((result) => (
                  <article 
                    key={result._id} 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-sm shadow-sm flex flex-col md:flex-row gap-6"
                  >
                    {/* Article Image */}
                    {result.mainImage?.asset?.url ? (
                      <div className="md:w-1/4">
                        <Link href={`/${result.slug?.current ?? '#'}`} className="block">
                          <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                            <img
                              src={result.mainImage.asset.url}
                              alt={result.mainImage.asset.alt || result.title || 'Article image'}
                              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                              width="400"
                              height="225"
                              loading="lazy"
                            />
                          </div>
                        </Link>
                      </div>
                    ) : null}

                    {/* Article Content */}
                    <div className={`${result.mainImage?.asset?.url ? 'md:w-3/4' : 'w-full'}`}>
                      <Link href={`/${result.slug?.current ?? '#'}`} className="group">
                        <h2 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-xl md:text-2xl leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-2">
                          {result.title || 'Untitled Post'}
                        </h2>
                      </Link>
                      
                      {result.excerpt && (
                        <p className="text-vpn-gray dark:text-vpn-gray-dark/80 text-base mb-4">
                          {result.excerpt}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {result.author?.name && <span className="mr-3">By {result.author.name}</span>}
                        <span className="mr-3">{formatDate(result.publishedAt)}</span>
                        
                        {/* Categories */}
                        {result.categories && result.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                            {result.categories.map((category) => (
                              <Link
                                key={category._id}
                                href={`/category/${category.slug?.current ?? '#'}`}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-vpn-blue dark:text-blue-400 px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                {category.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={`/${result.slug?.current ?? '#'}`} 
                        className="text-vpn-blue dark:text-blue-400 font-medium hover:underline"
                      >
                        Read full article →
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-bold mb-4">No results found for "{query}"</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try different keywords or check your spelling.
                  </p>
                  <div className="flex justify-center">
                    <Link 
                      href="/" 
                      className="bg-vpn-blue text-white px-6 py-2 rounded-sm hover:bg-opacity-90"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Ad Column - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-2 order-2">
            <div className="sticky top-4">
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
                <div>Ad (e.g., 160x600)</div>
              </div>
            </div>
          </div>

          {/* Right Ad Column - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-2 order-3">
            <div className="sticky top-4">
              <div className="w-full h-[600px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
                <div>Ad (e.g., 160x600)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Ad Banner - Sticky at bottom */}
        <div className="mt-8 sticky bottom-0 z-30">
          <div className="w-full h-[90px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-muted-foreground text-sm border border-border">
            Horizontal Advertisement (e.g., 728x90)
          </div>
        </div>
      </div>
    </Layout>
  );
}
