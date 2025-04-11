"use client";

import React from "react";
import SocialShareButtons from "@/components/article/SocialShareButtons";

interface SocialButtonsProps {
  title: string;
}

export default function SocialButtons({ title }: SocialButtonsProps) {
  const [currentUrl, setCurrentUrl] = React.useState("");
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  if (!currentUrl) return null;
  
  return <SocialShareButtons url={currentUrl} title={title} />;
}
