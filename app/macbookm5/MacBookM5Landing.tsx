"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  Cpu,
  CreditCard,
  HardDrive,
  Laptop,
  MapPin,
  MemoryStick,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3GpxNlbPROTln8ZSPFxBWZvzwfh/hf_20261005_133718_b5c1ee94-9bd7-4b93-b5da-a2a11111af3a.mp4";

const whatsapp =
  "https://wa.me/5519987510267?text=" +
  encodeURIComponent(
    "Olá! Vi a página do MacBook Pro 2025 M5 / 16GB / SSD 512GB por R$ 10.999 e quero confirmar disponibilidade e comprar em até 10x sem juros."
  );

const specs = [
  {
    icon: Cpu,
    title: "Chip Apple M5",
    text: "Nova geração de desempenho Apple para produtividade, criação e recursos modernos de IA.",
  },
  {
    icon: MemoryStick,
    title: "16GB de memória",
    text: "Multitarefa fluida para trabalho profissional, estudo, criação e desenvolvimento.",
  },
  {
    icon: HardDrive,
    title: "SSD 512GB",
    text: "Armazenamento rápido para projetos, aplicativos, fotos, vídeos e arquivos.",
  },
  {
    icon: Laptop,
    title: "MacBook Pro 2025",
    text: "Construção premium, mobilidade e integração completa com o ecossistema Apple.",
  },
];

const benefits = [
  "Ideal para profissionais, estudantes, programadores e criadores de conteúdo.",
  "Excelente experiência para multitarefa, produtividade e aplicações modernas com IA.",
  "Integração com iPhone, iCloud, AirDrop e demais dispositivos Apple.",
  "Compra local em Campinas com atendimento direto da Balão da Informática.",
];

const faqs = [
  [
    "Qual é a configuração deste MacBook?",
    "MacBook Pro 2025 com chip Apple M5, 16GB de memória e SSD de 512GB.",
  ],
  [
    "O valor é realmente R$ 10.999?",
    "Sim. A oferta desta página é de R$ 10.999,00, sujeita à disponibilidade do estoque no momento do contato.",
  ],
  [
    "Posso parcelar sem juros?",
    "Sim. A oferta permite pagamento em até 10x de R$ 1.099,90 sem juros no cartão.",
  ],
  [
    "Como funciona a garantia?",
    "São 6 meses de garantia Apple e mais 6 meses adicionais da Balão da Informática, completando 1 ano de cobertura.",
  ],
];

