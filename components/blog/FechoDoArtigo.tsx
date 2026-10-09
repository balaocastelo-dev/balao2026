import TextoRico from "@/components/blog/TextoRico";
import { prenderUnidades } from "@/lib/blog/texto";
import type { Analise, Artigo, Pergunta } from "@/lib/blog/tipos";

/**
 * O que vem depois do texto: veredito (nas análises), perguntas frequentes e
 * fontes. São seções do artigo — entram no sumário — e cada uma alimenta um
 * dado estruturado: Review, FAQPage e as citações do BlogPosting.
 */

function nota(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function Veredito({ analise }: { analise: Analise }) {
  return (
    <section aria-labelledby="veredito" className="b-prosa">
      <h2 id="veredito">Veredito</h2>
      <div className="b-bloco !mt-0 rounded-[18px] bg-[var(--b-painel)] p-6 ring-1 ring-inset ring-[var(--b-linha)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-9">
          <div className="flex-none">
            <p className="text-[0.8125rem] font-semibold text-[var(--b-tinta-3)]">{analise.item.nome}</p>
            <p className="b-titulo mt-1 text-white">
              <span className="text-[4rem] leading-none sm:text-[4.75rem]">{nota(analise.nota)}</span>
              <span className="ml-1 text-[1.25rem] font-semibold text-[var(--b-tinta-3)]">/ 10</span>
            </p>
            {analise.indicadoPara ? (
              <p className="mt-3 max-w-[14rem] text-[0.875rem] leading-snug text-[var(--b-tinta-2)]">
                <span className="font-bold text-white">Para quem serve: </span>
                {analise.indicadoPara}
              </p>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="b-serifa text-[1.0625rem] leading-[1.65] text-[var(--b-tinta-2)]">{prenderUnidades(analise.veredito)}</p>

            {analise.criterios?.length ? (
              <dl className="mt-6 space-y-3">
                {analise.criterios.map((c) => (
                  <div key={c.nome} className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-x-4 gap-y-1.5">
                    <dt className="text-[0.875rem] text-[var(--b-tinta-2)]">{c.nome}</dt>
                    <dd className="text-right text-[0.875rem] font-bold tabular-nums text-white">{nota(c.nota)}</dd>
                    <div aria-hidden className="col-span-2 h-1.5 rounded-full bg-[rgba(148,163,184,0.14)]">
                      <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(10, c.nota)) * 10}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PerguntasFrequentes({ perguntas }: { perguntas: Pergunta[] }) {
  if (perguntas.length === 0) return null;
  return (
    <section aria-labelledby="perguntas-frequentes" className="b-prosa">
      <h2 id="perguntas-frequentes">Perguntas frequentes</h2>
      <div className="b-bloco !mt-0 divide-y divide-[var(--b-linha)] border-y border-[var(--b-linha)]">
        {perguntas.map((p, i) => (
          <details key={p.pergunta} open={i === 0} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 py-4 text-[1.0625rem] font-bold leading-snug text-white [&::-webkit-details-marker]:hidden">
              {prenderUnidades(p.pergunta)}
              <span aria-hidden className="mt-0.5 flex-none text-[1.375rem] leading-none text-[var(--b-tinta-3)] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="b-serifa pb-5 pr-8 text-[1.0625rem] leading-[1.65] text-[var(--b-tinta-2)]">{prenderUnidades(p.resposta)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FontesEMetodo({ artigo }: { artigo: Pick<Artigo, "fontes" | "metodologia"> }) {
  const fontes = artigo.fontes ?? [];
  if (fontes.length === 0 && !artigo.metodologia) return null;
  return (
    <section aria-labelledby="fontes" className="b-prosa">
      <h2 id="fontes">{artigo.metodologia ? "Fontes e método" : "Fontes"}</h2>
      {artigo.metodologia ? (
        <p className="!text-[1rem] !leading-[1.65] !text-[var(--b-tinta-2)]">
          <TextoRico texto={artigo.metodologia} />
        </p>
      ) : null}
      {fontes.length > 0 ? (
        <ol className="b-lista !text-[0.9375rem]">
          {fontes.map((f) => (
            <li key={f.url}>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="b-link">
                {f.nome}
              </a>
              {f.data ? ` (${f.data})` : ""}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
