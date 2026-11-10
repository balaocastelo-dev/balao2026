import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Check,
  Cpu,
  GraduationCap,
  HardDrive,
  Keyboard,
  MapPin,
  MemoryStick,
  Monitor,
  PackageCheck,
  Plane,
  ShieldCheck,
  Video,
} from "lucide-react";

import { PARCELAS, PRECO, VALOR_DA_PARCELA } from "./dados";

/*
 * Página do notebook Acer Aspire Go 15 (unidade nova e lacrada na vitrine).
 * Ficha técnica e preço vieram do encarte do fornecedor que o Thiago trouxe em
 * 10/11/2026: i5 de 13ª geração, 8GB DDR5, SSD de 256GB, tela 15,6" Full HD,
 * teclado numérico, R$ 3.699 à vista ou 12x de R$ 369 no cartão, 1 ano de
 * garantia com o fabricante. Preço e parcelas ficam em ./dados.ts.
 */

const MIDIA = "/images/acer-aspire-go-15";

const WHATSAPP =
  "https://wa.me/5519987510267?text=" +
  encodeURIComponent(
    "Olá! Vi a página do notebook Acer Aspire Go 15 (i5 de 13ª geração, 8GB DDR5, SSD de 256GB) por R$ 3.699 e quero saber mais."
  );

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const DESTAQUES = [
  { icon: Cpu, rotulo: "Processador", valor: "Intel Core i5", detalhe: "13ª geração" },
  { icon: MemoryStick, rotulo: "Memória", valor: "8GB", detalhe: "DDR5" },
  { icon: HardDrive, rotulo: "Armazenamento", valor: "256GB", detalhe: "SSD" },
  { icon: Monitor, rotulo: "Tela", valor: "15,6\"", detalhe: "Full HD" },
  { icon: Keyboard, rotulo: "Teclado", valor: "Numérico", detalhe: "bloco completo" },
];

const PARA_QUEM = [
  {
    icon: GraduationCap,
    titulo: "Para estudar",
    texto:
      "Trabalhos, pesquisa, aula online e dezenas de abas abertas ao mesmo tempo. A tela de 15,6 polegadas Full HD cabe duas janelas lado a lado sem apertar a vista.",
  },
  {
    icon: Briefcase,
    titulo: "Para trabalhar",
    texto:
      "Office, e-mail, sistemas da empresa e planilhas grandes. O teclado numérico completo poupa tempo de quem digita número o dia inteiro — nota fiscal, estoque, caixa.",
  },
  {
    icon: Video,
    titulo: "Para o dia a dia",
    texto:
      "Streaming em Full HD, chamada de vídeo, fotos da família e o que mais aparecer. O SSD faz o notebook ligar em segundos e os programas abrirem na hora.",
  },
  {
    icon: Plane,
    titulo: "Para levar junto",
    texto:
      "Leve e portátil, do jeito que a Acer desenhou a linha Aspire Go: entra na mochila e vai para a faculdade, para o escritório e para a viagem.",
  },
];

const FICHA: [string, string][] = [
  ["Modelo", "Acer Aspire Go 15 (AG15-71P)"],
  ["Processador", "Intel Core i5 de 13ª geração"],
  ["Memória", "8GB DDR5"],
  ["Armazenamento", "SSD de 256GB"],
  ["Tela", "15,6 polegadas Full HD"],
  ["Teclado", "Com bloco numérico"],
  ["Estado", "Novo, lacrado de fábrica"],
  ["Garantia", "1 ano com o fabricante"],
  ["Onde está", "Vitrine da loja — Av. Anchieta, 789, Cambuí, Campinas/SP"],
];

const GARANTIAS = [
  { icon: PackageCheck, texto: "Novo e lacrado de fábrica" },
  { icon: ShieldCheck, texto: "1 ano de garantia com o fabricante" },
  { icon: BadgeCheck, texto: "Nota fiscal de venda" },
  { icon: MapPin, texto: "Retirada no balcão, em Campinas" },
];

