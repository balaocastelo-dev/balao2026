import Image from "next/image";
import Link from "next/link";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import TextoRico from "@/components/blog/TextoRico";
import { resolverChamada } from "@/lib/blog/chamadas";
import { montarSumario, prenderUnidades, semQuebraRuim } from "@/lib/blog/texto";
import type {
  Artigo,
  Bloco,
  BlocoBenchmark,
  BlocoChamada,
  BlocoCitacao,
  BlocoDestaque,
  BlocoProsContras,
  BlocoResumo,
  BlocoTabela,
  Fonte,
} from "@/lib/blog/tipos";

/**
 * Transforma os blocos de um artigo em página.
 *
 * Cada tipo de bloco tem um componente aqui. Artigo escrito no repositório e
 * artigo importado do Soro passam pelo mesmo caminho, então os dois saem com
 * a mesma cara — e nenhum HTML de fora é injetado na página.
 */

function LinhaDaFonte({ fonte, nota }: { fonte?: Fonte; nota?: string }) {
  if (!fonte && !nota) return null;
  return (
    <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--b-tinta-3)]">
      {fonte ? (
        <>
          Fonte:{" "}
          <a href={fonte.url} target="_blank" rel="noopener noreferrer" className="b-link">
            {fonte.nome}
          </a>
          {fonte.data ? `, ${fonte.data}. ` : ". "}
        </>
      ) : null}
      {nota ? <TextoRico texto={nota} /> : null}
    </p>
  );
}

