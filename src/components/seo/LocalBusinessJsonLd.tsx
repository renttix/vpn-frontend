import React from 'react';
import Script from 'next/script';

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

interface OpeningHoursSpecification {
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
  validFrom?: string;
  validThrough?: string;
}

interface LocalBusinessJsonLdProps {
  type: 'LocalBusiness' | 'Restaurant' | 'Hotel' | 'Store' | 'LegalService' | 'FinancialService' | 'MedicalBusiness' | string;
  name: string;
  description?: string;
  url: string;
  telephone?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: GeoCoordinates;
  images?: string[];
  priceRange?: string;
  openingHours?: OpeningHoursSpecification[];
  sameAs?: string[];
  servesCuisine?: string[];
  menu?: string;
  acceptsReservations?: boolean;
  paymentAccepted?: string[];
  areaServed?: string | string[];
  availableLanguage?: string | string[];
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed?: string | string[];
    availableLanguage?: string | string[];
  }[];
  currenciesAccepted?: string;
  openingHoursSpecification?: OpeningHoursSpecification[];
  hasMap?: string;
  slogan?: string;
  email?: string;
  foundingDate?: string;
  foundingLocation?: string;
  numberOfEmployees?: number;
  vatID?: string;
  taxID?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

/**
 * LocalBusiness Schema Component for Google Rich Results
 * 
 * This component generates structured data for local businesses following Google's guidelines.
 * Adding this to business pages can enhance local SEO and enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/local-business
 */
export default function LocalBusinessJsonLd({
  type,
  name,
  description,
  url,
  telephone,
  address,
  geo,
  images,
  priceRange,
  openingHours,
  sameAs,
  servesCuisine,
  menu,
  acceptsReservations,
  paymentAccepted,
  areaServed,
  availableLanguage,
  contactPoint,
  currenciesAccepted,
  openingHoursSpecification,
  hasMap,
  slogan,
  email,
  foundingDate,
  foundingLocation,
  numberOfEmployees,
  vatID,
  taxID,
  aggregateRating
}: LocalBusinessJsonLdProps) {
  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "url": url,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    }
  };

  // Add optional properties if provided
  if (description) jsonLd.description = description;
  if (telephone) jsonLd.telephone = telephone;
  if (address.addressRegion) jsonLd.address.addressRegion = address.addressRegion;

  // Add geo coordinates if provided
  if (geo) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      "latitude": geo.latitude,
      "longitude": geo.longitude
    };
  }

  // Add images if provided
  if (images && images.length > 0) {
    jsonLd.image = images;
  }

  // Add price range if provided
  if (priceRange) jsonLd.priceRange = priceRange;

  // Add opening hours if provided
  if (openingHours && openingHours.length > 0) {
    jsonLd.openingHoursSpecification = openingHours.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hours.dayOfWeek,
      "opens": hours.opens,
      "closes": hours.closes,
      ...(hours.validFrom && { "validFrom": hours.validFrom }),
      ...(hours.validThrough && { "validThrough": hours.validThrough })
    }));
  }

  // Add social media profiles if provided
  if (sameAs && sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  // Add restaurant-specific properties if provided
  if (servesCuisine && servesCuisine.length > 0) {
    jsonLd.servesCuisine = servesCuisine;
  }

  if (menu) jsonLd.menu = menu;
  if (acceptsReservations !== undefined) jsonLd.acceptsReservations = acceptsReservations;

  // Add payment methods if provided
  if (paymentAccepted && paymentAccepted.length > 0) {
    jsonLd.paymentAccepted = paymentAccepted.join(", ");
  }

  // Add area served if provided
  if (areaServed) {
    jsonLd.areaServed = Array.isArray(areaServed) ? areaServed : [areaServed];
  }

  // Add available languages if provided
  if (availableLanguage) {
    jsonLd.availableLanguage = Array.isArray(availableLanguage) ? availableLanguage : [availableLanguage];
  }

  // Add contact points if provided
  if (contactPoint && contactPoint.length > 0) {
    jsonLd.contactPoint = contactPoint.map(contact => {
      const contactObj: any = {
        "@type": "ContactPoint",
        "telephone": contact.telephone,
        "contactType": contact.contactType
      };

      if (contact.areaServed) {
        contactObj.areaServed = Array.isArray(contact.areaServed) ? contact.areaServed : [contact.areaServed];
      }

      if (contact.availableLanguage) {
        contactObj.availableLanguage = Array.isArray(contact.availableLanguage) ? contact.availableLanguage : [contact.availableLanguage];
      }

      return contactObj;
    });
  }

  // Add currencies accepted if provided
  if (currenciesAccepted) jsonLd.currenciesAccepted = currenciesAccepted;

  // Add opening hours specification if provided
  if (openingHoursSpecification && openingHoursSpecification.length > 0) {
    jsonLd.openingHoursSpecification = openingHoursSpecification.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hours.dayOfWeek,
      "opens": hours.opens,
      "closes": hours.closes,
      ...(hours.validFrom && { "validFrom": hours.validFrom }),
      ...(hours.validThrough && { "validThrough": hours.validThrough })
    }));
  }

  // Add map URL if provided
  if (hasMap) jsonLd.hasMap = hasMap;

  // Add slogan if provided
  if (slogan) jsonLd.slogan = slogan;

  // Add email if provided
  if (email) jsonLd.email = email;

  // Add founding information if provided
  if (foundingDate) jsonLd.foundingDate = foundingDate;
  if (foundingLocation) jsonLd.foundingLocation = foundingLocation;

  // Add number of employees if provided
  if (numberOfEmployees !== undefined) jsonLd.numberOfEmployees = numberOfEmployees;

  // Add tax IDs if provided
  if (vatID) jsonLd.vatID = vatID;
  if (taxID) jsonLd.taxID = taxID;

  // Add aggregate rating if provided
  if (aggregateRating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount
    };

    if (aggregateRating.bestRating) jsonLd.aggregateRating.bestRating = aggregateRating.bestRating;
    if (aggregateRating.worstRating) jsonLd.aggregateRating.worstRating = aggregateRating.worstRating;
  }

  return (
    <Script id="local-business-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
