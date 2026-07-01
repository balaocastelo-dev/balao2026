"use client";

import React from "react";
import { MapPin, Clock, Phone, MessageCircle, Star, ShieldCheck, Wrench, Package, Users } from "lucide-react";
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
    { label: "Balcão & Atendimento", desc: "Av. Anchieta, Cambuí", icon: Users, color: "from-blue-600 to-indigo-700" },
    { label: "Laboratório Técnico", desc: "Reparos e Upgrades de PC/Notebook", icon: Wrench, color: "from-red-600 to-rose-700" },
    { label: "Estoque & Peças", desc: "Hardware a Pronta Entrega", icon: Package, color: "from-green-600 to-emerald-700" },
  ];

  return (
    <section className="mt-12 space-y-8">
      
      {/* Upper Grid: Store Info & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Address, Maps, Working Hours */}
        <div className="lg:col-span-6 bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-950/30 px-3 py-1 rounded-full border border-red-900/30 w-fit">
              📍 Visite Nossa Loja Física
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight">
              Balão da Informática Castelo
            </h2>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              Traga seu equipamento para diagnóstico, retire seus produtos comprados pelo site ou monte sua máquina dos sonhos direto no nosso balcão.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#E60012] shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="block text-zinc-100 font-bold text-sm">Endereço</span>
                  <span className="text-zinc-400 text-xs">{SITE_CONFIG.address} • CEP {SITE_CONFIG.postalCode}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-[#E60012] shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="block text-zinc-100 font-bold text-sm">Horário de Funcionamento</span>
                  <span className="text-zinc-400 text-xs">{SITE_CONFIG.openingHoursDisplay}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-[#E60012] shrink-0 mt-0.5" size={20} />
                <div>
                  <span className="block text-zinc-100 font-bold text-sm">Contato Local</span>
                  <span className="text-zinc-400 text-xs">Telefone: {SITE_CONFIG.phone.display} • WhatsApp: {SITE_CONFIG.whatsapp.display}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={SITE_CONFIG.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-6 bg-[#E60012] hover:bg-red-700 text-white rounded-xl font-bold text-sm text-center shadow-lg shadow-red-950/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MapPin size={16} />
              Como Chegar (Google Maps)
            </a>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-6 bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white rounded-xl font-bold text-sm text-center active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-850"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
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
                className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shrink-0`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base group-hover:text-[#E60012] transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-zinc-400 text-xs mt-0.5">{item.desc}</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-800 font-black text-4xl select-none group-hover:text-[#E60012]/10 transition-colors pointer-events-none">
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Localized Testimonials Section */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl mt-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-950/30 px-3 py-1 rounded-full border border-green-900/30">
            ⭐ Avaliações no Google
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
            Quem Compra em Campinas Recomenda
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-colors"
            >
              <div>
                <div className="flex gap-1 text-amber-500 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <p className="text-zinc-300 text-xs italic leading-relaxed">
                  "{item.text}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[11px]">
                <span className="font-extrabold text-zinc-200">{item.name}</span>
                <span className="text-zinc-400 font-semibold">{item.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
