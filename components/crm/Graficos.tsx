"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ============================================================
// Gráficos do dashboard.
//
// SVG escrito à mão, sem biblioteca de gráfico. Motivo: o pacote mais leve
// desse tipo passa de 100 KB no bundle, e aqui são três formas simples. Menos
// peso na página e nenhuma dependência nova para manter.
//
// Todos animam do zero até o valor quando entram na tela, e refazem a
// transição quando o número muda — é isso que dá a sensação de "ao vivo".
// ============================================================

/** Interpola do valor anterior até o novo em ~600ms, com desaceleração. */
function useValorAnimado(alvo: number, duracao = 600) {
  const [valor, setValor] = useState(alvo);
  const anterior = useRef(alvo);
  const quadro = useRef<number | null>(null);

  useEffect(() => {
    const de = anterior.current;
    const ate = Number.isFinite(alvo) ? alvo : 0;
    if (de === ate) return;

    // Quem prefere menos movimento vê o número trocar direto.
    const semAnimacao =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (semAnimacao) {
      anterior.current = ate;
      setValor(ate);
      return;
    }

    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      setValor(de + (ate - de) * suave);
      if (t < 1) quadro.current = requestAnimationFrame(passo);
      else anterior.current = ate;
    };
    quadro.current = requestAnimationFrame(passo);

    return () => {
      if (quadro.current) cancelAnimationFrame(quadro.current);
      anterior.current = ate;
    };
  }, [alvo, duracao]);

  return valor;
}

export function NumeroAnimado({
  valor,
  formato = "inteiro",
  className,
}: {
  valor: number;
  formato?: "inteiro" | "dinheiro" | "decimal";
  className?: string;
}) {
  const atual = useValorAnimado(valor);

  const texto = useMemo(() => {
    if (formato === "dinheiro") {
      return atual.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      });
    }
    if (formato === "decimal") return atual.toFixed(2).replace(".", ",");
    return Math.round(atual).toLocaleString("pt-BR");
  }, [atual, formato]);

  // `tabular-nums` trava a largura dos dígitos: sem isso o número treme
  // horizontalmente enquanto anima.
  return <span className={`tabular-nums ${className || ""}`}>{texto}</span>;
}

export interface PontoSerie {
  dia: string;
  recebidas: number;
  enviadas: number;
  clientesNovos: number;
  vendas?: number;
  faturamento?: number;
}

function rotuloDoDia(dia: string) {
  const [, mes, d] = dia.split("-");
  return `${d}/${mes}`;
}

/**
 * Linha dupla: o que entra e o que sai, por dia.
 *
 * Duas séries no mesmo eixo de propósito — o que interessa é a distância entre
 * elas. Quando a linha de recebidas passa a de enviadas, está entrando mais
 * conversa do que a equipe responde.
 */
