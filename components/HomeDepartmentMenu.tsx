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
  const categoryIconMap: Record<string, any> = {
    "Computadores": Cpu,
    "Notebooks": Laptop,
    "Notebooks Seminovos": Laptop,
    "Monitores": Monitor,
    "Smartphones": Smartphone,
    "Hardware": HardDrive,
    "Periféricos": Keyboard,
    "Games": Gamepad2,
    "Impressão": Printer,
    "🔑  Licenças": KeyRound,
    "Licenças": KeyRound,
    "Segurança": Shield,
    "Acessórios": Cable
  };

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
    <aside className="w-full space-y-5">
      {/* 1. Menu Principal de Departamentos */}
      <div className="rounded-[1.75rem] border border-slate-700/80 bg-[#111827] p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center gap-2.5 pb-3.5 mb-3 border-b border-slate-700/80">
          <div className="p-1.5 rounded-lg bg-[#E60012] text-white">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Departamentos
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              Navegue pelo catálogo
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {priorityCategories.map((item) => {
            const Icon = item.icon;
            const slug = item.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={item.name}
                href={`/categoria/${encodeURIComponent(slug)}`}
                className="group flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:bg-[#1a233a] hover:text-white border border-transparent hover:border-[#E60012]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-[#E60012] group-hover:scale-110 transition-transform" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E60012]/20 text-[#E60012] border border-[#E60012]/30">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-[#E60012] transform translate-x-0 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. Oferta do Dia em Destaque */}
      {dealOfTheDay && (
        <div className="rounded-[1.75rem] border border-[#E60012]/50 bg-gradient-to-b from-[#E60012]/15 via-[#111827] to-[#111827] p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/80">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#E60012] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-white">Oferta do Dia</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E60012] text-white">
              Imperdível
            </span>
          </div>

          <Link href={getProductHref(dealOfTheDay)} className="group block">
            <div className="relative aspect-square w-full max-w-[150px] mx-auto my-2 rounded-xl overflow-hidden bg-white p-2 border border-slate-200">
              <Image
                src={dealOfTheDay.image || "/logo.png"}
                alt={dealOfTheDay.name}
                fill
                sizes="160px"
                className="object-contain p-1 group-hover:scale-105 transition-transform bg-white"
                unoptimized
              />
            </div>
            <h3 className="mt-3 text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-[#E60012] transition-colors leading-snug">
              {dealOfTheDay.name}
            </h3>
            <div className="mt-3 flex items-baseline justify-between border-t border-slate-800 pt-2.5">
              <span className="text-[11px] font-black uppercase text-[#E60012]">À vista no PIX</span>
              <span className="text-base font-black text-white">{dealOfTheDay.price}</span>
            </div>
          </Link>
        </div>
      )}

      {/* 3. Retirada no Balcão Cambuí */}
      <div className="rounded-[1.75rem] border border-slate-700/80 bg-[#111827] p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={18} className="text-[#E60012]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Loja Física Cambuí</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {SITE_CONFIG.address}. Compre online e retire no balcão em 30 min com suporte técnico.
        </p>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Gostaria de consultar estoque e retirar no balcão da Balão da Informática no Cambuí.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E60012] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <MessageCircle size={15} />
          <span>Chamar no WhatsApp</span>
        </a>
      </div>
    </aside>
  );
}
