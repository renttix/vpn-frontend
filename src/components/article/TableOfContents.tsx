"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headingSelector?: string;
  className?: string;
  title?: string;
  minHeadings?: number;
  maxLevel?: number;
  minLevel?: number;
  scrollOffset?: number;
  collapsible?: boolean;
  initiallyCollapsed?: boolean;
}

/**
 * TableOfContents Component
 * 
 * This component automatically generates a table of contents from the headings in an article.
 * It provides jump links to each section and highlights the current section as the user scrolls.
 * 
 * @param headingSelector - CSS selector for headings to include (default: 'h2, h3, h4')
 * @param className - Additional CSS classes
 * @param title - Title for the table of contents
 * @param minHeadings - Minimum number of headings required to show TOC (default: 3)
 * @param maxLevel - Maximum heading level to include (default: 4)
 * @param minLevel - Minimum heading level to include (default: 2)
 * @param scrollOffset - Offset in pixels when scrolling to a heading (default: 100)
 * @param collapsible - Whether the TOC can be collapsed (default: true)
 * @param initiallyCollapsed - Whether the TOC is initially collapsed (default: false)
 */
export default function TableOfContents({
  headingSelector = 'h2, h3, h4',
  className = '',
  title = 'Table of Contents',
  minHeadings = 3,
  maxLevel = 4,
  minLevel = 2,
  scrollOffset = 100,
  collapsible = true,
  initiallyCollapsed = false
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initiallyCollapsed);

  // Extract headings from the article
  useEffect(() => {
    const extractHeadings = () => {
      const elements = document.querySelectorAll<HTMLHeadingElement>(headingSelector);
      const headingElements: Heading[] = [];

      elements.forEach((el) => {
        // Skip headings without IDs
        if (!el.id) return;
        
        // Get heading level from tag name (h2 -> 2, h3 -> 3, etc.)
        const level = parseInt(el.tagName.substring(1), 10);
        
        // Skip headings outside our min/max range
        if (level < minLevel || level > maxLevel) return;
        
        headingElements.push({
          id: el.id,
          text: el.textContent || '',
          level
        });
      });

      setHeadings(headingElements);
    };

    // Extract headings on mount and when content changes
    extractHeadings();
    
    // Set up a mutation observer to detect when headings are added/removed
    const observer = new MutationObserver(extractHeadings);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, [headingSelector, minLevel, maxLevel]);

  // Track the active heading as the user scrolls
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      // Get all heading elements
      const headingElements = headings.map(heading => 
        document.getElementById(heading.id)
      ).filter(Boolean) as HTMLElement[];
      
      // Find the heading that's currently in view
      const scrollPosition = window.scrollY + scrollOffset + 10;
      
      // Find the heading that's at or before the current scroll position
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(element.id);
          return;
        }
      }
      
      // If no heading is found, set the first one as active
      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once to set initial active heading
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, scrollOffset]);

  // Don't render if there aren't enough headings
  if (headings.length < minHeadings) {
    return null;
  }

  // Handle click on a TOC item
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Update URL hash
      history.pushState(null, '', `#${id}`);
      
      // Scroll to the element
      window.scrollTo({
        top: element.offsetTop - scrollOffset,
        behavior: 'smooth'
      });
      
      // Set active ID
      setActiveId(id);
    }
  };

  // Toggle collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <nav 
      className={cn(
        'toc border-t border-b border-gray-100 dark:border-gray-800 py-2 mb-4 text-sm',
        className
      )}
      aria-label="Table of contents"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <List size={14} className="mr-1" />
          {title}
        </h2>
        {collapsible && (
          <button 
            onClick={toggleCollapsed}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-expanded={!isCollapsed}
            aria-controls="toc-list"
            aria-label={isCollapsed ? "Expand table of contents" : "Collapse table of contents"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <ol 
          id="toc-list"
          className="list-none pl-0 mt-1 pt-1 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-4 gap-y-1 text-xs"
        >
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={cn(
                'toc-item',
                activeId === heading.id ? 'font-medium text-vpn-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(heading.id);
                }}
                className="hover:text-vpn-blue dark:hover:text-blue-400 transition-colors"
                aria-current={activeId === heading.id ? 'location' : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

/**
 * Helper function to add IDs to headings in an article
 * 
 * This function can be called on mount to ensure all headings have IDs
 * for the table of contents to link to.
 * 
 * @param selector CSS selector for headings to process
 * @param prefix Prefix for generated IDs
 */
export function ensureHeadingIds(selector: string = 'h2, h3, h4', prefix: string = 'heading-') {
  const headings = document.querySelectorAll<HTMLHeadingElement>(selector);
  
  headings.forEach((heading, index) => {
    // Skip headings that already have IDs
    if (heading.id) return;
    
    // Generate an ID from the heading text or use a fallback
    const text = heading.textContent || '';
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      || `${prefix}${index + 1}`; // Fallback if slug is empty
    
    // Set the ID
    heading.id = slug;
  });
}
