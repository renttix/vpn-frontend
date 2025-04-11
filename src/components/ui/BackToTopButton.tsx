"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined') return;
    
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-vpn-blue text-white rounded-full shadow-lg hover:bg-opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-vpn-blue focus:outline-none transition-all duration-300 z-40"
          aria-label="Back to top"
          title="Scroll back to top of the page"
        >
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
