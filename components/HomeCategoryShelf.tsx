"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle, Star, ChevronRight, Zap, Flame, ShieldCheck } from "lucide-react";
import { Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeCategoryShelfProps {
  title: string;
  subtitle: string;
  categorySlug: string;
  icon?: string;
  products: Product[];
  badgeColor?: string;
}

function formatOldPrice(price: string) {
  const value = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(value) || value <= 0) return null;
  return (value * 1.15).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HomeCategoryShelf({
  title,
  subtitle,
  categorySlug,
  products,
  badgeColor = "from-red-600 to-rose-600"
}: HomeCategoryShelfProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full rounded-[2rem] border border-[var(--home-border)] bg-[var(--home-panel-bg)] p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${badgeColor} text-white text-[10px] font-black uppercase tracking-widest shadow-sm`}>
              Destaques
            </span>
            <span className="text-xs font-bold text-emerald-400">
              Pronta Entrega no Cambuí
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--home-muted)] mt-0.5">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/categoria/${encodeURIComponent(categorySlug)}`}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--home-accent)] text-xs font-black text-white hover:text-[var(--home-accent)] transition-all"
        >
          <span>Ver todos os modelos</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-border-strong)] hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    Mais Vendido
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Estoque Campinas
                  </span>
                </div>

                {/* Product Image */}
                <Link href={href} className="relative aspect-square w-full max-w-[170px] mx-auto my-2 block overflow-hidden rounded-xl bg-white/[0.01]">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </Link>

                {/* Title */}
                <Link href={href} className="block mt-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[var(--home-accent)] transition-colors">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {/* Pricing & CTAs */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                <div>
                  {oldPrice && (
                    <div className="text-[11px] text-[var(--home-muted)] line-through">
                      De {oldPrice}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {product.price}
                    </span>
                    <span className="text-[10px] font-black uppercase text-emerald-400">
                      no PIX
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--home-muted)]">
                    ou até 10x sem juros no cartão
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={href}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[var(--home-accent)] hover:bg-red-700 text-white text-xs font-black transition-colors shadow-md shadow-red-900/30"
                  >
                    <ShoppingCart size={13} />
                    <span>Comprar</span>
                  </Link>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de comprar / tirar dúvidas sobre: ${product.name} (${product.price})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors shadow"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
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
