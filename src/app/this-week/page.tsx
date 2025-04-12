import { Metadata } from "next";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { generateStaticPageMetadata } from "@/lib/metadata";
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

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

interface ThisWeekPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Function to fetch posts and categories
async function getThisWeekData(): Promise<{ posts: Post[]; allCategories: Category[]; usedFallback: boolean }> {
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const formattedDate = sevenDaysAgo.toISOString();
  
  // Fetch all categories
  const allCategoriesQuery = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;

  // Fetch posts from the last 7 days
  const recentPostsQuery = groq`*[_type == "post" && publishedAt >= $fromDate]{
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
  } | order(publishedAt desc)`;  // Order by publish date, we'll randomize later

  // Fallback query to fetch the most recent posts regardless of date
  const fallbackPostsQuery = groq`*[_type == "post"]{
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
  } | order(publishedAt desc)[0...12]`;  // Get the 12 most recent posts

  // Fetch data concurrently
  try {
    console.log("Fetching posts from the last 7 days for This Week page...");
    const [allCategories, fetchedRecentPosts] = await Promise.all([
      client.fetch<Category[]>(allCategoriesQuery, {}, { cache: 'no-store' }),
      client.fetch<Post[]>(recentPostsQuery, { fromDate: formattedDate }, { cache: 'no-store' })
    ]);
    
    let posts = [];
    let usedFallback = false;
    
    // Check if we have recent posts
    if (fetchedRecentPosts && fetchedRecentPosts.length > 0) {
      // Randomize the recent posts
      posts = [...fetchedRecentPosts].sort(() => Math.random() - 0.5);
    } else {
      // Fallback to most recent posts if no posts in the last 7 days
      console.log("No posts found in the last 7 days, fetching most recent posts instead...");
      const fallbackPosts = await client.fetch<Post[]>(fallbackPostsQuery, {}, { cache: 'no-store' });
      posts = fallbackPosts || [];
      usedFallback = true;
    }
    
    return { 
      posts, 
      allCategories: allCategories || [],
      usedFallback
    };
  } catch (error) {
    console.error("Failed to fetch data for This Week page:", error);
    return { posts: [], allCategories: [], usedFallback: false };
  }
}

// Define metadata for the page
export const metadata: Metadata = generateStaticPageMetadata(
  "This Week at VPN",
  "Browse our latest articles at Video Production News.",
  "this-week"
);

// The This Week Page Component
export default async function ThisWeekPage({ searchParams }: ThisWeekPageProps) {
  // Fetch data
  const { posts, allCategories, usedFallback } = await getThisWeekData();

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

  return (
    <Layout categories={allCategories}>
      <div className="container mx-auto px-4 py-8">
        {/* Empty space for top margin */}
        <div className="mb-8"></div>
        
        {/* Page Header Section */}
        <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
            This Week at VPN
          </h1>
          <p className="text-lg font-body text-gray-600 dark:text-gray-400">
            {usedFallback 
              ? "Selection of our most recent articles" 
              : "Random selection of articles published in the last 7 days"}
          </p>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 order-1">
            {posts.length > 0 ? (
              <div className="content-section p-6">
                {/* Fallback notification */}
                {usedFallback && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Note</h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                          <p>
                            No articles were published in the last 7 days. Showing the most recent articles instead.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-8">
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
                            {/* Category tag if available */}
                            {p.categories && p.categories.length > 0 && (
                              <Link
                                href={`/category/${p.categories[0].slug?.current || p.categories[0].title.toLowerCase().replace(/\s+/g, '-')}`}
                                className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
                              >
                                {p.categories[0].title}
                              </Link>
                            )}
                            
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
                              {p.author?.name && (
                                <span>
                                  By {p.author.slug ? (
                                    <Link href={`/author/${p.author.slug.current}`} className="hover:text-vpn-blue dark:hover:text-blue-400">
                                      {p.author.name}
                                    </Link>
                                  ) : (
                                    p.author.name
                                  )} • 
                                </span>
                              )}
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
                  No articles found from the last 7 days.
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
