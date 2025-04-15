// Type definitions for Google Analytics gtag.js
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

interface GtagEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  non_interaction?: boolean;
  [key: string]: any;
}

interface GtagConfig {
  page_title?: string;
  page_path?: string;
  page_location?: string;
  send_page_view?: boolean;
  cookie_flags?: string;
  cookie_domain?: string;
  cookie_expires?: number;
  anonymize_ip?: boolean;
  custom_map?: Record<string, string>;
  [key: string]: any;
}

// Declare global gtag function
declare function gtag(
  command: 'config',
  targetId: string,
  config?: GtagConfig
): void;

declare function gtag(
  command: 'set',
  config: Record<string, any>
): void;

declare function gtag(
  command: 'event',
  action: string,
  params?: GtagEvent
): void;

declare function gtag(
  command: 'js',
  date: Date
): void;

declare function gtag(
  command: 'consent',
  action: 'default' | 'update',
  params: {
    ad_storage?: 'granted' | 'denied';
    analytics_storage?: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
    wait_for_update?: number;
  }
): void;

// Declare global dataLayer array
interface Window {
  dataLayer: any[];
}