export function GraficoDeLinhas({ serie }: { serie: PontoSerie[] }) {
  const largura = 720;
  const altura = 220;
  const margem = { topo: 16, direita: 12, baixo: 26, esquerda: 38 };

  const dados = serie.length ? serie : [];
  const maximo = Math.max(1, ...dados.flatMap((p) => [p.recebidas, p.enviadas]));

  const x = (i: number) =>
    margem.esquerda +
    (dados.length > 1 ? (i / (dados.length - 1)) * (largura - margem.esquerda - margem.direita) : 0);
  const y = (v: number) =>
    altura - margem.baixo - (v / maximo) * (altura - margem.topo - margem.baixo);

  const caminho = (chave: "recebidas" | "enviadas") =>
    dados.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p[chave]).toFixed(1)}`).join(" ");

  const area = (chave: "recebidas" | "enviadas") =>
    `${caminho(chave)} L ${x(dados.length - 1).toFixed(1)} ${altura - margem.baixo} L ${x(0).toFixed(
      1
    )} ${altura - margem.baixo} Z`;

  const [ativo, setAtivo] = useState<number | null>(null);
  const linhasDeGrade = [0, 0.25, 0.5, 0.75, 1];

  if (!dados.length) {
    return <VazioDoGrafico texto="Sem movimento registrado ainda." />;
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="w-full"
        role="img"
        aria-label="Mensagens recebidas e enviadas por dia"
      >
        <defs>
          <linearGradient id="areaRecebidas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaEnviadas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>

        {linhasDeGrade.map((f) => {
          const valor = Math.round(maximo * (1 - f));
          const py = margem.topo + f * (altura - margem.topo - margem.baixo);
          return (
            <g key={f}>
              <line
                x1={margem.esquerda}
                x2={largura - margem.direita}
                y1={py}
                y2={py}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeDasharray="3 4"
              />
              <text x={4} y={py + 4} fontSize="10" fill="currentColor" fillOpacity="0.45">
                {valor}
              </text>
            </g>
          );
        })}

        <path d={area("recebidas")} fill="url(#areaRecebidas)" />
        <path d={area("enviadas")} fill="url(#areaEnviadas)" />

        {/* A animação do traço redesenha a linha da esquerda para a direita
            quando os dados chegam. */}
        <path
          d={caminho("recebidas")}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animar-traco"
        />
        <path
          d={caminho("enviadas")}
          fill="none"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animar-traco"
        />

        {dados.map((p, i) => (
          <g key={p.dia}>
            <circle cx={x(i)} cy={y(p.recebidas)} r={ativo === i ? 4.5 : 2.5} fill="#38bdf8" />
            <circle cx={x(i)} cy={y(p.enviadas)} r={ativo === i ? 4.5 : 2.5} fill="#34d399" />
            {/* Faixa invisível larga: pegar o ponto exato com o mouse é difícil. */}
            <rect
              x={x(i) - 14}
              y={margem.topo}
              width={28}
              height={altura - margem.topo - margem.baixo}
              fill="transparent"
              onMouseEnter={() => setAtivo(i)}
              onMouseLeave={() => setAtivo(null)}
            />
          </g>
        ))}

        {dados.map((p, i) =>
          i % Math.ceil(dados.length / 7) === 0 || i === dados.length - 1 ? (
            <text
              key={`r-${p.dia}`}
              x={x(i)}
              y={altura - 8}
              fontSize="10"
              textAnchor="middle"
              fill="currentColor"
              fillOpacity="0.5"
            >
              {rotuloDoDia(p.dia)}
            </text>
          ) : null
        )}
      </svg>

      {ativo !== null && dados[ativo] && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${(x(ativo) / largura) * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="font-semibold">{rotuloDoDia(dados[ativo].dia)}</div>
          <div className="mt-1 text-sky-300">{dados[ativo].recebidas} recebidas</div>
          <div className="text-emerald-300">{dados[ativo].enviadas} enviadas</div>
          {dados[ativo].clientesNovos > 0 && (
            <div className="text-amber-300">{dados[ativo].clientesNovos} clientes novos</div>
          )}
        </div>
      )}

      <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-sky-400" /> Recebidas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-emerald-400" /> Enviadas
        </span>
      </div>
    </div>
  );
}

/** Barras horizontais — usado no funil e no ranking. */
export function GraficoDeBarras({
  itens,
  formato = "inteiro",
}: {
  itens: { id: string; nome: string; total: number; cor?: string }[];
  formato?: "inteiro" | "dinheiro";
}) {
  const maximo = Math.max(1, ...itens.map((i) => i.total));

  if (!itens.length) return <VazioDoGrafico texto="Nada por aqui ainda." />;

  return (
    <div className="flex flex-col gap-2.5">
      {itens.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="w-40 shrink-0 truncate text-xs text-slate-300" title={item.nome}>
            {item.nome}
          </div>
          <div className="h-6 flex-1 overflow-hidden rounded-md bg-white/5">
            <div
              className="h-full rounded-md transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(2, (item.total / maximo) * 100)}%`,
                backgroundColor: item.cor || "#38bdf8",
              }}
            />
          </div>
          <div className="w-24 shrink-0 text-right text-xs font-semibold text-white">
            <NumeroAnimado valor={item.total} formato={formato} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Anel de proporção. Mostra a fatia de cada etapa do funil sem virar pizza de
 * dez fatias ilegíveis: acima de 6 itens o resto vira "Outras".
 */
