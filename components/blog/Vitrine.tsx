import Link from "next/link";
import CapaArtigo from "@/components/blog/CapaArtigo";
import { DadosDoArtigo, RotuloDeCategoria } from "@/components/blog/Rotulos";
import { semQuebraRuim } from "@/lib/blog/texto";
import type { ArtigoResumido } from "@/lib/blog/tipos";

/**
 * A vitrine do topo do blog: quatro artigos em grade assimétrica.
 * O primeiro ocupa mais da metade da largura e as duas linhas; os outros três
 * se dividem ao lado. No celular, viram uma coluna.
 */

const TAMANHOS = [
  // Onde cada peça aparece em cada largura de tela, para o navegador baixar a imagem certa.
  "(min-width: 1024px) 700px, 100vw",
  "(min-width: 1024px) 520px, 100vw",
  "(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw",
  "(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw",
];

const TITULOS = [
  "text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem]",
  "text-[1.375rem] sm:text-[1.625rem]",
  "text-[1.125rem] lg:text-[1.0625rem] xl:text-[1.1875rem]",
  "text-[1.125rem] lg:text-[1.0625rem] xl:text-[1.1875rem]",
];

export default function Vitrine({ artigos }: { artigos: ArtigoResumido[] }) {
  if (artigos.length === 0) return null;

  return (
    <section aria-label="Artigos em destaque" className="b-vitrine">
      {artigos.slice(0, 4).map((artigo, i) => (
        <article key={artigo.slug} className="relative flex">
          <Link
            href={`/blog/${artigo.slug}`}
            className="group relative flex min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-[18px] ring-1 ring-inset ring-white/10"
          >
            <CapaArtigo artigo={artigo} sizes={TAMANHOS[i]} prioridade={i === 0} comTexto className="absolute inset-0" />

            {/* O espaço em cima guarda a parte da imagem que fica à mostra: sem
                ele, um título longo subia e cobria a capa inteira no celular. */}
            <div className={`relative z-10 ${i === 0 ? "p-6 pt-44 sm:p-8 sm:pt-52 lg:p-10 lg:pt-48" : i === 1 ? "p-6 pt-24 sm:p-7 sm:pt-40 lg:pt-28" : "p-5 pt-24"}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <RotuloDeCategoria categoria={artigo.categoria} />
                {artigo.temAnalise && typeof artigo.nota === "number" ? (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[0.75rem] font-bold text-[#090d16]">
                    Nota {artigo.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
                  </span>
                ) : null}
              </div>

              <h2 className={`b-titulo mt-3 text-white ${TITULOS[i]} ${i >= 2 ? "line-clamp-4" : ""}`}>
                {semQuebraRuim(artigo.titulo)}
              </h2>

              {i === 0 ? (
                <p className="b-serifa mt-4 max-w-[38rem] text-[1.0625rem] leading-relaxed text-[var(--b-tinta-2)] sm:text-[1.125rem]">
                  {artigo.resumo}
                </p>
              ) : null}

              <DadosDoArtigo artigo={artigo} className={i === 0 ? "mt-5" : "mt-3"} />
            </div>
          </Link>
        </article>
      ))}
    </section>
  );
}
