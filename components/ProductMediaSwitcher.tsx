"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ProductVideo from "./ProductVideo";

interface ProductMediaSwitcherProps {
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
  productName: string;
  variant?: "square" | "hero";
  autoRotateMs?: number;
  showBorder?: boolean;
  showBackground?: boolean;
  padding?: boolean;
  rounded?: boolean;
}

export default function ProductMediaSwitcher({
  imageUrl,
  imageUrls = [],
  videoUrl,
  productName,
  variant = "square",
  autoRotateMs = 0,
  showBorder = true,
  showBackground = true,
  padding = true,
  rounded = true,
}: ProductMediaSwitcherProps) {
  const hasVideo = !!videoUrl;
  const [showVideo, setShowVideo] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userSelected, setUserSelected] = useState(false);

  // Combine primary image with extra images, filter duplicates
  const allImages = useMemo(() => Array.from(new Set([imageUrl, ...imageUrls])).filter(Boolean), [imageUrl, imageUrls]);
  const selectedImage = allImages[activeIndex] || imageUrl;

  useEffect(() => {
    setActiveIndex(0);
    setUserSelected(false);
    setShowVideo(false);
  }, [allImages.join("|")]);

  useEffect(() => {
    if (!autoRotateMs) return;
    if (showVideo) return;
    if (userSelected) return;
    if (allImages.length <= 1) return;
    const t = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % allImages.length);
    }, autoRotateMs);
    return () => window.clearInterval(t);
  }, [autoRotateMs, showVideo, userSelected, allImages.length]);

  if (!hasVideo && allImages.length <= 1) {
    const baseBox =
      variant === "hero"
        ? "relative w-full h-[960px] sm:h-[1320px] flex items-center justify-center"
        : "relative aspect-square flex items-center justify-center";
    const borderBox = showBorder ? "border border-gray-100" : "";
    return (
      <div
        className={`${baseBox} ${showBackground ? "bg-white" : "bg-transparent"} ${rounded ? "rounded-lg" : ""} ${borderBox} ${padding ? "p-4" : ""}`}
      >
        <Image
          src={imageUrl}
          alt={productName}
          fill
          className="object-contain product-main-image"
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        {showVideo ? (
          <ProductVideo videoUrl={videoUrl as string} productName={productName} />
        ) : (
          <div
            className={`${
              variant === "hero"
                ? "relative w-full h-[960px] sm:h-[1320px] flex items-center justify-center"
                : "relative aspect-square flex items-center justify-center"
            } ${showBackground ? "bg-white" : "bg-transparent"} ${rounded ? "rounded-lg" : ""} ${showBorder ? "border border-gray-100" : ""} ${
              padding ? "p-4" : ""
            }`}
          >
            <Image
              src={selectedImage}
              alt={productName}
              fill
              className="object-contain product-main-image"
              priority
              unoptimized
            />
          </div>
        )}

        {hasVideo && (
          <button
            type="button"
            onClick={() => setShowVideo((prev) => !prev)}
            className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-xs px-3 py-1.5 hover:bg-black/80 transition-colors"
          >
            <ChevronRight size={14} />
            <span>{showVideo ? "Ver foto" : "Ver vídeo"}</span>
          </button>
        )}
      </div>

      {allImages.length > 1 && !showVideo && (
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setUserSelected(true);
              }}
              className={`relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden transition-all ${
                selectedImage === img
                  ? showBorder
                    ? "border border-[#E60012] ring-1 ring-[#E60012]"
                    : "ring-2 ring-[#E60012]"
                  : showBorder
                    ? "border border-gray-200 opacity-70 hover:opacity-100"
                    : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - view ${idx + 1}`}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

