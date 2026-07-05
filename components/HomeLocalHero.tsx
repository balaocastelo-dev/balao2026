"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Cpu,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export default function HomeLocalHero() {
  const whatsappHref = buildWhatsAppUrl(
    "Olá! Vim pelo site da Balão da Informática. Quero comprar ou tirar dúvida sobre produto com pronta entrega em Campinas."
  );

  const quickLinks = [
    { title: "PC Gamer", subtitle: "Máquinas prontas e montagem", href: "/pcgamer", icon: Cpu },
    { title: "Notebooks", subtitle: "Novos, seminovos e upgrades", href: "/notebooks", icon: Laptop },
    { title: "Assistência", subtitle: "Diagnóstico e reparo local", href: "/manutencao", icon: Wrench },
    { title: "Monitores e peças", subtitle: "Estoque para retirada rápida", href: "/departamentos", icon: Monitor },
  ];

  const trustItems = [
    { title: "Loja física no Cambuí", text: SITE_CONFIG.addressShort || SITE_CONFIG.address, icon: MapPin },
    { title: "Retirada e entrega rápida", text: "Consulte disponibilidade para Campinas", icon: Truck },
    { title: "Atendimento humano", text: "Compra direto pelo WhatsApp", icon: MessageCircle },
    { title: "Garantia e suporte", text: "Equipe técnica especializada", icon: ShieldCheck },
  ];

  return (
    <section className="container mx-auto px-4 pt-5 lg:px-0">
      <div className="home-panel-strong relative overflow-hidden rounded-[2.4rem]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(230,0,18,0.12),transparent_40%),linear-gradient(135deg,transparent_0%,rgba(15,23,42,0.12)_100%)] lg:block" />
        <div className="relative grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:p-10">
          
          {/* Left Column: Local business information */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--home-border)] bg-[var(--home-accent-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
              <Clock size={15} />
              Atendimento local em Campinas
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-[var(--home-text)] sm:text-5xl lg:text-6xl">
              Informática em Campinas com pronta entrega e WhatsApp rápido.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--home-muted)] sm:text-lg">
              PCs Gamer, notebooks, peças, upgrades e assistência técnica com loja física no Cambuí. Confirme estoque, retire hoje ou peça entrega na região.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 items-center">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-black text-white shadow-lg shadow-green-950/25 transition hover:bg-[#128C7E] active:scale-[0.98] w-full sm:w-auto"
              >
                <MessageCircle size={22} />
                Comprar pelo WhatsApp
              </a>
              <Link
                href="/pcgamer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-4 text-base font-black text-[var(--home-text)] shadow-sm transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] active:scale-[0.98] sm:w-auto"
              >
                Ver PCs Gamer
                <ArrowRight size={19} />
              </Link>
              <Link
                href="/manutencao"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-4 text-base font-black text-[var(--home-text)] shadow-sm transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] active:scale-[0.98] sm:w-auto"
              >
                <Wrench size={19} />
                Assistência Técnica
              </Link>
              <a
                href={SITE_CONFIG.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-4 text-base font-black text-[var(--home-text)] shadow-sm transition hover:border-[var(--home-accent)] hover:text-[var(--home-accent)] active:scale-[0.98] sm:w-auto"
              >
                <MapPin size={19} />
                Como chegar
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="home-card rounded-2xl px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-black text-[var(--home-text)]">
                      <Icon size={17} className="text-[var(--home-accent)]" />
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs font-semibold leading-snug text-[var(--home-muted)]">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: High-converting Festa Julina promo PC hero banner */}
          <div className="lg:col-span-5">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.9rem] border border-[var(--home-border-strong)] bg-[var(--home-card-bg)] p-6 text-[var(--home-text)] shadow-2xl">
              
              {/* Glowing highlight light */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-950/45 px-2.5 py-1 rounded-md border border-yellow-900/30">
                    🔥 ARRAIÁ DE OFERTAS
                  </span>
                  <span className="rounded-md border border-[var(--home-border)] bg-[var(--home-accent-soft)] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--home-accent)]">
                    JULHO • VÁLIDO ATÉ 31/07
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[var(--home-text)] sm:text-2xl">
                    Super PC Gamer Completo
                  </h3>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--home-muted)]">
                    Gabinete Aquário + Led Azul (RTX 4090)
                  </p>
                </div>

                {/* Specs List */}
                <ul className="space-y-2 border-y border-[var(--home-border)] py-3 text-xs text-[var(--home-muted)]">
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[var(--home-accent)]">⚡</span>
                    <span>Processador Intel Core i9 13900</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[var(--home-accent)]">⚡</span>
                    <span>Placa de vídeo 24GB RTX 4090 PNY</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[var(--home-accent)]">⚡</span>
                    <span>32GB Memória RAM DDR5 (2x16GB)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-bold text-[var(--home-accent)]">⚡</span>
                    <span>SSD 2TB NVMe + Fonte 1000W</span>
                  </li>
                </ul>

                {/* Price tag */}
                <div className="text-left mt-2">
                  <span className="block text-xs text-[var(--home-muted)] line-through">De: R$ 34.999,00</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs text-[var(--home-muted)]">Por apenas:</span>
                    <span className="text-2xl font-black tracking-tight text-green-500 sm:text-3xl">R$ 28.329,90</span>
                  </div>
                  <span className="block text-[10px] font-semibold text-[var(--home-muted)]">ou em 12x sem juros no cartão!</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">Entrega</div>
                    <div className="mt-1 text-xs font-bold text-[var(--home-text)]">Sob consulta</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">Montagem</div>
                    <div className="mt-1 text-xs font-bold text-[var(--home-text)]">Pronta</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-3 text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--home-muted)]">Suporte</div>
                    <div className="mt-1 text-xs font-bold text-[var(--home-text)]">Especialista</div>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Vi o Super PC Gamer Completo (i9 + RTX 4090) por R$ 28.329,90 no site e quero garantir a minha máquina agora!"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-green-950/20 transition-all hover:scale-105 hover:bg-green-600 active:scale-[0.98]"
              >
                <MessageCircle size={21} />
                Comprar PC pelo WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.title}
              href={link.href}
              className="home-card group rounded-3xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)] hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)] transition group-hover:bg-[var(--home-accent)] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-[var(--home-text)]">{link.title}</div>
                  <div className="mt-1 text-xs font-semibold leading-snug text-[var(--home-muted)]">{link.subtitle}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