export default function MacBookM5Landing() {
  const scrubRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress: scrubProgress } = useScroll({
    target: scrubRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: pageProgress } = useScroll();
  const glowOpacity = useTransform(pageProgress, [0, 0.2], [0.9, 0.18]);
  const headlineY = useTransform(scrubProgress, [0, 0.38], [0, -44]);
  const headlineOpacity = useTransform(scrubProgress, [0, 0.34, 0.58], [1, 1, 0]);
  const specOpacity = useTransform(scrubProgress, [0.38, 0.58, 0.9], [0, 1, 1]);
  const specY = useTransform(scrubProgress, [0.38, 0.65], [34, 0]);
  const filmScale = useTransform(scrubProgress, [0, 0.6, 1], [0.9, 1.04, 0.96]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const unsubscribe = scrubProgress.on("change", (progress) => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const safeProgress = Math.min(0.995, Math.max(0, progress));
      const targetTime = safeProgress * video.duration;
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    });

    return unsubscribe;
  }, [scrubProgress]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050608] text-white selection:bg-red-600 selection:text-white">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="https://www.balao.info" aria-label="Balão da Informática">
            <Image
              src="/logo.png"
              alt="Balão da Informática"
              width={170}
              height={64}
              className="h-11 w-auto object-contain"
              priority
            />
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-green-950/30 transition hover:-translate-y-0.5 hover:scale-[1.03]"
          >
            <MessageCircle className="h-4 w-4" />
            Comprar no WhatsApp
          </a>
        </div>
      </div>

      <section ref={scrubRef} className="relative h-[260vh]">
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-20">
          <motion.div
            style={{ opacity: glowOpacity }}
            className="pointer-events-none absolute left-1/2 top-[44%] h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/20 blur-[150px]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.08),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 lg:grid-cols-[.9fr_1.1fr]">
            <motion.div
              style={{ y: headlineY, opacity: headlineOpacity }}
              className="relative z-20"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-red-400 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                MacBook Pro M5 em Campinas
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-6xl xl:text-[5.3rem]">
                MacBook Pro
                <br />
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                  M5. Sem limites.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Modelo 2025 com <strong className="text-white">16GB</strong> de memória e{" "}
                <strong className="text-white">SSD 512GB</strong>. Performance Apple com compra local,
                suporte e atendimento direto em Campinas.
              </p>

              <div className="mt-7">
                <div className="text-xs font-black uppercase tracking-[.2em] text-zinc-500">
                  Oferta especial
                </div>
                <div className="mt-1 text-5xl font-black tracking-[-.04em] sm:text-6xl">
                  R$ 10.999
                </div>
                <div className="mt-1 text-lg font-bold text-zinc-300">
                  ou 10x de R$ 1.099,90 sem juros
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-7 py-4 text-lg font-black text-white shadow-2xl shadow-green-950/40 transition hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <MessageCircle className="h-6 w-6" />
                  Quero comprar agora
                </a>
                <a
                  href="#detalhes"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[.04] px-7 py-4 font-bold text-zinc-200 transition hover:bg-white/[.08]"
                >
                  Explorar
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.div style={{ scale: filmScale }} className="relative mx-auto w-full max-w-3xl">
              <div className="absolute inset-12 rounded-full bg-white/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-zinc-950 shadow-[0_50px_140px_rgba(0,0,0,.75)]">
                {!videoReady && (
                  <Image
                    src="/images/apple/subcategories/macbook-card.png"
                    alt="MacBook Pro 2025 M5 16GB 512GB"
                    width={1200}
                    height={675}
                    className="absolute inset-0 z-10 h-full w-full object-cover"
                    priority
                  />
                )}
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  poster="/images/apple/subcategories/macbook-card.png"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={() => setVideoReady(true)}
                  className="aspect-video w-full object-cover"
                  aria-label="MacBook Pro M5 em apresentação cinematográfica controlada pela rolagem"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/[.04]" />
                <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-[11px] font-black uppercase tracking-[.16em] text-zinc-300 backdrop-blur-xl">
                  Role para explorar
                </div>
              </div>

              <motion.div
                style={{ opacity: specOpacity, y: specY }}
                className="pointer-events-none absolute inset-x-4 -bottom-24 z-20 grid grid-cols-2 gap-2 sm:inset-x-10 sm:grid-cols-4"
              >
                {[
                  ["M5", "Chip Apple"],
                  ["16GB", "Memória"],
                  ["512GB", "SSD"],
                  ["2025", "MacBook Pro"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-center shadow-xl backdrop-blur-xl"
                  >
                    <div className="text-xl font-black">{value}</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-zinc-600 md:flex">
            <span className="h-8 w-px bg-gradient-to-b from-zinc-500 to-transparent" />
            Scroll controla o produto
          </div>
        </div>
      </section>

      <section id="detalhes" className="border-y border-white/10 bg-white/[.025] py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-3">
          {[
            ["R$ 10.999", "preço da oferta"],
            ["10x sem juros", "parcelamento"],
            ["6 + 6 meses", "garantia Apple + Balão"],
          ].map(([value, label]) => (
            <div
              key={value}
              className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center"
            >
              <div className="text-2xl font-black">{value}</div>
              <div className="mt-1 text-sm text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="text-sm font-black uppercase tracking-[.2em] text-red-400">
            Configuração
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">
            Pro por dentro. Pro por fora.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Uma configuração equilibrada para quem quer velocidade, mobilidade e experiência premium.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {specs.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 28, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, rotateX: 2, rotateY: index % 2 ? -2 : 2 }}
                style={{ transformPerspective: 1000 }}
                className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[.055] to-white/[.025] p-6 shadow-2xl shadow-black/20"
              >
                <div className="inline-flex rounded-2xl bg-red-500/10 p-3">
                  <Icon className="h-7 w-7 text-red-400" />
                </div>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 bg-zinc-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(220,38,38,.15),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <BrainCircuit className="h-10 w-10 text-red-400" />
            <div className="mt-5 text-sm font-black uppercase tracking-[.2em] text-red-400">
              Performance M5
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">
              Feito para uma rotina que exige mais.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">
              O MacBook Pro M5 combina desempenho, autonomia, construção premium e o ecossistema Apple
              para entregar uma experiência de trabalho e criação de alto nível.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {benefits.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-5"
              >
                <div className="mt-0.5 rounded-full bg-red-500/15 p-2 text-red-400">
                  <Check className="h-5 w-5" />
                </div>
                <div className="font-bold text-zinc-200">{item}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="garantia" className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <BadgeCheck className="mx-auto h-14 w-14 text-red-400" />
            <div className="mt-5 text-sm font-black uppercase tracking-[.2em] text-red-400">
              Proteção da compra
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-6xl">
              1 ano de cobertura total.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
              São <strong className="text-white">6 meses de garantia Apple</strong> +{" "}
              <strong className="text-white">6 meses adicionais da Balão da Informática</strong>,
              completando 12 meses de cobertura.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[.04] p-7 text-left">
                <div className="text-sm font-black uppercase tracking-[.16em] text-zinc-500">
                  Primeiros 6 meses
                </div>
                <div className="mt-2 text-3xl font-black">Garantia Apple</div>
              </div>
              <div className="rounded-3xl border border-red-500/30 bg-red-500/[.07] p-7 text-left">
                <div className="text-sm font-black uppercase tracking-[.16em] text-red-400">
                  + 6 meses
                </div>
                <div className="mt-2 text-3xl font-black">Garantia Balão</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="text-sm font-black uppercase tracking-[.2em] text-red-400">
              Campinas e região
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em]">
              MacBook Pro M5 com atendimento local.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">
              Procura MacBook Pro M5 em Campinas, MacBook 16GB 512GB ou uma loja Apple na região
              com atendimento humano? Fale diretamente com a Balão da Informática pelo WhatsApp.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-black text-black transition hover:scale-[1.03]"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar disponibilidade
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [MapPin, "Campinas e região", "Atendimento local e contato rápido pelo WhatsApp."],
              [Zap, "Resposta comercial rápida", "Confirme estoque, condição e fechamento diretamente com a equipe."],
              [CreditCard, "10x sem juros", "Parcele a oferta em até dez vezes no cartão."],
              [ShieldCheck, "1 ano de cobertura", "Garantia combinada Apple + Balão da Informática."],
            ].map(([Icon, title, description]) => {
              const CardIcon = Icon as typeof MapPin;
              return (
                <div
                  key={title as string}
                  className="rounded-3xl border border-white/10 bg-white/[.035] p-6"
                >
                  <CardIcon className="h-7 w-7 text-red-400" />
                  <h3 className="mt-4 text-xl font-black">{title as string}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {description as string}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#07080b] py-24">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-4xl font-black tracking-[-.04em]">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-white/10 bg-white/[.025] p-5"
              >
                <summary className="cursor-pointer list-none font-black text-zinc-100">
                  {question}
                </summary>
                <p className="mt-3 leading-relaxed text-zinc-400">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-red-600 to-red-950 p-8 text-center shadow-2xl shadow-red-950/40 sm:p-14"
        >
          <h2 className="text-4xl font-black tracking-[-.04em] sm:text-6xl">
            Seu MacBook Pro M5 está a uma conversa de distância.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-red-100">
            Confirme o estoque e feche sua compra diretamente com a equipe da Balão da Informática.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#25D366] px-8 py-4 text-lg font-black text-white shadow-xl transition hover:scale-[1.04]"
          >
            <MessageCircle className="h-6 w-6" />
            Falar no WhatsApp agora
          </a>
        </motion.div>
      </section>

      <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:hidden">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-black text-white shadow-2xl shadow-black/50"
        >
          <MessageCircle className="h-5 w-5" />
          Comprar MacBook Pro M5
        </a>
      </div>
    </main>
  );
}
