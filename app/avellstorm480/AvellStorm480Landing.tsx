"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ComponentType } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Brain,
  Clapperboard,
  Code2,
  Gamepad2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import s from "./avell.module.css";
import { PRECO, VALOR_DA_NOTA_FISCAL } from "./dados";
import {
  IlustracaoMemoria,
  IlustracaoPlacaDeVideo,
  IlustracaoProcessador,
  IlustracaoSsd,
} from "./Ilustracoes";

/*
 * Página de vendas do notebook gamer Avell Storm 480 (unidade única na vitrine).
 * Preço e garantia ditos pelo Thiago em 25/10 (ficam em ./dados.ts); ficha
 * técnica do modelo (i9-14900HX, RTX 4080 12GB, tela 17" QHD 240 Hz) conferida
 * nas lojas e comparadores.
 */

const MIDIA = "/images/avell-storm-480";

const WHATSAPP =
  "https://wa.me/5519987510267?text=" +
  encodeURIComponent(
    "Olá! Vi a página do notebook Avell Storm 480 (i9 14ª geração, 64GB DDR5, SSD 1TB, RTX 4080 12GB) por R$ 13.999 e quero saber mais."
  );

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

type Peca = {
  numero: string;
  rotulo: string;
  titulo: string;
  destaque: string;
  texto: string;
  ficha: [string, string][];
  imagem: "processador" | "placa" | "memoria" | "ssd" | "tela";
};

const PECAS: Peca[] = [
  {
    numero: "01",
    rotulo: "Processador",
    titulo: "Intel Core i9-14900HX",
    destaque: "24 núcleos. Até 5,8 GHz.",
    texto:
      "O topo da 14ª geração da Intel para notebooks. São 8 núcleos de desempenho e 16 de eficiência trabalhando juntos: os primeiros entregam força bruta para o jogo, a renderização e a compilação; os outros cuidam de tudo o que roda por trás, sem roubar fôlego de quem está na frente.",
    ficha: [
      ["Núcleos", "24 (8 de desempenho + 16 de eficiência)"],
      ["Threads", "32"],
      ["Frequência", "até 5,8 GHz"],
      ["Cache", "36 MB"],
      ["Geração", "14ª — Raptor Lake Refresh HX"],
    ],
    imagem: "processador",
  },
  {
    numero: "02",
    rotulo: "Placa de vídeo",
    titulo: "NVIDIA GeForce RTX 4080",
    destaque: "12 GB de memória de vídeo.",
    texto:
      "Arquitetura Ada Lovelace, ray tracing e DLSS 3 com geração de quadros: o par perfeito para a tela de 240 Hz, com jogos atuais em QHD e taxa alta. E os 12 GB de memória GDDR6 fazem diferença longe dos jogos também — na edição de vídeo, no 3D e na inteligência artificial rodando no próprio notebook.",
    ficha: [
      ["Memória", "12 GB GDDR6"],
      ["Barramento", "192 bits"],
      ["Núcleos CUDA", "7.424"],
      ["Arquitetura", "Ada Lovelace"],
      ["Recursos", "DLSS 3, ray tracing, codificação AV1"],
    ],
    imagem: "placa",
  },
  {
    numero: "03",
    rotulo: "Memória",
    titulo: "64 GB DDR5",
    destaque: "O dobro da configuração de fábrica.",
    texto:
      "O Storm 480 sai de fábrica com 32 GB. Este tem 64 GB — o máximo que a plataforma aceita. Na prática, o sistema não precisa escolher: o jogo, o navegador com dezenas de abas, o editor de vídeo e a máquina virtual ficam abertos ao mesmo tempo, sem engasgo.",
    ficha: [
      ["Capacidade", "64 GB"],
      ["Tipo", "DDR5 SO-DIMM"],
      ["De fábrica", "32 GB"],
      ["Máximo da plataforma", "64 GB"],
    ],
    imagem: "memoria",
  },
  {
    numero: "04",
    rotulo: "Armazenamento",
    titulo: "SSD NVMe de 1 TB",
    destaque: "PCIe 4.0. E espaço para crescer.",
    texto:
      "Um SSD NVMe na linha PCIe 4.0 x4: o sistema liga em segundos, os jogos carregam rápido e projetos pesados abrem sem espera. E ainda há um segundo slot M.2 livre, para dobrar o espaço quando precisar.",
    ficha: [
      ["Capacidade", "1 TB"],
      ["Interface", "NVMe PCIe 4.0 x4"],
      ["Formato", "M.2"],
      ["Expansão", "segundo slot M.2 livre"],
    ],
    imagem: "ssd",
  },
  {
    numero: "05",
    rotulo: "Tela",
    titulo: "17 polegadas, QHD, 240 Hz",
    destaque: "Grande de verdade. Rápida de verdade.",
    texto:
      "Formato 16:10 com 2560 × 1600 pixels e 240 atualizações por segundo. O painel WVA antirreflexo cobre 100% do espaço de cor sRGB: movimento nítido no jogo, cor fiel na edição, e área de sobra para planilhas, linhas do tempo e código lado a lado.",
    ficha: [
      ["Tamanho", "17 polegadas, 16:10"],
      ["Resolução", "2560 × 1600"],
      ["Atualização", "240 Hz"],
      ["Painel", "WVA antirreflexo"],
      ["Cor e brilho", "100% sRGB · 350 nits"],
    ],
    imagem: "tela",
  },
];

