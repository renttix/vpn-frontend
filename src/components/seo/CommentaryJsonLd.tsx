import React from 'react';
import Script from 'next/script';
import { Category, Post, Author } from '@/types/sanity';
import { getBaseUrl, getFullUrl } from '@/lib/urlUtils';

interface CommentaryJsonLdProps {
  category: Category;
  posts: Post[];
  url: string;
  breadcrumbs?: { name: string; url: string }[];
}

export default function CommentaryJsonLd({ category, posts, url, breadcrumbs = [] }: CommentaryJsonLdProps) {
  // Only apply this enhanced schema for the Commentary category
  if (category._id !== 'IZrPJ0KdVO8qEhMFzimYnr' && category.title !== 'Commentary') {
    return null;
  }
  
  // Enhanced description specifically for Commentary
  const categoryDescription = category.description || 
    "Expert analysis of UK legal cases, criminal law changes, and justice policy. Stay informed with thought-provoking legal insights from our team of legal experts and commentators.";
  
  // Create an array of items for the ItemList with enhanced metadata
  const itemListElements = posts.map((post, index) => {
    // Extract author expertise information
    const authorExpertise = getAuthorExpertise(post.author);
    
    // Determine if the post has citations/sources
    const hasCitations = post.sources && post.sources.length > 0;
    
    return {
      "@type": "Article",
      "position": index + 1,
      "headline": post.title,
      "description": post.excerpt || `Legal analysis and expert commentary on ${post.title}`,
      "url": getFullUrl(post.slug?.current || ''),
      "image": post.mainImage?.asset?.url || "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
      "datePublished": post.publishedAt || new Date().toISOString(),
      "dateModified": post.lastUpdatedAt || post.publishedAt || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": post.author?.name || "VPN News Team",
        "description": authorExpertise.description,
        "jobTitle": authorExpertise.jobTitle,
        "knowsAbout": authorExpertise.expertise
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
      "isAccessibleForFree": "True",
      "isPartOf": {
        "@type": "WebSite",
        "name": "VPN News",
        "url": getBaseUrl()
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": getFullUrl(post.slug?.current || '')
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".article-headline", ".article-summary", ".article-body"]
      },
      "articleSection": "Legal Commentary",
      "articleBody": post.excerpt || "",
      "keywords": "legal analysis, expert commentary, UK law, criminal justice, legal insights",
      ...(hasCitations && {
        "citation": post.sources?.map(source => ({
          "@type": "CreativeWork",
          "name": source.name,
          "url": source.url
        }))
      })
    };
  });

  // Create breadcrumb list
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": getBaseUrl()
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Commentary",
        "item": url
      },
      ...(breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 3,
        "name": crumb.name,
        "item": crumb.url
      })))
    ]
  };

  // Create FAQ section if applicable
  const faqSection = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is legal commentary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Legal commentary provides expert analysis and insights on legal cases, changes in law, and justice policy. It helps readers understand complex legal matters through the lens of experienced legal professionals."
        }
      },
      {
        "@type": "Question",
        "name": "Why is legal commentary important?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Legal commentary is important because it provides context and expert interpretation of legal developments, helping the public understand the implications of court decisions, new legislation, and changes in the justice system."
        }
      },
      {
        "@type": "Question",
        "name": "Who writes VPN News legal commentary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VPN News legal commentary is written by a team of legal experts, including practicing lawyers, legal scholars, and experienced legal journalists who provide informed analysis on important legal matters."
        }
      }
    ]
  };

  // Create the enhanced JSON-LD schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        "headline": `Legal Commentary | VPN News`,
        "description": categoryDescription,
        "url": url,
        "publisher": {
          "@type": "Organization",
          "name": "Video Production News",
          "logo": {
            "@type": "ImageObject",
            "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
            "width": 600,
            "height": 60
          },
          "sameAs": [
            "https://twitter.com/vpnnews",
            "https://www.facebook.com/vpnnews",
            "https://www.linkedin.com/company/vpnnews"
          ]
        },
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": itemListElements,
          "numberOfItems": itemListElements.length
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".category-headline", ".category-description"]
        },
        "inLanguage": "en-GB",
        "isPartOf": {
          "@type": "WebSite",
          "name": "VPN News",
          "url": getBaseUrl(),
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${getBaseUrl()}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        "about": {
          "@type": "Thing",
          "name": "Legal Commentary",
          "description": "Expert analysis and insights on UK legal cases, criminal law, and justice policy",
          "sameAs": "https://en.wikipedia.org/wiki/Legal_commentary"
        },
        "specialty": "Legal Analysis and Commentary",
        "keywords": "legal commentary, UK law analysis, criminal justice commentary, legal insights, expert legal opinion, law reform analysis, court case analysis, justice system commentary"
      },
      breadcrumbList,
      faqSection
    ]
  };

  return (
    <Script id="commentary-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

// Helper function to extract author expertise information
function getAuthorExpertise(author?: Author): { description: string; jobTitle: string; expertise: string[] } {
  if (!author) {
    return {
      description: "VPN News legal expert",
      jobTitle: "Legal Commentator",
      expertise: ["UK Law", "Criminal Justice", "Legal Analysis"]
    };
  }

  // Default expertise based on role
  let expertise = ["UK Law", "Criminal Justice", "Legal Analysis"];
  let jobTitle = author.jobTitle || "Legal Commentator";
  
  // Enhance expertise based on author role if available
  if (author.role) {
    switch (author.role.toLowerCase()) {
      case "legal analyst":
      case "legal expert":
        expertise = ["UK Law", "Legal Analysis", "Judicial Review", "Statutory Interpretation"];
        break;
      case "crime reporter":
        expertise = ["Criminal Law", "Crime Reporting", "Criminal Justice System"];
        break;
      case "barrister":
      case "solicitor":
      case "lawyer":
        expertise = ["Court Proceedings", "Case Law", "Legal Practice", "Advocacy"];
        break;
      case "academic":
      case "professor":
        expertise = ["Legal Theory", "Jurisprudence", "Legal Education", "Legal Research"];
        break;
      default:
        // Keep default expertise
        break;
    }
  }
  
  return {
    description: author.bio ? "Legal expert and commentator" : `${author.role || "Legal commentator"} at VPN News`,
    jobTitle,
    expertise
  };
}
