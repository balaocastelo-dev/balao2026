import Link from "next/link";
import { CATEGORIAS } from "@/lib/blog/categorias";
import { prenderUnidades } from "@/lib/blog/texto";
import type { ArtigoResumido } from "@/lib/blog/tipos";

const POR_CATEGORIA = 12;

/**
 * O índice no pé da página do blog: os títulos, em texto, por categoria.
 *
 * A lista de cartões acima carrega aos poucos, então parte dos artigos só
 * aparece depois de rolar. Aqui todos têm um link que já vem na página — bom
 * para quem procura um título e para o Google achar os artigos mais antigos.
 */
export default function IndiceDeArtigos({ artigos }: { artigos: ArtigoResumido[] }) {
  const grupos = CATEGORIAS.map((categoria) => ({
    categoria,
    itens: artigos.filter((a) => a.categoria === categoria.slug),
  })).filter((g) => g.itens.length > 0);

  if (grupos.length === 0) return null;

  return (
    <nav aria-labelledby="indice-do-blog" className="mt-20 border-t border-[var(--b-linha)] pt-10">
      <h2 id="indice-do-blog" className="b-titulo text-[1.625rem] text-white sm:text-[2rem]">
        Índice por assunto
      </h2>
      <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {grupos.map(({ categoria, itens }) => (
          <div key={categoria.slug}>
            <h3 className="text-[0.9375rem] font-bold text-white">
              <Link href={`/blog/categoria/${categoria.slug}`} prefetch={false} className="b-categoria hover:underline">
                {categoria.nome}
              </Link>
            </h3>
            <ul className="mt-3.5 space-y-2.5">
              {itens.slice(0, POR_CATEGORIA).map((artigo) => (
                <li key={artigo.slug}>
                  <Link
                    href={`/blog/${artigo.slug}`}
                    prefetch={false}
                    className="text-[0.875rem] leading-snug text-[var(--b-tinta-3)] hover:text-white hover:underline"
                  >
                    {prenderUnidades(artigo.titulo)}
                  </Link>
                </li>
              ))}
            </ul>
            {itens.length > POR_CATEGORIA ? (
              <Link href={`/blog/categoria/${categoria.slug}`} prefetch={false} className="b-link mt-3.5 inline-block text-[0.8125rem] font-bold">
                Ver os {itens.length} artigos
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </nav>
  );
}
