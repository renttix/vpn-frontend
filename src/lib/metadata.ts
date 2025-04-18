import { Metadata } from 'next';

// Base URL for the site
export const siteUrl = 'https://www.vpnnews.co.uk';

// Default metadata values
export const defaultMetadata: Metadata = {
  title: {
    default: 'VPN News',
    template: '%s | VPN News'
  },
  description: 'Breaking legal news, court reports, and expert analysis on the most important cases and legal developments.',
  keywords: ['legal news', 'court reports', 'crime news', 'UK legal system', 'justice', 'law', 'criminal cases'],
  authors: [{ name: 'VPN News Team' }],
  creator: 'VPN News',
  publisher: 'VPN News',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteUrl,
    siteName: 'VPN News',
    title: 'VPN News',
    description: 'Breaking legal news, court reports, and expert analysis on the most important cases and legal developments.',
    images: [
      {
        // Use a Sanity CDN URL for the default image
        url: '/images/cover.jpg',
        width: 1000,
        height: 525,
        alt: 'VPN News Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VPN News',
    description: 'Breaking legal news, court reports, and expert analysis on the most important cases and legal developments.',
    site: '@vpnnews',
    creator: '@vpnnews',
    images: ['/images/cover.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
};

// Helper function to generate article metadata
export function generateArticleMetadata(article: any): Metadata {
  const title = article.title;
  const description = article.excerpt || `Read the article: ${article.title}`;
  const url = `${siteUrl}/${article.slug.current}`;
  const imageUrl = article.mainImage?.asset?.url || '/images/cover.jpg';
  const publishedTime = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;
  const authorName = article.author?.name || 'VPN News Team';
  const authorUrl = article.author?.slug?.current ? `${siteUrl}/author/${article.author.slug.current}` : undefined;
  
  const categoryNames = article.categories?.map((cat: any) => cat.title) || [];
  
  // Add Google News standout tag for breaking news
  const other: Record<string, string> = {};
  if (article.isBreakingNews) {
    other.standout = url; // This will become <link rel="standout" href="https://vpnnews.com/your-article-url" />
  }
  
  return {
    title: title,
    description: description,
    alternates: {
      canonical: url,
    },
    other: Object.keys(other).length > 0 ? other : undefined,
    openGraph: {
      type: 'article',
      url: url,
      title: title,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: publishedTime,
      authors: authorUrl ? [authorUrl] : undefined,
      section: categoryNames.length > 0 ? categoryNames[0] : 'News',
      tags: categoryNames,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
      creator: '@vpnnews',
    },
  };
}

// Helper function to generate category metadata
export function generateCategoryMetadata(category: any): Metadata {
  const title = category.title === 'Video' ? 'Legal Commentary' : category.title;
  const description = category.description || `Latest posts in the ${title} category.`;
  const url = `${siteUrl}/category/${category.slug?.current}`;
  
  return {
    title: title,
    description: description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url: url,
      title: `${title} | VPN News`,
      description: description,
    },
    twitter: {
      card: 'summary',
      title: `${title} | VPN News`,
      description: description,
    },
  };
}

// Helper function to generate static page metadata
export function generateStaticPageMetadata(title: string, description: string, path: string): Metadata {
  const url = `${siteUrl}/${path}`;
  
  return {
    title: title,
    description: description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url: url,
      title: `${title} | VPN News`,
      description: description,
    },
    twitter: {
      card: 'summary',
      title: `${title} | VPN News`,
      description: description,
    },
  };
}
