"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/utils";

// Carrossel da página do produto: uma linha que rola para o lado. No celular
// rola com o dedo (dois cards e um pedaço do terceiro, para mostrar que tem
// mais); no computador, pelas setas ou pelo trackpad.

export default function CarrosselDeSugestoes({
  id,
  titulo,
  subtitulo,
  produtos,
}: {
  id: string;
  titulo: string;
  subtitulo: string;
  produtos: Product[];
}) {
  const trilho = useRef<HTMLDivElement>(null);

  if (produtos.length === 0) return null;

  const rolar = (sentido: -1 | 1) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: sentido * Math.max(220, el.clientWidth * 0.85), behavior: "smooth" });
  };

  const botao =
    "hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[var(--site-border)] bg-[var(--site-panel-muted)] text-[var(--site-text)] transition hover:border-[#E60012] hover:bg-[#E60012] hover:text-white";

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={`${id}-titulo`} className="text-xl font-bold text-[var(--site-text)] sm:text-2xl">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-[var(--site-muted)]">{subtitulo}</p>
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
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 sm:gap-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="w-[44%] shrink-0 snap-start sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
          >
            <ProductCard product={produto} />
          </div>
        ))}
      </div>
    </section>
  );
}
