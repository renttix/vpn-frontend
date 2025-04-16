import React from 'react';
import Script from 'next/script';

interface OrganizationJsonLdProps {
  url?: string;
}

export default function OrganizationJsonLd({ url = 'https://www.vpnnews.co.uk' }: OrganizationJsonLdProps) {
  // Create the JSON-LD schema for Organization
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "VPN News",
    "alternateName": "VPN News",
    "url": url,
    "logo": {
      "@type": "ImageObject",
      "url": "https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg",
      "width": 1000,
      "height": 525
    },
    "sameAs": [
      "https://twitter.com/vpnnews",
      "https://www.facebook.com/vpnnews",
      "https://www.linkedin.com/company/vpnnews",
      "https://www.youtube.com/c/vpnnews"
    ],
    "description": "VPN News is a leading source for breaking legal news, court reports, expert analysis on criminal cases, legal developments, and in-depth coverage of high-profile trials.",
    "foundingDate": "2020-01-01",
    "founder": {
      "@type": "Person",
      "name": "VPN Founder"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fleet Street",
      "addressLocality": "London",
      "addressRegion": "England",
      "postalCode": "EC4Y 1AA",
      "addressCountry": "UK"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "telephone": "+44-20-7123-4567",
      "email": "editorial@vpnnews.com",
      "hoursAvailable": "Mo-Fr 09:00-18:00",
      "availableLanguage": ["English"]
    },
    // Editorial leadership
    "masthead": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/about",
      "description": "Editorial leadership: Editor-in-Chief Sarah Johnson, Managing Editor James Wilson, Legal Affairs Editor Elizabeth Chen, Court Reporting Director Michael Thompson, Head of Digital David Rodriguez"
    },
    // Policies
    "diversityPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/diversity-policy",
      "description": "Our commitment to diversity in reporting, staffing, and coverage"
    },
    "ethicsPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/ethics-policy",
      "description": "Our ethics policy ensures fair, accurate, and independent reporting. Key principles include maintaining independence from external influences, avoiding conflicts of interest, respecting privacy and dignity of individuals, distinguishing clearly between news and opinion, and correcting errors promptly and transparently."
    },
    "correctionsPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/corrections-policy",
      "description": "We promptly correct factual errors online and in print. Corrections are clearly labeled, explain the error, and provide accurate information. All corrections are documented and accessible in our corrections archive."
    },
    "verificationFactCheckingPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/fact-checking-policy",
      "description": "All articles undergo a three-tier verification process: 1) Reporter fact-checking during research, 2) Editor review of all factual claims, 3) Legal review for sensitive stories. We prioritize primary sources and official documents, and we verify information with multiple sources before publication."
    },
    "unnamedSourcesPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/unnamed-sources-policy",
      "description": "We use unnamed sources only when: the information is of significant public interest, the information cannot be obtained through on-the-record sources, the source has direct knowledge of the information, we know the source's identity and have verified their reliability, and we can explain to readers why anonymity was granted."
    },
    "actionableFeedbackPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/feedback-policy",
      "description": "How we handle and respond to reader feedback and corrections"
    },
    // Publishing principles
    "publishingPrinciples": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/editorial-guidelines",
      "description": "Our reporting aims to: provide accurate, fair, and comprehensive coverage of legal affairs, hold powerful institutions accountable, explain complex legal matters in accessible language, respect the presumption of innocence, consider the impact of our reporting on ongoing legal proceedings, and maintain editorial independence."
    },
    // Ownership structure
    "ownershipFundingInfo": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/ownership",
      "description": "VPN News is independently owned by VPN Media Holdings Ltd. Our revenue comes from: digital subscriptions (60%), advertising (30%), and events and partnerships (10%). We maintain a strict separation between editorial and business operations to ensure journalistic integrity."
    },
    // News-specific properties
    "noBylinesPolicy": {
      "@type": "CreativeWork",
      "url": "https://www.vpnnews.co.uk/bylines-policy",
      "description": "Most articles include reporter bylines to ensure accountability. We use staff bylines ('VPN News Staff') only for: collaborative reporting with multiple contributors, breaking news updates with multiple sources, content that may put reporters at risk, and routine court listings and procedural updates."
    },
    // Knowledge graph optimization
    "knowsAbout": [
      "Legal News",
      "Court Reports",
      "Criminal Cases",
      "Justice System",
      "Law Enforcement",
      "Legal Analysis",
      "Trial Coverage"
    ],
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Press Credentials",
        "recognizedBy": {
          "@type": "Organization",
          "name": "UK Press Association"
        }
      }
    ]
  };

  return (
    <Script id="organization-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
