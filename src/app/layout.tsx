import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import "./fonts.css";
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/components/ThemeProvider";

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap', // Use 'swap' to prevent FOIT (Flash of Invisible Text)
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif']
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
        
        {/* Preload Google Fonts */}
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
        
        {/* Logo is rendered as text in the header */}
        
        {/* RSS Feed */}
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Video Production News RSS Feed" 
          href="/feed.xml" 
        />
        
        {/* Google News Publisher */}
        <meta name="google-news-publication" content="Video Production News" />
        
        {/* Add priority hints for browsers that support it */}
        <meta name="priority" content="1.0" />
      </head>
      {/* Google Analytics is now loaded conditionally based on cookie consent */}
      <body className={roboto.className}>
        <ThemeProvider defaultTheme="light" storageKey="vpn-theme">
          <Suspense fallback={<div>Loading...</div>}>
            <ClientBody>{children}</ClientBody>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
