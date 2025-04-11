"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AlertTriangle, Video, LogIn, Menu, X, Calendar, Clock, Search } from "lucide-react";
import NewsTicker from "./NewsTicker";
import NotificationBell from "../notification/NotificationBell";
import SearchAutocomplete from "../search/SearchAutocomplete";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Define Category type (matching the one in Layout.tsx)
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

// Update props to include categories
interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Update date and time
  useEffect(() => {
    // Set initial date
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

  // Track scroll position with debouncing
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    let timeoutId: NodeJS.Timeout | null = null;
    let lastScrollY = window.scrollY;
    const scrollThreshold = 100;
    const bufferZone = 20; // Buffer to prevent flickering near threshold
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only change state if we've moved significantly and crossed the threshold with buffer
      if (
        (currentScrollY > scrollThreshold + bufferZone && !isScrolled) || 
        (currentScrollY < scrollThreshold - bufferZone && isScrolled)
      ) {
        // Clear any existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Set a timeout to update the state after scrolling stops
        timeoutId = setTimeout(() => {
          const shouldBeScrolled = currentScrollY > scrollThreshold;
          if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);
          }
        }, 50); // Short delay for responsiveness
      }
      
      lastScrollY = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled]);

  // Helper to get display title - transform long category names to shorter versions
  const getDisplayTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower === 'crime news') return 'Crime';
    if (titleLower === 'court news') return 'Court';
    if (titleLower === 'legal commentary') return 'Commentary';
    if (titleLower === 'justice watch') return 'Watch';
    return title;
  };

  // Helper to get mobile display title (shorter for news)
  const getMobileDisplayTitle = (title: string): string => {
    if (title.toLowerCase() === 'news') {
      return 'News';
    }
    return getDisplayTitle(title); // Use the main helper for other titles
  };

  // Sort categories in the desired order: News, Crime, Court, Commentary, Watch
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

  // Sort the categories
  const sortedCategories = sortCategories(categories);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`bg-background border-b border-border sticky top-0 z-40 w-full newspaper-header transition-all duration-300 ${isScrolled ? 'header-compact' : ''}`} role="banner" aria-label="Site header">
      {/* Breaking news ticker - always visible */}
      <NewsTicker />

      {/* Date and utility bar - hidden when scrolled */}
      <div className={`date-utility-bar border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs py-1 transition-all duration-300 ${isScrolled ? 'header-section-hidden' : 'header-section-visible'}`}>
        <div className="container mx-auto flex justify-between items-center px-3 sm:px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1 text-vpn-gray-light" />
              <span className="text-vpn-gray-light">{currentDate}</span>
            </div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1 text-vpn-gray-light" />
              <span className="text-vpn-gray-light">{currentTime}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/newsletters" className="text-vpn-gray-light hover:text-vpn-blue">
              Newsletters
            </Link>
            <span className="text-vpn-gray-light">|</span>
            <Link href="/contact-us" className="text-vpn-gray-light hover:text-vpn-blue">
              Contact
            </Link>
            <span className="text-vpn-gray-light">|</span>
            <a href="https://vpnnews.sanity.studio/" target="_blank" rel="noopener noreferrer" className="text-vpn-gray-light hover:text-vpn-blue flex items-center">
              <LogIn className="h-3 w-3 mr-1" />
              Creator Login
            </a>
          </div>
        </div>
      </div>

      {/* Main header with logo and navigation */}
      <div className="container mx-auto">
        {/* Masthead area - hidden when scrolled */}
        <div className={`masthead-area py-3 px-3 sm:px-4 flex flex-col items-center border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${isScrolled ? 'header-section-hidden' : 'header-section-visible'}`}>
          {/* Logo and Sponsor Row */}
          <div className="w-full flex justify-between items-center mb-1">
            {/* Logo/Masthead */}
            <Link href="/" className="flex-shrink-0">
              <div className="relative h-16 w-48 flex items-center justify-center">
                <Image
                  src="/images/vpn-logo-black.png"
                  alt="VPN News Logo"
                  width={200}
                  height={64}
                  className="block dark:hidden"
                  priority
                />
                <Image
                  src="/images/vpn-logo-white.png"
                  alt="VPN News Logo"
                  width={200}
                  height={64}
                  className="hidden dark:block"
                  priority
                  style={{ filter: 'brightness(1)' }}
                />
              </div>
            </Link>
            
            {/* Logo spacer */}
            <div className="hidden md:block"></div>
          </div>
          
          {/* Action buttons row - centered */}
          <div className="flex items-center justify-center space-x-3 mt-1 mb-1">
            <Link
              href="/membership"
              className="bg-vpn-red text-white text-xs font-bold py-1.5 px-4 rounded-sm hover:bg-opacity-90 transition-colors"
            >
              SUBSCRIBE
            </Link>
            
            <div className="flex items-center space-x-2 text-vpn-gray dark:text-gray-300">
              <ThemeToggle />
              <NotificationBell />
              <SearchAutocomplete />
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-vpn-gray dark:text-gray-300 italic text-sm">
            Reporting the Truth from the Courtroom Out
          </p>
        </div>

        {/* Compact header - visible only when scrolled */}
        <div className={`compact-header hidden md:flex justify-between items-center py-2 px-4 transition-all duration-300 ${isScrolled ? 'header-section-visible' : 'header-section-hidden'}`}>
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-20 flex items-center justify-center">
                <Image
                  src="/images/vpn-logo-black.png"
                  alt="VPN News Logo"
                  width={80}
                  height={32}
                  className="block dark:hidden"
                  priority
                />
                <Image
                  src="/images/vpn-logo-white.png"
                  alt="VPN News Logo"
                  width={80}
                  height={32}
                  className="hidden dark:block"
                  priority
                  style={{ filter: 'brightness(1)' }}
                />
              </div>
            </Link>
            
            {/* Logo spacer */}
            <div></div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-6 text-sm font-medium uppercase">
              {sortedCategories && sortedCategories.slice(0, 5).map((category) => {
                // Special case for Justice Watch category
                if (category.title.toLowerCase() === 'justice watch') {
                  return (
                    <Link
                      key={category._id}
                      href="/justice-watch"
                      className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white flex items-center"
                    >
                      <Video size={12} className="mr-1" aria-hidden="true" />
                      <span>Watch</span>
                    </Link>
                  );
                }
                
                // Regular categories
                return (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white flex items-center"
                  >
                    {category.title.toLowerCase() === 'news' && (
                      <AlertTriangle size={12} className="mr-1 text-vpn-red" />
                    )}
                    <span>{getDisplayTitle(category.title)}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              <SearchAutocomplete />
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Main navigation menu - desktop, hidden when scrolled */}
        <nav 
          className={`main-navigation hidden md:block py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${isScrolled ? 'header-section-hidden' : 'header-section-visible'}`} 
          role="navigation" 
          aria-label="Main navigation"
          id="main-navigation"
        >
          <div className="container mx-auto px-4">
            <ul 
              className="flex justify-center space-x-6 text-sm font-medium uppercase"
              role="menubar"
              aria-label="Main menu"
            >
              {/* Dynamic categories from CMS */}
              {sortedCategories && sortedCategories.map((category) => {
                // Determine if this is the current category based on URL
                const isCurrent = typeof window !== 'undefined' ? 
                  window.location.pathname === `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}` : false;
                
                // Special case for Justice Watch category
                if (category.title.toLowerCase() === 'justice watch') {
                  return (
                    <li 
                      key={category._id}
                      role="none"
                    >
                      <Link
                        href="/justice-watch"
                        className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white flex items-center py-1 px-2 newspaper-nav-item"
                        role="menuitem"
                        aria-current={typeof window !== 'undefined' ? window.location.pathname === '/justice-watch' ? "page" : undefined : undefined}
                      >
                        <Video size={14} className="mr-1" aria-hidden="true" />
                        <span>Watch</span>
                      </Link>
                    </li>
                  );
                }
                
                // Regular categories
                return (
                  <li 
                    key={category._id}
                    role="none"
                  >
                    <Link
                      href={`/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white flex items-center py-1 px-2 newspaper-nav-item"
                      role="menuitem"
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {category.title.toLowerCase() === 'news' && (
                        <AlertTriangle size={14} className="mr-1 text-vpn-red" aria-hidden="true" />
                      )}
                      <span>{getDisplayTitle(category.title)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile navigation and menu button */}
        <div className="md:hidden flex justify-between items-center py-2 px-3 border-t border-gray-200 dark:border-gray-700">
          <button
            className="text-vpn-gray dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            {sortedCategories && sortedCategories.slice(0, 3).map((category) => {
              // Determine if this is the current category based on URL
              const isCurrent = typeof window !== 'undefined' ? 
                window.location.pathname === `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}` : false;
              
              // Special case for Justice Watch category
              if (category.title.toLowerCase() === 'justice watch') {
                return (
                  <Link
                    key={category._id}
                    href="/justice-watch"
                    className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-xs font-medium"
                    aria-current={typeof window !== 'undefined' ? window.location.pathname === '/justice-watch' ? "page" : undefined : undefined}
                  >
                    Watch
                  </Link>
                );
              }
              
              // Regular categories
              return (
                <Link
                  key={category._id}
                  href={`/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-xs font-medium"
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {getMobileDisplayTitle(category.title)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile menu dropdown - additional options */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <ul 
              className="grid grid-cols-2 gap-2 p-4"
              role="menu"
            >
              {sortedCategories && sortedCategories.map((category) => {
                // Determine if this is the current category based on URL
                const isCurrent = typeof window !== 'undefined' ? 
                  window.location.pathname === `/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}` : false;
                
                // Special case for Justice Watch category
                if (category.title.toLowerCase() === 'justice watch') {
                  return (
                    <li 
                      key={category._id}
                      role="none"
                    >
                      <Link
                        href="/justice-watch"
                        className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                        role="menuitem"
                        aria-current={typeof window !== 'undefined' ? window.location.pathname === '/justice-watch' ? "page" : undefined : undefined}
                      >
                        <div className="flex items-center">
                          <Video size={14} className="mr-1" aria-hidden="true" />
                          <span>Watch</span>
                        </div>
                      </Link>
                    </li>
                  );
                }
                
                // Regular categories
                return (
                  <li 
                    key={category._id}
                    role="none"
                  >
                    <Link
                      href={`/category/${category.slug?.current ?? category.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block py-2 px-3 text-vpn-gray dark:text-gray-300 hover:text-vpn-blue dark:hover:text-white text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                      role="menuitem"
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {getDisplayTitle(category.title)}
                    </Link>
                  </li>
                );
              })}
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
            </ul>
          </div>
        )}

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
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
        )}
      </div>
    </header>
  );
}
