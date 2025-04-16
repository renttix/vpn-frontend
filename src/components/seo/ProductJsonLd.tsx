import React from 'react';
import Script from 'next/script';

interface ProductReview {
  author: string;
  datePublished?: string;
  reviewBody?: string;
  name?: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}

interface ProductOffer {
  price: number;
  priceCurrency: string;
  priceValidUntil?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability' | 'SoldOut' | 'BackOrder';
  url?: string;
  seller?: {
    name: string;
    url?: string;
  };
}

interface ProductAggregateRating {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

interface ProductBrand {
  name: string;
  url?: string;
  logo?: string;
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  mpn?: string;
  gtin?: string;
  gtin8?: string;
  gtin13?: string;
  gtin14?: string;
  brand?: ProductBrand;
  offers?: ProductOffer | ProductOffer[];
  aggregateRating?: ProductAggregateRating;
  reviews?: ProductReview[];
  url?: string;
  category?: string;
  color?: string;
  material?: string;
  height?: string;
  width?: string;
  depth?: string;
  weight?: string;
  hasMerchantReturnPolicy?: boolean;
  additionalProperty?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Product Schema Component for Google Rich Results
 * 
 * This component generates structured data for products following Google's guidelines.
 * Adding this to product pages can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/product
 */
export default function ProductJsonLd({
  name,
  description,
  image,
  sku,
  mpn,
  gtin,
  gtin8,
  gtin13,
  gtin14,
  brand,
  offers,
  aggregateRating,
  reviews,
  url,
  category,
  color,
  material,
  height,
  width,
  depth,
  weight,
  hasMerchantReturnPolicy,
  additionalProperty
}: ProductJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return dateString; // Return as is if it's already in ISO format
    }
  };

  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": Array.isArray(image) ? image : [image]
  };

  // Add identifiers if provided
  if (sku) jsonLd.sku = sku;
  if (mpn) jsonLd.mpn = mpn;
  if (gtin) jsonLd.gtin = gtin;
  if (gtin8) jsonLd.gtin8 = gtin8;
  if (gtin13) jsonLd.gtin13 = gtin13;
  if (gtin14) jsonLd.gtin14 = gtin14;

  // Add brand if provided
  if (brand) {
    jsonLd.brand = {
      "@type": "Brand",
      "name": brand.name
    };

    if (brand.url) jsonLd.brand.url = brand.url;
    if (brand.logo) jsonLd.brand.logo = brand.logo;
  }

  // Add offers if provided
  if (offers) {
    if (Array.isArray(offers)) {
      jsonLd.offers = offers.map(offer => formatOffer(offer));
    } else {
      jsonLd.offers = formatOffer(offers);
    }
  }

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

  // Add reviews if provided
  if (reviews && reviews.length > 0) {
    jsonLd.review = reviews.map(review => {
      const reviewObj: any = {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.reviewRating.ratingValue
        }
      };

      if (review.datePublished) reviewObj.datePublished = formatDate(review.datePublished);
      if (review.reviewBody) reviewObj.reviewBody = review.reviewBody;
      if (review.name) reviewObj.name = review.name;
      if (review.reviewRating.bestRating) reviewObj.reviewRating.bestRating = review.reviewRating.bestRating;
      if (review.reviewRating.worstRating) reviewObj.reviewRating.worstRating = review.reviewRating.worstRating;

      return reviewObj;
    });
  }

  // Add URL if provided
  if (url) jsonLd.url = url;

  // Add category if provided
  if (category) jsonLd.category = category;

  // Add physical properties if provided
  if (color) jsonLd.color = color;
  if (material) jsonLd.material = material;

  // Add dimensions if provided
  if (height || width || depth) {
    const dimensions: any = {};
    
    if (height) dimensions.height = height;
    if (width) dimensions.width = width;
    if (depth) dimensions.depth = depth;
    
    if (Object.keys(dimensions).length > 0) {
      jsonLd.size = Object.entries(dimensions)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
  }

  // Add weight if provided
  if (weight) jsonLd.weight = weight;

  // Add return policy if provided
  if (hasMerchantReturnPolicy !== undefined) {
    jsonLd.hasMerchantReturnPolicy = hasMerchantReturnPolicy;
  }

  // Add additional properties if provided
  if (additionalProperty && additionalProperty.length > 0) {
    jsonLd.additionalProperty = additionalProperty.map(prop => ({
      "@type": "PropertyValue",
      "name": prop.name,
      "value": prop.value
    }));
  }

  return (
    <Script id="product-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

// Helper function to format offer objects
function formatOffer(offer: ProductOffer): any {
  const offerObj: any = {
    "@type": "Offer",
    "price": offer.price,
    "priceCurrency": offer.priceCurrency
  };

  if (offer.priceValidUntil) offerObj.priceValidUntil = offer.priceValidUntil;
  if (offer.availability) offerObj.availability = `https://schema.org/${offer.availability}`;
  if (offer.url) offerObj.url = offer.url;
  
  if (offer.seller) {
    offerObj.seller = {
      "@type": "Organization",
      "name": offer.seller.name
    };
    
    if (offer.seller.url) offerObj.seller.url = offer.seller.url;
  }

  return offerObj;
}
