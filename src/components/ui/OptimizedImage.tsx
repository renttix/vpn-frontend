"use client";

import Image from 'next/image';
import { urlForImage } from '@/lib/sanity.image';
import { useState } from 'react';

// Default placeholder image URL
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x450?text=Image+Not+Available';

interface OptimizedImageProps {
  image: any;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
}

export default function OptimizedImage({
  image,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className = '',
  fill = false,
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);
  
  // Enhanced null/empty check
  if (!image || image === "") {
    // Use placeholder image instead of returning null
    return renderImage(PLACEHOLDER_IMAGE);
  }

  // Check if image has the expected structure
  if (!image.asset) {
    // Use placeholder image instead of returning null
    return renderImage(PLACEHOLDER_IMAGE);
  }

  // If image already has a direct URL, use it
  if (image.asset.url) {
    return renderImage(image.asset.url);
  }

  // Get image URL with transformations
  // Wrap in try/catch to handle any potential errors
  let imageUrl;
  try {
    imageUrl = urlForImage(image)
      .auto('format')
      .fit('max')
      .quality(80)
      .url();
  } catch (error) {
    console.error('Error generating image URL:', error);
    // Use placeholder image instead of returning null
    return renderImage(PLACEHOLDER_IMAGE);
  }

  // Additional check for empty URL
  if (!imageUrl) {
    return renderImage(PLACEHOLDER_IMAGE);
  }

  return renderImage(imageUrl);

  // Helper function to render the image with consistent props
  function renderImage(src: string) {
    // Use focal point if available
    const focalPoint = image?.focalPoint;
    const focus = focalPoint 
      ? `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%` 
      : undefined;
    
    // Calculate aspect ratio based on Sanity standard image size (1200x630)
    const aspectRatio = 1200 / 630;
    const calculatedHeight = width ? Math.round(width / aspectRatio) : 630;
    const calculatedWidth = height ? Math.round(height * aspectRatio) : 1200;

    return (
      <div className={`relative ${className}`}>
        {fill ? (
          <Image
            src={imgError ? PLACEHOLDER_IMAGE : src}
            alt={alt || (image?.alt ?? 'Image')}
            fill
            sizes={sizes}
            priority={priority}
            className="object-contain w-full h-full"
            style={{ objectPosition: focus }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src={imgError ? PLACEHOLDER_IMAGE : src}
            alt={alt || (image?.alt ?? 'Image')}
            width={width || 1200}
            height={height || 630}
            sizes={sizes}
            priority={priority}
            className="w-full h-auto"
            style={{ objectPosition: focus }}
            onError={() => setImgError(true)}
          />
        )}
        {image?.caption && (
          <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {image.caption}
            {image.attribution && <span className="text-gray-500 dark:text-gray-500"> • {image.attribution}</span>}
          </figcaption>
        )}
      </div>
    );
  }
}
