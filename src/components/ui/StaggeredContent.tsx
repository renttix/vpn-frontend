"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface StaggeredContentProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in ms before starting the animation
  staggerDelay?: number; // Delay between each child's animation
  threshold?: number; // IntersectionObserver threshold
  rootMargin?: string; // IntersectionObserver rootMargin
  disabled?: boolean; // Disable the staggered effect
}

/**
 * StaggeredContent component that animates children in a staggered fashion when they come into view
 * Each child is wrapped in a div that handles the animation
 */
const StaggeredContent: React.FC<StaggeredContentProps> = ({
  children,
  className = '',
  delay = 0,
  staggerDelay = 100,
  threshold = 0.1,
  rootMargin = '0px',
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { threshold, rootMargin });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (isInView && !hasAnimated && !disabled) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, disabled]);
  
  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => {
        // Calculate the delay for this child
        const itemDelay = disabled ? 0 : delay + index * staggerDelay;
        
        // Wrap each child in a div with animation styles
        return (
          <div
            key={`staggered-${index}`}
            style={{
              opacity: hasAnimated ? 1 : 0,
              transform: hasAnimated ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.5s ease ${itemDelay}ms, transform 0.5s ease ${itemDelay}ms`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default StaggeredContent;
