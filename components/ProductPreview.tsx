"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  slug: string;
  description?: string;
}

export default function ProductPreview() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handlePreview = (e: CustomEvent) => {
      const newProduct = e.detail;
      if (newProduct) {
        // Close existing if any, then open new one (simple replace)
        setProduct(newProduct);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("balao-preview-product" as any, handlePreview as any);
    return () => {
      window.removeEventListener("balao-preview-product" as any, handlePreview as any);
    };
  }, []);

  if (!product || !isVisible) return null;

  return (
    <div className="fixed bottom-[350px] right-[20px] z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Speech bubble tail */}
      <div className="absolute -bottom-2 right-10 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45 z-10"></div>
      
      <div className="relative h-48 bg-gray-50">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-gray-500 transition-colors z-10"
        >
          <X size={20} />
        </button>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain p-4 mix-blend-multiply"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px]">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-[#E60012]">
            {product.price}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
             onClick={() => {
                if ((window as any).balao_addToCart) {
                    (window as any).balao_addToCart(product);
                }
             }}
             className="flex items-center justify-center gap-2 bg-[#E60012] text-white py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
          >
            <ShoppingCart size={14} />
            Adicionar
          </button>
          
          <Link 
            href={`/product/${product.slug}`}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            onClick={() => setIsVisible(false)}
          >
            Ver Detalhes
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
