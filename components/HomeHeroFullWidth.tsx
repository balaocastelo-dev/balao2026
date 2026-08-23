"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, Clock, 
  Cpu, Laptop, Monitor, Smartphone, HardDrive, Gamepad2, Flame
} from "lucide-react";
import Carousel from "@/components/Carousel";
import type { CarouselImage } from "@/lib/utils";

interface HomeHeroFullWidthProps {
  carouselImages: CarouselImage[];
}

export default function HomeHeroFullWidth({ carouselImages }: HomeHeroFullWidthProps) {
  const quickCategories = [
    { id: "computadores", label: "PC Gamer", icon: Cpu, href: "/pcgamer", badge: "Mais Procurado" },
    { id: "notebooks", label: "Notebooks", icon: Laptop, href: "/categoria/notebooks", badge: "Pronta Entrega" },
    { id: "monitores", label: "Monitores", icon: Monitor, href: "/categoria/monitores", badge: "144Hz & 240Hz" },
    { id: "smartphones", label: "Smartphones", icon: Smartphone, href: "/categoria/smartphones", badge: "Novos & 5G" },
    { id: "hardware", label: "Hardware", icon: HardDrive, href: "/categoria/hardware", badge: "RTX & Ryzen" },
    { id: "games", label: "Games", icon: Gamepad2, href: "/categoria/games", badge: "Consoles" }
  ];

  return (
    <section className="w-full relative overflow-hidden rounded-[2rem] border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-2xl p-4 sm:p-6 lg:p-8">
      <div className="relative z-10 space-y-6">
        {/* 1. Live Status & Trust Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60012] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E60012]"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Loja Física no Cambuí Aberta
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-[var(--home-muted)]">•</span>
            <span className="hidden sm:inline text-xs font-bold text-white">
              Retirada no balcão em até 30 min
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-[#E60012] flex items-center gap-1 font-black">
              <Flame size={14} className="animate-pulse" />
              10% de Desconto no PIX
            </span>
            <span className="text-[var(--home-muted)]">•</span>
            <span className="text-white flex items-center gap-1">
              <Clock size={13} />
              Resposta no WhatsApp &lt; 3 min
            </span>
          </div>
        </div>

        {/* 2. Full-Width Hero Carousel Banner */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40">
          {carouselImages.length > 0 ? (
            <Carousel images={carouselImages} />
          ) : (
            <div className="relative py-12 px-6 sm:py-16 sm:px-12 text-center flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/40 mb-4">
                <Sparkles size={14} />
                Balão da Informática Castelo
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
                A melhor experiência em <span className="text-[#E60012]">PC Gamer, Notebooks</span> e Hardware em Campinas.
              </h1>
              <p className="mt-4 text-sm sm:text-lg text-[var(--home-muted)] max-w-2xl leading-relaxed">
                Mais de 5.000 produtos com pronta entrega, até 10x sem juros no cartão ou desconto no PIX e retirada no balcão.
              </p>
            </div>
          )}
        </div>

        {/* 3. Interactive Quick Category Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {quickCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E60012] hover:shadow-lg hover:shadow-red-950/20"
              >
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white group-hover:text-[#E60012] group-hover:scale-110 transition-all">
                  <Icon size={22} />
                </div>
                <span className="mt-2 text-xs sm:text-sm font-black text-white group-hover:text-[#E60012] transition-colors">
                  {item.label}
                </span>
                <span className="text-[10px] font-bold text-[var(--home-muted)] group-hover:text-white transition-colors">
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
