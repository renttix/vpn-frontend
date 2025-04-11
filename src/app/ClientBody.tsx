"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useTheme } from "@/components/ThemeProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import NotificationBanner from "@/components/notification/NotificationBanner";
import CookieBanner from "@/components/cookies/CookieBanner";
import { CookieConsentProvider, useCookieConsent } from "@/contexts/CookieConsentContext";
import { pageview, initializeGA } from "@/lib/analytics";
import { sendToAnalytics } from "@/lib/vitals";

// Inner component that has access to the CookieConsent context
function ClientBodyInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consent } = useCookieConsent();
  
  // Report Web Vitals
  useReportWebVitals(sendToAnalytics);
  
  // Initialize Google Analytics and track page views
  useEffect(() => {
    // Initialize Google Analytics if consent is given
    initializeGA();
    
    // Track page views
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams, consent]);
  
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = `antialiased font-body ${theme === 'dark' ? 'dark' : ''}`;
  }, [theme]);

  return (
    <div className="antialiased font-body" suppressHydrationWarning>
      {children}
      <NotificationBanner />
      <CookieBanner />
    </div>
  );
}

// Main component that provides the necessary contexts
export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <CookieConsentProvider>
        <ClientBodyInner>{children}</ClientBodyInner>
      </CookieConsentProvider>
    </SessionProvider>
  );
}
