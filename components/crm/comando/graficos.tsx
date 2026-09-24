"use client";

import { useState } from "react";

// Gráficos do painel da operação.
//
// São feitos à mão, em SVG, de propósito: o painel já carrega muita coisa e
// uma biblioteca de gráfico inteira para duas barras não se paga. As regras
// seguidas aqui: um eixo só, marca fina, rótulo direto só onde ajuda, grade
// discreta, e o texto sempre na cor do texto — nunca na cor da série.

// Duas cores conferidas para daltonismo (deutan ΔE 22,7 / normal ΔE 24,4).
export const COR_ENTRADA = "#0a6e3d";
export const COR_SAIDA = "#3b6fd4";
export const COR_ALERTA = "#c2571a";

const INK = "#202124";
const INK_FRACO = "#5f6368";
const GRADE = "#e3e3e3";

export function formatarDuracao(segundos: number) {
  const s = Math.max(0, Math.round(segundos || 0));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return resto ? `${h}h${String(resto).padStart(2, "0")}` : `${h}h`;
}

export function formatarDia(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Cartão de número — para o que é uma leitura só, não um gráfico. */
export function Indicador({
  titulo,
  valor,
  detalhe,
  destaque,
  atencao,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
  atencao?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        atencao ? "border-[#c2571a]/40 bg-[#fdf1e8]" : destaque ? "border-[#0f9d58]/40 bg-[#e7f6ec]" : "border-[#e3e3e3] bg-white"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">{titulo}</div>
      <div
        className="mt-1 text-2xl font-bold tabular-nums"
        style={{ color: atencao ? "#a8471a" : INK }}
      >
        {valor}
      </div>
      {detalhe && <div className="mt-0.5 text-[11px] text-[#5f6368]">{detalhe}</div>}
    </div>
  );
}

type PontoDia = { dia: string; entradas: number; saidas: number };

/** Barras agrupadas por dia: o que entrou e o que a loja respondeu. */
export function BarrasPorDia({ dados }: { dados: PontoDia[] }) {
  const [sobre, setSobre] = useState<number | null>(null);
  if (!dados.length) return <Vazio texto="Sem mensagens no período." />;

  const maximo = Math.max(1, ...dados.map((d) => Math.max(d.entradas, d.saidas)));
  const larguraGrupo = 100 / dados.length;
  const alturaCaixa = 160;

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-[11px] text-[#5f6368]">
        <Legenda cor={COR_ENTRADA} texto="Recebidas" />
        <Legenda cor={COR_SAIDA} texto="Enviadas" />
      </div>
      <div className="relative" style={{ height: alturaCaixa + 22 }}>
        <svg
          viewBox={`0 0 100 ${alturaCaixa}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: alturaCaixa }}
          role="img"
          aria-label="Mensagens recebidas e enviadas por dia"
        >
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2="100"
              y1={alturaCaixa - f * alturaCaixa}
              y2={alturaCaixa - f * alturaCaixa}
              stroke={GRADE}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {dados.map((d, i) => {
            const x = i * larguraGrupo;
            const largura = larguraGrupo * 0.32;
            const hE = (d.entradas / maximo) * (alturaCaixa - 8);
            const hS = (d.saidas / maximo) * (alturaCaixa - 8);
            return (
              <g key={d.dia} onMouseEnter={() => setSobre(i)} onMouseLeave={() => setSobre(null)}>
                <rect x={x} y="0" width={larguraGrupo} height={alturaCaixa} fill="transparent" />
                <rect
                  x={x + larguraGrupo * 0.14}
                  y={alturaCaixa - hE}
                  width={largura}
                  height={hE}
                  fill={COR_ENTRADA}
                  rx="1"
                  opacity={sobre === null || sobre === i ? 1 : 0.45}
                />
                <rect
                  x={x + larguraGrupo * 0.52}
                  y={alturaCaixa - hS}
                  width={largura}
                  height={hS}
                  fill={COR_SAIDA}
                  rx="1"
                  opacity={sobre === null || sobre === i ? 1 : 0.45}
                />
              </g>
            );
          })}
        </svg>
        <div className="flex w-full">
          {dados.map((d, i) => (
            <div
              key={d.dia}
              className="truncate text-center text-[10px] tabular-nums"
              style={{ width: `${larguraGrupo}%`, color: sobre === i ? INK : INK_FRACO }}
            >
              {formatarDia(d.dia)}
            </div>
          ))}
        </div>
        {sobre !== null && dados[sobre] && (
          <div
            className="pointer-events-none absolute -top-1 rounded-lg border border-[#e3e3e3] bg-white px-2 py-1 text-[11px] shadow-md"
            style={{ left: `min(calc(${sobre * larguraGrupo}% ), calc(100% - 130px))` }}
          >
            <div className="font-bold text-[#202124]">{formatarDia(dados[sobre].dia)}</div>
            <div className="tabular-nums text-[#5f6368]">
              {dados[sobre].entradas} recebidas · {dados[sobre].saidas} enviadas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Em que horário o cliente procura a loja. Série única: sem legenda. */
export function BarrasPorHora({ dados }: { dados: { hora: number; total: number }[] }) {
  const [sobre, setSobre] = useState<number | null>(null);
  const porHora = Array.from({ length: 24 }, (_, h) => dados.find((d) => d.hora === h)?.total || 0);
  const maximo = Math.max(1, ...porHora);
  if (!dados.length) return <Vazio texto="Sem mensagens no período." />;

  const pico = porHora.indexOf(maximo);
  return (
    <div>
      <div className="flex h-[120px] items-end gap-[2px]">
        {porHora.map((total, h) => (
          <div
            key={h}
            className="group relative flex-1"
            onMouseEnter={() => setSobre(h)}
            onMouseLeave={() => setSobre(null)}
          >
            <div
              className="w-full rounded-t-[2px]"
              style={{
                height: Math.max(2, (total / maximo) * 110),
                background: h === pico ? COR_ENTRADA : "#9ec9b1",
                opacity: sobre === null || sobre === h ? 1 : 0.5,
              }}
            />
            {sobre === h && (
              <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#e3e3e3] bg-white px-2 py-1 text-[11px] shadow-md">
                <span className="font-bold text-[#202124]">{String(h).padStart(2, "0")}h</span>{" "}
                <span className="tabular-nums text-[#5f6368]">{total} mensagens</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[#5f6368]">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
      <p className="mt-1 text-[11px] text-[#5f6368]">
        Pico às <strong className="text-[#202124]">{String(pico).padStart(2, "0")}h</strong> — é a hora
        em que vale mais ter gente respondendo.
      </p>
    </div>
  );
}

/** Lista com barra proporcional: funil, interesses, vendedores. */
export function ListaComBarra({
  itens,
  cor = COR_ENTRADA,
  sufixo = "",
  aoClicar,
}: {
  itens: { rotulo: string; valor: number; detalhe?: string; chave?: string }[];
  cor?: string;
  sufixo?: string;
  aoClicar?: (chave: string) => void;
}) {
  if (!itens.length) return <Vazio texto="Nada por aqui ainda." />;
  const maximo = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="space-y-1.5">
      {itens.map((i) => {
        const conteudo = (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-xs font-medium text-[#202124]">{i.rotulo}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#202124]">
                {i.valor.toLocaleString("pt-BR")}
                {sufixo}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0f2f5]">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.max(2, (i.valor / maximo) * 100)}%`, background: cor }}
              />
            </div>
            {i.detalhe && <div className="mt-0.5 text-[10px] text-[#5f6368]">{i.detalhe}</div>}
          </>
        );
        return (
          <li key={i.rotulo}>
            {aoClicar && i.chave ? (
              <button
                type="button"
                onClick={() => aoClicar(i.chave!)}
                className="w-full cursor-pointer rounded-lg px-1 py-0.5 text-left hover:bg-[#f0f2f5]"
              >
                {conteudo}
              </button>
            ) : (
              <div className="px-1 py-0.5">{conteudo}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: cor }} />
      {texto}
    </span>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <div className="py-6 text-center text-xs text-[#5f6368]">{texto}</div>;
}

export function Secao({
  titulo,
  ajuda,
  children,
  acao,
}: {
  titulo: string;
  ajuda?: string;
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e3e3e3] bg-white p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#202124]">{titulo}</h3>
          {ajuda && <p className="mt-0.5 text-[11px] text-[#5f6368]">{ajuda}</p>}
        </div>
        {acao}
      </header>
      {children}
    </section>
  );
}