function EmResumo({ bloco }: { bloco: BlocoResumo }) {
  return (
    <aside aria-label={bloco.titulo ?? "Em resumo"} className="b-bloco rounded-[16px] bg-[var(--b-painel)] p-6 ring-1 ring-inset ring-[var(--b-linha)] sm:p-7">
      <p className="b-titulo text-[1.125rem] text-white">{bloco.titulo ?? "Em resumo"}</p>
      <ul className="mt-4 space-y-3.5">
        {bloco.itens.map((item, i) => (
          <li key={i} className="b-serifa flex gap-3.5 text-[1.0625rem] leading-[1.6] text-[var(--b-tinta-2)]">
            <span aria-hidden className="mt-[0.6em] size-2 flex-none bg-[var(--b-vermelho)]" />
            <span>
              <TextoRico texto={item} />
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const TONS = {
  dica: { Icone: Lightbulb, rotulo: "Dica", borda: "border-white" },
  atencao: { Icone: TriangleAlert, rotulo: "Atenção", borda: "border-[var(--b-vermelho)]" },
  nota: { Icone: Info, rotulo: "Nota", borda: "border-[var(--b-linha-forte)]" },
} as const;

function CaixaDeDestaque({ bloco }: { bloco: BlocoDestaque }) {
  const { Icone, rotulo, borda } = TONS[bloco.tom];
  return (
    <aside className={`b-bloco border-l-[3px] ${borda} py-1 pl-5 sm:pl-6`}>
      <p className="flex items-center gap-2 text-[0.9375rem] font-bold text-white">
        <Icone aria-hidden className="size-[1.125rem]" />
        {bloco.titulo ?? rotulo}
      </p>
      <p className="b-serifa mt-2 text-[1.0625rem] leading-[1.65] text-[var(--b-tinta-2)]">
        <TextoRico texto={bloco.texto} />
      </p>
    </aside>
  );
}

function numero(valor: number): string {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function GraficoDeBenchmark({ bloco }: { bloco: BlocoBenchmark }) {
  const maiorMelhor = bloco.maiorMelhor !== false;
  const maximo = Math.max(1, ...bloco.grupos.flatMap((g) => g.barras.map((b) => b.valor)));

  // A legenda sai das próprias barras: cada nome aparece uma vez, com a cor que usa.
  const legenda = new Map<string, boolean>();
  for (const grupo of bloco.grupos) for (const barra of grupo.barras) if (!legenda.has(barra.nome)) legenda.set(barra.nome, Boolean(barra.destaque));

  return (
    <figure className="b-bloco rounded-[16px] bg-[var(--b-painel)] p-5 ring-1 ring-inset ring-[var(--b-linha)] sm:p-7">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <span className="b-titulo text-[1.125rem] text-white sm:text-[1.25rem]">{bloco.titulo}</span>
        <span className="flex gap-4 text-[0.8125rem] text-[var(--b-tinta-2)]">
          {[...legenda].map(([nome, destaque]) => (
            <span key={nome} className="inline-flex items-center gap-2">
              <span aria-hidden className="b-barra inline-block !h-2.5 w-2.5 !min-w-0 !rounded-[2px]" data-destaque={destaque} />
              {nome}
            </span>
          ))}
        </span>
      </figcaption>

      <div className="mt-6 space-y-6" aria-hidden>
        {bloco.grupos.map((grupo) => {
          const lider = grupo.barras.find((b) => b.destaque);
          const outra = grupo.barras.find((b) => !b.destaque);
          const diferenca =
            lider && outra && grupo.barras.length === 2 && outra.valor > 0 && lider.valor > 0
              ? Math.round(((maiorMelhor ? lider.valor / outra.valor : outra.valor / lider.valor) - 1) * 100)
              : null;

          return (
            <div key={`${grupo.rotulo}-${grupo.detalhe ?? ""}`} className="grid gap-x-6 gap-y-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-center">
              <div>
                <p className="text-[0.9375rem] font-bold leading-snug text-white">{grupo.rotulo}</p>
                {grupo.detalhe ? <p className="mt-0.5 text-[0.8125rem] text-[var(--b-tinta-3)]">{grupo.detalhe}</p> : null}
                {diferenca !== null && diferenca > 0 ? (
                  <p className="mt-1 text-[0.8125rem] font-semibold text-[var(--b-tinta-2)]">
                    {lider!.nome}: {diferenca}% à frente
                  </p>
                ) : null}
              </div>

              <div className="space-y-[2px]">
                {grupo.barras.map((barra) => (
                  <div
                    key={barra.nome}
                    className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.25rem] items-center gap-3"
                    title={`${grupo.rotulo}${grupo.detalhe ? ` (${grupo.detalhe})` : ""} — ${barra.nome}: ${numero(barra.valor)} ${bloco.unidade}`}
                  >
                    <span className="text-[0.8125rem] text-[var(--b-tinta-3)]">{barra.nome}</span>
                    <span className="b-barra-trilho">
                      <span className="b-barra block" data-destaque={Boolean(barra.destaque)} style={{ width: `${(barra.valor / maximo) * 100}%` }} />
                    </span>
                    <span className={`text-right text-[0.9375rem] tabular-nums ${barra.destaque ? "font-bold text-white" : "font-semibold text-[var(--b-tinta-2)]"}`}>
                      {numero(barra.valor)} <span className="text-[0.75rem] font-medium text-[var(--b-tinta-3)]">{bloco.unidade}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Os mesmos números em tabela, para leitor de tela. A classe vai em um
          bloco em volta: tabela ignora largura de 1px e alargava a página. */}
      <div className="sr-only">
      <table>
        <caption>{bloco.titulo}</caption>
        <thead>
          <tr>
            <th scope="col">Teste</th>
            <th scope="col">Condição</th>
            <th scope="col">Item</th>
            <th scope="col">Resultado ({bloco.unidade})</th>
          </tr>
        </thead>
        <tbody>
          {bloco.grupos.flatMap((grupo) =>
            grupo.barras.map((barra) => (
              <tr key={`${grupo.rotulo}-${grupo.detalhe ?? ""}-${barra.nome}`}>
                <th scope="row">{grupo.rotulo}</th>
                <td>{grupo.detalhe ?? ""}</td>
                <td>{barra.nome}</td>
                <td>{numero(barra.valor)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      </div>

      <LinhaDaFonte fonte={bloco.fonte} nota={bloco.nota} />
    </figure>
  );
}

function TabelaComparativa({ bloco }: { bloco: BlocoTabela }) {
  const destaque = (i: number) => (bloco.colunaDestaque === i ? "b-coluna-destaque" : undefined);
  return (
    <figure className="b-bloco">
      {bloco.titulo ? <figcaption className="b-titulo mb-3 text-[1.125rem] text-white sm:text-[1.25rem]">{bloco.titulo}</figcaption> : null}
      <div className="b-tabela-rolagem" tabIndex={0} role="group" aria-label={bloco.titulo ?? "Tabela comparativa"}>
        <table className="b-tabela" data-larga={bloco.colunas.length > 3}>
          <thead>
            <tr>
              {bloco.colunas.map((coluna, i) => (
                <th key={i} scope="col" className={destaque(i)}>
                  {coluna || <span className="sr-only">Item</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloco.linhas.map((linha, l) => (
              <tr key={l}>
                {linha.map((celula, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className={destaque(i)}>
                      <TextoRico texto={celula} />
                    </th>
                  ) : (
                    <td key={i} className={destaque(i)}>
                      <TextoRico texto={celula} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LinhaDaFonte fonte={bloco.fonte} nota={bloco.nota} />
    </figure>
  );
}

function ProsEContras({ bloco }: { bloco: BlocoProsContras }) {
  const coluna = (titulo: string, sinal: string, itens: string[], forte: boolean) => (
    <div className={`rounded-[16px] bg-[var(--b-painel)] p-6 ring-1 ring-inset ring-[var(--b-linha)] ${forte ? "border-t-[3px] border-white" : "border-t-[3px] border-[var(--b-linha-forte)]"}`}>
      <p className="b-titulo text-[1.125rem] text-white">{titulo}</p>
      <ul className="mt-4 space-y-3">
        {itens.map((item, i) => (
          <li key={i} className="flex gap-3 text-[0.9875rem] leading-[1.5] text-[var(--b-tinta-2)]">
            <span
              aria-hidden
              className={`mt-[0.1em] grid size-5 flex-none place-items-center rounded-full text-[0.875rem] font-bold leading-none ${
                forte ? "bg-white text-[#090d16]" : "border border-[var(--b-linha-forte)] text-[var(--b-tinta-3)]"
              }`}
            >
              {sinal}
            </span>
            <span>{prenderUnidades(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section aria-label={bloco.titulo ?? "Prós e contras"} className="b-bloco grid gap-4 sm:grid-cols-2">
      {coluna("Prós", "+", bloco.pros, true)}
      {coluna("Contras", "−", bloco.contras, false)}
    </section>
  );
}

function Citacao({ bloco }: { bloco: BlocoCitacao }) {
  return (
    <figure className="b-bloco border-l-[3px] border-[var(--b-vermelho)] pl-5 sm:pl-7">
      <blockquote cite={bloco.fonte.url} className="b-serifa text-[1.375rem] italic leading-[1.4] text-white sm:text-[1.625rem]">
        “{prenderUnidades(bloco.texto)}”
      </blockquote>
      <figcaption className="mt-4 text-[0.875rem] leading-relaxed text-[var(--b-tinta-3)]">
        <span className="font-bold text-[var(--b-tinta)]">{bloco.autor}</span>
        {bloco.cargo ? `, ${bloco.cargo}. ` : ". "}
        {bloco.traduzida ? "Tradução nossa. " : ""}
        <a href={bloco.fonte.url} target="_blank" rel="noopener noreferrer" className="b-link">
          Ver o original
        </a>
      </figcaption>
    </figure>
  );
}

function Chamada({ bloco, artigo }: { bloco: BlocoChamada; artigo: Artigo }) {
  const c = resolverChamada(bloco, artigo);
  const rastreio = {
    "data-conversion-source": "blog",
    "data-conversion-service": c.tema,
    "data-conversion-label": `${artigo.slug}: ${c.rotulo}`,
  };
  const botao =
    "inline-flex flex-none items-center justify-center rounded-full bg-[var(--b-vermelho)] px-5 py-2.5 text-[0.9375rem] font-bold text-white transition-colors hover:bg-[#c40010]";

  return (
    <aside
      aria-label="Atendimento da loja"
      className="b-bloco flex flex-col gap-5 rounded-[16px] bg-[var(--b-cartao)] p-6 ring-1 ring-inset ring-[var(--b-linha)] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7"
    >
      <div className="min-w-0">
        <p className="b-titulo text-[1.1875rem] text-white">{c.titulo}</p>
        <p className="mt-2 text-[0.9375rem] leading-[1.55] text-[var(--b-tinta-2)]">
          <TextoRico texto={c.texto} />
        </p>
      </div>
      <div className="flex flex-none flex-col items-start gap-2.5 sm:items-end">
        {c.externa ? (
          <a href={c.href} target="_blank" rel="noopener noreferrer" className={botao} {...rastreio}>
            {c.rotulo}
          </a>
        ) : (
          <>
            <Link href={c.href} prefetch={false} className={botao} {...rastreio}>
              {c.rotulo}
            </Link>
            <a href={c.whatsapp} target="_blank" rel="noopener noreferrer" className="b-link text-[0.8125rem]" {...rastreio}>
              ou pergunte no WhatsApp
            </a>
          </>
        )}
      </div>
    </aside>
  );
}

export default function BlocosDoArtigo({ artigo }: { artigo: Artigo }) {
  const { ids } = montarSumario(artigo.blocos);

  const desenhar = (bloco: Bloco, i: number) => {
    switch (bloco.tipo) {
      case "paragrafo":
        return (
          <p key={i}>
            <TextoRico texto={bloco.texto} />
          </p>
        );
      case "titulo": {
        const Tag = bloco.nivel === 2 ? "h2" : "h3";
        return (
          <Tag key={i} id={ids.get(bloco)}>
            {semQuebraRuim(bloco.texto)}
          </Tag>
        );
      }
      case "lista": {
        const Lista = bloco.ordenada ? "ol" : "ul";
        return (
          <Lista key={i} className="b-lista">
            {bloco.itens.map((item, n) => (
              <li key={n}>
                <TextoRico texto={item} />
              </li>
            ))}
          </Lista>
        );
      }
      case "resumo":
        return <EmResumo key={i} bloco={bloco} />;
      case "destaque":
        return <CaixaDeDestaque key={i} bloco={bloco} />;
      case "benchmark":
        return <GraficoDeBenchmark key={i} bloco={bloco} />;
      case "tabela":
        return <TabelaComparativa key={i} bloco={bloco} />;
      case "pros-contras":
        return <ProsEContras key={i} bloco={bloco} />;
      case "citacao":
        return <Citacao key={i} bloco={bloco} />;
      case "chamada":
        return <Chamada key={i} bloco={bloco} artigo={artigo} />;
      case "imagem":
        return (
          <figure key={i} className="b-bloco">
            <div className="b-capa relative aspect-[16/9] rounded-[14px] ring-1 ring-inset ring-white/10">
              <Image src={bloco.imagem.src} alt={bloco.imagem.alt} fill sizes="(min-width: 1024px) 704px, 100vw" />
            </div>
            {bloco.legenda ? <figcaption className="mt-2.5 text-[0.8125rem] text-[var(--b-tinta-3)]">{bloco.legenda}</figcaption> : null}
          </figure>
        );
    }
  };

  return <div className="b-prosa">{artigo.blocos.map(desenhar)}</div>;
}
