"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AlertTriangle, LogIn, Menu, X, Calendar, Clock, Search } from "lucide-react";
import NewsTicker from "./NewsTicker";
import NotificationBell from "../notification/NotificationBell";
import SearchAutocomplete from "../search/SearchAutocomplete";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Portal from "@/components/ui/Portal";
import { cn } from "@/lib/utils";

// Types
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

interface HeaderProps {
  categories: Category[];
}

// Helper functions moved outside component
const getDisplayTitle = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower === 'crime news') return 'Crime';
  if (titleLower === 'court news') return 'Court';
  if (titleLower === 'legal commentary') return 'Commentary';
  if (titleLower === 'justice watch') return 'Watch';
  return title;
};

const getMobileDisplayTitle = (title: string): string => {
  if (title.toLowerCase() === 'news') {
    return 'News';
  }
  return getDisplayTitle(title);
};

const sortCategories = (cats: Category[]): Category[] => {
  return [...cats].sort((a, b) => {
    // Map original category titles to their desired order
    const getOrderValue = (title: string): number => {
      const titleLower = title.toLowerCase();
      if (titleLower === 'news') return 1;
      if (titleLower === 'crime news') return 2;
      if (titleLower === 'court news') return 3;
      if (titleLower === 'legal commentary') return 4;
      if (titleLower === 'justice watch') return 5;
      return 999; // Default for any other categories
    };
    
    return getOrderValue(a.title) - getOrderValue(b.title);
  });
};

// Custom hooks
const useDateTime = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      }));
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  return { currentDate, currentTime };
};

