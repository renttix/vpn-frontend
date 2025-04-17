import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from 'next';
import { groq } from "next-sanity";
import { client } from "@/lib/sanity.client";
import Layout from "@/components/layout/Layout";
import { PortableText } from "@portabletext/react";
import { formatDate } from "@/lib/utils";
import OptimizedImage from "@/components/ui/OptimizedImage";
import AuthorJsonLd from "./AuthorJsonLd";
import BreadcrumbJsonLd, { generateAuthorBreadcrumbs } from "@/components/seo/BreadcrumbJsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Author, Post, Category } from "@/types/sanity";
import { trackAuthorView } from '@/lib/events';
import { getFullUrl } from '@/lib/urlUtils';

// --- Types ---
interface PageProps {
  params: { slug: string };
}

// --- Data Fetching ---
async function getAuthorData(slug: string): Promise<{
  author: Author | null;
  authorPosts: Post[];
  allCategories: Category[];
}> {
  console.log(`[getAuthorData] Attempting to fetch data for author slug: ${slug}`);

  // Fetch all categories (needed for header)
  const allCategoriesQuery = groq`*[_type == "category"]{ _id, title, slug }`;
  const allCategoriesPromise = client.fetch<Category[]>(allCategoriesQuery).catch(err => {
    console.error("Failed to fetch all categories in getAuthorData:", err);
    return [];
  });

  // Fetch author data
  const authorQuery = groq`*[_type == "author" && slug.current == $slug][0]{
    _id, name, slug, bio, image{asset->{url, alt}},
    "postCount": count(*[_type == "post" && references(^._id)])
  }`;
  const authorPromise = client.fetch<Author | null>(authorQuery, { slug });

  // Await both fetches
  const [allCategories, author] = await Promise.all([allCategoriesPromise, authorPromise]);
  const safeAllCategories = allCategories || [];

  if (!author) {
    console.log(`[getAuthorData] No author found for slug: ${slug}`);
    return { author: null, authorPosts: [], allCategories: safeAllCategories };
  }

  // Fetch recent posts by this author
  const authorPostsQuery = groq`*[_type == "post" && references($authorId)]{
    _id, title, slug, mainImage{asset->{url, alt}}, publishedAt, excerpt,
    categories[]->{_id, title, slug}
  } | order(publishedAt desc)[0...8]`;
  const authorPosts = await client.fetch<Post[]>(authorPostsQuery, { authorId: author._id }) || [];
  console.log(`[getAuthorData] Fetched ${authorPosts.length} posts for author: ${author.name}`);

  return { author, authorPosts, allCategories: safeAllCategories };
}

