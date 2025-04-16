import React from 'react';
import Script from 'next/script';

interface EventLocation {
  name: string;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  url?: string;
}

interface EventOrganizer {
  name: string;
  url?: string;
  logo?: string;
}

interface EventOffer {
  price: number;
  priceCurrency: string;
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
  validFrom?: string;
  url?: string;
}

interface EventPerformer {
  name: string;
  url?: string;
  image?: string;
}

interface EventJsonLdProps {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: EventLocation | string; // Can be a location object or a URL for virtual events
  image?: string | string[];
  offers?: EventOffer[];
  organizer?: EventOrganizer;
  performers?: EventPerformer[];
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled' | 'EventMovedOnline';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
  url?: string;
  isAccessibleForFree?: boolean;
  maximumAttendeeCapacity?: number;
  remainingAttendeeCapacity?: number;
  keywords?: string[];
  recordedIn?: string;
}

/**
 * Event Schema Component for Google Rich Results
 * 
 * This component generates structured data for events following Google's guidelines.
 * Adding this to event pages can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/event
 */
export default function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  offers,
  organizer,
  performers,
  eventStatus = 'EventScheduled',
  eventAttendanceMode = 'OfflineEventAttendanceMode',
  url,
  isAccessibleForFree,
  maximumAttendeeCapacity,
  remainingAttendeeCapacity,
  keywords,
  recordedIn
}: EventJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return dateString; // Return as is if it's already in ISO format
    }
  };

  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description,
    "startDate": formatDate(startDate),
    "eventStatus": `https://schema.org/${eventStatus}`,
    "eventAttendanceMode": `https://schema.org/${eventAttendanceMode}`
  };

  // Add location information
  if (typeof location === 'string') {
    // Virtual event with just a URL
    jsonLd.location = {
      "@type": "VirtualLocation",
      "url": location
    };
  } else {
    // Physical location
    jsonLd.location = {
      "@type": "Place",
      "name": location.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location.address.addressLocality,
        "addressCountry": location.address.addressCountry
      }
    };

    // Add detailed address information if provided
    if (location.address.streetAddress) {
      jsonLd.location.address.streetAddress = location.address.streetAddress;
    }

    if (location.address.addressRegion) {
      jsonLd.location.address.addressRegion = location.address.addressRegion;
    }

    if (location.address.postalCode) {
      jsonLd.location.address.postalCode = location.address.postalCode;
    }

    // Add location URL if provided
    if (location.url) {
      jsonLd.location.url = location.url;
    }
  }

  // Add end date if provided
  if (endDate) {
    jsonLd.endDate = formatDate(endDate);
  }

  // Add image if provided
  if (image) {
    jsonLd.image = Array.isArray(image) ? image : [image];
  }

  // Add offers if provided
  if (offers && offers.length > 0) {
    jsonLd.offers = offers.map(offer => {
      const offerObj: any = {
        "@type": "Offer",
        "price": offer.price,
        "priceCurrency": offer.priceCurrency
      };

      if (offer.availability) {
        offerObj.availability = `https://schema.org/${offer.availability}`;
      }

      if (offer.validFrom) {
        offerObj.validFrom = formatDate(offer.validFrom);
      }

      if (offer.url) {
        offerObj.url = offer.url;
      }

      return offerObj;
    });
  }

  // Add organizer if provided
  if (organizer) {
    jsonLd.organizer = {
      "@type": "Organization",
      "name": organizer.name
    };

    if (organizer.url) {
      jsonLd.organizer.url = organizer.url;
    }

    if (organizer.logo) {
      jsonLd.organizer.logo = organizer.logo;
    }
  }

  // Add performers if provided
  if (performers && performers.length > 0) {
    jsonLd.performer = performers.map(performer => {
      const performerObj: any = {
        "@type": "Person",
        "name": performer.name
      };

      if (performer.url) {
        performerObj.url = performer.url;
      }

      if (performer.image) {
        performerObj.image = performer.image;
      }

      return performerObj;
    });
  }

  // Add URL if provided
  if (url) {
    jsonLd.url = url;
  }

  // Add accessibility information if provided
  if (typeof isAccessibleForFree === 'boolean') {
    jsonLd.isAccessibleForFree = isAccessibleForFree;
  }

  // Add capacity information if provided
  if (maximumAttendeeCapacity !== undefined) {
    jsonLd.maximumAttendeeCapacity = maximumAttendeeCapacity;
  }

  if (remainingAttendeeCapacity !== undefined) {
    jsonLd.remainingAttendeeCapacity = remainingAttendeeCapacity;
  }

  // Add keywords if provided
  if (keywords && keywords.length > 0) {
    jsonLd.keywords = keywords.join(", ");
  }

  // Add recording information if provided
  if (recordedIn) {
    jsonLd.recordedIn = {
      "@type": "VideoObject",
      "url": recordedIn
    };
  }

  return (
    <Script id="event-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
