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
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4 px-4 lg:px-0 gap-4">
        <div>
          <div className={`text-xs font-extrabold uppercase tracking-[0.2em] ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Produtos</div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>{title}</h2>
        </div>
        <div className="flex gap-2">
            {categoryId && (
                <Link 
                    href={`/?category=${encodeURIComponent(categoryId)}`}
                    className={`hidden sm:flex text-sm font-extrabold mr-4 items-center gap-2 ${isDark ? 'text-white hover:text-white' : 'text-[#E60012] hover:underline'}`}
                >
                    Ver todos
                </Link>
            )}
          <button
            onClick={() => scroll("left")}
            className={`p-2.5 border rounded-full shadow-sm ${
              isDark 
                ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' 
                : 'bg-white border-black/10 text-gray-700 hover:bg-zinc-50'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2.5 border rounded-full shadow-sm ${
              isDark 
                ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' 
                : 'bg-white border-black/10 text-gray-700 hover:bg-zinc-50'
            }`}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="grid grid-rows-2 grid-flow-col auto-cols-[200px] md:auto-cols-[240px] gap-4 overflow-x-auto pb-5 px-4 lg:px-0 scrollbar-hide snap-x snap-mandatory"
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
