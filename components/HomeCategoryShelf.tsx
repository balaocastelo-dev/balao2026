"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle, ChevronRight, Flame } from "lucide-react";
import { Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeCategoryShelfProps {
  title: string;
  subtitle: string;
  categorySlug: string;
  products: Product[];
}

function formatOldPrice(price: string) {
  const value = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(value) || value <= 0) return null;
  return (value * 1.12).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HomeCategoryShelf({
  title,
  subtitle,
  categorySlug,
  products,
}: HomeCategoryShelfProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full rounded-[2rem] sm:rounded-[2.5rem] border border-slate-700/80 bg-[#111827] p-4 sm:p-7 lg:p-9 shadow-2xl relative">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 sm:mb-8 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-[#E60012] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-md">
              Destaque
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              Pronta Entrega no Cambuí
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/categoria/${encodeURIComponent(categorySlug)}`}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/5 hover:bg-[#E60012] border border-slate-700 hover:border-[#E60012] text-xs sm:text-sm font-black text-white transition-all shadow-md group"
        >
          <span>Ver todos os modelos</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Multi-screen Fluid Grid (Mobile 1 col, Tablet 2 cols, Desktop 3 cols, UltraWide/40" 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
        {products.slice(0, 4).map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-4 sm:p-6 rounded-3xl bg-[#161f32] border border-slate-700/80 hover:border-[#E60012] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#E60012]/15 text-[10px] sm:text-[11px] font-black uppercase text-[#E60012] border border-[#E60012]/30">
                    <Flame size={12} className="fill-[#E60012]" />
                    Mais Vendido
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">
                    Estoque Campinas
                  </span>
                </div>

                {/* Product Image: Clean white container allowing seamless natural blending */}
                <Link href={href} className="relative aspect-square w-full max-w-[240px] mx-auto my-3 sm:my-4 block overflow-hidden rounded-2xl bg-white p-3 sm:p-4 border border-slate-200 shadow-inner">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300 bg-white"
                    unoptimized
                  />
                </Link>

                {/* Title in Crisp Pure White */}
                <Link href={href} className="block mt-3 sm:mt-4">
                  <h3 className="text-sm sm:text-base font-extrabold text-white line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors min-h-[44px] sm:min-h-[48px]">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & High Conversion Action Button */}
              <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-700/80 space-y-3.5 sm:space-y-4">
                <div>
                  {oldPrice && (
                    <div className="text-xs text-slate-400 line-through mb-0.5">
                      De {oldPrice}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {product.price}
                    </span>
                    <span className="text-xs font-black uppercase text-[#E60012]">
                      no PIX
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5 sm:mt-1">
                    ou até 10x sem juros no cartão
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  <Link
                    href={href}
                    className="w-full py-3.5 sm:py-4 px-4 sm:px-5 rounded-2xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all active:scale-95"
                  >
                    <ShoppingCart size={17} />
                    <span>Comprar Agora</span>
                  </Link>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de comprar / consultar estoque de: ${product.name} (${product.price})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 text-center text-xs sm:text-sm font-bold text-slate-300 hover:text-[#E60012] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={15} className="text-[#E60012]" />
                    <span>Dúvidas? Falar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
