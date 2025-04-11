import Link from 'next/link';
import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import Script from 'next/script';
import BreadcrumbJsonLd, { generateCategoryBreadcrumbs } from '@/components/seo/BreadcrumbJsonLd';
import { generateCategoryMetadata } from '@/lib/metadata';

// Make this page fully dynamic
export const dynamic = 'force-dynamic';

// Define types (can be moved later)
interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string };
  publishedAt: string;
  excerpt?: string;
  categoryTitles?: string[]; // Added for debugging
}

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Function to fetch category and posts
// Modify getCategoryData to accept slug directly
async function getCategoryData(slug: string | undefined, sortBy: string = 'date_desc'): Promise<{ category: Category | null; posts: Post[]; allCategories: Category[] }> {
  // Try to find category by slug first
  const categoryQuery = groq`*[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    description
  }`;

  // If not found by slug, try to find by title matching the slug pattern
  const titleFromSlugQuery = groq`*[_type == "category" && title match $titlePattern][0]{
    _id,
    title,
    slug,
    description
  }`;

  const allCategoriesQuery = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;

  // Fetch category and all categories concurrently
  const [categoryBySlug, allCategories] = await Promise.all([
    client.fetch<Category | null>(categoryQuery, { slug }),
    client.fetch<Category[]>(allCategoriesQuery)
  ]);

  // If category not found by slug, try to find by title
  let category = categoryBySlug;
  if (!category) {
    // Convert slug to title format (e.g., "crime-news" -> "Crime News")
    const titlePattern = slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    console.log(`[getCategoryData] Category not found by slug, trying title pattern: ${titlePattern}`);
    category = await client.fetch<Category | null>(titleFromSlugQuery, { titlePattern: `^${titlePattern}$` });
  }

  // Handle case where category is not found
  if (!category) {
    return { category: null, posts: [], allCategories: allCategories || [] };
  }

  // Determine post ordering based on sortBy parameter
  let postOrder = 'publishedAt desc'; // Default sort
  if (sortBy === 'title_asc') postOrder = 'title asc';
  if (sortBy === 'title_desc') postOrder = 'title desc';
  if (sortBy === 'date_asc') postOrder = 'publishedAt asc';
  if (sortBy === 'author_asc') postOrder = 'author.name asc';
  if (sortBy === 'author_desc') postOrder = 'author.name desc';

  // Fetch posts for the category with dynamic ordering and limit
  // Modified query to check for category title in categories array
  const postsQuery = groq`*[_type == "post" && $categoryTitle in categories[]->title]{
    _id,
    title,
    slug,
    mainImage{ asset->{url, alt} },
    author->{name},
    publishedAt,
    excerpt,
    "categoryTitles": categories[]->title
  } | order(${postOrder}) [0...12]`; // Use dynamic order, limit to 12

  console.log(`[getCategoryData] Fetching posts for category: ${category.title} (ID: ${category._id})`);
  const posts = await client.fetch<Post[]>(postsQuery, { 
    categoryId: category._id,
    categoryTitle: category.title 
  });
  console.log(`[getCategoryData] Found ${posts.length} posts for category: ${category.title}`);
  
  // Log the titles of posts found for debugging
  if (posts.length > 0) {
    console.log(`[getCategoryData] Post titles: ${posts.map(p => p.title).join(', ')}`);
    console.log(`[getCategoryData] Post categories: ${JSON.stringify(posts.map(p => p.categoryTitles))}`);
  }

  return { category, posts: posts || [], allCategories: allCategories || [] };
}

// Generate Metadata for the page
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // Access params directly - it's not a Promise
  const slug = params.slug; // Extract slug here
  
  if (!slug) return { title: 'Invalid Request' };
  const { category } = await getCategoryData(slug); // Pass the extracted slug string

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return generateCategoryMetadata(category);
}

// Return empty array to make this page fully dynamic
export async function generateStaticParams() {
  // In production builds on Netlify, return empty array to avoid API calls
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    console.log('[CategoryPage] Skipping generateStaticParams in production/Netlify environment');
    return [];
  }
  
  try {
    // Get all category slugs
    const categorySlugsQuery = groq`*[_type == "category" && defined(slug.current)][].slug.current`;
    const categorySlugs = await client.fetch<string[]>(categorySlugsQuery);
    
    return categorySlugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('[CategoryPage] Error generating static params:', error);
    return []; // Fallback to empty array on error
  }
}

