"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const whatsapp =
  "https://wa.me/5519987510267?text=" +
  encodeURIComponent(
    "Olá! Vi a página do MacBook M5 por R$ 10.999 e quero confirmar disponibilidade e comprar em até 10x sem juros."
  );

const features = [
  "Chip Apple M5 com foco em desempenho e recursos de IA",
  "Design premium, leve e silencioso",
  "Integração total com iPhone, iCloud e ecossistema Apple",
  "Atendimento local em Campinas com suporte da loja",
];

const faqs = [
  ["O valor é realmente R$ 10.999?", "Sim. A oferta desta landing page é de R$ 10.999,00, sujeita à disponibilidade do estoque no momento do contato."],
  ["Posso parcelar sem juros?", "Sim. Você pode comprar em até 10x sem juros no cartão, conforme condições da oferta."],
  ["Como funciona a garantia?", "Você recebe 6 meses de garantia Apple e mais 6 meses adicionais da Balão da Informática, completando 1 ano de cobertura total."],
  ["Posso comprar falando direto no WhatsApp?", "Sim. O botão de compra abre uma conversa com a equipe da Balão da Informática no WhatsApp (19) 98751-0267."],
];

export default function MacBookM5Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.28], [0, 90]);
  const heroScale = useTransform(scrollYProgress, [0, 0.28], [1, 0.88]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.22], [0.85, 0.15]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06070a] text-white">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="https://www.balao.info" aria-label="Balão da Informática">
            <Image src="/logo.png" alt="Balão da Informática" width={170} height={64} className="h-11 w-auto object-contain" priority />
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-green-950/30 transition hover:scale-[1.03]">
            <MessageCircle className="h-4 w-4" /> Comprar no WhatsApp
          </a>
        </div>
      </div>

      <section className="relative flex min-h-[100svh] items-center pt-24">
        <motion.div style={{ opacity: glowOpacity }} className="pointer-events-none absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/25 blur-[130px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-red-400">
              <Sparkles className="h-4 w-4" /> Oferta MacBook M5 em Campinas
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              MacBook M5.<br />
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Potência Apple, preço especial.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
              Compre seu MacBook com chip M5 na Balão da Informática, em Campinas, com atendimento humano e compra direta pelo WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-5">
              <div>
                <div className="text-sm font-bold uppercase tracking-[.16em] text-zinc-500">Oferta</div>
                <div className="mt-1 text-5xl font-black tracking-tight">R$ 10.999</div>
                <div className="mt-1 text-lg font-bold text-zinc-300">ou 10x de R$ 1.099,90 sem juros</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-7 py-4 text-lg font-black text-white shadow-2xl shadow-green-950/40 transition hover:-translate-y-1 hover:scale-[1.02]">
                <MessageCircle className="h-6 w-6" /> Quero comprar agora
              </a>
              <a href="#garantia" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[.04] px-7 py-4 font-bold text-zinc-200 transition hover:bg-white/[.08]">
                Ver garantia <ChevronDown className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-zinc-400">
              <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-red-400" /> 10x sem juros</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-red-400" /> 1 ano de cobertura total</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-red-400" /> Campinas e região</span>
            </div>
          </motion.div>

          <motion.div style={{ y: heroY, scale: heroScale }} className="relative mx-auto w-full max-w-2xl">
            <div className="absolute inset-8 rounded-full bg-white/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[.08] to-white/[.02] p-3 shadow-2xl shadow-black/60">
              <Image src="/images/apple/subcategories/macbook-card.png" alt="MacBook Apple M5 disponível na Balão da Informática em Campinas" width={1200} height={900} className="aspect-[4/3] w-full rounded-[2rem] object-cover" priority />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025] py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-3">
          {[
            ["R$ 10.999", "preço da oferta"],
            ["10x sem juros", "parcelamento"],
            ["6 + 6 meses", "garantia Apple + loja"],
          ].map(([a,b]) => (
            <div key={a} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
              <div className="text-2xl font-black">{a}</div><div className="mt-1 text-sm text-zinc-500">{b}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-sm font-black uppercase tracking-[.2em] text-red-400">Por que M5</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Desempenho para trabalho, estudo, criação e IA.</h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">
              O chip M5 amplia o desempenho da linha Mac e foi projetado para acelerar tarefas modernas, inclusive fluxos de trabalho com inteligência artificial. A Apple posiciona a geração M5 como um salto importante em desempenho e eficiência.
            </p>
          </div>
          <div className="grid gap-4">
            {features.map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }} viewport={{ once: true }} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <div className="mt-0.5 rounded-full bg-red-500/15 p-2 text-red-400"><Check className="h-5 w-5" /></div>
                <div className="font-bold text-zinc-200">{item}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="garantia" className="relative overflow-hidden border-y border-white/10 bg-zinc-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,.15),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-5">
          <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-4xl text-center">
            <BadgeCheck className="mx-auto h-14 w-14 text-red-400" />
            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">1 ano de cobertura total.</h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
              São <strong className="text-white">6 meses de garantia Apple</strong> + <strong className="text-white">6 meses adicionais da Balão da Informática</strong>, completando 12 meses de cobertura.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[.04] p-7 text-left">
                <div className="text-sm font-black uppercase tracking-[.16em] text-zinc-500">Primeiros 6 meses</div>
                <div className="mt-2 text-3xl font-black">Garantia Apple</div>
              </div>
              <div className="rounded-3xl border border-red-500/30 bg-red-500/[.07] p-7 text-left">
                <div className="text-sm font-black uppercase tracking-[.16em] text-red-400">+ 6 meses</div>
                <div className="mt-2 text-3xl font-black">Garantia Balão</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="text-sm font-black uppercase tracking-[.2em] text-red-400">Compra local</div>
            <h2 className="mt-3 text-4xl font-black tracking-tight">MacBook M5 em Campinas, com atendimento de verdade.</h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">
              Se você procura MacBook M5 em Campinas, MacBook Apple no Cambuí ou uma loja de informática em Campinas para comprar com suporte local, fale diretamente com a Balão da Informática.
            </p>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-black text-black transition hover:scale-[1.03]">
              <MessageCircle className="h-5 w-5" /> Consultar disponibilidade
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [MapPin, "Campinas e região", "Atendimento local e contato rápido pelo WhatsApp."],
              [Zap, "Resposta comercial rápida", "Fale direto com a equipe para confirmar estoque e condições."],
              [CreditCard, "10x sem juros", "Parcele a oferta em até dez vezes no cartão."],
              [ShieldCheck, "1 ano de cobertura", "Garantia combinada Apple + Balão da Informática."],
            ].map(([Icon,title,desc]) => {
              const C = Icon as typeof MapPin;
              return <div key={title as string} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><C className="h-7 w-7 text-red-400" /><h3 className="mt-4 text-xl font-black">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-500">{desc as string}</p></div>
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black py-24">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-4xl font-black tracking-tight">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map(([q,a]) => <details key={q} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5"><summary className="cursor-pointer list-none font-black text-zinc-100">{q}</summary><p className="mt-3 leading-relaxed text-zinc-400">{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <motion.div initial={{ opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-600 to-red-950 p-8 text-center shadow-2xl shadow-red-950/40 sm:p-14">
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl">Seu MacBook M5 está a uma conversa de distância.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-red-100">Confirme o estoque, tire suas dúvidas e feche sua compra direto com a equipe da Balão da Informática.</p>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#25D366] px-8 py-4 text-lg font-black text-white shadow-xl transition hover:scale-[1.04]">
            <MessageCircle className="h-6 w-6" /> Falar no WhatsApp agora
          </a>
        </motion.div>
      </section>

      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:hidden">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-black text-white shadow-2xl shadow-black/50">
          <MessageCircle className="h-5 w-5" /> Comprar MacBook M5
        </a>
      </div>
    </main>
  );
}
