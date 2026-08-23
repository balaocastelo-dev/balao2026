"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Cpu, Laptop, Monitor, Smartphone, HardDrive, Keyboard, Gamepad2, 
  Printer, KeyRound, Shield, Cable, Flame, ChevronRight, Zap, MessageCircle, MapPin
} from "lucide-react";
import { Category, Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeDepartmentMenuProps {
  categories: Category[];
  dealOfTheDay?: Product | null;
}

export default function HomeDepartmentMenu({ categories, dealOfTheDay }: HomeDepartmentMenuProps) {
  const priorityCategories = [
    { name: "Computadores", label: "PC Gamer & Desktops", icon: Cpu, badge: "Destaque" },
    { name: "Notebooks", label: "Notebooks & MacBooks", icon: Laptop, badge: "Ofertas" },
    { name: "Monitores", label: "Monitores 144Hz & 240Hz", icon: Monitor, badge: "Gamer" },
    { name: "Smartphones", label: "Smartphones & 5G", icon: Smartphone, badge: "Novos" },
    { name: "Hardware", label: "Hardware & Peças", icon: HardDrive, badge: "RTX & Ryzen" },
    { name: "Periféricos", label: "Periféricos & Setup", icon: Keyboard, badge: "RGB" },
    { name: "Games", label: "Consoles & Games", icon: Gamepad2, badge: "PS5/Xbox" },
    { name: "Segurança", label: "Segurança & Redes", icon: Shield, badge: "Wi-Fi 6" },
    { name: "Acessórios", label: "Cabos & Conectividade", icon: Cable, badge: "" }
  ];

  return (
    <aside className="w-full space-y-6">
      {/* 1. Menu Principal de Departamentos */}
      <div className="rounded-[2rem] border border-slate-700/80 bg-[#111827] p-5 sm:p-6 lg:p-7 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-700/80">
          <div className="p-2 rounded-xl bg-[#E60012] text-white shadow-md">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              Departamentos
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              Navegue pelo catálogo completo
            </span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {priorityCategories.map((item) => {
            const Icon = item.icon;
            const slug = item.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={item.name}
                href={`/categoria/${encodeURIComponent(slug)}`}
                className="group flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold text-slate-200 hover:bg-[#1a233a] hover:text-white border border-transparent hover:border-[#E60012]/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon size={20} className="text-[#E60012] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#E60012]/20 text-[#E60012] border border-[#E60012]/30">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 text-[#E60012] transform translate-x-0 transition-all shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. Oferta do Dia em Destaque */}
      {dealOfTheDay && (
        <div className="rounded-[2rem] border border-[#E60012]/50 bg-gradient-to-b from-[#E60012]/15 via-[#111827] to-[#111827] p-5 sm:p-6 lg:p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <Flame size={20} className="text-[#E60012] animate-pulse" />
              <span className="text-sm font-black uppercase tracking-wider text-white">Oferta do Dia</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#E60012] text-white shadow">
              Imperdível
            </span>
          </div>

          <Link href={getProductHref(dealOfTheDay)} className="group block">
            <div className="relative aspect-square w-full max-w-[180px] mx-auto my-3 rounded-2xl overflow-hidden bg-white p-3 border border-slate-200 shadow-inner">
              <Image
                src={dealOfTheDay.image || "/logo.png"}
                alt={dealOfTheDay.name}
                fill
                sizes="200px"
                className="object-contain p-1 group-hover:scale-105 transition-transform bg-white"
                unoptimized
              />
            </div>
            <h3 className="mt-3.5 text-sm font-bold text-white line-clamp-2 group-hover:text-[#E60012] transition-colors leading-snug">
              {dealOfTheDay.name}
            </h3>
            <div className="mt-3.5 flex items-baseline justify-between border-t border-slate-800 pt-3">
              <span className="text-xs font-black uppercase text-[#E60012]">À vista no PIX</span>
              <span className="text-lg font-black text-white">{dealOfTheDay.price}</span>
            </div>
          </Link>
        </div>
      )}

      {/* 3. Retirada no Balcão Cambuí */}
      <div className="rounded-[2rem] border border-slate-700/80 bg-[#111827] p-5 sm:p-6 lg:p-7 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-2.5">
          <MapPin size={20} className="text-[#E60012]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Loja Física Cambuí</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {SITE_CONFIG.address}. Compre online e retire no balcão em 30 min com suporte técnico de prontidão.
        </p>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Gostaria de consultar estoque e retirar no balcão da Balão da Informática no Cambuí.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <MessageCircle size={16} />
          <span>Chamar no WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
