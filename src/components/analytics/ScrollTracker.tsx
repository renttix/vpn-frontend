"use client";

import { useEffect, useState } from "react";
import { event } from "@/lib/analytics";

interface ScrollTrackerProps {
  contentId: string;
  contentType?: string;
}

export default function ScrollTracker({ 
  contentId, 
  contentType = "article" 
}: ScrollTrackerProps) {
  const [scrollMarkers, setScrollMarkers] = useState({
    "25%": false,
    "50%": false,
    "75%": false,
    "100%": false
  });
  
  useEffect(() => {
    // Skip this effect during SSR
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      if (scrollPercent >= 25 && !scrollMarkers["25%"]) {
        event({ 
          action: "scroll_depth", 
          category: contentType, 
          label: `${contentId} - 25%` 
        });
        setScrollMarkers(prev => ({ ...prev, "25%": true }));
      }
      if (scrollPercent >= 50 && !scrollMarkers["50%"]) {
        event({ 
          action: "scroll_depth", 
          category: contentType, 
          label: `${contentId} - 50%` 
        });
        setScrollMarkers(prev => ({ ...prev, "50%": true }));
      }
      if (scrollPercent >= 75 && !scrollMarkers["75%"]) {
        event({ 
          action: "scroll_depth", 
          category: contentType, 
          label: `${contentId} - 75%` 
        });
        setScrollMarkers(prev => ({ ...prev, "75%": true }));
      }
      if (scrollPercent >= 99 && !scrollMarkers["100%"]) {
        event({ 
          action: "scroll_depth", 
          category: contentType, 
          label: `${contentId} - 100%` 
        });
        setScrollMarkers(prev => ({ ...prev, "100%": true }));
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentId, contentType, scrollMarkers]);
  
  // This component doesn't render anything
  return null;
}
