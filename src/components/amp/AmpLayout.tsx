import React from 'react';
import { Metadata } from 'next';

interface AmpLayoutProps {
  children: React.ReactNode;
  metadata?: Metadata & {
    structuredData?: string;
  };
}

export default function AmpLayout({ children, metadata }: AmpLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        <link rel="canonical" href={
          metadata?.alternates?.canonical
            ? (typeof metadata.alternates.canonical === 'string' 
                ? metadata.alternates.canonical 
                : typeof metadata.alternates.canonical === 'object' && 'url' in metadata.alternates.canonical
                  ? metadata.alternates.canonical.url as string
                  : '')
            : ''
        } />
        <title>{metadata?.title as string || 'VPN News'}</title>
        {metadata?.description && (
          <meta name="description" content={metadata.description as string} />
        )}
        
        {/* AMP required script */}
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        
        {/* AMP boilerplate styles */}
        <style amp-boilerplate>
          {`body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`}
        </style>
        <noscript>
          <style amp-boilerplate>
            {`body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`}
          </style>
        </noscript>
        
        {/* Structured Data for SEO */}
        {metadata?.structuredData && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: metadata.structuredData }} />
        )}
        
        {/* AMP components */}
        <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
        <script async custom-element="amp-sidebar" src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js"></script>
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        <script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
        
        {/* Custom AMP styles */}
        <style amp-custom>
          {`
            /* Base styles */
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
            }
            
            /* Header styles */
            header {
              background-color: #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              padding: 1rem;
              text-align: center;
            }
            
            .logo {
              max-width: 200px;
              margin: 0 auto;
            }
            
            /* Navigation */
            nav {
              background-color: #f1f1f1;
              padding: 0.5rem 1rem;
              text-align: center;
              border-bottom: 1px solid #ddd;
            }
            
            nav a {
              color: #333;
              text-decoration: none;
              margin: 0 0.5rem;
              font-size: 0.9rem;
            }
            
            /* Main content */
            main {
              max-width: 800px;
              margin: 0 auto;
              padding: 1rem;
              background-color: #fff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            /* Article styles */
            .article-title {
              font-size: 1.8rem;
              line-height: 1.3;
              margin-bottom: 0.5rem;
              color: #1a1a1a;
            }
            
            .article-meta {
              font-size: 0.9rem;
              color: #666;
              margin-bottom: 1.5rem;
            }
            
            .article-image {
              margin-bottom: 1.5rem;
            }
            
            .article-content {
              font-size: 1.1rem;
              line-height: 1.7;
              color: #333;
            }
            
            .article-content p {
              margin-bottom: 1.5rem;
            }
            
            .article-content h2 {
              font-size: 1.5rem;
              margin: 2rem 0 1rem;
              color: #1a1a1a;
            }
            
            .article-content h3 {
              font-size: 1.3rem;
              margin: 1.5rem 0 1rem;
              color: #1a1a1a;
            }
            
            .article-content blockquote {
              border-left: 4px solid #0066cc;
              padding-left: 1rem;
              margin-left: 0;
              font-style: italic;
              color: #555;
            }
            
            /* Footer */
            footer {
              text-align: center;
              padding: 2rem 1rem;
              background-color: #333;
              color: #fff;
              font-size: 0.9rem;
            }
            
            footer a {
              color: #fff;
              text-decoration: none;
            }
            
            /* Accessibility Tools */
            .accessibility-tools {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 0.75rem;
              margin: 0.5rem 0 1.5rem;
            }
            
            /* Reading time */
            .reading-time {
              font-size: 0.9rem;
              color: #666;
              display: flex;
              align-items: center;
            }
            
            /* Text-to-speech button */
            .listen-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.5rem 1rem;
              background-color: #0066cc; /* vpn-blue */
              color: white;
              border: none;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            
            .listen-button:hover {
              background-color: #0052a3;
            }
            
            .listen-button:focus {
              outline: 2px solid #0066cc;
              outline-offset: 2px;
            }
            
            /* Text size controls */
            .text-size-controls {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .text-size-label {
              font-size: 0.875rem;
              color: #666;
            }
            
            .text-size-buttons {
              display: flex;
              gap: 0.25rem;
            }
            
            .text-size-button {
              width: 1.75rem;
              height: 1.75rem;
              border: 1px solid #ddd;
              border-radius: 0.25rem;
              background: #f5f5f5;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.75rem;
              font-weight: 500;
            }
            
            .text-size-button:nth-child(1) {
              font-size: 0.7rem;
            }
            
            .text-size-button:nth-child(2) {
              font-size: 0.8rem;
            }
            
            .text-size-button:nth-child(3) {
              font-size: 0.9rem;
            }
            
            .text-size-button:nth-child(4) {
              font-size: 1rem;
            }
            
            .text-size-button.active {
              background-color: #0066cc;
              color: white;
              border-color: #0066cc;
            }
            
            /* Table of Contents */
            .toc {
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
              padding: 0.75rem 0;
              margin-bottom: 1.5rem;
              font-size: 0.9rem;
            }
            
            .toc-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5rem;
            }
            
            .toc-title {
              font-size: 0.9rem;
              font-weight: 500;
              color: #666;
              display: flex;
              align-items: center;
            }
            
            .toc-content {
              display: flex;
              flex-wrap: wrap;
              gap: 0.75rem;
              padding-top: 0.5rem;
              border-top: 1px solid #eee;
            }
            
            .toc-item {
              color: #666;
              text-decoration: none;
              font-size: 0.8rem;
            }
            
            .toc-item:hover {
              color: #0066cc;
              text-decoration: none;
            }
            
            /* Social sharing */
            .social-share {
              display: flex;
              justify-content: center;
              margin: 2rem 0;
            }
            
            /* Utility classes */
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 1rem;
            }
            
            .text-center {
              text-align: center;
            }
            
            /* Dark mode */
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #121212;
                color: #e0e0e0;
              }
              
              .toc {
                border-color: #333;
              }
              
              .toc-content {
                border-color: #333;
              }
              
              .toc-title {
                color: #999;
              }
              
              .toc-item {
                color: #999;
              }
              
              .toc-item:hover {
                color: #4d9aff;
              }
              
              .reading-time {
                color: #999;
              }
              
              /* Dark mode styles for accessibility tools */
              .listen-button {
                background-color: #0078d7;
              }
              
              .listen-button:hover {
                background-color: #0063b1;
              }
              
              .text-size-button {
                background: #2a2a2a;
                border-color: #444;
                color: #e0e0e0;
              }
              
              .text-size-button.active {
                background-color: #0078d7;
                border-color: #0078d7;
              }
              
              .text-size-label {
                color: #999;
              }
              
              header, main {
                background-color: #1e1e1e;
              }
              
              .article-title {
                color: #f0f0f0;
              }
              
              .article-content {
                color: #e0e0e0;
              }
              
              .article-content h2, .article-content h3 {
                color: #f0f0f0;
              }
              
              nav {
                background-color: #2a2a2a;
                border-color: #444;
              }
              
              nav a {
                color: #e0e0e0;
              }
            }
          `}
        </style>
      </head>
      <body>
        {/* AMP state for text size */}
        <div dangerouslySetInnerHTML={{
          __html: `
            <amp-state id="textSize">
              <script type="application/json">
                "medium"
              </script>
            </amp-state>
          `
        }} />
        <header>
          <a href="/">
            <amp-img
              src="/images/vpn-logo-black.png"
              width="200"
              height="64"
              layout="responsive"
              alt="VPN News Logo"
              class="logo"
            ></amp-img>
          </a>
        </header>
        
        <nav>
          <a href="/">Home</a>
          <a href="/category/crime-news">Crime</a>
          <a href="/category/court-news">Court</a>
          <a href="/category/legal-commentary">Commentary</a>
        </nav>
        
        <main className="main-content" dangerouslySetInnerHTML={{
          __html: `<div [class]="'article-wrapper text-' + textSize">${
            // We need to convert children to a string for AMP
            // This is a simplified approach - in a real implementation,
            // you'd need a more robust way to convert React elements to strings
            typeof children === 'string' ? children : ''
          }</div>`
        }} />
        
        <footer>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} VPN News. All rights reserved.</p>
            <p>
              <a href="/about">About</a> | 
              <a href="/contact">Contact</a> | 
              <a href="/privacy-policy">Privacy Policy</a> | 
              <a href="/terms-of-service">Terms of Service</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
