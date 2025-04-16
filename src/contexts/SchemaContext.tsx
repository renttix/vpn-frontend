'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { getBaseUrl } from '@/lib/urlUtils';

// Define the shape of the schema context
interface SchemaContextType {
  // Site information
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  siteLogo: string;
  siteLanguage: string;
  
  // Organization information
  organizationName: string;
  organizationLogo: string;
  organizationSameAs: string[];
  
  // Publisher information
  publisherName: string;
  publisherLogo: string;
  
  // Social media profiles
  socialProfiles: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Contact information
  contactEmail: string;
  contactPhone?: string;
  
  // Location information
  location?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  
  // Copyright information
  copyrightYear: number;
  copyrightHolder: string;
  
  // Helper functions
  getCanonicalUrl: (path: string) => string;
  getImageUrl: (path: string) => string;
}

// Create the context with default values
const SchemaContext = createContext<SchemaContextType>({
  // Site information
  siteName: 'VPN News',
  siteUrl: getBaseUrl(),
  siteDescription: 'Latest news and updates from VPN News',
  siteLogo: `${getBaseUrl()}/logo.png`,
  siteLanguage: 'en-US',
  
  // Organization information
  organizationName: 'Video Production News',
  organizationLogo: `${getBaseUrl()}/logo.png`,
  organizationSameAs: [
    'https://twitter.com/vpnnews',
    'https://facebook.com/vpnnews',
    'https://linkedin.com/company/vpnnews'
  ],
  
  // Publisher information
  publisherName: 'Video Production News',
  publisherLogo: `${getBaseUrl()}/logo.png`,
  
  // Social media profiles
  socialProfiles: {
    twitter: 'https://twitter.com/vpnnews',
    facebook: 'https://facebook.com/vpnnews',
    linkedin: 'https://linkedin.com/company/vpnnews'
  },
  
  // Contact information
  contactEmail: 'contact@vpnnews.co.uk',
  
  // Copyright information
  copyrightYear: new Date().getFullYear(),
  copyrightHolder: 'Video Production News',
  
  // Helper functions
  getCanonicalUrl: (path: string) => `${getBaseUrl()}/${path.replace(/^\//, '')}`,
  getImageUrl: (path: string) => {
    if (path.startsWith('http')) return path;
    return `${getBaseUrl()}/${path.replace(/^\//, '')}`;
  }
});

// Provider component
interface SchemaProviderProps {
  children: ReactNode;
  config?: Partial<SchemaContextType>;
}

export function SchemaProvider({ children, config = {} }: SchemaProviderProps) {
  // Merge default values with provided config
  const contextValue = {
    ...useContext(SchemaContext),
    ...config
  };
  
  return (
    <SchemaContext.Provider value={contextValue}>
      {children}
    </SchemaContext.Provider>
  );
}

// Hook to use the schema context
export function useSchema() {
  const context = useContext(SchemaContext);
  
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  
  return context;
}

// Export the context for direct usage
export { SchemaContext };

// Export a higher-order component for class components
export function withSchema<P>(Component: React.ComponentType<P & { schema: SchemaContextType }>) {
  return function WithSchemaComponent(props: P) {
    return (
      <SchemaContext.Consumer>
        {(schema) => <Component {...props} schema={schema} />}
      </SchemaContext.Consumer>
    );
  };
}
