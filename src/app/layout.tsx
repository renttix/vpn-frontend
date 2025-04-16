import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import AdSenseScript from "@/components/ads/AdSenseScript";
import "./globals.css";
import "./fonts.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/ThemeProvider";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";
import SiteNavigationJsonLd from "@/components/seo/SiteNavigationJsonLd";
import { SchemaProvider } from "@/contexts/SchemaContext";

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
  metadataBase: new URL('https://www.vpnnews.co.uk'),
  title: {
    default: "VPN News: Reporting the Truth from the Courtroom Out",
    template: "%s | VPN News"
  },
  description: "Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.",
  keywords: ["legal news", "court reports", "crime news", "criminal cases", "legal analysis", "law enforcement", "justice system", "trial coverage"],
  authors: [{ name: "VPN News Team" }],
  creator: "VPN News",
  publisher: "VPN News",
  category: "News",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/vpn.ico',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "google-site-verification": "google-site-verification-code",
    "news_keywords": "legal news, court reports, crime news, criminal cases, legal analysis",
    "copyright": `© ${new Date().getFullYear()} VPN News`,
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
    url: 'https://www.vpnnews.co.uk',
    siteName: 'VPN News',
    title: 'VPN News: Reporting the Truth from the Courtroom Out',
    description: 'Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.',
    images: [
      {
        url: 'https://www.vpnnews.co.uk/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VPN News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VPN News: Reporting the Truth from the Courtroom Out',
    description: 'Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.',
    images: ['https://www.vpnnews.co.uk/images/twitter-image.jpg'],
    creator: '@vpnnews',
    site: '@vpnnews',
  },
  alternates: {
    canonical: 'https://www.vpnnews.co.uk',
    languages: {
      'en-US': 'https://www.vpnnews.co.uk',
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
        {/* Google AdSense Script - Direct inclusion for crawler detection */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1954539584146592"
          crossOrigin="anonymous"
        />
        {/* Favicon */}
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
        />
        <link
          rel="shortcut icon"
          href="/favicon.ico"
          type="image/x-icon"
        />
        <link
          rel="apple-touch-icon"
          href="/images/vpn.ico"
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
        
        {/* Preload critical resources for better mobile performance */}
        
        {/* Preload critical JavaScript */}
        <link 
          rel="modulepreload" 
          href="/_next/static/chunks/main.js" 
          as="script"
          fetchPriority="high"
        />
        <link 
          rel="modulepreload" 
          href="/_next/static/chunks/webpack.js" 
          as="script"
          fetchPriority="high"
        />
        <link 
          rel="modulepreload" 
          href="/_next/static/chunks/framework.js" 
          as="script"
          fetchPriority="high"
        />
        
        {/* Preload logo images */}
        <link
          rel="preload"
          href="/images/vpn-logo-black.png"
          as="image"
          type="image/png"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/images/vpn-logo-white.png"
          as="image"
          type="image/png"
          media="(prefers-color-scheme: dark)"
          fetchPriority="high"
        />
        
        {/* Preload critical CSS */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
          fetchPriority="high"
        />
        
        {/* Critical CSS for above-the-fold content - improves FCP and LCP */}
        <style>
          {`
            /* Base optimizations */
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
              margin: 0;
              padding: 0;
              background-color: var(--background);
              color: var(--foreground);
            }
            
            /* Force Roboto font for all headline elements */
            h1, h2, h3, h4, h5, h6, 
            .font-headline, 
            [class*="font-headline"] {
              font-family: ${roboto.style.fontFamily} !important;
              margin-top: 0;
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

            /* Critical above-the-fold styles for header and hero section */
            header {
              width: 100%;
              z-index: 40;
              border-bottom: 1px solid var(--border);
              background-color: var(--background);
            }

            .container {
              width: 100%;
              margin-left: auto;
              margin-right: auto;
              padding-left: 1rem;
              padding-right: 1rem;
            }

            @media (min-width: 640px) {
              .container {
                padding-left: 2rem;
                padding-right: 2rem;
              }
            }

            @media (min-width: 1024px) {
              .container {
                padding-left: 4rem;
                padding-right: 4rem;
              }
            }

            /* Ensure proper tap target sizes for mobile */
            a, button, [role="button"], input, select, textarea {
              min-height: 48px;
              min-width: 48px;
            }

            /* Fix for small inline links that shouldn't be 48px */
            p a, span a, li a, td a {
              display: inline;
              min-height: 0;
              min-width: 0;
            }

            /* Optimize touch targets in navigation */
            nav a, .newspaper-nav-item {
              padding: 0.5rem;
              margin: 0.25rem;
              display: inline-block;
            }
          `}
        </style>
        
        {/* Logo is rendered as text in the header */}
        
        {/* RSS Feed */}
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="VPN News RSS Feed" 
          href="/feed.xml" 
        />
        
        {/* JSON Feed */}
        <link 
          rel="alternate" 
          type="application/feed+json" 
          title="VPN News JSON Feed" 
          href="/feed.json" 
        />
        
        {/* Google News Publisher */}
        <meta name="google-news-publication" content="VPN News" />
        
        {/* Google AdSense Verification */}
        <meta name="google-adsense-account" content="ca-pub-1954539584146592" />
        
        {/* Add priority hints for browsers that support it */}
        <meta name="priority" content="1.0" />
      </head>
      {/* Google Analytics is now loaded conditionally based on cookie consent */}
      <body className={`${roboto.className} ${roboto.variable}`}>
        {/* Schema context provider for structured data */}
        <SchemaProvider>
          {/* Add structured data for the organization */}
          <OrganizationJsonLd />
          
          {/* Add structured data for the website */}
          <WebSiteJsonLd 
            name="VPN News"
            url="https://www.vpnnews.co.uk"
            description="Breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials."
            searchUrl="https://www.vpnnews.co.uk/search"
            potentialActions={[
              {
                type: "SearchAction",
                target: "https://www.vpnnews.co.uk/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            ]}
            sameAs={[
              "https://twitter.com/vpnnews",
              "https://facebook.com/vpnnews",
              "https://linkedin.com/company/vpnnews"
            ]}
          />
          
          {/* Add structured data for site navigation */}
          <SiteNavigationJsonLd 
            items={[
              { name: "Home", url: "/" },
              { name: "Latest", url: "/latest" },
              { name: "Crime", url: "/crime" },
              { name: "Courts", url: "/courts" },
              { name: "Legal", url: "/legal" },
              { name: "Commentary", url: "/commentary" }
            ]}
            siteUrl="https://www.vpnnews.co.uk"
          />
          
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
        </SchemaProvider>
      </body>
    </html>
  );
}
