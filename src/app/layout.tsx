import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import AdSenseScript from "@/components/ads/AdSenseScript";
import "./globals.css";
import "./fonts.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/ThemeProvider";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

// Optimize font loading for better Core Web Vitals
const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap', // Use 'swap' to prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  adjustFontFallback: true, // Reduce layout shift by matching fallback metrics
  variable: '--font-roboto', // Enable as CSS variable for more flexibility
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vpnnews.com'),
  title: {
    default: "Video Production News: Reporting the Truth from the Courtroom Out",
    template: "%s | Video Production News"
  },
  description: "Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.",
  keywords: ["legal news", "court reports", "crime news", "criminal cases", "legal analysis", "law enforcement", "justice system", "trial coverage"],
  authors: [{ name: "Video Production News Team" }],
  creator: "Video Production News",
  publisher: "Video Production News",
  category: "News",
  icons: {
    icon: '/images/vpn.ico',
    shortcut: '/images/vpn.ico',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "google-site-verification": "google-site-verification-code",
    "news_keywords": "legal news, court reports, crime news, criminal cases, legal analysis",
    "copyright": `© ${new Date().getFullYear()} Video Production News`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vpnnews.com',
    siteName: 'Video Production News',
    title: 'Video Production News: Reporting the Truth from the Courtroom Out',
    description: 'Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.',
    images: [
      {
        url: 'https://vpnnews.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video Production News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Production News: Reporting the Truth from the Courtroom Out',
    description: 'Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.',
    images: ['https://vpnnews.com/images/twitter-image.jpg'],
    creator: '@vpnnews',
    site: '@vpnnews',
  },
  alternates: {
    canonical: 'https://vpnnews.com',
    languages: {
      'en-US': 'https://vpnnews.com',
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    other: {
      'msvalidate.01': 'bing-verification-code',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link
          rel="icon"
          href="/images/vpn.ico"
          type="image/x-icon"
        />
        <link
          rel="shortcut icon"
          href="/images/vpn.ico"
          type="image/x-icon"
        />
        
        {/* Preload Google Fonts with optimized strategy */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          fetchPriority="high"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        
        {/* Preload critical JavaScript instead of images for better performance */}
        
        {/* Preload critical JavaScript */}
        <link 
          rel="modulepreload" 
          href="/_next/static/chunks/main.js" 
          as="script"
        />
        
        {/* Font display and performance optimization */}
        <style>
          {`
            html {
              font-size: 100%; /* Prevent zooming layout shifts */
              text-size-adjust: 100%; /* Prevent mobile text inflation */
            }
            
            /* Ensure text remains visible during webfont load */
            .font-body {
              font-display: swap;
            }
            
            /* Prevent layout shifts with font loading */
            body {
              font-family: ${roboto.style.fontFamily};
            }
            
            /* Optimize for Core Web Vitals */
            img, video {
              max-width: 100%;
              height: auto;
              display: block;
              contain: content;
            }
            
            /* Content-visibility for off-screen content */
            .content-visibility-auto {
              content-visibility: auto;
              contain-intrinsic-size: 0 500px;
            }
          `}
        </style>
        
        {/* Logo is rendered as text in the header */}
        
        {/* RSS Feed */}
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Video Production News RSS Feed" 
          href="/feed.xml" 
        />
        
        {/* JSON Feed */}
        <link 
          rel="alternate" 
          type="application/feed+json" 
          title="Video Production News JSON Feed" 
          href="/feed.json" 
        />
        
        {/* Google News Publisher */}
        <meta name="google-news-publication" content="Video Production News" />
        
        {/* Add priority hints for browsers that support it */}
        <meta name="priority" content="1.0" />
      </head>
      {/* Google Analytics is now loaded conditionally based on cookie consent */}
      <body className={`${roboto.className} ${roboto.variable}`}>
        {/* Add structured data for the organization */}
        <OrganizationJsonLd />
        
        {/* AdSense script is loaded client-side only */}
        <AdSenseScript />
        
        <ThemeProvider defaultTheme="light" storageKey="vpn-theme">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>}>
            <ClientBody>{children}</ClientBody>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
