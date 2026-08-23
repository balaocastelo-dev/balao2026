"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { LayoutGrid, Grid2x2, ArrowUpDown, ChevronDown } from "lucide-react";

type ViewMode = "small" | "large" | "list";
type SortMode = "default" | "price-asc" | "price-desc";

export default function ProductList({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const filteredAndSortedProducts = useMemo(() => {
    const result = [...products];

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
        } catch {
            return 0;
        }
      });
    }

    return result;
  }, [products, sortMode]);

  const getGridClasses = () => {
    switch (viewMode) {
      case "small":
        return "grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
    }
  };

  const [visibleCount, setVisibleCount] = useState(30);
  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const loadMore = () => { setVisibleCount((prev) => prev + 30); };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col justify-between gap-4 px-1 sm:flex-row sm:items-center lg:px-0">
        
        {/* Sort Controls */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
            <span className="text-sm font-medium whitespace-nowrap flex items-center gap-1 text-[var(--site-muted)]">
                <ArrowUpDown size={16} /> Ordenar por:
            </span>
            <select 
                value={sortMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortMode(e.target.value as SortMode)}
                className="block w-full cursor-pointer rounded-md border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-2 text-sm text-[var(--site-text)] outline-none transition-colors hover:border-[var(--site-accent-soft)] focus:border-[#E60012] focus:ring-red-500"
            >
                <option value="default">Relevância</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
            </select>
        </div>

        {/* View Controls */}
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            
            <span className="mr-2 hidden text-sm font-medium text-[var(--site-muted)] sm:inline">VisualizaÃ§Ã£o:</span>
            
            <button
            onClick={() => setViewMode("small")}
            className={`p-2 rounded-md transition-all cursor-pointer ${
                viewMode === "small" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "border border-[var(--site-border)] bg-[var(--site-panel-soft)] text-[var(--site-muted)] hover:border-[var(--site-accent-soft)] hover:text-[var(--site-text)]"
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
                : "border border-[var(--site-border)] bg-[var(--site-panel-soft)] text-[var(--site-muted)] hover:border-[var(--site-accent-soft)] hover:text-[var(--site-text)]"
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
            className="group flex cursor-pointer items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-6 py-3 font-medium text-[var(--site-text)] shadow-md transition-all hover:border-[#E60012] hover:text-[var(--site-accent)]"
          >
            <span>Carregar mais produtos</span>
            <ChevronDown size={20} className="text-[var(--site-muted)] transition-colors group-hover:text-[var(--site-accent)]" />
          </button>
        </div>
      )}
    </div>
  );
}
