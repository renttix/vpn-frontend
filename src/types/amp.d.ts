// Type definitions for AMP HTML components
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-img': React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement> & {
        layout?: 'responsive' | 'fill' | 'fixed' | 'fixed-height' | 'flex-item' | 'container' | 'nodisplay' | 'intrinsic';
        heights?: string;
        class?: string;
      }, HTMLImageElement>;
      
      'amp-social-share': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type: string;
        width: string | number;
        height: string | number;
        'data-param-url'?: string;
        'data-param-text'?: string;
      }, HTMLElement>;
      
      'amp-video': React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement> & {
        layout?: string;
        poster?: string;
        autoplay?: boolean;
        controls?: boolean;
      }, HTMLVideoElement>;
      
      'amp-analytics': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        'data-credentials'?: string;
      }, HTMLElement>;
      
      'amp-ad': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type: string;
        width: string | number;
        height: string | number;
        layout?: string;
        'data-slot'?: string;
      }, HTMLElement>;
      
      'amp-iframe': React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement> & {
        layout?: string;
        sandbox?: string;
        frameborder?: string;
        'resizable'?: boolean;
        'allowfullscreen'?: boolean;
      }, HTMLIFrameElement>;
    }
  }
}