const NUMEROS = ["24 núcleos", "5,8 GHz", "64 GB DDR5", "RTX 4080 · 12 GB", "1 TB NVMe", "17\" · 240 Hz", "1 ano de garantia"];

const USOS: { icone: ComponentType<{ className?: string }>; titulo: string; texto: string }[] = [
  {
    icone: Gamepad2,
    titulo: "Jogos em QHD",
    texto: "A RTX 4080 e a tela de 240 Hz foram feitas uma para a outra.",
  },
  {
    icone: Clapperboard,
    titulo: "Criação",
    texto: "Edição de vídeo, modelagem e renderização 3D, com memória de sobra para projetos grandes.",
  },
  {
    icone: Brain,
    titulo: "IA local",
    texto: "12 GB de vídeo e 64 GB de RAM para rodar modelos de texto e imagem no próprio notebook, sem mandar dados para fora.",
  },
  {
    icone: Code2,
    titulo: "Engenharia e código",
    texto: "CAD, simulação, máquinas virtuais e compilação com 32 threads.",
  },
];

const PERGUNTAS = [
  {
    p: "Qual é a configuração exata?",
    r: "Notebook gamer Avell Storm 480 com Intel Core i9-14900HX (14ª geração), 64 GB de memória DDR5, SSD NVMe de 1 TB, NVIDIA GeForce RTX 4080 de 12 GB e tela de 17 polegadas QHD (2560 × 1600) de 240 Hz.",
  },
  {
    p: "Quanto custa?",
    r: `${emReais(PRECO)}. O valor na nota fiscal do aparelho é de ${emReais(VALOR_DA_NOTA_FISCAL)}.`,
  },
  {
    p: "Qual é a garantia?",
    r: "1 ano de garantia da Balão da Informática.",
  },
  {
    p: "Posso ver antes de comprar?",
    r: "Sim. Ele está na vitrine da loja, na Av. Anchieta, 789, no Cambuí, em Campinas. Segunda a sexta das 9h às 18h e sábado das 9h às 13h.",
  },
  {
    p: "Como faço para comprar?",
    r: "Pelo WhatsApp (19) 98751-0267 ou direto na loja. É uma unidade única: quem fechar primeiro leva.",
  },
];

