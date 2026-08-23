"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle, ChevronRight, Flame, Star } from "lucide-react";
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
    <section className="w-full rounded-[2rem] border border-slate-700/80 bg-[#111827] p-5 sm:p-7 shadow-2xl relative">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E60012] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
              Destaque
            </span>
            <span className="text-xs font-bold text-slate-300">
              Pronta Entrega no Cambuí
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-1.5">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/categoria/${encodeURIComponent(categorySlug)}`}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#E60012] border border-slate-700 hover:border-[#E60012] text-xs font-black text-white transition-all shadow-sm group"
        >
          <span>Ver todos os modelos</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Spacious High-Contrast Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.slice(0, 4).map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#161f32] border border-slate-700/80 hover:border-[#E60012] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E60012]/15 text-[10px] font-black uppercase text-[#E60012] border border-[#E60012]/30">
                    <Flame size={11} className="fill-[#E60012]" />
                    Mais Vendido
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Estoque Campinas
                  </span>
                </div>

                {/* Product Image: Clean white container allowing seamless blending */}
                <Link href={href} className="relative aspect-square w-full max-w-[200px] mx-auto my-3 block overflow-hidden rounded-2xl bg-white p-3 border border-slate-200 shadow-inner">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 250px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300 bg-white"
                    unoptimized
                  />
                </Link>

                {/* Title in Crisp Pure White */}
                <Link href={href} className="block mt-3">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors min-h-[40px]">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & High Conversion Action Button */}
              <div className="mt-4 pt-3.5 border-t border-slate-700/80 space-y-3">
                <div>
                  {oldPrice && (
                    <div className="text-[11px] text-slate-400 line-through">
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
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    ou até 10x sem juros no cartão
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href={href}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-95"
                  >
                    <ShoppingCart size={16} />
                    <span>Comprar Agora</span>
                  </Link>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de comprar / consultar estoque de: ${product.name} (${product.price})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1 text-center text-xs font-bold text-slate-300 hover:text-[#E60012] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={14} className="text-[#E60012]" />
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
