"use client";

import React from "react";
import { MapPin, Clock, Phone, MessageCircle, Star, Wrench, Package, Users } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function HomeLocalStoreInfo() {
  const testimonials = [
    {
      name: "Marcos S.",
      location: "Cambuí - Campinas",
      text: "Fui à loja física no Cambuí montar meu PC Gamer. O atendimento técnico é fantástico, me ajudaram a escolher as peças ideais e retirei no mesmo dia. Nota 10!",
      rating: 5,
    },
    {
      name: "Júlia R.",
      location: "Barão Geraldo - Campinas",
      text: "Melhor assistência de notebooks de Campinas. Meu aparelho não ligava; levei no laboratório deles de manhã e de tarde já estava pronto com formatação limpa.",
      rating: 5,
    },
    {
      name: "Felipe M.",
      location: "Sumaré - SP",
      text: "Comprei uma placa de vídeo RTX 4070 Super pelo WhatsApp deles. Moro em Sumaré e me entregaram via motoboy em menos de 2 horas. Agilidade sensacional!",
      rating: 5,
    },
  ];

  const photos = [
    { label: "Balcão & Atendimento", desc: "Av. Anchieta, Cambuí", icon: Users, color: "from-red-600 to-rose-700" },
    { label: "Laboratório Técnico", desc: "Reparos e Upgrades de PC/Notebook", icon: Wrench, color: "from-slate-700 to-slate-900" },
    { label: "Estoque & Peças", desc: "Hardware a Pronta Entrega", icon: Package, color: "from-red-700 to-red-950" },
  ];

  return (
    <section className="mt-12 space-y-8">
      
      {/* Upper Grid: Store Info & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Address, Maps, Working Hours */}
        <div className="home-panel lg:col-span-6 flex flex-col justify-between rounded-3xl p-6 shadow-xl sm:p-8">
          <div>
            <span className="w-fit rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E60012]">
              📍 Visite Nossa Loja Física
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Balão da Informática Castelo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--home-muted)]">
              Traga seu equipamento para diagnóstico, retire seus produtos comprados pelo site ou monte sua máquina dos sonhos direto no nosso balcão.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                <div>
                  <span className="block text-sm font-bold text-white">Endereço</span>
                  <span className="text-xs text-[var(--home-muted)]">{SITE_CONFIG.address} • CEP {SITE_CONFIG.postalCode}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                <div>
                  <span className="block text-sm font-bold text-white">Horário de Funcionamento</span>
                  <span className="text-xs text-[var(--home-muted)]">{SITE_CONFIG.openingHoursDisplay}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                <div>
                  <span className="block text-sm font-bold text-white">Contato Local</span>
                  <span className="text-xs text-[var(--home-muted)]">Telefone: {SITE_CONFIG.phone.display} • WhatsApp: {SITE_CONFIG.whatsapp.display}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={SITE_CONFIG.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E60012] px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-950/20 transition-all hover:bg-red-700 active:scale-95"
            >
              <MapPin size={16} />
              Como Chegar (Google Maps)
            </a>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-center text-sm font-bold text-white transition-all hover:border-[#E60012] active:scale-95"
            >
              <MessageCircle size={16} className="text-[#E60012]" />
              Falar com Vendedor
            </a>
          </div>
        </div>

        {/* Right: Real Shop Virtual Grid */}
        <div className="lg:col-span-6 grid grid-rows-3 gap-4">
          {photos.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="home-card group relative flex items-center gap-4 overflow-hidden rounded-2xl p-5"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white transition-colors group-hover:text-[#E60012]">
                    {item.label}
                  </h4>
                  <p className="mt-0.5 text-xs text-[var(--home-muted)]">{item.desc}</p>
                </div>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-4xl font-black text-white/5 transition-colors group-hover:text-red-500/10">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Localized Testimonials Section */}
      <div className="home-panel mt-6 rounded-3xl p-6 shadow-xl sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E60012]">
            ⭐ Avaliações no Google
          </span>
          <h3 className="mt-3 text-xl font-black text-white sm:text-2xl">
            Quem Compra em Campinas Recomenda
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div 
              key={idx} 
              className="home-card flex flex-col justify-between rounded-2xl p-5 transition-colors hover:border-[#E60012]"
            >
              <div>
                <div className="flex gap-1 text-[#E60012] mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-xs italic leading-relaxed text-[var(--home-soft)]">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--home-border)] pt-3 text-[11px]">
                <span className="font-extrabold text-white">{item.name}</span>
                <span className="font-semibold text-[var(--home-muted)]">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