function Revelar({ children, atraso = 0, className }: { children: React.ReactNode; atraso?: number; className?: string }) {
  const reduzir = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduzir ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function BotaoOuro({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#f1dfb4] via-[#c9a66b] to-[#e9d4a2] px-8 py-4 text-[13px] font-bold uppercase tracking-[0.22em] text-[#141008] shadow-[0_10px_40px_-10px_rgba(201,166,107,0.6)] transition-[filter,transform] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1dfb4] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}

function Cabecalho() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#060607]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Balão da Informática — página inicial">
          <Image src="/logo.png" alt="Balão da Informática" width={120} height={40} className="h-8 w-auto" />
        </Link>
        <p className={`${s.serif} hidden text-lg italic text-[#e9e2d3] md:block`}>Avell Storm 480</p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#c9a66b]/60 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ead6a6] transition-colors hover:bg-[#c9a66b]/10"
        >
          Reservar
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const suave = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const yVideo = useTransform(suave, [0, 1], [0, reduzir ? 0 : 120]);
  const escala = useTransform(suave, [0, 1], [1, reduzir ? 1 : 1.12]);
  const yTexto = useTransform(suave, [0, 1], [0, reduzir ? 0 : -60]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-16">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_70%_35%,rgba(150,12,24,0.22),transparent_70%),radial-gradient(ellipse_50%_40%_at_20%_0%,rgba(201,166,107,0.10),transparent_70%)]" />
      <div className={s.grao} aria-hidden="true" />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1400px] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:pb-24">
        <motion.div style={{ y: yTexto }} className="relative z-10 order-2 lg:order-1">
          <motion.p
            initial={reduzir ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]"
          >
            <span className="h-px w-10 bg-[#c9a66b]/70" />
            Unidade única · Na vitrine da Balão
          </motion.p>

          <motion.h1
            initial={reduzir ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`${s.serif} mt-6 text-[3.4rem] font-light leading-[0.95] tracking-[-0.01em] text-[#f6f1e7] sm:text-7xl xl:text-[6.2rem]`}
          >
            Avell
            <br />
            <span className={`${s.ouro} font-normal italic`}>Storm 480</span>
          </motion.h1>

          <motion.p
            initial={reduzir ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className={`${s.serif} mt-6 max-w-md text-2xl font-light italic leading-snug text-[#cfc7b6] sm:text-[1.7rem]`}
          >
            Potência de estação de trabalho, com alma de máquina gamer.
          </motion.p>

          <motion.div
            initial={reduzir ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-10"
          >
            <p className="text-sm text-[#9d968a]">
              Na nota fiscal{" "}
              <s className="decoration-[#c9a66b]/80 decoration-1">{emReais(VALOR_DA_NOTA_FISCAL)}</s>
            </p>
            <p className={`${s.serif} ${s.numeros} mt-1 text-6xl font-normal tracking-tight text-[#f6f1e7] sm:text-7xl`}>
              {emReais(PRECO)}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#bdb5a5]">
              <ShieldCheck className="h-4 w-4 text-[#c9a66b]" aria-hidden="true" />
              1 ano de garantia · pronta entrega em Campinas
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <BotaoOuro>Quero o meu</BotaoOuro>
              <a
                href="#pecas"
                className="inline-flex items-center justify-center gap-2 px-2 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#cfc7b6] transition-colors hover:text-white"
              >
                Conhecer cada peça
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: yVideo, scale: escala }}
          initial={reduzir ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 lg:order-2"
        >
          <div className={`${s.esfumar} relative mx-auto aspect-[16/10] w-full max-w-[820px]`}>
            <Image
              src={`${MIDIA}/avell-storm-480-poster.webp`}
              alt="Notebook gamer Avell Storm 480"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 60vw"
              className="object-contain"
            />
            <video
              aria-hidden="true"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={`${MIDIA}/avell-storm-480-poster.jpg`}
              className="absolute inset-0 h-full w-full object-contain motion-reduce:hidden"
            >
              <source src={`${MIDIA}/avell-storm-480.webm`} type="video/webm" />
              <source src={`${MIDIA}/avell-storm-480.mp4`} type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FaixaDeNumeros() {
  const itens = [...NUMEROS, ...NUMEROS];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.07] bg-[#09090b] py-6">
      <div className={`${s.faixa} flex w-max gap-14 whitespace-nowrap`}>
        {itens.map((n, i) => (
          <span key={i} className={`${s.serif} flex items-center gap-14 text-2xl font-light italic text-[#d9cfbb] sm:text-3xl`}>
            {n}
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c9a66b]" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <section className="relative px-5 py-28 sm:px-8 sm:py-36">
      <Revelar className="mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]">A configuração</p>
        <p className={`${s.serif} mt-8 text-[2.1rem] font-light leading-[1.2] text-[#efe8da] sm:text-5xl sm:leading-[1.15]`}>
          Poucos notebooks chegam a este nível.{" "}
          <span className="italic text-[#a59d8f]">Este chegou — e está a poucos passos, na nossa vitrine.</span>
        </p>
        <div className={`${s.fio} mx-auto mt-12 h-px w-40`} />
      </Revelar>
    </section>
  );
}

function ImagemDaPeca({ tipo }: { tipo: Peca["imagem"] }) {
  const reduzir = useReducedMotion();
  const flutuar = reduzir
    ? {}
    : { animate: { y: [0, -12, 0] }, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } };

  if (tipo === "tela") {
    return (
      <div className="relative">
        <motion.div {...flutuar} className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
          <Image
            src={`${MIDIA}/avell-storm-480.webp`}
            alt="Tela de 17 polegadas do Avell Storm 480"
            fill
            sizes="(max-width: 1023px) 90vw, 45vw"
            className={`${s.pecaPlana} object-contain`}
          />
        </motion.div>
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-[#6f695f]">Foto oficial Avell</p>
      </div>
    );
  }

  const Ilustracao = {
    processador: IlustracaoProcessador,
    placa: IlustracaoPlacaDeVideo,
    memoria: IlustracaoMemoria,
    ssd: IlustracaoSsd,
  }[tipo];
  const plana = tipo === "memoria" || tipo === "ssd";

  return (
    <div className="relative">
      <div className={`${s.palco} relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center`}>
        <motion.div {...flutuar} className="w-[94%]">
          <Ilustracao className={`${plana ? s.pecaPlana : s.peca3d} h-auto w-full`} />
        </motion.div>
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.3em] text-[#6f695f]">Ilustração</p>
    </div>
  );
}

function BlocoDaPeca({ peca, indice }: { peca: Peca; indice: number }) {
  const invertido = indice % 2 === 1;
  return (
    <article className="relative overflow-hidden border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,166,107,0.10),transparent_65%)] ${invertido ? "left-[-8%]" : "right-[-8%]"}`}
      />
      <div className="relative mx-auto grid max-w-[1300px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Revelar className={invertido ? "lg:order-2" : ""}>
          <div className="flex items-baseline gap-5">
            <span className={`${s.serif} ${s.ouro} text-6xl font-light italic sm:text-7xl`}>{peca.numero}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a59d8f]">{peca.rotulo}</span>
          </div>
          <h2 className={`${s.serif} mt-6 text-4xl font-normal leading-[1.05] text-[#f6f1e7] sm:text-5xl`}>{peca.titulo}</h2>
          <p className={`${s.serif} mt-3 text-2xl font-light italic text-[#d9c39a]`}>{peca.destaque}</p>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-[#b3ab9d] sm:text-base">{peca.texto}</p>

          <dl className="mt-10 max-w-xl divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {peca.ficha.map(([rotulo, valor]) => (
              <div key={rotulo} className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d776c]">{rotulo}</dt>
                <dd className="text-right text-sm font-medium text-[#ece5d6]">{valor}</dd>
              </div>
            ))}
          </dl>
        </Revelar>

        <Revelar atraso={0.15} className={invertido ? "lg:order-1" : ""}>
          <ImagemDaPeca tipo={peca.imagem} />
        </Revelar>
      </div>
    </article>
  );
}

function FeitoPara() {
  return (
    <section className="border-t border-white/[0.06] bg-[#09090b] px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1300px]">
        <Revelar className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]">Feito para</p>
          <h2 className={`${s.serif} mt-5 text-4xl font-light leading-[1.1] text-[#f6f1e7] sm:text-5xl`}>
            Uma máquina, <span className="italic text-[#d9c39a]">quatro vocações.</span>
          </h2>
        </Revelar>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
          {USOS.map(({ icone: Icone, titulo, texto }, i) => (
            <Revelar key={titulo} atraso={i * 0.08} className="bg-[#09090b] p-8 sm:p-10">
              <Icone className="h-7 w-7 text-[#c9a66b]" aria-hidden="true" />
              <h3 className={`${s.serif} mt-8 text-2xl text-[#f1eadc]`}>{titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9d968a]">{texto}</p>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}

function FichaCompleta() {
  const linhas: [string, string][] = [
    ["Modelo", "Avell Storm 480 — notebook gamer"],
    ["Processador", "Intel Core i9-14900HX, 24 núcleos, 32 threads, até 5,8 GHz"],
    ["Placa de vídeo", "NVIDIA GeForce RTX 4080, 12 GB GDDR6"],
    ["Memória", "64 GB DDR5"],
    ["Armazenamento", "SSD NVMe PCIe 4.0 de 1 TB, com segundo slot M.2 livre"],
    ["Tela", "17\", 2560 × 1600, 240 Hz, WVA antirreflexo, 100% sRGB"],
    ["Garantia", "1 ano, pela Balão da Informática"],
    ["Onde ver", "Vitrine da loja — Av. Anchieta, 789, Cambuí, Campinas"],
  ];
  return (
    <section className="border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <Revelar className="mx-auto max-w-4xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]">Ficha técnica</p>
        <h2 className={`${s.serif} mt-5 text-center text-4xl font-light text-[#f6f1e7] sm:text-5xl`}>Tudo, em uma página.</h2>
        <dl className="mt-14 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo} className="grid gap-1 py-5 sm:grid-cols-[200px_1fr] sm:gap-8">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7d776c]">{rotulo}</dt>
              <dd className="text-[15px] text-[#ece5d6]">{valor}</dd>
            </div>
          ))}
        </dl>
      </Revelar>
    </section>
  );
}

function Oferta() {
  return (
    <section id="oferta" className="relative overflow-hidden border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(201,166,107,0.10),transparent_70%)]" />
      <Revelar className="relative mx-auto max-w-3xl">
        <div className="relative rounded-[2rem] border border-[#c9a66b]/40 bg-[#0b0b0d]/90 p-8 text-center shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:p-14">
          <div className={s.cantos} aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]">Unidade única</p>
          <h2 className={`${s.serif} mt-5 text-4xl font-light text-[#f6f1e7] sm:text-5xl`}>
            Avell Storm 480
          </h2>
          <p className="mt-8 text-sm text-[#9d968a]">
            Valor na nota fiscal <s className="decoration-[#c9a66b]/80">{emReais(VALOR_DA_NOTA_FISCAL)}</s>
          </p>
          <p className={`${s.serif} ${s.ouro} ${s.numeros} mt-2 text-7xl font-normal tracking-tight sm:text-8xl`}>{emReais(PRECO)}</p>
          <p className="mt-4 text-sm text-[#bdb5a5]">
            {emReais(VALOR_DA_NOTA_FISCAL - PRECO)} abaixo do valor da nota fiscal
          </p>

          <div className="mx-auto mt-10 grid max-w-xl gap-4 text-left sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a66b]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#f1eadc]">1 ano de garantia</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8f897e]">Pela Balão da Informática.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a66b]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#f1eadc]">Na vitrine</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8f897e]">Av. Anchieta, 789 · Cambuí · Campinas</p>
              </div>
            </div>
          </div>

          <BotaoOuro className="mt-10 w-full sm:w-auto">Quero o Avell Storm 480</BotaoOuro>
          <p className="mt-5 text-xs text-[#6f695f]">Atendimento pelo WhatsApp (19) 98751-0267</p>
        </div>
      </Revelar>
    </section>
  );
}

