import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param inputs - Class names to combine
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the reading time for Portable Text content
 * @param blocks - Portable Text blocks
 * @returns Estimated reading time in minutes
 */
/**
 * Extracts plain text from Portable Text blocks
 * @param blocks - Portable Text blocks
 * @returns Plain text content
 */
export function extractTextFromPortableText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) {
    return ''; // Return empty string if no valid blocks
  }
  
  // Process each block and extract text
  return blocks.map(block => {
    // Handle text blocks
    if (block._type === 'block' && block.children) {
      return block.children
        .map((child: any) => {
          if (child._type === 'span' && typeof child.text === 'string') {
            return child.text;
          }
          return '';
        })
        .join(' ');
    }
    
    // Skip non-text blocks like images
    return '';
  }).join(' ');
}

export function calculatePortableTextReadingTime(blocks: any[]): number {
  if (!blocks || !Array.isArray(blocks)) {
    return 1; // Default to 1 minute if no valid blocks
  }
  
  // Average reading speed (words per minute)
  const wordsPerMinute = 200;
  
  // Count words in all text blocks
  let wordCount = 0;
  
  // Process each block
  blocks.forEach(block => {
    // Handle text blocks
    if (block._type === 'block' && block.children) {
      block.children.forEach((child: any) => {
        if (child._type === 'span' && typeof child.text === 'string') {
          // Count words in text
          const words = child.text.trim().split(/\s+/).length;
          wordCount += words;
        }
      });
    }
    
    // Add extra time for images (assume 10 seconds per image)
    if (block._type === 'image') {
      wordCount += Math.round((10 / 60) * wordsPerMinute);
    }
  });
  
  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return readingTime;
}

/**
 * Formats a date string into a human-readable format
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format the date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generates a random string of specified length
 * @param length - Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 * @param func - Function to throttle
 * @param limit - Limit time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
