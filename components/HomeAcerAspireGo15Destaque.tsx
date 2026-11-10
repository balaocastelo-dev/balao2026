import Image from "next/image";
import Link from "next/link";
import { PARCELAS, PRECO, VALOR_DA_PARCELA } from "@/app/acer-aspire-go-15/dados";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  HardDrive,
  Keyboard,
  MemoryStick,
  Monitor,
  ShieldCheck,
} from "lucide-react";

/**
 * Destaque da home: notebook Acer Aspire Go 15, novo e lacrado, na vitrine da loja.
 *
 * Histórico do bloco: MacBook Pro M5 (vendido em 16/10) → MacBook M2 (vendido
 * em 25/10) → Avell Storm 480 (vendido em 10/11) → Acer Aspire Go 15.
 *
 * É um produto único da loja — não vem do espelhamento de preços (Kabum e
 * afins). O preço fica em app/acer-aspire-go-15/dados.ts, junto com a página do
 * produto (/acer-aspire-go-15), para os dois nunca mostrarem valores diferentes.
 *
 * Mídia em public/images/acer-aspire-go-15/, tirada do encarte do fornecedor.
 */
const PAGINA_DO_PRODUTO = "/acer-aspire-go-15";

const MIDIA = "/images/acer-aspire-go-15";

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const especificacoes = [
  { icon: Cpu, texto: "Intel Core i5 13ª geração" },
  { icon: MemoryStick, texto: "8GB DDR5" },
  { icon: HardDrive, texto: "SSD de 256GB" },
  { icon: Monitor, texto: "Tela 15,6\" Full HD" },
  { icon: Keyboard, texto: "Teclado numérico" },
];

export default function HomeAcerAspireGo15Destaque() {
  return (
    <section
      aria-labelledby="destaque-acer-aspire-go-15"
      className="group relative isolate w-full overflow-hidden rounded-[2.5rem] border-2 border-[#E60012]/70 bg-[#06070b] shadow-2xl shadow-red-950/40 transition-colors duration-300 hover:border-[#E60012]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(230,0,18,0.20),transparent_42%)]"
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Foto do produto: em cima no celular, à direita no computador */}
        <div className="relative min-h-[230px] overflow-hidden bg-black sm:min-h-[340px] lg:order-last lg:min-h-[460px]">
          <Image
            src={`${MIDIA}/acer-aspire-go-15.webp`}
            alt="Notebook Acer Aspire Go 15 novo e lacrado à venda na Balão da Informática"
            fill
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="object-cover object-center"
            priority={false}
          />

          {/* Funde a foto com o painel, sem deixar emenda */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06070b] to-transparent lg:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#06070b] to-transparent lg:block"
          />

          {/* Selo discreto no canto */}
          <div
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-100 backdrop-blur-sm sm:right-6 sm:top-6 sm:text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E60012]" />
            Novo lacrado
          </div>
        </div>

        {/* Oferta */}
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10 xl:p-12">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E60012] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
              <BadgeCheck size={14} aria-hidden="true" />
              Na vitrine
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              Destaque da loja
            </span>
          </div>

          <h2
            id="destaque-acer-aspire-go-15"
            className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-4xl xl:text-5xl"
          >
            Acer Aspire Go 15
          </h2>
          <p className="mt-2 text-lg font-bold text-slate-200 sm:text-xl">
            Notebook novo e lacrado ·{" "}
            <span className="whitespace-nowrap">pronto para estudo e trabalho</span>
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {especificacoes.map(({ icon: Icon, texto }) => (
              <li
                key={texto}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-100 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <Icon size={15} className="shrink-0 text-[#E60012]" aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>

          {/* Preço à vista e parcelamento */}
          <div className="mt-6 border-t border-slate-700/80 pt-5">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-300">
              Por apenas
            </p>

            <p className="mt-1.5 whitespace-nowrap text-6xl font-black leading-none tracking-tight text-white sm:text-7xl">
              <span className="sr-only">Preço: </span>
              {emReais(PRECO)}
            </p>

            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              à vista ou {PARCELAS}x de {emReais(VALOR_DA_PARCELA)} no cartão de crédito.
            </p>
          </div>

          {/* Garantia */}
          <div className="mt-5 flex items-start gap-3.5 border-t border-slate-700/80 pt-5">
            <ShieldCheck size={26} className="mt-0.5 shrink-0 text-[#E60012]" aria-hidden="true" />
            <div>
              <p className="text-base font-black text-white sm:text-lg">
                1 ano de garantia com o fabricante
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Está na vitrine da loja, na Av. Anchieta, 789, Cambuí, Campinas. Venha ver de perto
                ou chame no WhatsApp.
              </p>
            </div>
          </div>

          {/* O ::after estica o link: o bloco inteiro leva para a página do produto.
              Não pôr scale/transform neste link: isso encolheria a área clicável
              de volta para o botão bem na hora do clique. */}
          <Link
            href={PAGINA_DO_PRODUTO}
            className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 group-hover:bg-red-700 sm:w-fit sm:px-9 sm:text-base"
          >
            Conhecer o Acer Aspire Go 15
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
