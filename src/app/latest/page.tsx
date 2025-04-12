import Link from 'next/link';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import { getSortOrder, validateSortParam } from '@/lib/sorting';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import { generateStaticPageMetadata } from '@/lib/metadata';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ArticleCardList from '@/components/ui/ArticleCardList';
import { fetchMorePosts } from './actions';

// Make this page fully dynamic
export const dynamic = 'force-dynamic';

// Define types
interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string; slug?: { current: string } };
  publishedAt: string;
  excerpt?: string;
  categories?: Category[];
}

interface LatestPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  'Latest Articles - VPN News',
  'Browse all the latest articles from VPN News, covering crime news, court reports, and legal commentary.',
  'latest'
);

// Function to fetch all posts and categories with pagination
async function getAllData(sortBy: string = 'date_desc', skip: number = 0, limit: number = 12): Promise<{ posts: Post[]; allCategories: Category[]; totalCount: number }> {
  // Fetch all categories
  const allCategoriesQuery = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;

  // Validate and get sort order
  const validSortBy = validateSortParam(sortBy);
  const postOrder = getSortOrder(validSortBy);

  // Count total posts
  const countQuery = groq`count(*[_type == "post"])`;

  // Fetch posts with pagination
  const postsQuery = groq`*[_type == "post"]{
    _id,
    title,
    slug,
    mainImage{ asset->{url, alt} },
    author->{name, slug},
    publishedAt,
    excerpt,
    categories[]->{
      _id,
      title,
      slug
    }
  } | order(${postOrder}) [${skip}...${skip + limit}]`;

  // Fetch data concurrently
  const [allCategories, posts, totalCount] = await Promise.all([
    client.fetch<Category[]>(allCategoriesQuery, {}, { cache: 'no-store' }),
    client.fetch<Post[]>(postsQuery, {}, { cache: 'no-store' }),
    client.fetch<number>(countQuery, {}, { cache: 'no-store' })
  ]);

  console.log(`[LatestPage] Fetched ${posts.length} posts (${skip}-${skip + limit} of ${totalCount}) and ${allCategories.length} categories`);
  
  return { 
    posts: posts || [], 
    allCategories: allCategories || [],
    totalCount: totalCount || 0
  };
}

// The Latest Articles Page Component
export default async function LatestPage({ searchParams }: LatestPageProps) {
  // Get and validate sort parameter from URL
  const sortBy = validateSortParam(typeof searchParams.sort === 'string' ? searchParams.sort : 'date_desc');
  
  // Fetch data
  const { posts, allCategories } = await getAllData(sortBy);

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
    const href = `/latest?sort=${sortValue}`;
    return (
      <a
        href={href}
        className={`font-body px-3 py-1 text-xs rounded ${isActive ? 'bg-vpn-blue text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {children}
      </a>
    );
  };

  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-8"></div>
        
        {/* Page Header Section */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
            Latest Articles
          </h1>
          <p className="text-lg font-body text-gray-600 dark:text-gray-400">
            Browse all the latest articles from VPN News
          </p>
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

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 order-1">
            {posts.length > 0 ? (
              <ArticleCardList
                initialPosts={posts}
                fetchMorePosts={async (skip: number, limit: number) => {
                  "use server";
                  return fetchMorePosts(skip, limit, sortBy);
                }}
              />
            ) : (
              // Message when no posts are found
              <div className="content-section p-6">
                <p className="font-body text-center text-gray-500 dark:text-gray-400 py-10">
                  No articles found.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Categories and Related Content */}
          <div className="lg:col-span-4 order-2">
            <div className="sticky top-[156px]">
              {/* Categories Box */}
              <div className="content-section p-5">
                <h3 className="text-3xl font-heading text-yellow-500 dark:text-yellow-300 uppercase mb-4 tracking-wider">
                  Categories
                </h3>
                <ul className="space-y-3">
                  {allCategories
                    .slice(0, 10)
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
              
              {/* Newsletter Box */}
              <div className="content-section p-5 mt-8">
                <h3 className="text-3xl font-heading text-yellow-500 dark:text-yellow-300 uppercase mb-4 tracking-wider">
                  Newsletter
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Get caught up in minutes with our speedy summary of today's must-read stories.
                </p>

                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-vpn-blue text-white font-bold py-2 px-4 rounded text-sm hover:bg-opacity-90"
                  >
                    SUBSCRIBE
                  </button>
                </form>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  By subscribing, you agree to our Terms of Use and Privacy Policy
                </p>
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
