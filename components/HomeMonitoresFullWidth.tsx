"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Monitor, ShoppingCart, MessageCircle, ChevronRight, Flame } from "lucide-react";
import { Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeMonitoresFullWidthProps {
  products: Product[];
}

function formatOldPrice(price: string) {
  const value = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(value) || value <= 0) return null;
  return (value * 1.15).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HomeMonitoresFullWidth({ products }: HomeMonitoresFullWidthProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full rounded-[2rem] border border-slate-700/80 bg-[#111827] p-6 sm:p-8 shadow-2xl relative">
      {/* Header Full-Width */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#E60012] text-white text-[11px] font-black uppercase tracking-widest shadow-md">
              Vitrine Especial Full Size
            </span>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Monitor size={15} className="text-[#E60012]" />
              Painéis IPS, 144Hz, 165Hz, 240Hz & 4K
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            🖥️ Monitores Gamer & UltraWide
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Máxima fidelidade de cores, alta taxa de atualização e tempo de resposta de 1ms para jogos e produtividade profissional.
          </p>
        </div>

        <Link
          href="/categoria/monitores"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E60012] hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-red-950/40"
        >
          <span>Explorar Todos os Monitores</span>
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* Full Width Grid: 4 high-end monitors side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.slice(0, 4).map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#161f32] border border-slate-700/80 hover:border-[#E60012] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E60012]/15 text-[10px] font-black uppercase text-[#E60012] border border-[#E60012]/30">
                    <Flame size={11} className="fill-[#E60012]" />
                    Alta Performance
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Pronta Entrega
                  </span>
                </div>

                {/* Monitor Image Container on Clean White Box */}
                <Link href={href} className="relative aspect-[4/3] w-full max-w-[220px] mx-auto my-3 block overflow-hidden rounded-2xl bg-white p-3 border border-slate-200 shadow-inner">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300 bg-white"
                    unoptimized
                  />
                </Link>

                {/* Title in Crisp White */}
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
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de consultar / comprar o monitor: ${product.name} (${product.price})`)}`}
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