export default function AcerAspireGo15Landing() {
  return (
    <main className="min-h-screen bg-[#06070b] text-white">
      {/* Topo: foto + oferta */}
      <section className="relative isolate overflow-hidden border-b border-slate-800">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(230,0,18,0.22),transparent_45%)]"
        />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
          <div className="relative order-last aspect-[1449/941] w-full overflow-hidden rounded-3xl border border-slate-700 bg-[#0a0d14] p-5 shadow-2xl shadow-black/60 sm:p-7 lg:order-last">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,0,18,0.18),transparent_65%)]"
            />
            <Image
              src={`${MIDIA}/acer-aspire-go-15.webp`}
              alt="Notebook Acer Aspire Go 15 novo e lacrado, aberto, na Balão da Informática"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-contain object-center p-3 drop-shadow-[0_26px_40px_rgba(0,0,0,0.7)]"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-100 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E60012]" />
              Novo lacrado
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E60012] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
              <BadgeCheck size={14} aria-hidden="true" />
              Na vitrine da loja
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Acer Aspire Go 15
            </h1>
            <p className="mt-3 max-w-xl text-lg font-bold text-slate-200 sm:text-xl">
              Desempenho, praticidade e estilo para o seu dia a dia — novo, lacrado e com um ano de
              garantia.
            </p>

            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DESTAQUES.map(({ icon: Icon, rotulo, valor, detalhe }) => (
                <li
                  key={rotulo}
                  className="rounded-2xl border border-slate-700 bg-white/5 p-3.5 sm:p-4"
                >
                  <Icon size={18} className="text-[#E60012]" aria-hidden="true" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {rotulo}
                  </p>
                  <p className="text-base font-black leading-tight text-white sm:text-lg">{valor}</p>
                  <p className="text-xs font-bold text-slate-300">{detalhe}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-3xl border border-slate-700 bg-white/5 p-6 sm:p-7">
              <p className="text-xs font-black uppercase tracking-widest text-slate-300">
                Por apenas
              </p>
              <p className="mt-1 whitespace-nowrap text-5xl font-black leading-none tracking-tight sm:text-6xl">
                <span className="sr-only">Preço: </span>
                {emReais(PRECO)}
              </p>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                à vista ou{" "}
                <strong className="font-black text-white">
                  {PARCELAS}x de {emReais(VALOR_DA_PARCELA)}
                </strong>{" "}
                no cartão de crédito.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95 sm:text-base"
                >
                  Falar no WhatsApp
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 px-6 py-4 text-sm font-bold text-slate-200 transition-colors hover:border-[#E60012] hover:text-white"
                >
                  Ver a loja
                </Link>
              </div>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {GARANTIAS.map(({ icon: Icon, texto }) => (
                <li key={texto} className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
                  <Icon size={17} className="shrink-0 text-[#E60012]" aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Um notebook que dá conta do dia inteiro
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
          A linha Aspire Go foi feita para quem quer uma máquina confiável sem pagar por exageros: o
          i5 de 13ª geração com memória DDR5 e SSD entrega folga de sobra para estudo, trabalho e
          entretenimento.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {PARA_QUEM.map(({ icon: Icon, titulo, texto }) => (
            <article
              key={titulo}
              className="rounded-3xl border border-slate-700 bg-[#111827] p-6 transition-colors hover:border-[#E60012] sm:p-7"
            >
              <Icon size={26} className="text-[#E60012]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black text-white sm:text-xl">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">{texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Ficha técnica */}
      <section className="border-y border-slate-800 bg-[#0a0d14]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Ficha técnica</h2>

          <dl className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {FICHA.map(([rotulo, valor]) => (
              <div
                key={rotulo}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-slate-800 py-4"
              >
                <dt className="text-sm font-bold text-slate-400">{rotulo}</dt>
                <dd className="text-sm font-black text-white sm:text-base">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Fechamento */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border-2 border-[#E60012]/70 bg-[#111827] p-7 sm:p-10">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Venha ver de perto, no Cambuí
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
            A unidade está na vitrine da Balão da Informática, na Av. Anchieta, 789, Cambuí,
            Campinas. Dá para abrir, ligar e testar o notebook no balcão antes de pagar. Se preferir
            resolver por mensagem, chame no WhatsApp que a gente separa a unidade.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm font-bold text-slate-200">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#E60012]" aria-hidden="true" />
              Segunda a sexta, das 9h às 18h
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#E60012]" aria-hidden="true" />
              Sábado, das 9h às 13h
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#E60012]" aria-hidden="true" />
              (19) 98751-0267
            </li>
          </ul>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-700 active:scale-95 sm:text-base"
          >
            Quero esse notebook
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
