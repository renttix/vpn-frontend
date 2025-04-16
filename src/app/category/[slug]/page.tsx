import Link from 'next/link';
import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import CategoryJsonLd from '@/components/seo/CategoryJsonLd';
import CommentaryJsonLd from '@/components/seo/CommentaryJsonLd';
import { generateCategoryMetadata } from '@/lib/metadata';
import CategoryPostsList from '@/components/category/CategoryPostsList';
import VideoGallery from '@/components/video/VideoGallery';
import { Category, Post } from '@/types/sanity';

// Make this page fully dynamic and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely
export const fetchCache = 'force-no-store'; // Ensure fetch requests are not cached

// Define the BreadcrumbItem interface to match what BreadcrumbJsonLd expects
interface BreadcrumbItem {
  name: string;
  item: string;
  position: number;
  image?: string;
}

// Define VideoPost interface
interface VideoPost {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnailImage?: { asset: { url: string; alt?: string } };
  videoUrl: string;
  author?: { name: string };
  publishedAt: string;
  description?: any;
  duration?: string;
}

// Function to fetch category and posts
async function getCategoryData(slug: string | undefined, sortBy: string = 'date_desc'): Promise<{ 
  category: any | null; 
  posts: any[]; 
  videos: VideoPost[];
  allCategories: any[] 
}> {
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
    client.fetch(categoryQuery, { slug }),
    client.fetch(allCategoriesQuery)
  ]);

  // If category not found by slug, try to find by title
  let category = categoryBySlug;
  if (!category) {
    // Convert slug to title format (e.g., "crime-news" -> "Crime News")
    const titlePattern = slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    console.log(`[getCategoryData] Category not found by slug, trying title pattern: ${titlePattern}`);
    category = await client.fetch(titleFromSlugQuery, { titlePattern: `^${titlePattern}$` });
  }

  // Handle case where category is not found
  if (!category) {
    return { category: null, posts: [], videos: [], allCategories: allCategories || [] };
  }

  // Determine post ordering based on sortBy parameter
  let postOrder = 'publishedAt desc'; // Default sort
  if (sortBy === 'title_asc') postOrder = 'title asc';
  if (sortBy === 'title_desc') postOrder = 'title desc';
  if (sortBy === 'date_asc') postOrder = 'publishedAt asc';
  if (sortBy === 'author_asc') postOrder = 'author.name asc';
  if (sortBy === 'author_desc') postOrder = 'author.name desc';

  // Check if this is the Watch category
  const isWatchCategory = category._id === '821b6fe2-4408-4ea9-8dee-e90f4640c84e';
  
  // Fetch posts for the category with dynamic ordering and limit
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

  // Fetch video posts if this is the Watch category
  const videosQuery = groq`*[_type == "videoPost" && references($categoryId)]{
    _id,
    title,
    slug,
    thumbnailImage{ asset->{url, alt} },
    videoUrl,
    author->{name},
    publishedAt,
    description,
    duration
  } | order(${postOrder}) [0...12]`;

  console.log(`[getCategoryData] Fetching content for category: ${category.title} (ID: ${category._id})`);
  
  // Fetch posts and videos (if needed) concurrently
  const [posts, videos] = await Promise.all([
    client.fetch(postsQuery, { 
      categoryId: category._id,
      categoryTitle: category.title 
    }),
    isWatchCategory ? client.fetch(videosQuery, { categoryId: category._id }) : Promise.resolve([])
  ]);
  
  console.log(`[getCategoryData] Found ${posts.length} posts for category: ${category.title}`);
  if (isWatchCategory) {
    console.log(`[getCategoryData] Found ${videos.length} videos for Watch category`);
  }
  
  // Log the titles of posts found for debugging
  if (posts.length > 0) {
    console.log(`[getCategoryData] Post titles: ${posts.map((p: any) => p.title).join(', ')}`);
  }

  return { 
    category, 
    posts: posts || [], 
    videos: videos || [],
    allCategories: allCategories || [] 
  };
}

