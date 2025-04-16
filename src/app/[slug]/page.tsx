import Link from 'next/link'; // Import Link
import Image from 'next/image'; // Import Next.js Image component
import Breadcrumbs from '@/components/ui/Breadcrumbs'; // Import Breadcrumbs component
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import ArticleLayout from "@/components/article/ArticleLayout";
import ArticleContent from "@/components/article/ArticleContent";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentSection from "@/components/article/CommentSection";
import AuthorBio from "@/components/article/AuthorBio";
import SocialButtons from "./SocialButtons";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import type { Post, Category } from "@/types/sanity"; // Use shared types
import { Metadata } from 'next';
import CategoryJsonLd from "@/components/seo/CategoryJsonLd";
import BreadcrumbJsonLd, { generateArticleBreadcrumbs, generateCategoryBreadcrumbs } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd, { extractFaqsFromContent } from "@/components/seo/FaqJsonLd";
import SpeakableJsonLd, { generateSpeakableSelectors } from "@/components/seo/SpeakableJsonLd";
import NewsArticleJsonLd from "@/components/seo/NewsArticleJsonLd";
import SeriesJsonLd, { formatSeriesArticles } from "@/components/seo/SeriesJsonLd";
import { generateArticleMetadata, generateCategoryMetadata } from '@/lib/metadata';
import { trackArticleView, trackCategoryView } from '@/lib/events';
import CategoryPostsList from '@/components/category/CategoryPostsList';

// --- Types --- (Assuming Post and Category are correctly defined in @/types/sanity)
interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined }; // Add searchParams
}

