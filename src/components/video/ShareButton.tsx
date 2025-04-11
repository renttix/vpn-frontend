"use client"; // This marks the component as a Client Component

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  description: string;
  videoId: string;
}

export default function ShareButton({ title, description, videoId }: ShareButtonProps) {
  const handleShare = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: url
      }).catch(err => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center text-vpn-blue hover:underline"
      aria-label="Share video"
    >
      <Share2 size={16} className="mr-1" />
      <span>Share</span>
    </button>
  );
}
