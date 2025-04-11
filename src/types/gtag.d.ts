// Type definitions for Google Analytics gtag.js
interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: any[];
}