// --- Data Fetching ---
// Combined function to fetch either post or category data
// Change signature to accept slug string directly
async function getPageData(slug: string, searchParams: { [key: string]: string | string[] | undefined }): Promise<{
  pageType: 'article' | 'category' | 'notFound';
  article: Post | null;
  category: Category | null;
  categoryPosts: Post[]; // Posts for the category page
  allCategories: Category[];
}> {
  // slug is now guaranteed to be a string here
  // Removed slug extraction from params inside this function
  console.log(`[getPageData] START: Attempting to fetch data for slug: ${slug}`);

  // Fetch all categories (needed for header)
  const allCategoriesQuery = groq`*[_type == "category"]{ _id, title, slug }`;
  const allCategoriesPromise = client.fetch<Category[]>(allCategoriesQuery).catch(err => {
      console.error("Failed to fetch all categories in getPageData:", err);
      return [];
  });

  // 1. Try fetching an article
  const articleQuery = groq`*[_type == "post" && slug.current == $slug][0]{
    _id, title, slug, mainImage{ asset->{url, alt} },
    author->{_id, name, slug, bio, image{asset->{url, alt}}},
    publishedAt, lastUpdatedAt, body, isBreakingNews,
    "categories": categories[]->{_id, title, slug},
    "tags": tags[]->{_id, title, slug},
    "series": series{
      "seriesRef": seriesRef->{
        _id, title, slug, description, 
        "coverImage": coverImage.asset->{url, alt},
        startDate, endDate, totalPlannedParts,
        "categories": categories[]->{_id, title, slug},
        "tags": tags[]->{_id, title, slug}
      },
      partNumber, partTitle, isFinalPart
    },
    "seriesArticles": *[_type == "post" && series.seriesRef._ref == ^.series.seriesRef._ref] | order(series.partNumber asc) {
      _id, title, slug, 
      "series": series{
        partNumber, partTitle, isFinalPart
      }
    },
    "relatedPosts": relatedPosts[]->{ 
      _id, title, slug, excerpt, 
      "author": author->name,
      "imageUrl": mainImage.asset->url
    }
  }`;
  console.log(`[getPageData] Running article query for slug: ${slug}`);
  const articlePromise = client.fetch<Post | null>(articleQuery, { slug });

  // Await both fetches
  const [allCategories, article] = await Promise.all([allCategoriesPromise, articlePromise]);
  const safeAllCategories = allCategories || [];

  // --- Corrected Logic ---
  if (article) {
    // Found an article
    console.log(`[getPageData] Found article: ${article.title}`);
    console.log(`[getPageData] Article body exists: ${!!article.body}`);
    if (article.body) {
      console.log(`[getPageData] Article body type: ${typeof article.body}`);
      console.log(`[getPageData] Article body is array: ${Array.isArray(article.body)}`);
      console.log(`[getPageData] Article body length: ${Array.isArray(article.body) ? article.body.length : 'N/A'}`);
    }
    return { pageType: 'article', article, category: null, categoryPosts: [], allCategories: safeAllCategories };
  }
  // Only proceed to check category if article is null
  console.log(`[getPageData] No article found for slug: ${slug}. Trying category...`);
  // Revert to using $slug parameter in the query
  // Ensure query uses $slug parameter
  const categoryQuery = groq`*[_type == "category" && slug.current == $slug][0]{
    _id, title, slug, description
  }`;
  console.log(`[getPageData] Running category query for slug: ${slug}`);
  // Pass slug as a parameter to the fetch call
  const category = await client.fetch<Category | null>(categoryQuery, { slug });

  if (category) {
    // Found a category
    console.log(`[getPageData] Found category: ${category.title}`);
    const sortBy = typeof searchParams?.sort === 'string' ? searchParams.sort : 'date_desc';
    let postOrder = 'publishedAt desc';
    if (sortBy === 'title_asc') postOrder = 'title asc';
    if (sortBy === 'title_desc') postOrder = 'title desc';
    if (sortBy === 'date_asc') postOrder = 'publishedAt asc';
    if (sortBy === 'author_asc') postOrder = 'author.name asc';
    if (sortBy === 'author_desc') postOrder = 'author.name desc';

    const categoryPostsQuery = groq`*[_type == "post" && references($categoryId)]{
      _id, title, slug, mainImage{ asset->{url, alt} }, author->{name}, publishedAt, excerpt
    } | order(${postOrder}) [0...12]`;
    const categoryPosts = await client.fetch<Post[]>(categoryPostsQuery, { categoryId: category._id }) || [];
    console.log(`[getPageData] Fetched ${categoryPosts.length} posts for category: ${category.title}`);
    return { pageType: 'category', article: null, category, categoryPosts, allCategories: safeAllCategories };
  }
  // No category found either
  console.log(`[getPageData] No category found for slug: ${slug}.`);
  // --- End Corrected Logic ---


  // If we reach here, neither article nor category was found
  console.log(`[getPageData] END: Neither article nor category found for slug: ${slug}. Returning 'notFound'.`);
  return { pageType: 'notFound', article: null, category: null, categoryPosts: [], allCategories: safeAllCategories };
}


// --- Metadata Generation ---
export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Await searchParams as well
  const resolvedSearchParams = await searchParams;
  
  if (!slug) {
    console.log("[generateMetadata] No slug found in params.");
    return { title: 'Invalid Request' };
  }
  
  // Pass the confirmed slug string and resolved search params
  const { pageType, article, category } = await getPageData(slug, resolvedSearchParams);

  if (pageType === 'article' && article) {
    const metadata = generateArticleMetadata(article);
    
    // Add AMP link for article pages
    return {
      ...metadata,
      alternates: {
        ...metadata.alternates,
        types: {
          ...metadata.alternates?.types,
          'application/vnd.amp.html': `https://www.vpnnews.co.uk/amp/${article.slug?.current || slug}`,
        },
      },
    };
  } else if (pageType === 'category' && category) {
    return generateCategoryMetadata(category);
  } else {
    return { 
      title: 'Not Found',
      description: 'The page you are looking for does not exist.',
      robots: { index: false, follow: false }
    };
  }
}

// --- Make this page fully dynamic ---
export const dynamic = 'force-dynamic';

