"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/utils";

// Uma fileira de produtos: uma linha só, que rola para o lado. No celular
// rola com o dedo; no computador, pelas setas (ou pelo trackpad).

export default function FileiraDeProdutos({
  id,
  numero,
  titulo,
  subtitulo,
  produtos,
}: {
  id: string;
  /** Posição da fileira na página (1, 2, 3...). */
  numero: number;
  titulo: string;
  subtitulo: string;
  produtos: Product[];
}) {
  const trilho = useRef<HTMLDivElement>(null);

  const rolar = (sentido: -1 | 1) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: sentido * Math.max(240, el.clientWidth * 0.9), behavior: "smooth" });
  };

  if (produtos.length === 0) return null;

  const botao =
    "hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#161f32] text-slate-200 transition hover:border-[#E60012] hover:bg-[#E60012] hover:text-white";

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E60012] text-sm font-black text-white shadow-lg">
            {numero}
          </span>
          <div>
            <h3 id={`${id}-titulo`} className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {titulo}
            </h3>
            <p className="text-sm text-slate-400">{subtitulo}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => rolar(-1)} className={botao} aria-label={`Voltar em ${titulo}`}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => rolar(1)} className={botao} aria-label={`Avançar em ${titulo}`}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={trilho}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:gap-6"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
      >
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]"
          >
            <ProductCard product={produto} />
          </div>
        ))}
      </div>
    </section>
  );
}
