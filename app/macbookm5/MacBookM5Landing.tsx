"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronDown,
  Cpu,
  CreditCard,
  HardDrive,
  MapPin,
  MemoryStick,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3GpxNlbPROTln8ZSPFxBWZvzwfh/hf_20261005_133718_b5c1ee94-9bd7-4b93-b5da-a2a11111af3a.mp4";

const WHATSAPP =
  "https://wa.me/5519987510267?text=" +
  encodeURIComponent(
    "Olá! Vi a página do MacBook Pro 2025 M5 16GB / SSD 512GB por R$ 10.999 e quero confirmar disponibilidade."
  );

const specs = [
  {
    number: "01",
    label: "PROCESSADOR",
    value: "Apple M5",
    copy: "Desempenho de nova geração para produtividade, criação, código e recursos modernos de IA.",
    icon: Cpu,
  },
  {
    number: "02",
    label: "MEMÓRIA",
    value: "16GB",
    copy: "Memória para trabalhar com múltiplos apps, projetos grandes e fluxos profissionais com fluidez.",
    icon: MemoryStick,
  },
  {
    number: "03",
    label: "ARMAZENAMENTO",
    value: "512GB SSD",
    copy: "Velocidade para abrir aplicativos, editar arquivos e mover projetos sem perder ritmo.",
    icon: HardDrive,
  },
  {
    number: "04",
    label: "GARANTIA",
    value: "1 ano",
    copy: "6 meses Apple + 6 meses adicionais da Balão da Informática.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    q: "Qual é exatamente o modelo anunciado?",
    a: "MacBook Pro 2025 com chip Apple M5, 16GB de memória e SSD de 512GB.",
  },
  {
    q: "Qual é o valor?",
    a: "R$ 10.999,00, sujeito à disponibilidade do estoque no momento do atendimento.",
  },
  {
    q: "Dá para parcelar sem juros?",
    a: "Sim. A condição anunciada é em até 10x de R$ 1.099,90 sem juros no cartão.",
  },
  {
    q: "Como funciona a garantia?",
    a: "São 6 meses de garantia Apple e mais 6 meses adicionais da Balão da Informática, completando 12 meses.",
  },
];

function ScrubVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });

  const videoScale = useTransform(smoothProgress, [0, 0.5, 1], [0.82, 1, 0.92]);
  const videoRadius = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [40, 8, 8, 40]);
  const introOpacity = useTransform(smoothProgress, [0, 0.18, 0.34], [1, 1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.34], [0, -70]);
  const specOpacity = useTransform(smoothProgress, [0.28, 0.48, 0.78], [0, 1, 1]);
  const specY = useTransform(smoothProgress, [0.28, 0.55], [70, 0]);
  const footerOpacity = useTransform(smoothProgress, [0.72, 0.9], [0, 1]);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (p) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      targetTime.current = Math.min(video.duration * 0.995, Math.max(0, p * video.duration));
    });

    let raf = 0;
    const animate = () => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const delta = targetTime.current - video.currentTime;
        if (Math.abs(delta) > 0.018) {
          video.currentTime += delta * 0.16;
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [smoothProgress]);

  return (
    <section ref={sectionRef} className="relative h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#050505]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(220,38,38,.16),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.13] [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:52px_52px]" />

        <motion.div
          style={{ scale: videoScale, borderRadius: videoRadius }}
          className="absolute inset-0 m-auto h-[68vh] w-[92vw] max-w-[1500px] overflow-hidden border border-white/10 bg-black shadow-[0_60px_180px_rgba(0,0,0,.9)]"
        >
          {!ready && (
            <Image
              src="/images/apple/subcategories/macbook-card.png"
              alt="MacBook Pro 2025 M5"
              fill
              sizes="100vw"
              className="z-10 object-cover"
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
            onLoadedMetadata={() => setReady(true)}
            className="h-full w-full object-cover"
            aria-label="MacBook Pro M5 em apresentação cinematográfica controlada pelo scroll"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/65" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(0,0,0,.5)_100%)]" />
        </motion.div>

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-x-0 top-[13vh] z-20 mx-auto max-w-7xl px-5"
        >
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-zinc-300 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-red-400" />
              MacBook Pro 2025 · M5
            </div>

            <h1 className="text-[15vw] font-black leading-[.72] tracking-[-.085em] text-white sm:text-[11vw] lg:text-[8.3rem]">
              PRO.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-300 sm:text-xl">
              A máquina que transforma um dia inteiro de trabalho em uma experiência mais rápida,
              silenciosa e elegante.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: specOpacity, y: specY }}
          className="absolute inset-x-0 bottom-[8vh] z-20 mx-auto max-w-7xl px-5"
        >
          <div className="grid gap-2 md:grid-cols-4">
            {[
              ["M5", "Apple Silicon"],
              ["16GB", "Memória"],
              ["512GB", "SSD"],
              ["10x", "Sem juros"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="border-t border-white/25 bg-black/20 px-4 py-4 backdrop-blur-md"
              >
                <div className="text-3xl font-black tracking-[-.04em]">{value}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[.2em] text-zinc-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: footerOpacity }}
          className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2"
        >
          <a
            href="#oferta"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-white backdrop-blur-xl"
          >
            Ver oferta
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default function MacBookM5Landing() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 28,
    mass: 0.3,
  });

  const [pointer, setPointer] = useState({ x: 50, y: 20 });

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-red-600 selection:text-white"
      onPointerMove={(event) => {
        setPointer({
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        });
      }}
    >
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left bg-red-500"
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 hidden opacity-70 lg:block"
        style={{
          background: `radial-gradient(650px circle at ${pointer.x}% ${pointer.y}%, rgba(229, 37, 45, .10), transparent 45%)`,
        }}
      />

      <header className="fixed inset-x-0 top-0 z-[70]">
        <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/60 px-4 py-2.5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:px-5">
          <a href="https://www.balao.info" aria-label="Balão da Informática">
            <Image
              src="/logo.png"
              alt="Balão da Informática"
              width={170}
              height={64}
              className="h-9 w-auto object-contain sm:h-10"
              priority
            />
          </a>

          <div className="hidden items-center gap-7 text-xs font-black uppercase tracking-[.15em] text-zinc-400 md:flex">
            <a href="#performance" className="transition hover:text-white">Performance</a>
            <a href="#garantia" className="transition hover:text-white">Garantia</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[.08em] text-black transition hover:scale-[1.03] sm:px-5"
          >
            Comprar
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </header>

      <ScrubVideo />

      <section className="relative overflow-hidden border-y border-white/10 bg-[#090909] py-5">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="flex w-max whitespace-nowrap"
        >
          {[0, 1].map((row) => (
            <div key={row} className="flex items-center">
              {[
                "APPLE M5",
                "16GB RAM",
                "SSD 512GB",
                "10X SEM JUROS",
                "1 ANO DE GARANTIA",
                "CAMPINAS",
              ].map((item) => (
                <div
                  key={row + item}
                  className="flex items-center gap-6 px-6 text-sm font-black uppercase tracking-[.22em] text-zinc-300 sm:text-base"
                >
                  {item}
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </section>

      <section id="performance" className="relative mx-auto max-w-7xl px-5 py-28 sm:py-36">
        <div className="mb-16 grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.28em] text-red-400">
              01 / PERFORMANCE
            </div>
            <h2 className="mt-4 text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-6xl">
              Menos espera.
              <br />
              Mais criação.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 lg:justify-self-end lg:text-xl">
            O MacBook Pro M5 foi feito para quem passa o dia produzindo. Código, apresentações,
            edição, criação, estudo e multitarefa em uma máquina que parece desaparecer entre você e o trabalho.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-12">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-7 lg:col-span-7 sm:p-9"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(229,37,45,.2),transparent_30%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[.22em] text-zinc-500">Apple Silicon</div>
                <Cpu className="h-7 w-7 text-red-400" />
              </div>
              <div className="mt-16 text-[27vw] font-black leading-[.65] tracking-[-.09em] text-white/95 sm:text-[10rem]">
                M5
              </div>
              <p className="mt-10 max-w-lg text-lg leading-relaxed text-zinc-400">
                Nova geração de desempenho Apple para trabalhar com velocidade, eficiência e recursos modernos de IA.
              </p>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            viewport={{ once: true }}
            className="relative min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-white p-7 text-black lg:col-span-5 sm:p-9"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-[.22em] text-black/45">Memória</div>
              <MemoryStick className="h-7 w-7" />
            </div>
            <div className="mt-20 text-[24vw] font-black leading-[.7] tracking-[-.08em] sm:text-[8rem]">
              16
            </div>
            <div className="mt-1 text-3xl font-black tracking-[-.04em]">GB</div>
            <p className="mt-10 max-w-sm text-base font-medium leading-relaxed text-black/60">
              Espaço para trabalhar em múltiplos aplicativos sem transformar sua rotina em espera.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] p-7 lg:col-span-5 sm:p-9"
          >
            <HardDrive className="h-7 w-7 text-red-400" />
            <div className="mt-10 text-6xl font-black tracking-[-.06em] sm:text-7xl">512GB</div>
            <div className="mt-2 text-sm font-black uppercase tracking-[.22em] text-zinc-500">SSD</div>
            <p className="mt-12 max-w-sm leading-relaxed text-zinc-400">
              Armazenamento rápido para projetos, arquivos e aplicativos sem perder o fluxo.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-red-600 p-7 lg:col-span-7 sm:p-9"
          >
            <BatteryCharging className="h-8 w-8 text-white" />
            <div className="mt-10 max-w-2xl text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-6xl">
              Feito para acompanhar o seu dia.
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-red-100">
              Mobilidade, desempenho e a experiência integrada do ecossistema Apple.
            </p>
          </motion.article>
        </div>
      </section>

      <section id="oferta" className="relative overflow-hidden border-y border-white/10 bg-white text-black">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
          <div className="relative min-h-[560px] overflow-hidden bg-[#efefef] p-6 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />
            <Image
              src="/images/apple/subcategories/macbook-card.png"
              alt="MacBook Pro 2025 M5 16GB 512GB"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center mix-blend-multiply"
            />
            <div className="absolute left-6 top-6 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-white sm:left-10 sm:top-10">
              Pronta entrega · consulte estoque
            </div>
          </div>

          <div className="flex min-h-[560px] flex-col justify-between p-7 sm:p-12 lg:p-14">
            <div>
              <div className="text-xs font-black uppercase tracking-[.25em] text-black/45">
                OFERTA BALÃO
              </div>
              <h2 className="mt-5 text-4xl font-black leading-[.95] tracking-[-.055em] sm:text-6xl">
                MacBook Pro
                <br />
                M5 · 16GB · 512GB
              </h2>
              <div className="mt-10 border-t border-black/15 pt-8">
                <div className="text-xs font-black uppercase tracking-[.2em] text-black/45">Por</div>
                <div className="mt-2 text-6xl font-black tracking-[-.07em] sm:text-7xl">
                  R$ 10.999
                </div>
                <div className="mt-2 text-lg font-bold text-black/60">
                  10x de R$ 1.099,90 sem juros
                </div>
              </div>
            </div>

            <div className="mt-10">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-between rounded-2xl bg-black px-6 py-5 text-white transition hover:bg-red-600"
              >
                <span className="flex items-center gap-3 text-lg font-black">
                  <MessageCircle className="h-6 w-6" />
                  Comprar pelo WhatsApp
                </span>
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-black/50">
                <span>✓ Atendimento humano</span>
                <span>✓ Compra local em Campinas</span>
                <span>✓ Garantia total de 1 ano</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="garantia" className="relative mx-auto max-w-7xl px-5 py-28 sm:py-36">
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[.28em] text-red-400">
              02 / GARANTIA
            </div>
            <h2 className="mt-4 text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-6xl">
              Um ano.
              <br />
              Sem letra miúda.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              A sua compra fica coberta por duas etapas que se complementam.
            </p>
          </div>

          <div className="relative">
            <div className="absolute bottom-8 left-[2.25rem] top-8 w-px bg-gradient-to-b from-red-500 via-white/20 to-white/5 sm:left-[2.75rem]" />
            {[
              {
                n: "01",
                title: "6 meses de garantia Apple",
                desc: "A primeira etapa da cobertura é fornecida pela Apple.",
              },
              {
                n: "02",
                title: "+ 6 meses pela Balão",
                desc: "Depois, a Balão da Informática adiciona mais seis meses.",
              },
              {
                n: "12",
                title: "12 meses de cobertura",
                desc: "Você completa um ano de segurança para a sua compra.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.n}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex gap-5 border-b border-white/10 py-8 last:border-b-0 sm:gap-7"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#050505] text-sm font-black text-red-400 sm:h-14 sm:w-14">
                  {item.n}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-[-.035em]">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0a0a] py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-[1fr_.8fr]">
            <div>
              <div className="text-xs font-black uppercase tracking-[.28em] text-red-400">
                03 / CAMPINAS
              </div>
              <h2 className="mt-4 max-w-4xl text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-7xl">
                Apple performance.
                <br />
                Atendimento local.
              </h2>
            </div>

            <div className="lg:pt-12">
              <MapPin className="h-8 w-8 text-red-400" />
              <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                Se você procura MacBook Pro M5 em Campinas, fale direto com a Balão da Informática.
                Tire dúvidas, confirme o estoque e feche sua compra com uma equipe real.
              </p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 border-b border-white pb-2 text-sm font-black uppercase tracking-[.14em]"
              >
                Falar com a loja
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-20 grid gap-3 md:grid-cols-3">
            {[
              [CreditCard, "10x sem juros", "Condição pensada para facilitar a compra."],
              [BadgeCheck, "1 ano de garantia", "6 meses Apple + 6 meses Balão."],
              [Zap, "Resposta rápida", "WhatsApp direto com a equipe comercial."],
            ].map(([Icon, title, copy]) => {
              const CardIcon = Icon as typeof CreditCard;
              return (
                <div key={title as string} className="rounded-[1.7rem] border border-white/10 p-6">
                  <CardIcon className="h-6 w-6 text-red-400" />
                  <h3 className="mt-12 text-2xl font-black tracking-[-.035em]">{title as string}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-5 py-28 sm:py-36">
        <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-[.28em] text-red-400">
              04 / DÚVIDAS
            </div>
            <h2 className="mt-4 text-5xl font-black tracking-[-.06em]">FAQ.</h2>
          </div>

          <div className="border-t border-white/15">
            {faqs.map((item) => (
              <details key={item.q} className="group border-b border-white/15 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-black tracking-[-.02em] sm:text-xl">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pt-4 leading-relaxed text-zinc-500">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-red-600">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center sm:py-32">
          <div className="mx-auto max-w-5xl text-[14vw] font-black leading-[.72] tracking-[-.085em] text-white sm:text-[8rem]">
            QUERO M5.
          </div>
          <p className="mx-auto mt-9 max-w-xl text-lg font-medium text-red-100">
            MacBook Pro 2025 M5, 16GB, SSD 512GB. R$ 10.999 em até 10x sem juros.
          </p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-base font-black text-black transition hover:scale-[1.04]"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      <div className="fixed bottom-4 left-1/2 z-[75] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:hidden">
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-4 text-sm font-black uppercase tracking-[.06em] text-white shadow-2xl shadow-black/60"
        >
          <MessageCircle className="h-5 w-5" />
          Comprar MacBook Pro M5
        </a>
      </div>
    </main>
  );
}
