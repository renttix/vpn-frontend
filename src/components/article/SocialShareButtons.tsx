"use client";

import React from "react";
import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

export default function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4 mr-2" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-4 w-4 mr-2" />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-4 w-4 mr-2" />,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
    // Basic share using Web Share API if available, otherwise maybe copy link?
    // For simplicity, let's just add the main platforms for now.
  ];

  // Fallback for navigator.share
  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        console.log("Article shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      // Maybe copy link to clipboard? Or just show the main links.
      alert("Sharing not supported on this browser, please use the platform links.");
    }
  };


  return (
    <div className="flex items-center space-x-2 mt-6 mb-8 border-t border-b border-border py-4">
      <span className="text-sm font-medium mr-2 text-muted-foreground">Share:</span>
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="sm"
          asChild // Use Button styling on the anchor tag
        >
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            className="flex items-center"
          >
            {link.icon}
            {link.name}
          </a>
        </Button>
      ))}
       <Button
          variant="outline"
          size="sm"
          onClick={handleGenericShare}
          aria-label="Share"
          className="flex items-center"
        >
          <Share2 className="h-4 w-4 mr-2" />
          More
        </Button>
    </div>
  );
}