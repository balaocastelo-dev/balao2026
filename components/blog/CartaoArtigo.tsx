import Link from "next/link";
import CapaArtigo from "@/components/blog/CapaArtigo";
import { DadosDoArtigo, RotuloDeCategoria } from "@/components/blog/Rotulos";
import { semQuebraRuim } from "@/lib/blog/texto";
import type { ArtigoResumido } from "@/lib/blog/tipos";

type Props = {
  artigo: ArtigoResumido;
  /** Ocupa duas colunas, com a imagem ao lado do texto. */
  largo?: boolean;
  /** Entra com um movimento curto — usado nos cartões carregados ao rolar. */
  animar?: boolean;
  /** Nível do título: h2 na lista principal, h3 em "leia também". */
  nivel?: 2 | 3;
};

/**
 * O cartão da lista. Sem caixa em volta: a capa e o texto bastam, e a grade
 * respira melhor do que uma parede de retângulos iguais.
 */
export default function CartaoArtigo({ artigo, largo, animar, nivel = 2 }: Props) {
  const Titulo = nivel === 2 ? "h2" : "h3";

  return (
    <article className={`${largo ? "b-largo" : ""} ${animar ? "b-entra" : ""}`}>
      <Link
        href={`/blog/${artigo.slug}`}
        className={`group flex h-full flex-col gap-4 rounded-[16px] ${largo ? "sm:flex-row sm:items-stretch sm:gap-7" : ""}`}
      >
        <CapaArtigo
          artigo={artigo}
          sizes={
            largo
              ? "(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
              : "(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
          }
          className={`relative aspect-[3/2] w-full flex-none rounded-[14px] ring-1 ring-inset ring-white/10 ${
            largo ? "sm:aspect-auto sm:min-h-[19rem] sm:w-[56%]" : ""
          }`}
        />

        <div className={`min-w-0 flex-1 ${largo ? "sm:self-center" : ""}`}>
          <RotuloDeCategoria categoria={artigo.categoria} />
          <Titulo
            className={`b-titulo mt-2.5 text-white decoration-[var(--b-vermelho)] decoration-2 underline-offset-4 group-hover:underline ${
              largo ? "text-[1.375rem] sm:text-[1.75rem]" : "text-[1.25rem] sm:text-[1.3125rem]"
            }`}
          >
            {semQuebraRuim(artigo.titulo)}
          </Titulo>
          <p
            className={`b-serifa mt-2.5 text-[0.9875rem] leading-[1.6] text-[var(--b-tinta-2)] ${
              largo ? "line-clamp-4" : "line-clamp-3"
            }`}
          >
            {artigo.resumo}
          </p>
          <DadosDoArtigo artigo={artigo} className="mt-3.5" />
        </div>
      </Link>
    </article>
  );
}
