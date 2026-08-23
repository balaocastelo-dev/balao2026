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
    <section className="my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className={`group relative h-full flex flex-col justify-between p-4 md:p-5 rounded-2xl border border-white/10 bg-gradient-to-b ${item.accentColor} bg-[var(--home-panel-bg)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E60012] hover:shadow-lg hover:shadow-red-950/20`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${item.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-black text-white tracking-tight group-hover:text-[#E60012] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--home-muted)]">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-black text-[var(--home-soft)] group-hover:text-[#E60012] transition-colors">
                <span>{item.actionText}</span>
                <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
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
