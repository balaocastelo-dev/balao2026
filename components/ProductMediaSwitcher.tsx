"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import ProductVideo from "./ProductVideo";

interface ProductMediaSwitcherProps {
  imageUrl: string;
  imageUrls?: string[];
  videoUrl?: string;
  productName: string;
}

export default function ProductMediaSwitcher({
  imageUrl,
  imageUrls = [],
  videoUrl,
  productName,
}: ProductMediaSwitcherProps) {
  const hasVideo = !!videoUrl;
  const [showVideo, setShowVideo] = useState(false);
  const [selectedImage, setSelectedImage] = useState(imageUrl);

  // Combine primary image with extra images, filter duplicates
  const allImages = Array.from(new Set([imageUrl, ...imageUrls])).filter(Boolean);

  if (!hasVideo && allImages.length <= 1) {
    return (
      <div className="relative aspect-square bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
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
          <div className="relative aspect-square bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4">
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
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 flex-shrink-0 bg-white border rounded-md overflow-hidden transition-all ${
                selectedImage === img ? 'border-[#E60012] ring-1 ring-[#E60012]' : 'border-gray-200 opacity-70 hover:opacity-100'
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

