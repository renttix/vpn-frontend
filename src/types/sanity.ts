// Define shared Sanity types

export interface Slug {
  current: string;
  _type: 'slug';
}

export interface ImageAsset {
  url: string;
  alt?: string;
}

export interface SanityImage {
  asset: ImageAsset;
  alt?: string; // Optional alt text directly on the image field
  caption?: string; // Optional caption for the image
  attribution?: string; // Optional attribution for the image
  focalPoint?: { x: number; y: number }; // Optional focal point for responsive cropping
}

export interface Author {
  _id: string;
  name: string;
  slug?: Slug;
  bio?: any; // Portable Text
  image?: SanityImage;
}

export interface Category {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: Slug;
  mainImage?: SanityImage;
  author?: Author; // Reference to Author type
  publishedAt: string;
  body?: any; // Portable Text
  subtitle?: string;
  categories?: Category[]; // Array of referenced Category types
  excerpt?: string;
  isBreakingNews?: boolean; // Flag for news
  relatedPosts?: any[]; // Array of related posts
}

// You can add more specific types as needed, e.g., for Portable Text blocks
