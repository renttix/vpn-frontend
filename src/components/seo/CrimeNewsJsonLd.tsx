import React from 'react';
import Script from 'next/script';

export default function CrimeNewsJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://vpnnews.com/crime-news"
    },
    "headline": "Crime News: Latest Criminal Cases, Investigations & Law Enforcement Updates",
    "description": "Stay informed with the latest crime news, criminal investigations, arrests, and law enforcement activities. In-depth coverage of major criminal cases and police operations.",
    "publisher": {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vpnnews.com/images/logo.png"
      }
    },
    "hasPart": [
      {
        "@type": "NewsArticle",
        "headline": "Major Drug Trafficking Ring Busted in Multi-State Operation",
        "description": "Federal agents arrested 12 individuals in connection with a drug trafficking operation spanning three states.",
        "image": "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1974&auto=format&fit=crop",
        "datePublished": "2025-04-01T08:00:00+00:00",
        "author": {
          "@type": "Person",
          "name": "Elena Mitchell"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Video Production News",
          "logo": {
            "@type": "ImageObject",
            "url": "https://vpnnews.com/images/logo.png"
          }
        },
        "url": "https://vpnnews.com/drug-trafficking-ring-busted"
      },
      {
        "@type": "NewsArticle",
        "headline": "Cybercrime Unit Prevents $2M Ransomware Attack on Hospital",
        "description": "Quick action by cybersecurity experts prevented a potentially devastating ransomware attack on a major hospital system.",
        "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
        "datePublished": "2025-04-02T10:30:00+00:00",
        "author": {
          "@type": "Person",
          "name": "Marcus Reynolds"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Video Production News",
          "logo": {
            "@type": "ImageObject",
            "url": "https://vpnnews.com/images/logo.png"
          }
        },
        "url": "https://vpnnews.com/cybercrime-unit-prevents-ransomware"
      },
      {
        "@type": "NewsArticle",
        "headline": "Former CFO Charged with Embezzling $5M from Tech Startup",
        "description": "Prosecutors allege the executive used elaborate accounting schemes to hide the theft over three years.",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
        "datePublished": "2025-04-03T09:15:00+00:00",
        "author": {
          "@type": "Person",
          "name": "Sarah Blackwell"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Video Production News",
          "logo": {
            "@type": "ImageObject",
            "url": "https://vpnnews.com/images/logo.png"
          }
        },
        "url": "https://vpnnews.com/cfo-charged-embezzlement"
      }
    ],
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://vpnnews.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Crime News",
          "item": "https://vpnnews.com/crime-news"
        }
      ]
    }
  };

  return (
    <Script id="crime-news-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