// --- Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (!slug) {
    console.log("[generateMetadata] No slug found in params.");
    return { title: 'Author Not Found' };
  }
  
  const { author } = await getAuthorData(slug);

  if (!author) {
    return { title: 'Author Not Found' };
  }

  return {
    title: `${author.name} - VPN News`,
    description: author.bio ? `Articles by ${author.name}` : `Read the latest articles by ${author.name} on VPN News.`,
    alternates: { canonical: `/author/${author.slug?.current || slug}` },
    openGraph: {
      type: 'profile',
      title: `${author.name} - VPN News`,
      description: `Articles by ${author.name}`,
      images: author.image?.asset?.url ? [
        {
          url: author.image.asset.url,
          width: 800,
          height: 800,
          alt: author.name,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.name} - VPN News`,
      description: `Articles by ${author.name}`,
      images: author.image?.asset?.url ? [author.image.asset.url] : undefined,
    },
  };
}

// --- Make this page fully dynamic ---
export const dynamic = 'force-dynamic';

// --- Page Component ---
export default async function AuthorPage({ params }: PageProps) {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  console.log(`[AuthorPage] Rendering for author slug: ${slug}`);

  if (!slug) {
    console.log(`[AuthorPage] No slug found in params. Calling notFound().`);
    notFound(); // If no slug in params, it's an invalid route
  }

  const { author, authorPosts, allCategories } = await getAuthorData(slug);

  if (!author) {
    console.log(`[AuthorPage] No author found for slug: ${slug}. Calling notFound().`);
    notFound();
  }

  // Simple components for rendering author bio
  const bioComponents = {
    block: {
      normal: ({children}: any) => {
        return <p className="font-body text-base leading-relaxed mb-4 text-vpn-gray dark:text-gray-300">{children}</p>;
      },
    },
    marks: {
      link: ({ children, value }: any) => {
        if (!value?.href) return <>{children}</>;
        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
        const target = !value.href.startsWith('/') ? '_blank' : undefined;
        return (
          <a href={value.href} rel={rel} target={target} className="text-vpn-blue hover:underline transition-colors">
            {children}
          </a>
        );
      },
    },
  };

  // Construct the full URL for the author page
  const authorUrl = getFullUrl(`author/${author.slug?.current || slug}`);

  // Track author view for analytics
  if (typeof window !== 'undefined') {
    // This will only run on the client side
    trackAuthorView(author);
  }
  
  return (
    <Layout categories={allCategories}>
      {/* Add structured data for Google News */}
      {/* Add structured data */}
      <AuthorJsonLd 
        author={author} 
        authorPosts={authorPosts} 
        url={authorUrl} 
      />
      <BreadcrumbJsonLd items={generateAuthorBreadcrumbs(author || { name: 'Author', _id: '' })} />
      <div className="container mx-auto px-4 py-8">
        {/* Visual breadcrumbs */}
        <Breadcrumbs items={generateAuthorBreadcrumbs(author || { name: 'Author', _id: '' })} className="mb-6" />
        {/* Author Header */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-200 dark:border-gray-700 rounded-sm mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Author Image */}
            {author.image?.asset?.url && (
              <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden" style={{ position: 'relative' }}>
                  <Image
                    src={author.image.asset.url}
                    alt={author.image.asset.alt || `Photo of ${author.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </div>
            )}
            
            {/* Author Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-body font-bold text-vpn-gray dark:text-white mb-2">
                {author.name}
              </h1>
              
              
              {/* Author Bio */}
              {author.bio ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <PortableText value={author.bio} components={bioComponents} />
                </div>
              ) : (
                <p className="text-vpn-gray dark:text-gray-300 italic">
                  No bio available for this author.
                </p>
              )}
              
              {/* Author Stats */}
              <div className="mt-4 text-sm text-vpn-gray-light dark:text-gray-400">
                <span>{authorPosts.length} articles published</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Author's Articles */}
        <div className="mb-8">
          <h2 className="text-2xl font-body font-bold text-vpn-gray dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            Articles by {author.name}
          </h2>
          
          {authorPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authorPosts.map(post => (
                <article key={post._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden shadow-sm">
                  {/* Article Image */}
                  <Link href={`/${post.slug?.current ?? '#'}`} className="block">
                    {post.mainImage?.asset?.url ? (
                      <div className="aspect-[16/9] overflow-hidden" style={{ position: 'relative' }}>
                        <OptimizedImage
                          image={post.mainImage}
                          alt={post.mainImage.asset.alt || post.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[16/9] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Article Content */}
                  <div className="p-4">
                    <Link href={`/${post.slug?.current ?? '#'}`}>
                      <h3 className="text-lg font-body font-bold text-vpn-gray dark:text-white mb-2 hover:text-vpn-blue dark:hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    
                    {post.excerpt && (
                      <p className="text-sm text-vpn-gray-light dark:text-gray-300 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-vpn-gray-light dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                      
                      {post.categories && post.categories.length > 0 && (
                        <Link 
                          href={`/category/${post.categories[0].slug?.current ?? '#'}`}
                          className="text-vpn-blue dark:text-blue-400 hover:underline"
                        >
                          {post.categories[0].title}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-vpn-gray-light dark:text-gray-400 py-8">
              No articles found by this author.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
