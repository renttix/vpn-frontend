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

  // Register service worker on mount
  useEffect(() => {
    const registerSW = async () => {
      const registration = await registerServiceWorker();
      setServiceWorkerRegistered(!!registration);
    };

    // Only run in browser environment
    if (typeof window !== 'undefined') {
      registerSW();
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
      <main id="main-content" className="flex-grow" tabIndex={-1}>{children}</main>
      <TipReferrer />
      <Footer />
      
      {/* Notification Banner */}
      <NotificationBanner />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}
