"use client";

import React from "react";
import Image from "next/image";
// Remove import of AuthorType from "@/lib/authors"
import type { Author } from "@/types/sanity"; // Import the Sanity Author type
import { Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortableText } from "@portabletext/react"; // Import PortableText for bio

interface AuthorBioProps {
  author: Author; // Use the Sanity Author type
}

// Optional: Define simple PT components for bio if needed
const bioComponents = {
  block: {
    // Render paragraphs simply, adjust styling as needed
    normal: ({ children }: { children?: React.ReactNode }) => <p className="font-body mb-2 last:mb-0">{children}</p>, // Make children optional
  },
  marks: { // Ensure links in bio work
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => { // Make value and href optional to match type
      const href = value?.href;
      if (!href) {
        // Handle cases where link mark might not have an href (though unlikely for standard links)
        return <>{children}</>; // Render children without link if href is missing
      }
      const rel = !href.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !href.startsWith('/') ? '_blank' : undefined;
      return (
        <a href={href} rel={rel} target={target} className="font-body text-vpn-blue hover:underline">
          {children}
        </a>
      );
    },
  },
  // Add other list/block types if your bio uses them
}

export default function AuthorBio({ author }: AuthorBioProps) {
  // Check if author data exists
  if (!author) return null;

  return (
    <div className="mt-8 mb-8 pt-6 border-t border-border">
      <div className="flex items-start space-x-4">
        {/* Use author.image from Sanity */}
        {author.image?.asset?.url && (
          <div className="flex-shrink-0">
            <Image
              src={author.image.asset.url}
              alt={author.image.asset.alt || `Photo of ${author.name}`}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-lg font-headline font-semibold mb-1">{author.name}</h3>
          {/* Render bio using PortableText */}
          {author.bio ? (
             <div className="font-body text-sm text-muted-foreground mb-3 prose prose-sm dark:prose-invert max-w-none prose-p:my-1"> {/* Basic prose styling */}
               <PortableText value={author.bio} components={bioComponents} />
             </div>
          ) : (
            <p className="font-body text-sm text-muted-foreground mb-3 italic">Author bio not available.</p>
          )}

          {/* Social links - Add checks or remove if these fields don't exist in your Sanity schema */}
          {/* Example: If you add a 'twitterUrl' field of type 'url' to your Sanity author schema: */}
          {/* <div className="flex items-center space-x-3">
            {author.twitterUrl && (
              <Button variant="ghost" size="icon" asChild>
                <a href={author.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label={`${author.name}'s Twitter profile`} className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {/* Add similar checks for LinkedIn, Email etc. */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
