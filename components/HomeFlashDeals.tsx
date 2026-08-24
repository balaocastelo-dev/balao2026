"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap, Timer, ShoppingCart, MessageCircle, ChevronRight, Star } from "lucide-react";
import { Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeFlashDealsProps {
  products: Product[];
}

export default function HomeFlashDeals({ products }: HomeFlashDealsProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 27, seconds: 43 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.slice(0, 4);
  if (!dealProducts.length) return null;

  return (
    <section className="my-6 rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-950/30 via-[var(--home-card-bg)] to-[var(--home-card-bg)] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--home-accent)] text-white shadow-lg shadow-red-900/40">
            <Zap size={22} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                Hoje em Campinas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Ofertas Relâmpago com Desconto Especial
            </h2>
          </div>
        </div>

        {/* Countdown timer widget */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-red-500/30 backdrop-blur-md">
          <Timer size={16} className="text-red-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-[var(--home-muted)]">Termina em:</span>
          <div className="flex items-center gap-1 font-mono text-sm font-black text-white">
            <span className="bg-white/10 px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}h</span>
            <span>:</span>
            <span className="bg-white/10 px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}m</span>
            <span>:</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-red-400">{String(timeLeft.seconds).padStart(2, "0")}s</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealProducts.map((product, idx) => {
          const progressPercent = 70 + (idx * 7) % 25;
          const href = getProductHref(product);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-950/20"
            >
              {/* Top badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-[10px] font-black uppercase tracking-wider">
                  🔥 -12% no PIX
                </span>
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Star size={10} className="fill-amber-400" />
                  Destaque
                </span>
              </div>

              {/* Product Image */}
              <Link href={href} className="relative aspect-square w-full max-w-[170px] mx-auto my-2 block overflow-hidden rounded-xl bg-white/[0.02]">
                <Image
                  src={product.image || "/logo.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </Link>

              {/* Title & Info */}
              <div className="mt-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--home-accent)]">
                    {product.category?.split("/").pop()?.trim() || "Informática"}
                  </span>
                  <Link href={href} className="block mt-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 space-y-2">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      À vista no PIX
                    </div>
                    <div className="text-xl font-black text-white tracking-tight">
                      {product.price}
                    </div>
                    <div className="text-[11px] text-[var(--home-muted)]">
                      ou até 10x no cartão
                    </div>
                  </div>

                  {/* Stock progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--home-muted)]">
                      <span>Reservados</span>
                      <span className="text-red-400 font-mono font-black">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-colors"
                    >
                      <ShoppingCart size={13} />
                      <span>Comprar</span>
                    </Link>
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Vi a oferta relâmpago de ${product.name} no site por ${product.price} e gostaria de reservar/comprar.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors"
                    >
                      <MessageCircle size={13} />
                      <span>Whats</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
