"use client";

import React, { useRef } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  categoryId?: string;
  isDark?: boolean;
}

export default function ProductCarousel({ title, products, categoryId, isDark = false }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-[var(--home-text)]' : 'text-gray-800'}`}>{title}</h2>
        <div className="flex gap-2">
            {categoryId && (
                <Link 
                    href={`/?category=${encodeURIComponent(categoryId)}`}
                    className="mr-4 flex items-center text-sm font-medium text-[#E60012] hover:underline"
                >
                    Ver todos
                </Link>
            )}
          <button
            onClick={() => scroll("left")}
            className={`p-2 border rounded-full shadow-sm ${
              isDark 
                ? 'bg-[var(--home-card-bg)] border-[var(--home-border)] text-[var(--home-text)] hover:border-[var(--home-border-strong)]' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 border rounded-full shadow-sm ${
              isDark 
                ? 'bg-[var(--home-card-bg)] border-[var(--home-border)] text-[var(--home-text)] hover:border-[var(--home-border-strong)]' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="grid grid-rows-2 grid-flow-col auto-cols-[200px] md:auto-cols-[240px] gap-4 overflow-x-auto pb-4 px-4 lg:px-0 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start h-full">
            <ProductCard product={product} variant="grid" />
          </div>
        ))}
      </div>
    </div>
  );
}
