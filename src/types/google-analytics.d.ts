// Type definitions for Google Analytics gtag
interface Window {
  gtag: (
    command: 'config' | 'event' | 'set',
    targetId: string,
    config?: Record<string, any> | undefined
  ) => void;
  dataLayer: any[];
}
