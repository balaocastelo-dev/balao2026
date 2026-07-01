"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { LayoutGrid, Grid2x2, List, ArrowUpDown, Filter, ChevronDown } from "lucide-react";

type ViewMode = "small" | "large" | "list";
type SortMode = "default" | "price-asc" | "price-desc";

export default function ProductList({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Sort
    if (sortMode !== "default") {
      result.sort((a, b) => {
        try {
            const getPrice = (p: Product) => {
                if (typeof p.price === 'number') return p.price;
                if (!p.price) return 0;
                // Remove "R$", dots (thousands) and replace comma with dot
                return parseFloat(p.price.toString().replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
            };
            
            const priceA = getPrice(a);
            const priceB = getPrice(b);
            return sortMode === "price-asc" ? priceA - priceB : priceB - priceA;
        } catch (e) {
            return 0;
        }
      });
    }

    return result;
  }, [products, sortMode]);

  const getGridClasses = () => {
    switch (viewMode) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    }
  };

  const [visibleCount, setVisibleCount] = useState(30);
  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const loadMore = () => { setVisibleCount((prev) => prev + 30); };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 lg:px-0">
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown size={16} /> Ordenar por:
            </span>
            <select 
                value={sortMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortMode(e.target.value as SortMode)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-md focus:ring-red-500 focus:border-red-500 block w-full p-2 outline-none cursor-pointer hover:border-zinc-700 transition-colors"
            >
                <option value="default">Relevância</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
            </select>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            <span className="text-sm text-zinc-400 font-medium mr-2 hidden sm:inline">Visualização:</span>
            
            <button
            onClick={() => setViewMode("small")}
            className={`p-2 rounded-md transition-all cursor-pointer ${
                viewMode === "small" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
            }`}
            title="Menores (Grade Compacta)"
            >
            <LayoutGrid size={20} />
            </button>

            <button
            onClick={() => setViewMode("large")}
            className={`p-2 rounded-md transition-all cursor-pointer ${
                viewMode === "large" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
            }`}
            title="Grandes (Grade Expandida)"
            >
            <Grid2x2 size={20} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-6 ${getGridClasses()}`}>
        {visibleProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            variant={viewMode === "list" ? "list" : "grid"}
          />
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredAndSortedProducts.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium rounded-full shadow-md hover:bg-zinc-850 hover:border-[#E60012] hover:text-white transition-all group cursor-pointer"
          >
            <span>Carregar mais produtos</span>
            <ChevronDown size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
}
