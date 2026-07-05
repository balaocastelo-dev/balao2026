"use client";

import { useRef } from "react";
import { Product } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { getProductHref } from "@/lib/utils";

export default function ProductCard({ product, variant = "grid" }: { product: Product, variant?: "grid" | "list" }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const productHref = getProductHref(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(productHref);
  };

  if (variant === "list") {
    return (
      <div className="site-surface-soft rounded-2xl shadow-lg hover:-translate-y-0.5 hover:border-[var(--site-accent-soft)] hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row h-full group">
        <Link href={productHref} className="flex-1 flex flex-col md:flex-row">
          <div
            ref={imageRef}
            className="relative w-full md:w-32 pt-[100%] md:pt-0 md:h-auto md:min-h-[8rem] overflow-hidden shrink-0 bg-[var(--site-panel-muted)]"
          >
             <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 150px"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                priority={false}
                unoptimized
             />
          </div>
          <div className="p-3 flex-1 flex flex-col justify-center">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--site-muted)]">{product.category || "Hardware"}</div>
              <h3
                className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-[var(--site-text)] transition-colors group-hover:text-[var(--site-accent)]"
                title={product.name}
              >
                  {product.name}
              </h3>
              
              <div className="mt-1">
                  <p className="text-[10px] text-[var(--site-muted)] line-through">
                      {(parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) / 0.85).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-[#E60012]">R$</span>
                      <span className="text-lg font-extrabold text-[#E60012]">
                          {product.price.replace("R$", "").trim()}
                      </span>
                  </div>
                  <p className="text-[10px] text-[var(--site-soft)]">
                      à vista no PIX
                  </p>
              </div>
          </div>
        </Link>
        
        <div className="p-3 md:w-40 flex items-center justify-center border-t md:border-t-0 md:border-l border-[var(--site-border)] bg-[var(--site-panel-muted)]/80 md:bg-transparent">
          <button 
              onClick={handleAddToCart}
              className="w-full bg-[#E60012] hover:bg-[#cc0010] active:scale-95 transform text-white font-bold py-2 px-3 rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/20"
          >
              <ShoppingCart size={16} />
              Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="site-surface-soft rounded-2xl shadow-lg hover:-translate-y-0.5 hover:border-[var(--site-accent-soft)] hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full group">
      <Link href={productHref} className="flex-1">
        <div ref={imageRef} className="relative pt-[100%] overflow-hidden bg-[var(--site-panel-muted)]">
             <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                priority={false}
                unoptimized
             />
        </div>
        <div className="p-3 md:p-4">
            <div className="mb-1 text-[10px] sm:text-xs uppercase tracking-wider text-[var(--site-muted)]">{product.category || "Hardware"}</div>
            <h3
              className="mb-2 h-10 line-clamp-2 text-sm sm:text-base font-semibold leading-5 text-[var(--site-text)] transition-colors group-hover:text-[var(--site-accent)]"
              title={product.name}
            >
                {product.name}
            </h3>
            
            <div className="mt-2 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-[var(--site-muted)] line-through">
                    {(parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) / 0.85).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm font-bold text-[#E60012]">R$</span>
                    <span className="text-lg sm:text-2xl font-extrabold text-[#E60012]">
                        {product.price.replace("R$", "").trim()}
                    </span>
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-[var(--site-soft)]">
                    à vista no PIX
                </p>
            </div>
        </div>
      </Link>
      
      <div className="p-3 md:p-4 pt-0 mt-auto">
        <button 
            onClick={handleAddToCart}
            className="w-full bg-[#E60012] hover:bg-[#cc0010] active:scale-95 transform text-white font-bold py-2 px-3 md:px-4 rounded transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-red-950/20"
        >
            <ShoppingCart size={18} />
            Comprar
        </button>
      </div>
    </div>
  );
}
