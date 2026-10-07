import Link from "next/link";

/**
 * Paginação enxuta: primeira, última e uma janela em volta da página atual.
 * (Uma categoria grande tem mais de cem páginas; listar todas enchia a tela.)
 */
export function paginasVisiveis(atual: number, total: number, raio = 2): (number | "…")[] {
  const numeros = new Set<number>([1, total]);
  for (let p = atual - raio; p <= atual + raio; p++) if (p >= 1 && p <= total) numeros.add(p);
  const ordenados = [...numeros].sort((a, b) => a - b);
  const saida: (number | "…")[] = [];
  ordenados.forEach((p, i) => {
    if (i > 0 && p - ordenados[i - 1] > 1) saida.push("…");
    saida.push(p);
  });
  return saida;
}

export default function Paginacao({
  atual,
  total,
  href,
  rotulo = "Paginação",
}: {
  atual: number;
  total: number;
  /** Monta o endereço de uma página. */
  href: (pagina: number) => string;
  rotulo?: string;
}) {
  if (total <= 1) return null;
  const base = "min-w-11 rounded-xl border px-4 py-2 text-center text-sm font-bold transition-colors";
  const normal = "border-[var(--site-border)] bg-[var(--site-panel-soft)] text-[var(--site-text)] hover:border-red-500 hover:text-red-600";

  return (
    <nav aria-label={rotulo} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {atual > 1 && (
        <Link href={href(atual - 1)} rel="prev" className={`${base} ${normal}`}>
          Anterior
        </Link>
      )}
      {paginasVisiveis(atual, total).map((p, i) =>
        p === "…" ? (
          <span key={`salto-${i}`} className="px-1 text-[var(--site-muted)]" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === atual ? "page" : undefined}
            className={`${base} ${p === atual ? "border-red-600 bg-red-600 text-white" : normal}`}
          >
            {p}
          </Link>
        )
      )}
      {atual < total && (
        <Link href={href(atual + 1)} rel="next" className={`${base} ${normal}`}>
          Próxima
        </Link>
      )}
    </nav>
  );
}
