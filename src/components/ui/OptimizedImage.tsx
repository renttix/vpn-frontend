"use client";

import Image from 'next/image';
import { urlForImage } from '@/lib/sanity.image';
import { useState, useEffect } from 'react';

// Default placeholder image URL - use a lightweight SVG for better performance
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjQwMCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';

// Low quality image placeholder - tiny blurred version
const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+';

interface OptimizedImageProps {
  image: any;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  quality?: number;
  placeholder?: 'blur' | 'empty';
  style?: React.CSSProperties;
  onLoad?: () => void;
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
  fetchPriority = 'auto',
  loading = priority ? 'eager' : 'lazy',
  quality = 80,
  placeholder = 'blur',
  style,
  onLoad,
}: OptimizedImageProps) {
  const [imgError, setImgError] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState(BLUR_PLACEHOLDER);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate blur placeholder for better LCP
  useEffect(() => {
    if (image?.asset?._ref && placeholder === 'blur') {
      try {
        // Generate a tiny version for the blur placeholder
        const tinyUrl = urlForImage(image)
          .width(20)
          .height(20)
          .blur(10)
          .quality(20)
          .format('webp')
          .url();
          
        if (tinyUrl) {
          setBlurDataURL(tinyUrl);
        }
      } catch (error) {
        console.error('Error generating blur placeholder:', error);
      }
    }
  }, [image, placeholder]);
  
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
    // Use AVIF format for better compression if supported
    imageUrl = urlForImage(image)
      .auto('format')
      .format('webp') // Fallback to WebP which has better browser support than AVIF
      .fit('max')
      .quality(quality)
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
    
    // Determine if this is a content image or a UI element
    const isContentImage = className?.includes('content') || false;
    
    // Handle image load complete
    const handleImageLoad = () => {
      setIsLoaded(true);
      if (onLoad) onLoad();
    };

    // Combine styles
    const imageStyle = {
      objectPosition: focus,
      ...style,
    };

    // Combine classes with loading state
    const imageClasses = `${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ${fill ? 'object-cover w-full h-full' : 'w-full h-auto'}`;

    return (
      <figure className={`relative ${className}`} style={{ position: 'relative' }}>
        {fill ? (
          <Image
            src={imgError ? PLACEHOLDER_IMAGE : src}
            alt={alt || (image?.alt ?? 'Image')}
            fill
            sizes={sizes}
            priority={priority}
            fetchPriority={fetchPriority}
            loading={loading}
            quality={quality}
            blurDataURL={blurDataURL}
            placeholder={placeholder}
            className={imageClasses}
            style={imageStyle}
            onError={() => setImgError(true)}
            onLoad={handleImageLoad}
            // Accessibility attributes
            decoding="async"
            role={isContentImage ? "img" : undefined}
            aria-hidden={!isContentImage}
          />
        ) : (
          <Image
            src={imgError ? PLACEHOLDER_IMAGE : src}
            alt={alt || (image?.alt ?? 'Image')}
            width={width || calculatedWidth}
            height={height || calculatedHeight}
            sizes={sizes}
            priority={priority}
            fetchPriority={fetchPriority}
            loading={loading}
            quality={quality}
            blurDataURL={blurDataURL}
            placeholder={placeholder}
            className={imageClasses}
            style={imageStyle}
            onError={() => setImgError(true)}
            onLoad={handleImageLoad}
            // Accessibility attributes
            decoding="async"
            role={isContentImage ? "img" : undefined}
            aria-hidden={!isContentImage}
          />
        )}
        
        {/* Show a loading placeholder while the image loads */}
        {!isLoaded && !priority && (
          <div 
            className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" 
            aria-hidden="true"
          />
        )}
        
        {image?.caption && (
          <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {image.caption}
            {image.attribution && <span className="text-gray-500 dark:text-gray-500"> • {image.attribution}</span>}
          </figcaption>
        )}
      </figure>
    );
  }
}
