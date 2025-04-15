"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  _id: string;
  title: string;
}

interface CarouselItem {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Category[];
}

interface HeroCarouselProps {
  posts: CarouselItem[];
}

export default function HeroCarousel({ posts }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // If no posts are provided, don't render the carousel
  if (!posts || posts.length === 0) {
    return null;
  }

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, posts.length]);

  // Pause auto-play on hover or touch
  const handleInteractionStart = () => setIsAutoPlaying(false);
  const handleInteractionEnd = () => setIsAutoPlaying(true);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? posts.length - 1 : prevIndex - 1
    );
  }, [posts.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % posts.length
    );
  }, [posts.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    handleInteractionStart();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleInteractionEnd();
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentItem = posts[currentIndex];

  return (
    <div 
      className="relative w-full bg-vpn-blue text-white overflow-hidden"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto px-2 sm:px-4 py-0">
        <div className="relative aspect-[1.9/1] h-auto">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={currentItem.mainImage?.asset.url || "/images/placeholder-carousel.jpg"}
              alt={currentItem.title}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vpn-blue via-vpn-blue/70 to-transparent opacity-80"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full pb-6 sm:pb-10 px-2">
            <span className="inline-block bg-vpn-red text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 mb-2 sm:mb-3 uppercase font-bold w-fit">
              {currentItem.categories && currentItem.categories.length > 0 
                ? currentItem.categories[0].title 
                : "NEWS"}
            </span>
            <h2 className="font-headline font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl max-w-3xl mb-2 sm:mb-4">
              {currentItem.title}
            </h2>
            <Link 
              href={`/${currentItem.slug.current}`} 
              className="inline-block bg-white text-vpn-blue text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-4 sm:px-6 rounded hover:bg-opacity-90 transition w-fit"
            >
              Read Full Story
            </Link>
          </div>

          {/* Navigation Buttons - hidden on smallest screens */}
          <button 
            onClick={goToPrevious}
            className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-full p-1 sm:p-2 transition"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={goToNext}
            className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-full p-1 sm:p-2 transition"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
            {posts.map((_, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-4 sm:w-6" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
