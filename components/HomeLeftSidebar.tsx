"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Cpu, Laptop, Monitor, Smartphone, HardDrive, Keyboard, Gamepad2, 
  ShieldCheck, Zap, Sparkles, Flame, ArrowRight, MessageCircle
} from "lucide-react";
import { Category, Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeLeftSidebarProps {
  categories: Category[];
  flashDeals: Product[];
}

export default function HomeLeftSidebar({ categories, flashDeals }: HomeLeftSidebarProps) {
  const categoryIcons: Record<string, any> = {
    "Computadores": Cpu,
    "Notebooks": Laptop,
    "Notebooks Seminovos": Laptop,
    "Monitores": Monitor,
    "Smartphones": Smartphone,
    "Hardware": HardDrive,
    "Periféricos": Keyboard,
    "Games": Gamepad2
  };

  return (
    <aside className="w-full space-y-4">
      {/* 1. Departamentos Principais */}
      <div className="rounded-[1.75rem] border border-[var(--home-border)] bg-[var(--home-panel-bg)] p-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
          <Zap size={18} className="text-[#E60012]" />
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Departamentos</h2>
        </div>

        <nav className="space-y-1">
          {categories.slice(0, 8).map((cat) => {
            const Icon = categoryIcons[cat.name] || Sparkles;
            const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={cat.id}
                href={`/categoria/${encodeURIComponent(slug)}`}
                className="group flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-[var(--home-soft)] hover:bg-white/5 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className="text-[var(--home-muted)] group-hover:text-[#E60012] transition-colors" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all text-[#E60012]" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. Promoção Especial / Oferta Relâmpago */}
      {flashDeals.length > 0 && (
        <div className="rounded-[1.75rem] border border-red-500/30 bg-gradient-to-b from-red-950/40 via-[var(--home-panel-bg)] to-[var(--home-panel-bg)] p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-[#E60012] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-white">Oferta Relâmpago</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E60012]/20 text-[#E60012] border border-[#E60012]/30">
              Hoje
            </span>
          </div>

          <div className="space-y-3">
            {flashDeals.slice(0, 2).map((product) => {
              const href = getProductHref(product);
              return (
                <Link
                  key={product.id}
                  href={href}
                  className="group block p-3 rounded-xl border border-white/5 bg-white text-slate-900 hover:border-[#E60012] transition-all shadow-sm"
                >
                  <div className="relative aspect-square w-full max-w-[120px] mx-auto my-1 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={product.image || "/logo.png"}
                      alt={product.name}
                      fill
                      sizes="120px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  </div>
                  <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-[#E60012] transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-black uppercase text-[#E60012]">À vista PIX</span>
                    <span className="text-sm font-black text-slate-950">{product.price}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Card de Suporte & WhatsApp Balcão */}
      <div className="rounded-[1.75rem] border border-white/10 bg-[var(--home-panel-bg)] p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} className="text-[#E60012]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Retirada no Cambuí</h3>
        </div>
        <p className="text-xs text-[var(--home-muted)] leading-relaxed">
          Peça pelo site e retire em até 30 minutos no balcão da loja física.
        </p>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Gostaria de consultar estoque e retirar no balcão da Balão da Informática no Cambuí.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow"
        >
          <MessageCircle size={14} />
          <span>Falar no WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