export function GraficoDeAnel({
  itens,
  centroRotulo,
  centroValor,
}: {
  itens: { id: string; nome: string; total: number; cor?: string }[];
  centroRotulo: string;
  centroValor: number;
}) {
  const ordenados = [...itens].sort((a, b) => b.total - a.total);
  const principais = ordenados.slice(0, 6);
  const resto = ordenados.slice(6);
  const fatias = resto.length
    ? [
        ...principais,
        { id: "outras", nome: "Outras", total: resto.reduce((s, i) => s + i.total, 0), cor: "#475569" },
      ]
    : principais;

  const total = fatias.reduce((s, i) => s + i.total, 0);
  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;

  if (!total) return <VazioDoGrafico texto="Nenhum cliente no funil ainda." />;

  let acumulado = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90">
        {fatias.map((fatia) => {
          const fracao = fatia.total / total;
          const traco = fracao * circunferencia;
          const deslocamento = acumulado * circunferencia;
          acumulado += fracao;
          return (
            <circle
              key={fatia.id}
              cx="70"
              cy="70"
              r={raio}
              fill="none"
              stroke={fatia.cor || "#38bdf8"}
              strokeWidth="16"
              strokeDasharray={`${traco} ${circunferencia - traco}`}
              strokeDashoffset={-deslocamento}
              className="transition-all duration-700 ease-out"
            />
          );
        })}
      </svg>

      <div className="min-w-0 flex-1">
        <div className="mb-3">
          <div className="text-2xl font-bold text-white">
            <NumeroAnimado valor={centroValor} />
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400">{centroRotulo}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          {fatias.map((fatia) => (
            <div key={fatia.id} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: fatia.cor || "#38bdf8" }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-300">{fatia.nome}</span>
              <span className="font-semibold text-white">{fatia.total}</span>
              <span className="w-10 text-right text-slate-500">
                {Math.round((fatia.total / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Barras por hora do dia — mostra quando o movimento acontece de verdade. */
export function GraficoPorHora({
  dados,
}: {
  dados: { hora: number; recebidas: number; enviadas: number }[];
}) {
  const maximo = Math.max(1, ...dados.map((d) => d.recebidas + d.enviadas));
  const totalDeMensagens = dados.reduce((s, d) => s + d.recebidas + d.enviadas, 0);

  if (!totalDeMensagens) return <VazioDoGrafico texto="Sem movimento nas últimas 24 horas." />;

  return (
    <div>
      {/* `items-stretch` (o padrão) de propósito: com `items-end` cada coluna
          teria altura de conteúdo, e a altura em porcentagem das barras não
          teria contra o que medir — todas colapsavam para zero. */}
      <div className="flex h-28 gap-[3px]">
        {dados.map((d) => {
          const total = d.recebidas + d.enviadas;
          return (
            <div
              key={d.hora}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${String(d.hora).padStart(2, "0")}h — ${d.recebidas} recebidas, ${d.enviadas} enviadas`}
            >
              <div
                className="w-full rounded-t bg-emerald-400/70 transition-[height] duration-700 ease-out"
                style={{ height: `${(d.enviadas / maximo) * 100}%` }}
              />
              <div
                className="w-full rounded-b bg-sky-400/80 transition-[height] duration-700 ease-out"
                style={{ height: `${(d.recebidas / maximo) * 100}%` }}
              />
              {total === 0 && <div className="h-[2px] w-full rounded bg-white/10" />}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

function VazioDoGrafico({ texto }: { texto: string }) {
  // Estado vazio explícito. Um gráfico em branco parece defeito; a frase
  // deixa claro que o número é zero mesmo.
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-slate-500">
      {texto}
    </div>
  );
}
