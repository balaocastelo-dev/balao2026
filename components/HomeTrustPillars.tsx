"use client";

import React from "react";
import { Zap, ShieldCheck, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";

export default function HomeTrustPillars() {
  const pillars = [
    {
      icon: Zap,
      title: "Retirada Express no Cambuí",
      desc: "Confirme no WhatsApp e retire seu produto no balcão em até 30 minutos.",
      badge: "Mais Rápido",
      actionText: "Ver Localização",
      href: SITE_CONFIG.mapsUrl,
      external: true,
      accentColor: "from-red-500/10 to-transparent",
      iconColor: "text-[#E60012]",
      badgeColor: "bg-red-500/20 text-white border-red-500/30"
    },
    {
      icon: ShieldCheck,
      title: "Garantia & Laboratório Próprio",
      desc: "Assistência técnica com bancada especializada para reparos, upgrades e manutenção.",
      badge: "Garantia Real",
      actionText: "Assistência Técnica",
      href: "/manutencao",
      external: false,
      accentColor: "from-white/5 to-transparent",
      iconColor: "text-white",
      badgeColor: "bg-white/10 text-white border-white/20"
    },
    {
      icon: CreditCard,
      title: "Até 10x sem juros ou Desconto PIX",
      desc: "Preço justo de distribuidor com economia real no PIX ou facilidade no cartão.",
      badge: "Melhor Condição",
      actionText: "Ver Promoções",
      href: "/promocao",
      external: false,
      accentColor: "from-red-500/10 to-transparent",
      iconColor: "text-[#E60012]",
      badgeColor: "bg-red-500/20 text-white border-red-500/30"
    },
    {
      icon: MessageCircle,
      title: "Atendimento Especialista",
      desc: "Fale com técnicos de verdade pelo WhatsApp para tirar dúvidas e fechar negócio.",
      badge: "Online Agora",
      actionText: "Chamar no Whats",
      href: `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Estou no site da Balão da Informática e gostaria de tirar uma dúvida.")}`,
      external: true,
      accentColor: "from-white/5 to-transparent",
      iconColor: "text-white",
      badgeColor: "bg-white/10 text-white border-white/20"
    }
  ];

  return (
    <section className="my-8 sm:my-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className={`group relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-slate-700/80 bg-gradient-to-b ${item.accentColor} bg-[#111827] shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E60012] hover:shadow-2xl`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-slate-700 ${item.iconColor}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight group-hover:text-[#E60012] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs sm:text-sm font-bold text-white group-hover:text-[#E60012] transition-colors">
                <span>{item.actionText}</span>
                <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );

          return item.external ? (
            <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer" className="h-full">
              {content}
            </a>
          ) : (
            <Link key={idx} href={item.href} className="h-full">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
