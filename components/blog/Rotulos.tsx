import { nomeDaCategoria } from "@/lib/blog/categorias";
import { dataCurta } from "@/lib/blog/texto";
import type { ArtigoResumido } from "@/lib/blog/tipos";

export function RotuloDeCategoria({ categoria }: { categoria: ArtigoResumido["categoria"] }) {
  return <span className="b-categoria">{nomeDaCategoria(categoria)}</span>;
}

/** Data e tempo de leitura, separados por uma barra fina. */
export function DadosDoArtigo({
  artigo,
  className = "",
}: {
  artigo: Pick<ArtigoResumido, "publicadoEm" | "minutos">;
  className?: string;
}) {
  return (
    <p className={`flex items-center gap-2.5 text-[0.8125rem] text-[var(--b-tinta-3)] ${className}`}>
      <time dateTime={artigo.publicadoEm}>{dataCurta(artigo.publicadoEm)}</time>
      <span aria-hidden className="h-3 w-px bg-[var(--b-linha-forte)]" />
      <span>{artigo.minutos} min de leitura</span>
    </p>
  );
}
