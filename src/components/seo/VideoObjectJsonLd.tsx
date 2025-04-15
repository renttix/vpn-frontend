import React from 'react';
import Script from 'next/script';

interface VideoObjectJsonLdProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string; // Format: PT1H30M15S (ISO 8601 duration format)
  expires?: string;
  hasPart?: VideoClip[];
  watchCount?: number;
  publication?: Publication[];
  regionsAllowed?: string[];
}

interface VideoClip {
  name: string;
  startOffset: number;
  endOffset: number;
  url?: string;
}

interface Publication {
  name: string;
  publisherName: string;
  date: string;
}

/**
 * VideoObject Schema Component for SEO
 * 
 * This component generates structured data for video content following Google's guidelines.
 * Adding this helps videos appear in Google Video search results and potentially in rich results.
 * 
 * @see https://developers.google.com/search/docs/appearance/structured-data/video
 */
export default function VideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
  expires,
  hasPart,
  watchCount,
  publication,
  regionsAllowed
}: VideoObjectJsonLdProps) {
  // Create the JSON-LD schema with proper typing
  const jsonLd: {
    "@context": string;
    "@type": string;
    "name": string;
    "description": string;
    "thumbnailUrl": string | string[];
    "uploadDate": string;
    "contentUrl"?: string;
    "embedUrl"?: string;
    "duration"?: string;
    "expires"?: string;
    "interactionStatistic"?: {
      "@type": string;
      "interactionType": string;
      "userInteractionCount": number;
    };
    "publication"?: Array<{
      "@type": string;
      "name": string;
      "publisherName": string;
      "date": string;
    }>;
    "hasPart"?: Array<{
      "@type": string;
      "name": string;
      "startOffset": number;
      "endOffset": number;
      "url"?: string;
    }>;
    "regionsAllowed"?: string[];
  } = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": name,
    "description": description,
    "thumbnailUrl": thumbnailUrl.includes(',') 
      ? thumbnailUrl.split(',').map(url => url.trim()) 
      : thumbnailUrl,
    "uploadDate": uploadDate
  };

  // Add optional properties if provided
  if (contentUrl) jsonLd.contentUrl = contentUrl;
  if (embedUrl) jsonLd.embedUrl = embedUrl;
  if (duration) jsonLd.duration = duration;
  if (expires) jsonLd.expires = expires;
  
  // Add watch count if provided
  if (watchCount) {
    jsonLd.interactionStatistic = {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": watchCount
    };
  }
  
  // Add publication information if provided
  if (publication && publication.length > 0) {
    jsonLd.publication = publication.map(pub => ({
      "@type": "BroadcastEvent",
      "name": pub.name,
      "publisherName": pub.publisherName,
      "date": pub.date
    }));
  }
  
  // Add video clips if provided
  if (hasPart && hasPart.length > 0) {
    jsonLd.hasPart = hasPart.map(clip => ({
      "@type": "Clip",
      "name": clip.name,
      "startOffset": clip.startOffset,
      "endOffset": clip.endOffset,
      "url": clip.url
    }));
  }
  
  // Add regions allowed if provided
  if (regionsAllowed && regionsAllowed.length > 0) {
    jsonLd.regionsAllowed = regionsAllowed;
  }

  return (
    <Script id="video-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

/**
 * Helper function to format duration in ISO 8601 format
 * 
 * @param hours Hours component
 * @param minutes Minutes component
 * @param seconds Seconds component
 * @returns ISO 8601 formatted duration string
 */
export function formatDuration(hours: number = 0, minutes: number = 0, seconds: number = 0): string {
  let duration = 'PT';
  
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (seconds > 0) duration += `${seconds}S`;
  
  // If all values are 0, return at least PT0S
  if (duration === 'PT') duration += '0S';
  
  return duration;
}

/**
 * Helper function to parse ISO 8601 duration string
 * 
 * @param isoDuration ISO 8601 duration string (e.g., PT1H30M15S)
 * @returns Object with hours, minutes, and seconds
 */
export function parseDuration(isoDuration: string): { hours: number; minutes: number; seconds: number } {
  const result = { hours: 0, minutes: 0, seconds: 0 };
  
  // Remove PT prefix
  const duration = isoDuration.substring(2);
  
  // Extract hours
  const hoursMatch = duration.match(/(\d+)H/);
  if (hoursMatch) result.hours = parseInt(hoursMatch[1], 10);
  
  // Extract minutes
  const minutesMatch = duration.match(/(\d+)M/);
  if (minutesMatch) result.minutes = parseInt(minutesMatch[1], 10);
  
  // Extract seconds
  const secondsMatch = duration.match(/(\d+)S/);
  if (secondsMatch) result.seconds = parseInt(secondsMatch[1], 10);
  
  return result;
}
