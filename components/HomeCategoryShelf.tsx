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
    <section className="w-full rounded-[2.5rem] border border-slate-700/80 bg-[#111827] p-6 sm:p-8 lg:p-10 shadow-2xl relative">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-8 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full bg-[#E60012] text-white text-[11px] font-black uppercase tracking-widest shadow-md">
              Destaque
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              Pronta Entrega no Cambuí
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            {title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/categoria/${encodeURIComponent(categorySlug)}`}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-[#E60012] border border-slate-700 hover:border-[#E60012] text-xs sm:text-sm font-black text-white transition-all shadow-md group"
        >
          <span>Ver todos os modelos</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Spacious 3-Column Grid with Rich Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {products.slice(0, 3).map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#161f32] border border-slate-700/80 hover:border-[#E60012] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E60012]/15 text-[11px] font-black uppercase text-[#E60012] border border-[#E60012]/30">
                    <Flame size={12} className="fill-[#E60012]" />
                    Mais Vendido
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Estoque Campinas
                  </span>
                </div>

                {/* Product Image: Clean white container allowing seamless natural blending */}
                <Link href={href} className="relative aspect-square w-full max-w-[220px] mx-auto my-4 block overflow-hidden rounded-2xl bg-white p-4 border border-slate-200 shadow-inner">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300 bg-white"
                    unoptimized
                  />
                </Link>

                {/* Title in Crisp Pure White */}
                <Link href={href} className="block mt-4">
                  <h3 className="text-base font-extrabold text-white line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors min-h-[48px]">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & High Conversion Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-700/80 space-y-4">
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
                  <div className="text-xs font-bold text-slate-400 mt-1">
                    ou até 10x sem juros no cartão
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href={href}
                    className="w-full py-4 px-5 rounded-2xl bg-[#E60012] hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all active:scale-95"
                  >
                    <ShoppingCart size={17} />
                    <span>Comprar Agora</span>
                  </Link>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de comprar / consultar estoque de: ${product.name} (${product.price})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 text-center text-xs sm:text-sm font-bold text-slate-300 hover:text-[#E60012] flex items-center justify-center gap-1.5 transition-colors"
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
