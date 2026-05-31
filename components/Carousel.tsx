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
    <div 
      className="relative w-full h-44 md:h-64 lg:h-80 overflow-hidden rounded-[28px] shadow-lg group border border-white/10"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="min-w-full relative h-full bg-transparent">
             <Image
                src={image.image_url}
                alt={image.title || "Banner"}
                fill
                className="w-full h-full"
                style={{ objectFit: "cover" }}
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                unoptimized
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
             {/* Title removed as requested */}
          </div>
        ))}
      </div>

      {/* Navigation Buttons (visible on hover) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur border border-white/10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
