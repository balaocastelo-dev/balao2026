import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ChevronRight, TrendingDown } from "lucide-react";
import SeloProntaEntrega, { AvisoImagemIlustrativa } from "@/components/SeloProntaEntrega";
import { getProductHref } from "@/lib/utils";
import { DIAS_NA_VITRINE, type ProdutoEmQueda } from "@/lib/precos/queda";

// ============================================================
// Container "Queda de preço" (pedido do Thiago em 12/10).
//
// Na página inicial fica logo depois do vídeo do banner e acima do destaque
// do MacBook. Mostra os produtos cujo preço baixou nos últimos 7 dias, com o
// "de / por" real (o "de" é o preço que estava no site antes da queda).
// O tamanho e a disposição seguem a quantidade: 1 produto vira um destaque
// largo; 2 a 3, cartões grandes lado a lado; 4 ou mais, grade de 4 ou 6 colunas.
// Sem nenhuma queda, o container não aparece.
// ============================================================

/** Quantos cabem na página inicial; o resto fica em /queda-de-preco. */
export const MAXIMO_NA_HOME = 12;

const reais = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function quandoBaixou(iso: string, agora = Date.now()): string {
  const dias = Math.floor((agora - Date.parse(iso)) / 86_400_000);
  if (!Number.isFinite(dias) || dias <= 0) return "baixou hoje";
  if (dias === 1) return "baixou ontem";
  return `baixou há ${dias} dias`;
}

function Selo({ q, grande = false }: { q: ProdutoEmQueda; grande?: boolean }) {
  return (
    <span
      className={`absolute right-2 top-2 z-10 inline-flex items-center gap-0.5 rounded-lg bg-emerald-500 font-black text-white shadow-lg ${
        grande ? "px-3 py-1.5 text-base" : "px-2 py-1 text-xs"
      }`}
    >
      <ArrowDown size={grande ? 18 : 13} strokeWidth={3} />
      {q.porcentagem}%
    </span>
  );
}

function Precos({ q, tamanho }: { q: ProdutoEmQueda; tamanho: "destaque" | "grande" | "normal" }) {
  const por = tamanho === "destaque" ? "text-4xl sm:text-5xl" : tamanho === "grande" ? "text-2xl" : "text-base sm:text-lg";
  const pequeno = tamanho === "normal" ? "text-[11px]" : "text-sm";
  return (
    <div>
      <p className={`text-slate-400 ${pequeno}`}>
        De <s className="decoration-[#ff3b47]/80 decoration-2">R$ {reais(q.de)}</s> por
      </p>
      <p className="leading-tight">
        <span className={`whitespace-nowrap font-black text-emerald-400 ${por}`}>R$ {reais(q.por)}</span>{" "}
        <span className={`whitespace-nowrap font-semibold text-slate-400 ${tamanho === "normal" ? "text-[10px]" : "text-xs"}`}>no Pix</span>
      </p>
      <p className={`mt-1 font-bold text-emerald-300 ${pequeno}`}>Economize R$ {reais(q.economia)}</p>
      <p className={`text-slate-500 ${tamanho === "normal" ? "text-[10px]" : "text-xs"}`}>{quandoBaixou(q.queda_em)}</p>
    </div>
  );
}

