"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselImage } from "@/lib/utils";

export default function Carousel({ images }: { images: CarouselImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Touch state for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.targetTouches.length === 0) return;
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlay(false); // Pause autoplay on touch
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.targetTouches.length === 0) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
    
    setIsAutoPlay(true); // Resume autoplay
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prev: number) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!isAutoPlay || images.length <= 1) return;
    const interval = setInterval(nextSlide, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [isAutoPlay, images.length, nextSlide]);

  if (!images || images.length === 0) {
    return null; // Or a default banner
  }

  return (
    <div className="w-full">
      <div 
        className="relative group h-40 w-full overflow-hidden rounded-xl shadow-lg md:h-64 lg:h-80"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image) => (
            <div key={image.id} className="relative h-full min-w-full bg-transparent">
               <Image
                  src={image.image_url}
                  alt={image.title || "Banner"}
                  fill
                  className="h-full w-full"
                  style={{ objectFit: "fill" }}
                  priority={currentIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  unoptimized
               />
               {/* Title removed as requested */}
            </div>
          ))}
        </div>

        {/* Navigation Buttons (visible on hover) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prevSlide(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); nextSlide(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index ? "w-6 bg-[var(--home-accent)]" : "bg-[var(--home-border-strong)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
