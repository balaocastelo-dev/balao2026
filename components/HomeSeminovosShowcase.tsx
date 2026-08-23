"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Smartphone, Laptop, ShieldCheck, BatteryCharging, CheckCircle2, ChevronRight, MessageCircle, Star, Sparkles } from "lucide-react";
import { Product, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";

interface HomeSeminovosShowcaseProps {
  iphoneProducts: Product[];
  notebookProducts: Product[];
}

export default function HomeSeminovosShowcase({ iphoneProducts, notebookProducts }: HomeSeminovosShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"iphones" | "notebooks">("iphones");

  const currentList = activeTab === "iphones" ? iphoneProducts : notebookProducts;
  const categoryLink = activeTab === "iphones" ? "/categoria/iphones-seminovos" : "/categoria/notebooks-seminovos";
  const categoryTitle = activeTab === "iphones" ? "iPhones Seminovos Grade A+" : "Notebooks & MacBooks Seminovos";

  return (
    <section className="my-8 rounded-[2rem] border border-[var(--home-border)] bg-[var(--home-panel-bg)] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      {/* Header & Tabs */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={13} />
              Seminovos com Garantia Balão
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
            Vitrine Especial de Seminovos Selecionados
          </h2>
          <p className="text-xs sm:text-sm text-[var(--home-muted)] mt-1">
            Equipamentos 100% revisados em 20 pontos de bancada, com saúde de bateria comprovada e garantia local.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("iphones")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "iphones"
                ? "bg-[var(--home-accent)] text-white shadow-lg shadow-red-900/40"
                : "text-[var(--home-muted)] hover:text-white"
            }`}
          >
            <Smartphone size={16} />
            <span>iPhones ({iphoneProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notebooks")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "notebooks"
                ? "bg-[var(--home-accent)] text-white shadow-lg shadow-red-900/40"
                : "text-[var(--home-muted)] hover:text-white"
            }`}
          >
            <Laptop size={16} />
            <span>Notebooks ({notebookProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Quality Guarantee Badges */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 py-2 px-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[var(--home-soft)] font-bold">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>Bateria 85% a 97%+</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-blue-400 shrink-0" />
          <span>Garantia de 90 dias</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-400 shrink-0" />
          <span>Revisão de 20 pontos</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>Retirada hoje no balcão</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {currentList.slice(0, 4).map((product) => {
          const href = getProductHref(product);
          const specs = product.specs && typeof product.specs === "object" ? (product.specs as Record<string, any>) : {};
          const battery = specs["Bateria"] || specs["bateria"] || "Excelente";
          const condition = specs["Condição"] || specs["condicao"] || "Grade A+";

          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl"
            >
              {/* Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  <BatteryCharging size={12} />
                  {battery}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[var(--home-muted)] text-[10px] font-bold">
                  {condition}
                </span>
              </div>

              {/* Product Image */}
              <Link href={href} className="relative aspect-square w-full max-w-[180px] mx-auto my-3 block overflow-hidden rounded-xl bg-white/[0.02]">
                <Image
                  src={product.image || "/logo.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              </Link>

              {/* Title & Price */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--home-accent)]">
                    {product.category || categoryTitle}
                  </span>
                  <Link href={href} className="block mt-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
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

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={href}
                      className="inline-flex items-center justify-center py-2 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Vi o seminovo ${product.name} (${product.price}) no site da Balão da Informática e quero consultar disponibilidade.`)}`}
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

      {/* Footer Link */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <span className="text-xs text-[var(--home-muted)] font-medium">
          Mais de 100 opções de seminovos inspecionados para estudo, trabalho ou games.
        </span>
        <Link
          href={categoryLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--home-accent)] hover:bg-red-700 text-white font-black text-xs transition-colors shadow-md shadow-red-900/30"
        >
          <span>Ver todos os {activeTab === "iphones" ? "iPhones" : "Notebooks"}</span>
          <ChevronRight size={15} />
        </Link>
      </div>
    </section>
  );
}