function Perguntas() {
  return (
    <section className="border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <Revelar className="mx-auto max-w-3xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[#c9a66b]">Perguntas</p>
        <h2 className={`${s.serif} mt-5 text-center text-4xl font-light text-[#f6f1e7] sm:text-5xl`}>Antes de levar para casa.</h2>
        <div className="mt-12 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {PERGUNTAS.map(({ p, r }) => (
            <details key={p} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                <span className={`${s.serif} text-xl text-[#f1eadc] sm:text-2xl`}>{p}</span>
                <span className="text-2xl font-light text-[#c9a66b] transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#a59d8f]">{r}</p>
            </details>
          ))}
        </div>
      </Revelar>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-white/[0.06] px-5 pb-28 pt-12 sm:px-8 sm:pb-12">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <Link href="/" aria-label="Balão da Informática — página inicial">
          <Image src="/logo.png" alt="Balão da Informática" width={110} height={36} className="h-7 w-auto opacity-80" />
        </Link>
        <p className="text-xs leading-relaxed text-[#6f695f]">
          Balão da Informática · Av. Anchieta, 789 · Cambuí · Campinas, SP · (19) 98751-0267
          <br />
          Imagens das peças internas são ilustrações. Avell, Intel e NVIDIA são marcas de seus donos.
        </p>
      </div>
    </footer>
  );
}

