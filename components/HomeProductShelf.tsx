"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Star, MessageCircle, Zap } from "lucide-react";
import { getProductHref, type Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

type HomeProductShelfProps = {
  title: string;
  subtitle: string;
  products: Product[];
  categoryId?: string;
  bannerTitle: string;
  bannerText: string;
};

function formatOldPrice(price: string) {
  const value = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(value)) return null;
  return (value / 0.88).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HomeProductShelf({
  title,
  subtitle,
  products,
  categoryId,
  bannerTitle,
  bannerText,
}: HomeProductShelfProps) {
  if (!products.length) return null;

  return (
    <section className="home-panel rounded-[1.75rem] p-3.5 sm:p-5 md:rounded-[2rem] md:p-6 my-6 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-xl relative overflow-hidden">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 border-b border-white/5">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--home-accent)] flex items-center gap-1.5">
            <Zap size={14} />
            Destaques de {title}
          </div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--home-text)] sm:text-2xl">{title}</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[var(--home-muted)]">{subtitle}</p>
        </div>

        {categoryId ? (
          <Link
            href={`/categoria/${encodeURIComponent(categoryId.toLowerCase().replace(/\s+/g, "-"))}`}
            className="inline-flex items-center gap-1.5 text-xs font-black text-white hover:text-[var(--home-accent)] px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--home-accent)] transition-all"
          >
            <span>Ver tudo em {title}</span>
            <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => {
            const oldPrice = formatOldPrice(product.price);
            const href = getProductHref(product);

            return (
              <div
                key={product.id}
                className="home-card group flex h-full min-h-full flex-col justify-between rounded-2xl p-3.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-border-strong)] hover:shadow-xl"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--home-muted)]">
                      <Star size={10} className="fill-current text-[var(--home-accent)]" />
                      Pronta Entrega
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      CBU & Região
                    </span>
                  </div>

                  <Link href={href} className="relative mx-auto aspect-square w-full max-w-[160px] block my-2 overflow-hidden rounded-xl bg-white/[0.01]">
                    <Image
                      src={product.image || "/logo.png"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 220px"
                      className="object-contain p-2 transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </Link>

                  <Link href={href} className="block mt-2">
                    <h3 className="text-xs sm:text-sm font-bold leading-snug text-[var(--home-text)] line-clamp-3 group-hover:text-[var(--home-accent)] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 space-y-2.5">
                  <div className="flex flex-col justify-center">
                    {oldPrice ? <div className="text-[11px] text-[var(--home-muted)] line-through">{oldPrice}</div> : null}
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">No PIX</div>
                    <div className="text-xl font-black leading-none tracking-tight text-white sm:text-2xl mt-0.5">
                      {product.price.replace("R$", "R$ ").trim()}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--home-muted)]">ou até 10x no cartão</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[var(--home-accent)] hover:bg-red-700 text-xs font-black text-white transition shadow-md shadow-red-900/30"
                    >
                      <ShoppingCart size={13} />
                      <span>Comprar</span>
                    </Link>

                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Gostaria de consultar disponibilidade e fechar pedido de: ${product.name} (${product.price})`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white transition"
                    >
                      <MessageCircle size={13} />
                      <span>Whats</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="home-panel-strong flex flex-col justify-between rounded-2xl p-5 text-white shadow-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
          <div>
            <div className="inline-flex rounded-full bg-[var(--home-accent-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--home-accent)] border border-[var(--home-accent)]/20">
              Seleção Especial
            </div>
            <h3 className="mt-4 text-xl sm:text-2xl font-black leading-tight">{bannerTitle}</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--home-muted)]">{bannerText}</p>
          </div>

          <div className="mt-6 space-y-2.5">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 backdrop-blur">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Retirada & Envio</div>
              <div className="mt-0.5 text-xs font-bold text-slate-200">Pronta entrega em Campinas</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 backdrop-blur">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">Garantia Balão</div>
              <div className="mt-0.5 text-xs font-bold text-slate-200">Suporte humano balcão e WhatsApp</div>
            </div>
            <Link
              href="/fale-conosco"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-black text-white transition"
            >
              <span>Fale com um Especialista</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
