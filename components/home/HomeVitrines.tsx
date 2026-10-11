import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  PackageCheck,
  Printer,
  MonitorSmartphone,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SeloProntaEntrega, { AvisoImagemIlustrativa } from "@/components/SeloProntaEntrega";
import { getProductHref, type Product } from "@/lib/utils";
import { atalhosDeDepartamento, montarVitrines, type Vitrine } from "@/lib/home/vitrines";

// ============================================================
// Parte de produtos da página inicial, em três desenhos para o Thiago
// escolher (?versao=a, b ou c). O banner e o destaque do MacBook M5 ficam
// como estão; isto substitui o menu lateral e as prateleiras.
// ============================================================

export type Variante = "a" | "b" | "c";

const ICONES: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "pc-gamer": MonitorSmartphone,
  notebooks: Laptop,
  monitores: Monitor,
  "pronta-entrega": PackageCheck,
  hardware: Cpu,
  perifericos: Headphones,
  games: Gamepad2,
  impressao: Printer,
};

function precoTexto(p: Product) {
  return String(p.price || "").replace("R$", "").trim();
}

function Cabecalho({ v, compacto = false }: { v: Vitrine; compacto?: boolean }) {
  const Icone = ICONES[v.id] || PackageCheck;
  const verde = v.id === "pronta-entrega";
  return (
    <div className={`flex items-end justify-between gap-4 ${compacto ? "mb-4" : "mb-6"}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl ${verde ? "bg-emerald-500" : "bg-[#E60012]"} ${
            compacto ? "h-9 w-9" : "h-11 w-11"
          } text-white shadow-lg`}
        >
          <Icone size={compacto ? 18 : 22} />
        </span>
        <div>
          <h2 className={`font-black tracking-tight text-white ${compacto ? "text-lg" : "text-2xl lg:text-[1.7rem]"}`}>{v.titulo}</h2>
          {!compacto && <p className="text-sm text-slate-400">{v.subtitulo}</p>}
        </div>
      </div>
      <Link
        href={v.href}
        className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-[#E60012] hover:bg-[#E60012] hover:text-white"
      >
        Ver todos <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/** Cartão enxuto: foto, nome, preço. Usado nos desenhos B e C. */
function CartaoCompacto({ p, mini = false }: { p: Product; mini?: boolean }) {
  return (
    <Link
      href={getProductHref(p)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-0.5 hover:border-slate-600 hover:shadow-xl"
    >
      <div className={`relative overflow-hidden bg-white ${mini ? "pt-[85%]" : "pt-[100%]"}`}>
        <SeloProntaEntrega availability={p.availability} tamanho="pequeno" />
        <AvisoImagemIlustrativa url={p.image} tamanho="pequeno" />
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-contain p-3 transition duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className={`flex flex-1 flex-col ${mini ? "p-2.5" : "p-3"}`}>
        <h3 className={`line-clamp-2 font-semibold leading-snug text-slate-100 group-hover:text-white ${mini ? "text-xs" : "text-sm"}`} title={p.name}>
          {p.name}
        </h3>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-[#ff3b47]">R$</span>
            <span className={`font-black text-[#ff3b47] ${mini ? "text-base" : "text-lg"}`}>{precoTexto(p)}</span>
            <span className="text-[10px] font-semibold text-slate-400">no Pix</span>
          </div>
          {p.price_card && !mini && <p className="text-[11px] text-slate-500">ou {p.price_card} no cartão</p>}
        </div>
      </div>
    </Link>
  );
}

function Atalhos({ produtos }: { produtos: Product[] }) {
  const atalhos = atalhosDeDepartamento(produtos);
  return (
    <nav aria-label="Departamentos" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
      {atalhos.map((a) => {
        const Icone = ICONES[a.id] || PackageCheck;
        const verde = a.id === "pronta-entrega";
        return (
          <Link
            key={a.id}
            href={a.href}
            className={`group flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
              verde
                ? "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400"
                : "border-slate-800 bg-slate-900 hover:border-[#E60012]"
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${verde ? "bg-emerald-500" : "bg-slate-800 group-hover:bg-[#E60012]"} text-white transition`}>
              <Icone size={20} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">{a.titulo}</span>
              <span className="block text-[11px] text-slate-400">{a.total.toLocaleString("pt-BR")} produtos</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function painel(verde = false) {
  return `rounded-[1.75rem] border p-5 sm:p-7 ${
    verde ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-slate-900" : "border-slate-800 bg-slate-900/70"
  }`;
}

// ---------- A: vitrines em grade, uma por departamento ----------

function DesenhoA({ produtos }: { produtos: Product[] }) {
  const vitrines = montarVitrines(produtos, 8);
  return (
    <div className="space-y-10">
      <Atalhos produtos={produtos} />
      {vitrines.map((v) => (
        <section key={v.id} className={painel(v.id === "pronta-entrega")}>
          <Cabecalho v={v} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {v.produtos.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------- B: uma linha por departamento, cartões enxutos ----------

function DesenhoB({ produtos }: { produtos: Product[] }) {
  const vitrines = montarVitrines(produtos, 6);
  const atalhos = atalhosDeDepartamento(produtos);
  return (
    <div className="space-y-8">
      <nav aria-label="Departamentos" className="flex flex-wrap gap-2">
        {atalhos.map((a) => (
          <Link
            key={a.id}
            href={a.href}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              a.id === "pronta-entrega"
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-[#E60012] hover:text-white"
            }`}
          >
            {a.titulo}
          </Link>
        ))}
      </nav>
      {vitrines.map((v) => (
        <section key={v.id} className={painel(v.id === "pronta-entrega")}>
          <Cabecalho v={v} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {v.produtos.map((p) => (
              <CartaoCompacto key={p.id} p={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------- C: mosaico, dois departamentos lado a lado ----------

function DesenhoC({ produtos }: { produtos: Product[] }) {
  const vitrines = montarVitrines(produtos, 4);
  const pares: Vitrine[][] = [];
  for (let i = 0; i < vitrines.length; i += 2) pares.push(vitrines.slice(i, i + 2));
  return (
    <div className="space-y-6">
      <Atalhos produtos={produtos} />
      {pares.map((par, i) => (
        <div key={i} className="grid gap-6 lg:grid-cols-2">
          {par.map((v) => (
            <section key={v.id} className={painel(v.id === "pronta-entrega")}>
              <Cabecalho v={v} compacto />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {v.produtos.map((p) => (
                  <CartaoCompacto key={p.id} p={p} mini />
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomeVitrines({ variante, produtos }: { variante: Variante; produtos: Product[] }) {
  return (
    <div id="vitrines-home">
      {variante === "b" ? <DesenhoB produtos={produtos} /> : variante === "c" ? <DesenhoC produtos={produtos} /> : <DesenhoA produtos={produtos} />}
    </div>
  );
}
