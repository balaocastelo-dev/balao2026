"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MessageCircle, MapPin, PhoneCall, Sparkles, Clock, ShieldCheck, 
  Cpu, Laptop, Smartphone, Wrench, ArrowRight, Zap, Flame, CheckCircle2, ChevronRight
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import Carousel from "@/components/Carousel";
import type { CarouselImage } from "@/lib/utils";

interface HomeHeroInteractiveProps {
  carouselImages: CarouselImage[];
}

export default function HomeHeroInteractive({ carouselImages }: HomeHeroInteractiveProps) {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string>("pc-gamer");
  const [selectedBudget, setSelectedBudget] = useState<string>("medio");

  const goals = [
    { id: "pc-gamer", label: "PC Gamer", icon: Cpu, route: "/pcgamer", query: "PC Gamer" },
    { id: "notebooks", label: "Notebooks", icon: Laptop, route: "/categoria/notebooks-seminovos", query: "Notebook" },
    { id: "iphones", label: "iPhones", icon: Smartphone, route: "/categoria/iphones-seminovos", query: "iPhone" },
    { id: "assistencia", label: "Assistência", icon: Wrench, route: "/manutencao", query: "Assistência" }
  ];

  const budgets: Record<string, { label: string; maxPrice?: number; filterUrl: string }> = {
    "economico": { label: "Até R$ 2.500", filterUrl: "/promocao" },
    "medio": { label: "R$ 2.500 a R$ 5.000", filterUrl: "/pcgamer" },
    "alto": { label: "R$ 5.000+", filterUrl: "/premium" }
  };

  const handleQuickFinder = () => {
    const goal = goals.find(g => g.id === selectedGoal);
    if (selectedGoal === "assistencia") {
      router.push("/manutencao");
    } else if (goal) {
      router.push(goal.route);
    }
  };

  const openWhatsAppHelp = () => {
    const goal = goals.find(g => g.id === selectedGoal)?.label || "um produto";
    const budget = budgets[selectedBudget]?.label || "sob medida";
    const text = `Olá! Estou procurando ${goal} na faixa de ${budget} no site da Balão da Informática. Podem me ajudar com as melhores opções?`;
    window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* 1. Live Ticker / Store Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)]/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--home-text)]">
              Loja Física Cambuí Aberta
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-[var(--home-muted)]">•</span>
          <span className="hidden sm:inline text-xs font-semibold text-[var(--home-muted)]">
            Retirada no balcão em até 30 min
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[var(--home-accent)] flex items-center gap-1 font-black">
            <Flame size={14} className="animate-pulse" />
            Ofertas Atualizadas Hoje
          </span>
          <span className="text-[var(--home-muted)]">•</span>
          <span className="text-[var(--home-soft)] flex items-center gap-1">
            <Clock size={13} />
            Resposta Whats &lt; 3 min
          </span>
        </div>
      </div>

      {/* 2. Main Hero Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
        {/* Main Banner / Carousel Column */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--home-border)] bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#1e1b2e] p-4 sm:p-6 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--home-accent)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-red-900/30">
                    <Sparkles size={13} />
                    Balão da Informática
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[var(--home-soft)] text-[11px] font-bold">
                    Campinas & Região
                  </span>
                </div>

                <Link
                  href="/promocao"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Flame size={14} />
                  Ver Liquidação da Semana
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Carousel or Headline */}
              {carouselImages.length > 0 ? (
                <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10">
                  <Carousel images={carouselImages} />
                </div>
              ) : (
                <div className="py-8 text-center">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Monte, compre e faça upgrade com quem entende.
                  </h1>
                  <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-[var(--home-muted)]">
                    PCs Gamer montados, notebooks seminovos com garantia, peças e assistência no Cambuí.
                  </p>
                </div>
              )}

              {/* 3. Interactive Quick Finder Bar */}
              <div className="pt-2">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[var(--home-accent)] mb-2.5 flex items-center gap-1.5">
                    <Zap size={14} />
                    Encontre Rápido o que você precisa:
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {goals.map((g) => {
                      const Icon = g.icon;
                      const active = selectedGoal === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setSelectedGoal(g.id)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black transition-all ${
                            active
                              ? "bg-[var(--home-accent)] text-white border-red-500 shadow-md shadow-red-900/40"
                              : "bg-white/5 border-white/10 text-[var(--home-soft)] hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-[var(--home-muted)]">
                      <span className="font-bold text-[var(--home-text)]">Faixa:</span>
                      <div className="flex gap-1.5">
                        {Object.entries(budgets).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedBudget(key)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                              selectedBudget === key
                                ? "bg-white/20 border-white/30 text-white"
                                : "bg-white/5 border-white/5 text-[var(--home-muted)] hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleQuickFinder}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-colors shadow"
                      >
                        <span>Explorar Catálogo</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={openWhatsAppHelp}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-colors shadow"
                      >
                        <MessageCircle size={14} />
                        <span>Falar no Whats</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Concierge & Direct Action Sidebar */}
        <aside className="space-y-4 flex flex-col">
          {/* WhatsApp Direct Help Box */}
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-b from-emerald-950/40 via-[var(--home-card-bg)] to-[var(--home-card-bg)] p-5 md:p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                <MessageCircle size={14} />
                Consultoria Balcão & WhatsApp
              </div>

              <h2 className="mt-4 text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Dúvida na peça ou configuração?
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-[var(--home-muted)] leading-relaxed">
                Nossa equipe técnica analisa sua necessidade na hora, confirma estoque e calcula frete ou retirada imediata.
              </p>

              <div className="mt-4 space-y-2 text-xs font-semibold text-[var(--home-soft)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Orçamento de montagem sem compromisso</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Confirmação de compatibilidade técnica</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Negociação no PIX direto com vendedor</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Estou no site da Balão da Informática e quero ajuda para escolher meu produto / tirar dúvidas de estoque.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm shadow-lg shadow-green-900/30 transition-all hover:scale-[1.02]"
              >
                <MessageCircle size={18} />
                <span>Iniciar Atendimento WhatsApp</span>
              </a>

              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[var(--home-border)] bg-white/5 hover:bg-white/10 text-[var(--home-text)] font-black text-xs transition-colors"
              >
                <MapPin size={15} className="text-red-400" />
                <span>Ver Loja no Google Maps</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
