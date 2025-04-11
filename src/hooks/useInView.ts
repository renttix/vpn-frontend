"use client";

import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Custom hook that tracks whether an element is in the viewport
 * @param ref - Reference to the element to track
 * @param options - IntersectionObserver options
 * @returns boolean indicating if the element is in view
 */
export function useInView(
  ref: RefObject<Element>,
  options: IntersectionOptions = {}
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // If we don't have a ref to observe yet, return early
    if (!ref.current) return;

    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create a new observer with the provided options
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Update state when intersection changes
        setIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null,
      }
    );

    // Start observing the target element
    observerRef.current.observe(ref.current);

    // Cleanup function to disconnect the observer when component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, options.threshold, options.rootMargin, options.root]);

  return isIntersecting;
}
