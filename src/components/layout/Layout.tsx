"use client";

import type React from "react";
import Header from "./Header";
import Footer from "./Footer";
import NotificationBanner from "../notification/NotificationBanner";
import BackToTopButton from "../ui/BackToTopButton";
import TipReferrer from "../tip/TipReferrer";
import SiteNavigationJsonLd, { generateNavigationItems } from "../seo/SiteNavigationJsonLd";
import { useEffect, useState } from "react";
import { registerServiceWorker } from "@/lib/notification";
import { UserTracker } from "@/components/hubspot";
import { getUserEmail } from "@/lib/userIdentification";

// Define Category type (matching the one in page.tsx)
interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

// Update props to include categories
interface LayoutProps {
  children: React.ReactNode;
  categories: Category[];
}

export default function Layout({ children, categories }: LayoutProps) { // Destructure categories
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    const registerSW = async () => {
      const registration = await registerServiceWorker();
      setServiceWorkerRegistered(!!registration);
    };

    // Only run in browser environment
    if (typeof window !== 'undefined') {
      registerSW();
      
      // Detect mobile devices for content prioritization
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Initial check
      checkMobile();
      
      // Add resize listener
      window.addEventListener('resize', checkMobile);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }
  }, []);

  // Generate navigation items for structured data
  const navigationItems = generateNavigationItems(categories);

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      {/* Skip to content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-vpn-blue focus:text-white focus:rounded"
      >
        Skip to content
      </a>
      
      {/* Structured data for site navigation */}
      <SiteNavigationJsonLd items={navigationItems} />
      
      {/* Pass categories down to Header */}
      <Header categories={categories} />
      
      {/* Main content */}
      <main 
        id="main-content" 
        className="flex-grow" 
        tabIndex={-1}
      >
        {children}
      </main>
      
      <TipReferrer />
      
      <Footer />
      
      {/* Notification Banner */}
      <NotificationBanner />
      
      {/* Back to Top Button */}
      <BackToTopButton />
      
      {/* HubSpot User Tracker - Temporarily disabled due to client-side API key issues */}
      {/* Uncomment and fix API access before re-enabling
      {typeof window !== 'undefined' && getUserEmail() && (
        <UserTracker email={getUserEmail() || ''} />
      )}
      */}
    </div>
  );
}