const useScrollPosition = (threshold = 100) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const bufferZone = 20; // Buffer to prevent flickering
    
    // Use requestAnimationFrame for better performance
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const shouldBeScrolled = currentScrollY > threshold;
          
          // Only update state if we've crossed the threshold with buffer
          if (
            (currentScrollY > threshold + bufferZone && !isScrolled) || 
            (currentScrollY < threshold - bufferZone && isScrolled)
          ) {
            setIsScrolled(shouldBeScrolled);
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled, threshold]);

  return isScrolled;
};

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentDate, currentTime } = useDateTime();
  const isScrolled = useScrollPosition(100);
  
  // Refs for accessibility
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Memoized sorted categories - filter out Justice Watch
  const sortedCategories = useMemo(() => {
    // Filter out Justice Watch category
    const filteredCategories = categories.filter(
      category => category.title.toLowerCase() !== 'justice watch'
    );
    return sortCategories(filteredCategories);
  }, [categories]);

  // Handle search submission
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);
  
  // Toggle mobile menu with accessibility
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    // Announce to screen readers
    if (!mobileMenuOpen) {
      // Focus the first menu item when opening
      setTimeout(() => {
        const firstMenuItem = mobileMenuRef.current?.querySelector('a');
        if (firstMenuItem) {
          (firstMenuItem as HTMLElement).focus();
        }
      }, 100);
    }
  }, [mobileMenuOpen]);
  
  // Toggle search with accessibility
  const toggleSearch = useCallback(() => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [searchOpen]);
  
  // Handle escape key for modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [searchOpen, mobileMenuOpen]);

  // Announce header state change to screen readers
  useEffect(() => {
    // This would ideally use a live region, but for now we'll just log
    // In a real implementation, you'd use an ARIA live region
    console.log(`Header is now ${isScrolled ? 'compact' : 'expanded'}`);
  }, [isScrolled]);

  // Render category link based on type
  const renderCategoryLink = (category: Category, isMobile = false, isCompact = false) => {
    const isJusticeWatch = category.title.toLowerCase() === 'justice watch';
    const isNews = category.title.toLowerCase() === 'news';
    const displayTitle = isMobile ? getMobileDisplayTitle(category.title) : getDisplayTitle(category.title);
    const href = isJusticeWatch 
      ? "/justice-watch" 
      : `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Determine if this is the current category based on URL
    const isCurrent = typeof window !== 'undefined' 
      ? window.location.pathname === href 
      : false;
    
    return (
      <Link
        key={category._id}
        href={href}
        className={cn(
          "text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white",
          isMobile ? "text-xs font-medium" : "flex items-center",
          !isMobile && !isCompact && "py-1 px-2 newspaper-nav-item"
        )}
        aria-current={isCurrent ? "page" : undefined}
        aria-label={displayTitle}
      >
        {isJusticeWatch && !isMobile && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            width={isCompact ? 12 : 14}
            height={isCompact ? 12 : 14}
            className="mr-1 fill-current" 
            aria-hidden="true"
          >
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        )}
        {isNews && !isMobile && (
          <AlertTriangle 
            size={isCompact ? 12 : 14} 
            className="mr-1 text-vpn-red" 
            aria-hidden="true" 
          />
        )}
        <span>{displayTitle}</span>
      </Link>
    );
  };

  return (
    <header 
      className={cn(
        "bg-background border-b border-border sticky top-0 z-40 w-full newspaper-header",
        "transition-all duration-300 ease-in-out",
        isScrolled && "header-compact"
      )} 
      role="banner" 
      aria-label="Site header"
    >
      {/* Breaking news ticker - always visible */}
      <NewsTicker />

      {/* Date and utility bar - hidden when scrolled */}
      <div 
        className={cn(
          "date-utility-bar border-b border-gray-200 dark:border-gray-700",
          "bg-gray-50 dark:bg-gray-900 text-xs py-1.5",
          "transition-all duration-300 ease-in-out",
          isScrolled ? "header-section-hidden" : "header-section-visible"
        )}
        aria-hidden={isScrolled}
      >
        <div className="container mx-auto flex justify-between items-center px-3 sm:px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1 text-vpn-gray-light dark:text-gray-300" aria-hidden="true" />
              <span className="text-vpn-gray-light dark:text-gray-300">{currentDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1 text-vpn-gray-light dark:text-gray-300" aria-hidden="true" />
              <span className="text-vpn-gray-light dark:text-gray-300">{currentTime}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link 
              href="/newsletters" 
              className="text-vpn-gray-light dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white transition-colors"
            >
              Newsletters
            </Link>
            <span className="text-vpn-gray-light dark:text-gray-300" aria-hidden="true">|</span>
            <Link 
              href="/contact-us" 
              className="text-vpn-gray-light dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
            <span className="text-vpn-gray-light dark:text-gray-300" aria-hidden="true">|</span>
            <a 
              href="https://vpnnews.sanity.studio/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-vpn-gray-light dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white transition-colors flex items-center"
            >
              <LogIn className="h-3 w-3 mr-1" aria-hidden="true" />
              Creator Login
            </a>
          </div>
        </div>
      </div>

      {/* Main header with logo and navigation */}
      <div className="container mx-auto">
        {/* Masthead area - hidden when scrolled */}
        <div 
          className={cn(
            "masthead-area py-4 px-3 sm:px-4 flex flex-col items-center",
            "border-b border-gray-200 dark:border-gray-700",
            "transition-all duration-300 ease-in-out",
            isScrolled ? "header-section-hidden" : "header-section-visible"
          )}
          aria-hidden={isScrolled}
        >
          {/* Logo and Sponsor Row */}
          <div className="w-full flex justify-between items-center mb-2">
            {/* Logo/Masthead */}
            <Link href="/" className="flex-shrink-0" aria-label="VPN News Home">
              <div className="relative h-16 w-48 flex items-center justify-center">
                <Image
                  src="/images/vpn-logo-black.png"
                  alt="VPN News Logo"
                  width={200}
                  height={64}
                  className="block dark:hidden"
                  priority
                  style={{ height: "auto", width: "auto", maxWidth: "200px", maxHeight: "64px" }}
                />
                <Image
                  src="/images/vpn-logo-white.png"
                  alt="VPN News Logo"
                  width={200}
                  height={64}
                  className="hidden dark:block"
                  priority
                  style={{ height: "auto", width: "auto", maxWidth: "200px", maxHeight: "64px", filter: 'brightness(1)' }}
                />
              </div>
            </Link>
            
            {/* Logo spacer */}
            <div className="hidden md:block"></div>
          </div>
          
          {/* Action buttons row - centered */}
          <div className="flex items-center justify-center space-x-4 mt-2 mb-2">
            <Link
              href="/membership"
              className="bg-vpn-red text-white text-xs font-bold py-2 px-5 rounded-sm hover:bg-opacity-90 transition-colors focus:ring-2 focus:ring-vpn-red focus:ring-opacity-50 focus:outline-none"
              aria-label="Subscribe to VPN News"
            >
              SUBSCRIBE
            </Link>
            
            <div className="flex items-center space-x-3 text-vpn-gray dark:text-gray-300">
              <ThemeToggle />
              <NotificationBell />
              <button
                onClick={toggleSearch}
                className="p-1 hover:text-vpn-blue dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-vpn-blue rounded-sm"
                aria-label="Open search"
                aria-expanded={searchOpen}
                aria-controls="search-modal"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-vpn-gray dark:text-gray-300 italic text-sm mt-1">
            Reporting the Truth from the Courtroom Out
          </p>
        </div>

        {/* Compact header - visible only when scrolled */}
        <div 
          className={cn(
            "compact-header hidden md:flex justify-between items-center py-2 px-4",
            "transition-all duration-300 ease-in-out shadow-sm",
            isScrolled ? "header-section-visible" : "header-section-hidden"
          )}
          aria-hidden={!isScrolled}
        >
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center" aria-label="VPN News Home">
              <div className="relative h-8 w-20 flex items-center justify-center">
                <Image
                  src="/images/vpn-logo-black.png"
                  alt="VPN News Logo"
                  width={80}
                  height={32}
                  className="block dark:hidden"
                  priority
                  style={{ height: "auto", width: "auto", maxWidth: "80px", maxHeight: "32px" }}
                />
                <Image
                  src="/images/vpn-logo-white.png"
                  alt="VPN News Logo"
                  width={80}
                  height={32}
                  className="hidden dark:block"
                  priority
                  style={{ height: "auto", width: "auto", maxWidth: "80px", maxHeight: "32px", filter: 'brightness(1)' }}
                />
              </div>
            </Link>
            
            {/* Subscribe button in compact header */}
            <Link
              href="/membership"
              className="bg-vpn-red text-white text-xs font-bold py-1.5 px-3 rounded-sm hover:bg-opacity-90 transition-colors focus:ring-2 focus:ring-vpn-red focus:ring-opacity-50 focus:outline-none"
              aria-label="Subscribe to VPN News"
            >
              SUBSCRIBE
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-6 text-sm font-medium uppercase" aria-label="Main navigation (compact)">
              {sortedCategories.slice(0, 5).map((category) => (
                renderCategoryLink(category, false, true)
              ))}
              
              {/* Marketplace link removed */}
            </nav>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSearch}
                className="p-1 hover:text-vpn-blue dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-vpn-blue rounded-sm text-vpn-gray dark:text-gray-300"
                aria-label="Open search"
                aria-expanded={searchOpen}
                aria-controls="search-modal"
              >
                <Search size={18} />
              </button>
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Main navigation menu - desktop, hidden when scrolled */}
        <nav 
          className={cn(
            "main-navigation hidden md:block py-2 border-b border-gray-200 dark:border-gray-700",
            "bg-gray-50 dark:bg-gray-900 transition-all duration-300",
            isScrolled ? "header-section-hidden" : "header-section-visible"
          )}
          role="navigation" 
          aria-label="Main navigation"
          id="main-navigation"
          aria-hidden={isScrolled}
        >
          <div className="container mx-auto px-4">
            <ul 
              className="flex justify-center space-x-6 text-sm font-medium uppercase"
              role="menubar"
              aria-label="Main menu"
            >
              {/* Dynamic categories from CMS */}
              {sortedCategories.map((category) => {
                const isJusticeWatch = category.title.toLowerCase() === 'justice watch';
                const href = isJusticeWatch 
                  ? "/justice-watch" 
                  : `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`;
                
                // Determine if this is the current category based on URL
                const isCurrent = typeof window !== 'undefined' 
                  ? window.location.pathname === href 
                  : false;
                
                return (
                  <li key={category._id} role="none">
                    {renderCategoryLink(category)}
                  </li>
                );
              })}
              
              {/* Marketplace menu item removed */}
            </ul>
          </div>
        </nav>

        {/* Mobile navigation and menu button */}
        <div className="md:hidden flex justify-between items-center py-2 px-3 border-t border-gray-200 dark:border-gray-700">
          <button
            className="text-vpn-gray dark:text-gray-300 flex items-center focus:outline-none focus:ring-2 focus:ring-vpn-blue rounded-sm"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="ml-1 text-xs font-medium">SECTIONS</span>
          </button>
          
          <div 
            className="flex space-x-4"
            role="navigation"
            aria-label="Quick category access"
          >
            {sortedCategories.slice(0, 3).map((category) => (
              renderCategoryLink(category, true)
            ))}
          </div>
        </div>

        {/* Mobile menu dropdown - additional options */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            role="menu"
            aria-label="Mobile navigation menu"
            ref={mobileMenuRef}
          >
            <ul 
              className="grid grid-cols-2 gap-2 p-4"
              role="menu"
            >
              {sortedCategories.map((category) => {
                const isJusticeWatch = category.title.toLowerCase() === 'justice watch';
                const href = isJusticeWatch 
                  ? "/justice-watch" 
                  : `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`;
                
                // Determine if this is the current category based on URL
                const isCurrent = typeof window !== 'undefined' 
                  ? window.location.pathname === href 
                  : false;
                
                return (
                  <li key={category._id} role="none">
                    <Link
                      href={href}
                      className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                      role="menuitem"
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {isJusticeWatch ? (
                        <div className="flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            width="14" 
                            height="14" 
                            className="mr-1 fill-current" 
                            aria-hidden="true"
                          >
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                          <span>Watch</span>
                        </div>
                      ) : (
                        getDisplayTitle(category.title)
                      )}
                    </Link>
                  </li>
                );
              })}
              
              {/* Additional menu items */}
              <li role="none">
                <Link 
                  href="/about" 
                  className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                  role="menuitem"
                >
                  About Us
                </Link>
              </li>
              <li role="none">
                <Link 
                  href="/contact-us" 
                  className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                  role="menuitem"
                >
                  Contact Us
                </Link>
              </li>
              <li role="none">
                <Link 
                  href="/terms-of-use" 
                  className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                  role="menuitem"
                >
                  Terms of Use
                </Link>
              </li>
              <li role="none">
                <Link 
                  href="/privacy-policy" 
                  className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                  role="menuitem"
                >
                  Privacy Policy
                </Link>
              </li>
              {/* Marketplace menu item removed */}
            </ul>
          </div>
        )}

        {/* Search Modal */}
        {searchOpen && (
          <Portal>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-999 flex items-start justify-center pt-20 px-4">
              <div className="bg-background dark:bg-gray-800 rounded-md shadow-lg w-full max-w-2xl">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-lg font-bold">Search VPN News</h2>
                  <button 
                    onClick={() => setSearchOpen(false)}
                    className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white"
                    aria-label="Close search"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Search for news, articles, topics..."
                        className="flex-grow px-4 py-2 border border-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-vpn-blue dark:bg-gray-700 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        ref={searchInputRef}
                      />
                      <button
                        type="submit"
                        className="bg-vpn-blue text-white px-4 py-2 rounded-r-md hover:bg-opacity-90"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-vpn-gray dark:text-gray-400">
                      <p>Popular searches: Crime, Court Cases, Legal Updates, News</p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </header>
  );
}