/** Barra fixa de compra no celular. */
function BarraDoCelular() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#060607]/90 px-4 py-3 backdrop-blur-xl sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8f897e]">Avell Storm 480</p>
          <p className={`${s.serif} ${s.numeros} text-2xl leading-none text-[#f6f1e7]`}>{emReais(PRECO)}</p>
        </div>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-gradient-to-r from-[#f1dfb4] via-[#c9a66b] to-[#e9d4a2] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#141008]"
        >
          Quero o meu
        </a>
      </div>
    </div>
  );
}

export default function AvellStorm480Landing({ classeFontes }: { classeFontes: string }) {
  return (
    <main className={`${s.pagina} ${classeFontes} min-h-screen overflow-x-clip bg-[#060607] text-[#f4f1ea] antialiased selection:bg-[#c9a66b]/30`}>
      <Cabecalho />
      <Hero />
      <FaixaDeNumeros />
      <Manifesto />
      <section id="pecas" aria-label="As peças do Avell Storm 480" className="scroll-mt-16">
        {PECAS.map((peca, i) => (
          <BlocoDaPeca key={peca.numero} peca={peca} indice={i} />
        ))}
      </section>
      <FeitoPara />
      <FichaCompleta />
      <Oferta />
      <Perguntas />
      <Rodape />
      <BarraDoCelular />
    </main>
  );
}