// Generate Metadata for the page
export async function generateMetadata({ params }: any): Promise<Metadata> {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  if (!slug) return { title: 'Invalid Request' };
  const { category } = await getCategoryData(slug);

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
  
  // Ensure params and searchParams are properly awaited
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  
  const slug = resolvedParams.slug;
  
  console.log(`[CategoryPage] Extracted slug: ${slug}`); // Log extracted slug
  if (!slug) {
      console.log(`[CategoryPage] No slug found, calling notFound().`);
      notFound(); // If no slug, trigger 404
  }
  
  const sortBy = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'date_desc';
  
  console.log(`[CategoryPage] Fetching data for slug: ${slug}, sort: ${sortBy}`);
  const { category, posts, videos, allCategories } = await getCategoryData(slug, sortBy);
  console.log(`[CategoryPage] Fetched category:`, category ? category.title : 'null'); // Log fetched category result

  // If category fetch returned null, trigger 404
  if (!category) {
    console.log(`[CategoryPage] Category not found for slug "${slug}", calling notFound().`);
    notFound();
  }
  console.log(`[CategoryPage] Rendering page for category: ${category.title}`); // Log successful rendering start
  
  // Check if this is the Watch category
  const isWatchCategory = category._id === '821b6fe2-4408-4ea9-8dee-e90f4640c84e';

  // Generate the page URL for structured data
  const pageUrl = `https://vpnnews.com/category/${slug}`;

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
    // Use a regular anchor tag with a full URL to force a complete page reload
    const href = `/category/${slug}?sort=${sortValue}`;
    return (
      <a
        href={href}
        className={`font-body px-3 py-1 text-xs rounded ${isActive ? 'bg-vpn-blue text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {children}
      </a>
    );
  };

  // Generate breadcrumbs for BreadcrumbJsonLd
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', item: 'https://vpnnews.com', position: 1 },
    { name: category.title, item: pageUrl, position: 2 }
  ];
  
  // Generate breadcrumbs for CommentaryJsonLd (different format)
  const commentaryBreadcrumbs = [
    { name: 'Home', url: 'https://vpnnews.com' },
    { name: category.title, url: pageUrl }
  ];

  return (
    <Layout categories={allCategories}>
      {/* Add structured data for SEO */}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      
      {/* Use CategoryJsonLd for regular categories */}
      {category.title !== 'Commentary' && category._id !== 'IZrPJ0KdVO8qEhMFzimYnr' && (
        <CategoryJsonLd category={category} posts={posts} url={pageUrl} />
      )}
      
      {/* Use CommentaryJsonLd for the Commentary category */}
      {(category.title === 'Commentary' || category._id === 'IZrPJ0KdVO8qEhMFzimYnr') && (
        <CommentaryJsonLd category={category} posts={posts} url={pageUrl} breadcrumbs={commentaryBreadcrumbs} />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-8"></div>
        
        {/* Category Header Section */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-body font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
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
            {isWatchCategory ? (
              // For Watch category, show VideoGallery
              videos.length > 0 ? (
                <VideoGallery 
                  initialVideos={videos}
                  categoryId={category._id}
                  sortOrder={
                    sortBy === 'title_asc' ? 'title asc' :
                    sortBy === 'title_desc' ? 'title desc' :
                    sortBy === 'date_asc' ? 'publishedAt asc' :
                    sortBy === 'author_asc' ? 'author.name asc' :
                    sortBy === 'author_desc' ? 'author.name desc' :
                    'publishedAt desc' // Default sort
                  }
                />
              ) : (
                // Message when no videos are found
                <div className="content-section p-6">
                  <p className="font-body text-center text-gray-500 dark:text-gray-400 py-10">
                    No videos found in this category yet.
                  </p>
                </div>
              )
            ) : (
              // For all other categories, show CategoryPostsList
              posts.length > 0 ? (
                <CategoryPostsList 
                  initialPosts={posts}
                  categoryId={category._id}
                  categoryTitle={category.title}
                  sortOrder={
                    sortBy === 'title_asc' ? 'title asc' :
                    sortBy === 'title_desc' ? 'title desc' :
                    sortBy === 'date_asc' ? 'publishedAt asc' :
                    sortBy === 'author_asc' ? 'author.name asc' :
                    sortBy === 'author_desc' ? 'author.name desc' :
                    'publishedAt desc' // Default sort
                  }
                />
              ) : (
                // Message when no posts are found
                <div className="content-section p-6">
                  <p className="font-body text-center text-gray-500 dark:text-gray-400 py-10">
                    No posts found in this category yet.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Right Sidebar - Ads and Related Content */}
          <div className="lg:col-span-4 order-2">
            <div className="sticky top-[156px]">
              {/* Empty space for sidebar layout */}
              <div className="w-full"></div>
              
              {/* Related Categories Box */}
              <div className="content-section p-5 mt-8">
                <h3 className="text-3xl font-body text-yellow-500 dark:text-yellow-300 uppercase mb-4 tracking-wider">
                  Related Categories
                </h3>
                <ul className="space-y-3">
                  {allCategories
                    .filter(cat => cat._id !== category._id)
                    .slice(0, 5)
                    .map(cat => (
                      <li key={cat._id}>
                        <Link 
                          href={`/category/${cat.slug?.current || cat.title.toLowerCase().replace(/\s+/g, '-')}`}
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
