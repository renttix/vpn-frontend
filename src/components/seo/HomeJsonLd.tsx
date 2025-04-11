import React from 'react';
import Script from 'next/script';

export default function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://vpnnews.com/",
    "name": "Video Production News",
    "description": "Breaking legal news, court reports, and expert analysis on the most important cases and legal developments.",
    "publisher": {
      "@type": "Organization",
      "name": "Video Production News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://vpnnews.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Article",
            "headline": "Major Drug Trafficking Ring Busted in Multi-State Operation",
            "description": "Federal agents arrested 12 individuals in connection with a drug trafficking operation spanning three states.",
            "image": "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1974&auto=format&fit=crop",
            "url": "https://vpnnews.com/drug-trafficking-ring-busted",
            "author": {
              "@type": "Person",
              "name": "Elena Mitchell"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Video Production News",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
              }
            },
            "datePublished": "2025-04-01T08:00:00+00:00"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Article",
            "headline": "Cybercrime Unit Prevents $2M Ransomware Attack on Hospital",
            "description": "Quick action by cybersecurity experts prevented a potentially devastating ransomware attack on a major hospital system.",
            "image": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
            "url": "https://vpnnews.com/cybercrime-unit-prevents-ransomware",
            "author": {
              "@type": "Person",
              "name": "Marcus Reynolds"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Video Production News",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
              }
            },
            "datePublished": "2025-04-02T10:30:00+00:00"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Article",
            "headline": "Former CFO Charged with Embezzling $5M from Tech Startup",
            "description": "Prosecutors allege the executive used elaborate accounting schemes to hide the theft over three years.",
            "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
            "url": "https://vpnnews.com/cfo-charged-embezzlement",
            "author": {
              "@type": "Person",
              "name": "Sarah Blackwell"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Video Production News",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
              }
            },
            "datePublished": "2025-04-03T09:15:00+00:00"
          }
        }
      ]
    }
  };

  return (
    <Script id="home-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
