import { notFound } from "next/navigation";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
import type { Post, Category } from "@/types/sanity";
import { Metadata } from 'next';
import AmpLayout from "@/components/amp/AmpLayout";
import AmpArticleContent from "@/components/amp/AmpArticleContent";
import { generateArticleMetadata } from '@/lib/metadata';
import { extractFaqsFromContent } from "@/components/seo/FaqJsonLd";
import { generateSpeakableSelectors } from "@/components/seo/SpeakableJsonLd";

// --- Types ---
interface PageProps {
  params: { slug: string };
}

// --- Data Fetching ---
async function getArticleData(slug: string): Promise<{
  article: Post | null;
  allCategories: Category[];
}> {
  console.log(`[AmpPage] START: Attempting to fetch data for slug: ${slug}`);

  // Fetch all categories (needed for navigation)
  const allCategoriesQuery = groq`*[_type == "category"]{ _id, title, slug }`;
  const allCategoriesPromise = client.fetch<Category[]>(allCategoriesQuery).catch(err => {
    console.error("Failed to fetch all categories in getArticleData:", err);
    return [];
  });

  // Fetch article
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
    }
  }`;
  console.log(`[AmpPage] Running article query for slug: ${slug}`);
  const articlePromise = client.fetch<Post | null>(articleQuery, { slug });

  // Await both fetches
  const [allCategories, article] = await Promise.all([allCategoriesPromise, articlePromise]);
  const safeAllCategories = allCategories || [];

  console.log(`[AmpPage] Article found: ${!!article}`);
  if (article) {
    console.log(`[AmpPage] Article title: ${article.title}`);
  }

  return { article, allCategories: safeAllCategories };
}

// --- Metadata Generation ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (!slug) {
    console.log("[AmpPage] No slug found in params.");
    return { title: 'Invalid Request' };
  }
  
  const { article } = await getArticleData(slug);

  if (article) {
    const metadata = generateArticleMetadata(article);
    
    // Add AMP-specific metadata
    return {
      ...metadata,
      alternates: {
        ...metadata.alternates,
        canonical: `https://www.vpnnews.co.uk/${article.slug.current}`,
        // Next.js doesn't have a built-in amphtml property, so we'll use types property
        types: {
          ...metadata.alternates?.types,
          'application/vnd.amp.html': `https://www.vpnnews.co.uk/amp/${article.slug.current}`,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
    };
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
    console.log('[AmpPage] Skipping generateStaticParams in production/Netlify environment');
    return [];
  }
  
  try {
    // Get all article slugs
    const articleSlugsQuery = groq`*[_type == "post" && defined(slug.current)][].slug.current`;
    const articleSlugs = await client.fetch<string[]>(articleSlugsQuery);
    
    // Return slugs
    return articleSlugs.map(slug => ({
      slug,
    }));
  } catch (error) {
    console.error('[AmpPage] Error generating static params:', error);
    return []; // Fallback to empty array on error
  }
}

// --- Page Component ---
export default async function AmpPage({ params }: PageProps) {
  // Await params since it's a Promise in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  console.log(`[AmpPage] START Rendering for slug: ${slug}`);

  if (!slug) {
    console.log(`[AmpPage] No slug found in params. Calling notFound().`);
    notFound(); // If no slug in params, it's an invalid route
  }

  // Fetch article data
  const { article, allCategories } = await getArticleData(slug);
  
  // If no article found, return 404
  if (!article) {
    console.log(`[AmpPage] No article found for slug: ${slug}. Calling notFound().`);
    notFound();
  }

  // Generate metadata for the page
  const metadata = await generateMetadata({ params });
  
  // Extract FAQs from article content if available
  const faqs = article.body ? extractFaqsFromContent(article.body) : [];
  const articleUrl = `https://www.vpnnews.co.uk/${article.slug?.current || slug}`;
  
  // Format the date in ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toISOString();
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };
  
  // Get the first category name or default to "News"
  const categoryName = article.categories && article.categories.length > 0
    ? article.categories[0].title
    : "News";
  
  // Get the author name or default to "VPN Editorial Team"
  const authorName = article.author?.name || "VPN Editorial Team";
  
  // Generate structured data for the article with proper null checks
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title || "News Article",
    "name": article.title || "News Article",
    "description": article.excerpt || `Read the latest news from VPN News`,
    "image": article.mainImage?.asset?.url 
      ? [article.mainImage.asset.url]
      : ["https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"],
    "datePublished": formatDate(article.publishedAt),
    "dateModified": article.lastUpdatedAt ? formatDate(article.lastUpdatedAt) : formatDate(article.publishedAt),
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": article.author?.slug ? `https://www.vpnnews.co.uk/author/${article.author.slug.current}` : "https://www.vpnnews.co.uk/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
        "width": 600,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "articleSection": categoryName,
    "isAccessibleForFree": "True",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": generateSpeakableSelectors('news')
    },
    "inLanguage": "en-US"
  };
  
  // Add series information if article is part of a series
  if (article.series && article.series.seriesRef && article.seriesArticles) {
    const seriesRef = article.series.seriesRef;
    const partNumber = article.series.partNumber || 1;
    
    // Format series articles for structured data
    const seriesArticlesList = article.seriesArticles
      .filter(a => a && a.slug && a.title)
      .map(a => ({
        "@type": "Article",
        "headline": a.title,
        "url": `https://www.vpnnews.co.uk/${a.slug.current}`,
        "position": a.series?.partNumber || 0
      }))
      .sort((a, b) => a.position - b.position);
    
    // Add series data to article structured data
    (articleStructuredData as any).isPartOf = {
      "@type": "CreativeWorkSeries",
      "name": seriesRef.title,
      "url": `https://www.vpnnews.co.uk/series/${seriesRef.slug.current}`,
      "position": partNumber,
      "numberOfItems": seriesRef.totalPlannedParts
    };
    
    // Add other articles in the series
    if (seriesArticlesList.length > 0) {
      (articleStructuredData as any).hasPart = seriesArticlesList;
    }
  }
  
  // Add standout property for breaking news
  if (article.isBreakingNews) {
    (articleStructuredData as any).standout = true;
  }
  
  // Generate FAQ structured data if FAQs are available
  const faqStructuredData = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;
  
  // Create a custom metadata object that AmpLayout can handle
  const customMetadata = {
    ...metadata,
    structuredData: JSON.stringify([
      articleStructuredData,
      ...(faqStructuredData ? [faqStructuredData] : [])
    ])
  };

  // Add additional error handling
  try {

    return (
      <AmpLayout metadata={customMetadata}>
        <AmpArticleContent article={article} />
      </AmpLayout>
    );
  } catch (error) {
    console.error('[AmpPage] Error rendering AMP page:', error);
    return (
      <AmpLayout>
        <div className="error-container">
          <h1>Error Loading Article</h1>
          <p>We're sorry, but there was an error loading this article. Please try again later.</p>
        </div>
      </AmpLayout>
    );
  }
}
