"use client";

import { useEffect } from 'react';

export default function AdSenseScript() {
  useEffect(() => {
    // Only run on the client side
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1954539584146592';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