/** Um produto só: destaque largo, foto de um lado e preço do outro. */
function CartaoDestaque({ q }: { q: ProdutoEmQueda }) {
  const p = q.produto;
  return (
    <Link
      href={getProductHref(p)}
      className="group grid overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900 transition hover:border-emerald-400 hover:shadow-2xl sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <div className="relative min-h-[240px] bg-white sm:min-h-[300px]">
        <Selo q={q} grande />
        <SeloProntaEntrega availability={p.availability} tamanho="pequeno" />
        <AvisoImagemIlustrativa url={p.image} tamanho="pequeno" />
        <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 100vw, 40vw" className="object-contain p-6 transition duration-300 group-hover:scale-105" unoptimized />
      </div>
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <h3 className="line-clamp-3 text-xl font-bold leading-snug text-white sm:text-2xl" title={p.name}>
          {p.name}
        </h3>
        <Precos q={q} tamanho="destaque" />
        {p.price_card && <p className="text-sm text-slate-500">ou {p.price_card} no cartão</p>}
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white transition group-hover:bg-emerald-400">
          Aproveitar o preço novo <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}

/** Dois ou três produtos: cartão horizontal grande. */
function CartaoGrande({ q }: { q: ProdutoEmQueda }) {
  const p = q.produto;
  return (
    <Link
      href={getProductHref(p)}
      className="group grid h-full grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-xl"
    >
      <div className="relative min-h-[180px] bg-white">
        <Selo q={q} />
        <SeloProntaEntrega availability={p.availability} tamanho="pequeno" />
        <AvisoImagemIlustrativa url={p.image} tamanho="pequeno" />
        <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 40vw, 15vw" className="object-contain p-3 transition duration-300 group-hover:scale-105" unoptimized />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white" title={p.name}>
          {p.name}
        </h3>
        <div className="mt-auto">
          <Precos q={q} tamanho="grande" />
        </div>
      </div>
    </Link>
  );
}

/** Quatro ou mais: cartão vertical, como os das vitrines. */
function CartaoNormal({ q }: { q: ProdutoEmQueda }) {
  const p = q.produto;
  return (
    <Link
      href={getProductHref(p)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-xl"
    >
      <div className="relative overflow-hidden bg-white pt-[80%]">
        <Selo q={q} />
        <SeloProntaEntrega availability={p.availability} tamanho="pequeno" />
        <AvisoImagemIlustrativa url={p.image} tamanho="pequeno" />
        <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 18vw" className="object-contain p-3 transition duration-300 group-hover:scale-105" unoptimized />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100 group-hover:text-white" title={p.name}>
          {p.name}
        </h3>
        <div className="mt-auto pt-2">
          <Precos q={q} tamanho="normal" />
        </div>
      </div>
    </Link>
  );
}

// Classes escritas por inteiro para o Tailwind encontrar.
const COLUNAS: Record<number, string> = {
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  7: "grid-cols-2 md:grid-cols-4",
  8: "grid-cols-2 md:grid-cols-4",
  9: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  10: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  11: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  12: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
};

/** Grade e cartão conforme a quantidade de produtos em queda. */
export function GradeDeQuedas({ quedas }: { quedas: ProdutoEmQueda[] }) {
  const n = quedas.length;
  if (n === 0) return null;
  if (n === 1) return <CartaoDestaque q={quedas[0]} />;
  if (n <= 3) {
    return (
      <div className={`grid gap-4 ${n === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {quedas.map((q) => (
          <CartaoGrande key={q.produto.id} q={q} />
        ))}
      </div>
    );
  }
  // 4 ou mais: colunas escolhidas para as fileiras ficarem cheias (no máximo
  // um buraco): 4 → 4, 5 → 5, 6 → 6, 7 e 8 → 4, 9 e 10 → 5, 11 e 12 → 6.
  const colunas = COLUNAS[Math.min(n, 12)] ?? COLUNAS[12];
  return (
    <div className={`grid gap-3 sm:gap-4 ${colunas}`}>
      {quedas.map((q) => (
        <CartaoNormal key={q.produto.id} q={q} />
      ))}
    </div>
  );
}

export function CabecalhoDaQueda({ total, comLink }: { total: number; comLink: boolean }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <TrendingDown size={26} strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight text-white lg:text-[1.8rem]">
            Queda de preço
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/40">
              {total === 1 ? "1 produto baixou" : `${total} produtos baixaram`}
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Preços que caíram nos últimos {DIAS_NA_VITRINE} dias. O &quot;de&quot; é o preço que estava no site antes da queda.
          </p>
        </div>
      </div>
      {comLink && (
        <Link
          href="/queda-de-preco"
          className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/50 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500 hover:text-white"
        >
          Ver todas as quedas <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Container da página inicial. */
export default function HomeQuedaDePreco({ quedas }: { quedas: ProdutoEmQueda[] }) {
  if (quedas.length === 0) return null;
  const naHome = quedas.slice(0, MAXIMO_NA_HOME);
  return (
    <section
      id="queda-de-preco"
      aria-label="Queda de preço"
      className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 p-4 shadow-2xl sm:p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <CabecalhoDaQueda total={quedas.length} comLink={quedas.length > 1} />
        <GradeDeQuedas quedas={naHome} />
        {quedas.length > naHome.length && (
          <div className="mt-5 text-center">
            <Link
              href="/queda-de-preco"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
            >
              {quedas.length - naHome.length === 1
                ? "Ver mais 1 produto que baixou"
                : `Ver mais ${quedas.length - naHome.length} produtos que baixaram`}{" "}
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
