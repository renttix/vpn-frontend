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
  role?: string; // Author's role or specialty (e.g., "Crime Reporter", "Legal Analyst")
  jobTitle?: string; // Author's job title for structured data
  socialLinks?: string[]; // Array of social media profile URLs
}

export interface Category {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
  parent?: Category; // Reference to parent category for hierarchical categories
}

export interface Tag {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
}

// Series for article series
export interface Series {
  _id: string;
  title: string;
  slug: Slug;
  description?: string;
  coverImage?: SanityImage;
  startDate?: string;
  endDate?: string;
  totalPlannedParts?: number;
  categories?: Category[];
  tags?: Tag[];
}

// Series information for a post
export interface SeriesInfo {
  seriesRef?: Series;
  partNumber?: number;
  partTitle?: string;
  isFinalPart?: boolean;
}

// Source for citations
export interface Source {
  name: string;
  url: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: Slug;
  mainImage?: SanityImage;
  author?: Author; // Reference to Author type
  publishedAt: string;
  lastUpdatedAt?: string; // Date when the post was last updated
  body?: any; // Portable Text
  subtitle?: string;
  categories?: Category[]; // Array of referenced Category types
  tags?: Tag[]; // Array of referenced Tag types
  excerpt?: string;
  isBreakingNews?: boolean; // Flag for breaking news (used for Google News standout tag)
  series?: SeriesInfo; // Series information if this post is part of a series
  seriesArticles?: Post[]; // Other articles in the same series (populated by GROQ)
  relatedPosts?: any[]; // Array of related posts
  sources?: Source[]; // Sources cited in the article
  backstory?: string; // Background information about the article
  wordCount?: number; // Word count of the article
}

// SearchResult type for search functionality
export interface SearchResult {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { name: string };
  publishedAt: string;
  excerpt?: string;
  categories?: { _id: string; title: string; slug: { current: string } }[];
}

// VideoPost type for video content
export interface VideoPost {
  _id: string;
  title: string;
  slug: Slug;
  thumbnailImage?: SanityImage;
  videoUrl: string;
  duration?: string;
  author?: Author;
  publishedAt: string;
  lastUpdatedAt?: string;
  description?: any; // Portable Text
  categories?: Category[];
  tags?: Tag[];
  status?: string;
  isBreakingNews?: boolean;
  relatedPosts?: any[];
}

// You can add more specific types as needed, e.g., for Portable Text blocks
