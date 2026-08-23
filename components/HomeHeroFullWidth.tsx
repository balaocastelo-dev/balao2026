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
    <section className="w-full relative overflow-hidden rounded-[2.5rem] border border-slate-700/80 bg-[#111827] shadow-2xl p-6 sm:p-8 lg:p-10">
      <div className="relative z-10 space-y-8">
        {/* 1. Live Status & Trust Bar - Folgada e Espaçosa */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-3.5 rounded-2xl bg-[#161f32] border border-slate-700/80 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E60012] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E60012]"></span>
              </span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Loja Física no Cambuí Aberta
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-slate-500">•</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              Consulte disponibilidade imediata no WhatsApp
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold">
            <span className="text-[#E60012] flex items-center gap-1.5 font-black">
              <Flame size={16} className="animate-pulse" />
              10% de Desconto no PIX
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200 flex items-center gap-1.5 font-bold">
              <Clock size={15} className="text-[#E60012]" />
              Resposta no Whats &lt; 3 min
            </span>
          </div>
        </div>

        {/* 2. Full-Width Hero Carousel Banner */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-black/60">
          {carouselImages.length > 0 ? (
            <Carousel images={carouselImages} />
          ) : (
            <div className="relative py-16 px-8 sm:py-20 sm:px-16 text-center flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E60012] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-900/50 mb-6">
                <Sparkles size={16} />
                Balão da Informática Castelo
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-5xl leading-tight">
                A melhor experiência em <span className="text-[#E60012]">PC Gamer, Notebooks</span> e Hardware em Campinas.
              </h1>
              <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
                Mais de 5.000 produtos com pronta entrega, até 10x sem juros no cartão ou desconto no PIX e retirada no balcão.
              </p>
            </div>
          )}
        </div>

        {/* 3. Interactive Quick Category Navigation Strip - Folgado */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-slate-700/80 bg-[#161f32] hover:bg-[#1f2b45] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E60012] hover:shadow-xl shadow-md"
              >
                <div className="p-3 rounded-xl bg-white/5 border border-slate-700 text-white group-hover:text-[#E60012] group-hover:scale-110 transition-all">
                  <Icon size={24} />
                </div>
                <span className="mt-2.5 text-sm font-black text-white group-hover:text-[#E60012] transition-colors">
                  {item.label}
                </span>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors mt-0.5">
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
