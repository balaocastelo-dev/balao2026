"use client";

import { useRef } from "react";
import { Product, parsePriceToNumber } from "@/lib/utils";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { ShoppingCart, Zap } from "lucide-react";
import { animateAddToCart } from "@/lib/animations";
import SafeImage from "@/components/SafeImage";

export default function ProductCard({ product, variant = "grid" }: { product: Product, variant?: "grid" | "list" }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const imageRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    showToast("Adicionado ao carrinho");
    animateAddToCart(imageRef.current, product.image);
  };

  const pixPrice = parsePriceToNumber(product.price);
  const cardPrice = pixPrice > 0 ? pixPrice / 0.85 : 0;
  const installment12 = cardPrice > 0 ? cardPrice / 12 : 0;
  const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const badgeText = pixPrice > 0 ? "PIX -15%" : "DESTAQUE";

  if (variant === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-black/5 flex flex-col md:flex-row h-full group">
        <Link href={`/product/${product.id}`} className="flex-1 flex flex-col md:flex-row">
          <div ref={imageRef} className="relative w-full md:w-40 pt-[100%] md:pt-0 md:h-auto md:min-h-[9rem] bg-gradient-to-b from-zinc-50 to-white overflow-hidden shrink-0">
            <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
              {badgeText}
            </div>
            <SafeImage
              src={product.image}
              fallbackSrc="/logo.png"
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className="object-contain p-3 group-hover:scale-[1.06] transition-transform duration-300"
              priority={false}
              unoptimized
            />
          </div>
          <div className="p-3 flex-1 flex flex-col justify-center">
            <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">{product.category || "Hardware"}</div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm leading-snug group-hover:text-[#E60012] transition-colors" title={product.name}>
              {product.name}
            </h3>
              
            <div className="mt-1">
              {cardPrice > 0 && (
                <p className="text-[11px] text-gray-400 line-through">{formatBRL(cardPrice)}</p>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tight text-[#E60012]">{pixPrice > 0 ? formatBRL(pixPrice) : product.price}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Zap className="h-3.5 w-3.5" />
                  PIX
                </span>
              </div>
              {installment12 > 0 && (
                <p className="text-[11px] text-gray-600 mt-1">
                  ou 12x de <span className="font-bold text-gray-900">{formatBRL(installment12)}</span> sem juros
                </p>
              )}
            </div>
          </div>
        </Link>
        
        <div className="p-3 md:w-44 flex items-center justify-center border-t md:border-t-0 md:border-l border-black/5 bg-zinc-50 md:bg-transparent">
          <button 
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-[#E60012] hover:bg-[#cc0010] active:scale-[0.98] text-white font-extrabold py-2.5 px-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_14px_30px_rgba(230,0,18,0.22)]"
          >
              <ShoppingCart size={16} />
              Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-black/5 flex flex-col h-full group">
      <Link href={`/product/${product.id}`} className="flex-1">
        <div ref={imageRef} className="relative pt-[92%] bg-gradient-to-b from-zinc-50 to-white overflow-hidden">
          <div className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
            {badgeText}
          </div>
          <SafeImage
            src={product.image}
            fallbackSrc="/logo.png"
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-3 sm:p-5 group-hover:scale-[1.06] transition-transform duration-300"
            priority={false}
            unoptimized
          />
        </div>
        <div className="p-3 md:p-4">
          <div className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category || "Hardware"}</div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[40px] leading-snug text-sm sm:text-[15px] group-hover:text-[#E60012] transition-colors" title={product.name}>
            {product.name}
          </h3>
            
          <div className="mt-2 sm:mt-4">
            {cardPrice > 0 && (
              <p className="text-[10px] sm:text-xs text-gray-400 line-through">{formatBRL(cardPrice)}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <div className="text-[11px] sm:text-xs text-gray-600">à vista no PIX</div>
                <div className="text-xl sm:text-2xl font-black tracking-tight text-[#E60012]">
                  {pixPrice > 0 ? formatBRL(pixPrice) : product.price}
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <Zap className="h-3.5 w-3.5" />
                  PIX
                </div>
                {installment12 > 0 && (
                  <div className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-tight">
                    12x de <span className="font-extrabold text-gray-900">{formatBRL(installment12)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-3 md:p-4 pt-0 mt-auto">
        <button 
            onClick={handleAddToCart}
            className="w-full rounded-xl bg-[#E60012] hover:bg-[#cc0010] active:scale-[0.98] text-white font-extrabold py-3 px-3 md:px-4 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-[0_14px_30px_rgba(230,0,18,0.22)]"
        >
            <ShoppingCart size={18} />
            Comprar
        </button>
      </div>
    </div>
  );
}
