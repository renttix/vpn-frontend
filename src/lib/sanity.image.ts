import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanity.client';

// Create an image URL builder using the Sanity client
const builder = imageUrlBuilder(client);

/**
 * Generate an image URL builder for a Sanity image
 * @param source The Sanity image object
 * @returns An image URL builder
 */
export function urlForImage(source: any) {
  // Enhanced null/empty check
  if (!source || source === "" || !source?.asset || !source?.asset?._ref) {
    // Return a default image or empty string
    // Using an empty string will cause the builder to return a valid builder instance
    // but will ultimately result in an empty URL
    return builder.image('');
  }
  
  try {
    return builder.image(source);
  } catch (error) {
    console.error('Error creating image URL builder:', error);
    return builder.image('');
  }
}

/**
 * Helper function to get responsive image URLs
 * @param image The Sanity image object
 * @param width The desired width of the image
 * @returns A URL string for the image with the specified width
 */
export function getResponsiveImageUrl(image: any, width: number) {
  // Enhanced null/empty check
  if (!image || image === "" || !image?.asset || !image?.asset?._ref) {
    return '';
  }
  
  try {
    // Calculate height based on Sanity standard aspect ratio (1200x630)
    const aspectRatio = 1200 / 630;
    const height = Math.round(width / aspectRatio);
    
    return urlForImage(image)
      .width(width)
      .height(height)
      .auto('format')
      .fit('max')
      .quality(width < 600 ? 70 : 80)
      .url();
  } catch (error) {
    console.error('Error generating responsive image URL:', error);
    return '';
  }
}

/**
 * Helper to generate srcSet for responsive images
 * @param image The Sanity image object
 * @returns A srcSet string for use in img or picture elements
 */
export function generateSrcSet(image: any) {
  // Enhanced null/empty check
  if (!image || image === "" || !image?.asset || !image?.asset?._ref) {
    return '';
  }
  
  try {
    // Use widths that maintain the 1200x630 aspect ratio
    const widths = [300, 600, 900, 1200, 1800, 2400];
    
    // Calculate heights based on the 1200x630 aspect ratio
    const aspectRatio = 1200 / 630;
    
    return widths
      .map(w => {
        const h = Math.round(w / aspectRatio);
        return `${urlForImage(image)
          .width(w)
          .height(h)
          .fit('max')
          .auto('format')
          .quality(w < 600 ? 70 : 80)
          .url()} ${w}w`;
      })
      .join(', ');
  } catch (error) {
    console.error('Error generating srcSet:', error);
    return '';
  }
}

/**
 * Get optimized image props for next/image
 * @param image The Sanity image object
 * @param options Additional options for the image
 * @returns Props object for next/image component
 */
export function getImageProps(image: any, options: {
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
} = {}) {
  // Enhanced null/empty check
  if (!image || image === "" || !image?.asset || !image?.asset?._ref) {
    return {
      src: '',
      width: options.width || 1200,
      height: options.height || 630,
      alt: '',
    };
  }
  
  // Default to Sanity standard dimensions (1200x630)
  const { width = 1200, height = 630, priority = false, sizes = '100vw' } = options;
  
  // Calculate aspect ratio based on Sanity standard image size (1200x630)
  const aspectRatio = 1200 / 630;
  
  // If only width is provided, calculate height to maintain aspect ratio
  const calculatedHeight = options.width && !options.height 
    ? Math.round(options.width / aspectRatio) 
    : height;
  
  // If only height is provided, calculate width to maintain aspect ratio
  const calculatedWidth = options.height && !options.width 
    ? Math.round(options.height * aspectRatio) 
    : width;
  
  try {
    const src = urlForImage(image)
      .width(calculatedWidth)
      .height(calculatedHeight)
      .fit('max')
      .quality(80)
      .url();
    
    return {
      src: src || '',
      width: calculatedWidth,
      height: calculatedHeight,
      alt: image.alt || '',
      sizes,
      priority,
      blurDataURL: image.metadata?.lqip,
      placeholder: image.metadata?.lqip ? 'blur' : 'empty',
    };
  } catch (error) {
    console.error('Error generating image props:', error);
    return {
      src: '',
      width: options.width || 1200,
      height: options.height || 630,
      alt: '',
    };
  }
}
