import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.slice(0, length) + '...';
}

/**
 * Generates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

/**
 * Extracts the first image URL from a Portable Text block
 */
export function extractFirstImage(blocks: any[]): string | null {
  if (!blocks || !Array.isArray(blocks)) return null;
  
  for (const block of blocks) {
    if (block._type === 'image' && block.asset?._ref) {
      // This is a simplified version - in a real app, you'd need to construct the actual URL
      return block.asset._ref;
    }
    
    // Check for inline images in block children
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (child.marks && child.marks.some((mark: string) => mark.startsWith('image-'))) {
          return child.marks.find((mark: string) => mark.startsWith('image-')).replace('image-', '');
        }
      }
    }
  }
  
  return null;
}

/**
 * Calculates reading time for an article based on word count
 */
export function calculateReadingTime(content: string | any[]): number {
  const WORDS_PER_MINUTE = 200;
  let wordCount = 0;
  
  if (typeof content === 'string') {
    wordCount = content.split(/\s+/).length;
  } else if (Array.isArray(content)) {
    // Assuming content is an array of Portable Text blocks
    for (const block of content) {
      if (block.children && Array.isArray(block.children)) {
        for (const child of block.children) {
          if (child.text) {
            wordCount += child.text.split(/\s+/).length;
          }
        }
      }
    }
  }
  
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