// The Category Page Component
export default async function CategoryPage({ params, searchParams }: any) {
  console.log(`[CategoryPage] Rendering for params:`, params); // Log received params
  
  // Access params directly - it's not a Promise
  const slug = params.slug; // Extract slug here
  
  console.log(`[CategoryPage] Extracted slug: ${slug}`); // Log extracted slug
  if (!slug) {
      console.log(`[CategoryPage] No slug found, calling notFound().`);
      notFound(); // If no slug, trigger 404
  }
  
  // Access searchParams directly - it's not a Promise
  const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'date_desc';
  
  console.log(`[CategoryPage] Fetching data for slug: ${slug}, sort: ${sortBy}`);
  const { category, posts, allCategories } = await getCategoryData(slug, sortBy); // Pass the extracted slug string
  console.log(`[CategoryPage] Fetched category:`, category ? category.title : 'null'); // Log fetched category result

  // If category fetch returned null, trigger 404
  if (!category) {
    console.log(`[CategoryPage] Category not found for slug "${slug}", calling notFound().`);
    notFound();
  }
  console.log(`[CategoryPage] Rendering page for category: ${category.title}`); // Log successful rendering start

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date'; // Handle potential invalid date strings
    }
  };

  // Helper component for rendering sorting links
  const SortLink = ({ sortValue, currentSort, children }: { sortValue: string; currentSort: string; children: React.ReactNode }) => {
    const isActive = sortValue === currentSort;
    // Use the correct category path format
    const href = `/category/${slug}?sort=${sortValue}`;
    return (
      <Link
        href={href}
        className={`font-body px-3 py-1 text-xs rounded ${isActive ? 'bg-vpn-blue text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-8"></div>
        
        {/* Category Header Section */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
            {/* Apply title override */}
            {category.title === 'Video' ? 'Legal Commentary' : category.title}
          </h1>
          {category.description && (
            <p className="text-lg font-body text-gray-600 dark:text-gray-400">{category.description}</p>
          )}
        </div>

        {/* Sorting Controls Section */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="font-body text-sm font-medium mr-2">Sort by:</span>
          <SortLink sortValue="date_desc" currentSort={sortBy}>Date (Newest)</SortLink>
          <SortLink sortValue="date_asc" currentSort={sortBy}>Date (Oldest)</SortLink>
          <SortLink sortValue="title_asc" currentSort={sortBy}>Title (A-Z)</SortLink>
          <SortLink sortValue="title_desc" currentSort={sortBy}>Title (Z-A)</SortLink>
          <SortLink sortValue="author_asc" currentSort={sortBy}>Author (A-Z)</SortLink>
          <SortLink sortValue="author_desc" currentSort={sortBy}>Author (Z-A)</SortLink>
        </div>

        {/* Main Layout Grid - Improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column - Wider on desktop */}
          <div className="lg:col-span-8 order-1">
            {posts.length > 0 ? (
              <div className="content-section p-6">
                <div className="grid grid-cols-1 gap-8"> {/* Outer grid for spacing between rows */}
                  {/* Iterate through posts and create rows of 2 */}
                  {Array.from({ length: Math.ceil(posts.length / 2) }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {posts.slice(rowIndex * 2, rowIndex * 2 + 2).map(p => (
                        <article key={p._id} className="article-card flex flex-col h-full">
                          <Link href={`/${p.slug?.current ?? '#'}`} className="block overflow-hidden">
                            {p.mainImage?.asset?.url ? (
                              <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                                <img
                                  src={p.mainImage.asset.url}
                                  alt={p.mainImage.asset.alt || p.title || 'Article image'}
                                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                  width="600"
                                  height="338"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              // Placeholder if no image
                              <div className="relative aspect-[16/9] bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded-sm">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                          </Link>
                          <div className="p-5 flex flex-col flex-grow">
                            <Link href={`/${p.slug?.current ?? '#'}`} className="group">
                              <h3 className="font-heading font-bold text-vpn-gray dark:text-vpn-gray-dark text-lg md:text-xl leading-tight group-hover:text-vpn-blue dark:group-hover:text-blue-400 mb-3">
                                {p.title || 'Untitled Post'}
                              </h3>
                            </Link>
                            {p.excerpt && (
                              <p className="font-body text-vpn-gray dark:text-vpn-gray-dark/80 text-base mb-4 line-clamp-3 flex-grow">
                                {p.excerpt}
                              </p>
                            )}
                            {/* Footer of card */}
                            <div className="mt-auto font-body text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                              {p.author?.name && <span>By {p.author.name} • </span>}
                              {formatDate(p.publishedAt)}
                            </div>
                          </div>
                        </article>
                      ))}
                      {/* Add placeholders if the last row doesn't have 2 items */}
                      {posts.slice(rowIndex * 2, rowIndex * 2 + 2).length < 2 &&
                        Array.from({ length: 2 - posts.slice(rowIndex * 2, rowIndex * 2 + 2).length }).map((_, placeholderIndex) => (
                          <div key={`placeholder-${rowIndex}-${placeholderIndex}`} className="hidden md:block"></div> // Empty div to maintain grid structure
                        ))
                      }
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Message when no posts are found
              <div className="content-section p-6">
                <p className="font-body text-center text-gray-500 dark:text-gray-400 py-10">
                  No posts found in this category yet.
                </p>
              </div>
            )}
            
          </div>

          {/* Right Sidebar - Ads and Related Content */}
          <div className="lg:col-span-4 order-2">
            <div className="sticky top-[156px]">
              {/* Empty space for sidebar layout */}
              <div className="w-full"></div>
              
              {/* Related Categories Box */}
              <div className="content-section p-5 mt-8">
                <h3 className="font-heading font-bold text-lg mb-4">Related Categories</h3>
                <ul className="space-y-3">
                  {allCategories
                    .filter(cat => cat._id !== category._id)
                    .slice(0, 5)
                    .map(cat => (
                      <li key={cat._id}>
                        <Link 
                          href={`/category/${cat.slug?.current}`}
                          className="font-body text-sm font-medium text-vpn-gray hover:text-vpn-blue dark:text-vpn-gray-dark dark:hover:text-blue-400 transition-colors"
                        >
                          {cat.title}
                        </Link>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Empty space for bottom margin */}
        <div className="mt-8"></div>
      </div>
    </Layout>
  );
}
