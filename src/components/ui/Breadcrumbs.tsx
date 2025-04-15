"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  item: string;
  image?: string;
  position: number;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Sort items by position to ensure correct order
  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  
  return (
    <nav aria-label="Breadcrumb" className={`text-sm mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center space-x-1">
        {sortedItems.map((item, index) => (
          <React.Fragment key={item.position}>
            {index > 0 && (
              <li className="flex items-center">
                <ChevronRight size={14} className="text-gray-400 mx-1" />
              </li>
            )}
            <li className="flex items-center">
              {index === sortedItems.length - 1 ? (
                // Last item (current page) - not a link
                <span className="text-gray-600 dark:text-gray-400 font-medium truncate max-w-[200px]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                // Link to previous level
                <Link 
                  href={item.item} 
                  className="text-vpn-blue dark:text-blue-400 hover:underline truncate max-w-[150px]"
                >
                  {item.name}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
