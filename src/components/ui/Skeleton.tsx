"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
  circle?: boolean;
  animate?: boolean;
}

/**
 * Skeleton component for loading states
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className,
  height,
  width,
  rounded = false,
  circle = false,
  animate = true,
}) => {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        rounded && 'rounded-md',
        circle && 'rounded-full',
        className
      )}
      style={{
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      }}
    />
  );
};

/**
 * Article skeleton for loading states
 */
export const ArticleSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="h-8 w-3/4 mb-2" />
      
      {/* Author and date */}
      <div className="flex items-center space-x-4">
        <Skeleton circle height={40} width={40} />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      {/* Featured image */}
      <Skeleton className="h-64 w-full rounded-md" />
      
      {/* Content paragraphs */}
      <div className="space-y-4 mt-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Image */}
      <Skeleton className="h-48 w-full" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