// Return empty array to make this page fully dynamic
export async function generateStaticParams() {
  // In production builds on Netlify, return empty array to avoid API calls
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    console.log('[SlugPage] Skipping generateStaticParams in production/Netlify environment');
    return [];
  }
  
  try {
    // Get all article and category slugs
    const articleSlugsQuery = groq`*[_type == "post" && defined(slug.current)][].slug.current`;
    const categorySlugsQuery = groq`*[_type == "category" && defined(slug.current)][].slug.current`;
    
    const [articleSlugs, categorySlugs] = await Promise.all([
      client.fetch<string[]>(articleSlugsQuery),
      client.fetch<string[]>(categorySlugsQuery)
    ]);
    
    // Combine all slugs
    const allSlugs = [...articleSlugs, ...categorySlugs];
    
    // Return unique slugs
    return [...new Set(allSlugs)].map(slug => ({
      slug,
    }));
  } catch (error) {
    console.error('[SlugPage] Error generating static params:', error);
    return []; // Fallback to empty array on error
  }
}


// --- Page Component ---
export default async function SlugPage({ params, searchParams }: any) {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Await searchParams as well
  const resolvedSearchParams = await searchParams;
  
  console.log(`[SlugPage] START Rendering for slug: ${slug}`, `Search Params:`, resolvedSearchParams);

  if (!slug) {
    console.log(`[SlugPage] No slug found in params. Calling notFound().`);
    notFound(); // If no slug in params, it's an invalid route
  }

  // Pass the confirmed slug string and resolved search params
  const { pageType, article, category, categoryPosts, allCategories } = await getPageData(slug, resolvedSearchParams);
  console.log(`[SlugPage] getPageData result: pageType=${pageType}, article=${!!article}, category=${!!category}`);

  // --- Render Article ---
  if (pageType === 'article' && article) {
    console.log(`[SlugPage] Rendering ARTICLE: ${article.title}`);
    const author = article.author;
    
    console.log(`[SlugPage] RETURNING ARTICLE JSX for: ${article.title}`); // Log before returning JSX
    
    // Generate breadcrumbs using the enhanced helper function with null checks
    const articleBreadcrumbs = generateArticleBreadcrumbs(
      article.title || 'Article',
      article.slug?.current || slug, // Use the URL slug as fallback
      article.categories,
      article.tags,
      article.author,
      article.mainImage?.asset?.url
    );
    
    // Track article view for analytics
    if (typeof window !== 'undefined') {
      // This will only run on the client side
      trackArticleView(article);
    }
    
    // Extract FAQs from article content if available
    const faqs = article.body ? extractFaqsFromContent(article.body) : [];
    const articleUrl = `https://www.vpnnews.co.uk/${article.slug?.current || slug}`;
    
    return (
      <Layout categories={allCategories}>
        {/* Schema.org markup - optimized for Google News */}
        <BreadcrumbJsonLd items={articleBreadcrumbs} />
        {article && (
          <NewsArticleJsonLd 
            article={article} 
            url={articleUrl} 
            isGoogleNews={true}
          />
        )}
        {article && article.series && article.series.seriesRef && article.seriesArticles && (
          <SeriesJsonLd
            series={article.series.seriesRef}
            seriesUrl={`https://www.vpnnews.co.uk/series/${article.series.seriesRef.slug.current}`}
            article={article}
            articleUrl={articleUrl}
            partNumber={article.series.partNumber || 1}
            totalParts={article.series.seriesRef.totalPlannedParts}
            articleList={formatSeriesArticles(article.seriesArticles)}
          />
        )}
        {faqs.length > 0 && (
          <FaqJsonLd faqs={faqs} url={articleUrl} />
        )}
        <SpeakableJsonLd 
          cssSelectors={generateSpeakableSelectors('news')} 
          url={articleUrl} 
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Visual breadcrumbs */}
          <Breadcrumbs items={articleBreadcrumbs} className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-200 dark:border-gray-700 rounded-sm">
                {article.body ? (
                  <>
                    <ArticleContent article={article} />
                    <SocialButtons title={article.title} />
                    {author && <AuthorBio author={author} />}
                    <CommentSection articleId={article._id} />
                  </>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">Article Content Unavailable</h2>
                    <p className="text-yellow-700">The content for this article is currently unavailable. Please try again later.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Related Articles */}
              {article && article._id && (
                <RelatedArticles 
                  currentArticleId={article._id} 
                  relatedPosts={article.relatedPosts} 
                />
              )}

              {/* Newsletter Signup */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 mt-8 rounded-sm">
                <h3 className="font-body font-bold text-lg mb-2">Newsletter</h3>
                <p className="font-body text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get caught up in minutes with our speedy summary of today's must-read stories.
                </p>

                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="font-body w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="font-body w-full bg-vpn-red text-white font-bold py-2 px-4 rounded text-sm hover:bg-opacity-90"
                  >
                    SUBSCRIBE
                  </button>
                </form>

                <p className="font-body text-xs text-gray-500 dark:text-gray-400 mt-3">
                  By subscribing, you agree to our Terms of Use and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- Render Category ---
  if (pageType === 'category' && category) {
    console.log(`[SlugPage] Rendering CATEGORY layout for: ${category.title}`);
    const sortBy = typeof searchParams?.sort === 'string' ? searchParams.sort : 'date_desc';

    const formatDate = (dateString: string) => {
      try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
      catch (e) { return 'Invalid Date'; }
    };

    const SortLink = ({ sortValue, currentSort, children }: { sortValue: string; currentSort: string; children: React.ReactNode }) => {
      const isActive = sortValue === currentSort;
      const href = `/${category.slug?.current || slug}?sort=${sortValue}`; // Use direct slug with fallback
      return (
        <Link href={href} className={`font-body px-3 py-1 text-xs rounded ${isActive ? 'bg-vpn-blue text-white font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
          {children}
        </Link>
      );
    };

    console.log(`[SlugPage] RETURNING CATEGORY JSX for: ${category.title}`); // Log before returning JSX
    // Generate breadcrumbs using the enhanced helper function
    const categoryBreadcrumbs = generateCategoryBreadcrumbs(category);

    // Track category view for analytics
    if (typeof window !== 'undefined') {
      // This will only run on the client side
      trackCategoryView(category);
    }
    
    return (
      <Layout categories={allCategories}>
        {/* Schema.org markup for category page */}
        <BreadcrumbJsonLd items={categoryBreadcrumbs} />
        <CategoryJsonLd 
          category={category} 
          posts={categoryPosts}
          url={`https://www.vpnnews.co.uk/${category.slug?.current || slug}`} 
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Visual breadcrumbs */}
          <Breadcrumbs items={categoryBreadcrumbs} className="mb-6" />
          {/* Category Header */}
          <div className="mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
            <h1 className="text-3xl md:text-4xl font-body font-bold text-vpn-blue dark:text-blue-400 uppercase mb-2">
              {category.title === 'Video' ? 'Legal Commentary' : category.title}
            </h1>
            {category.description && <p className="font-body text-lg text-gray-600 dark:text-gray-400">{category.description}</p>}
          </div>

          {/* Sorting Controls */}
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="font-body text-sm font-medium mr-2">Sort by:</span>
            <SortLink sortValue="date_desc" currentSort={sortBy}>Date (Newest)</SortLink>
            <SortLink sortValue="date_asc" currentSort={sortBy}>Date (Oldest)</SortLink>
            <SortLink sortValue="title_asc" currentSort={sortBy}>Title (A-Z)</SortLink>
            <SortLink sortValue="title_desc" currentSort={sortBy}>Title (Z-A)</SortLink>
            <SortLink sortValue="author_asc" currentSort={sortBy}>Author (A-Z)</SortLink>
            <SortLink sortValue="author_desc" currentSort={sortBy}>Author (Z-A)</SortLink>
          </div>

          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 order-1 md:order-1">
              <div className="sticky top-20">
                <div className="w-full"></div>
              </div>
            </div>
            {/* Middle Content */}
            <div className="md:col-span-2 order-3 md:order-2">
              {categoryPosts.length > 0 ? (
                <CategoryPostsList 
                  initialPosts={categoryPosts}
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
                <p className="font-body text-center text-gray-500 dark:text-gray-400 py-10 col-span-full">No posts found in this category yet.</p>
              )}
            </div>
            {/* Right Column */}
            <div className="md:col-span-1 order-2 md:order-3">
              <div className="sticky top-20">
                <div className="w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- Render Not Found ---
  console.log(`[SlugPage] Page type is '${pageType}'. Neither article nor category found for slug: ${slug}. Calling notFound().`);
  notFound();
}
