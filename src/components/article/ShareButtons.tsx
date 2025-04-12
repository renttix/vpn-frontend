"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Share2, 
  Printer,
  Check,
  Copy,
  Link as LinkIcon
} from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  // Share handlers for each platform
  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  
  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-sm font-semibold font-body text-vpn-gray-light dark:text-gray-400">
          Share this article:
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* X (Twitter) */}
          <Button 
            onClick={handleTwitterShare} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors"
            aria-label="Share on X (Twitter)"
            title="Share on X (Twitter)"
          >
            <Twitter size={18} />
          </Button>
          
          {/* Facebook */}
          <Button 
            onClick={handleFacebookShare} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-[#4267B2]/10 hover:text-[#4267B2] transition-colors"
            aria-label="Share on Facebook"
            title="Share on Facebook"
          >
            <Facebook size={18} />
          </Button>
          
          {/* LinkedIn */}
          <Button 
            onClick={handleLinkedInShare} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-[#0077B5]/10 hover:text-[#0077B5] transition-colors"
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
          >
            <Linkedin size={18} />
          </Button>
          
          {/* WhatsApp */}
          <Button 
            onClick={handleWhatsAppShare} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors"
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
          >
            <Share2 size={18} />
          </Button>
          
          {/* Copy Link */}
          <Button 
            onClick={handleCopyLink} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Copy link to clipboard"
            title="Copy link to clipboard"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
          </Button>
          
          {/* Print */}
          <Button 
            onClick={handlePrint} 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Print article"
            title="Print article"
          >
            <Printer size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
