"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ItemCalendario, PonteStatus } from "./tipos";
import { DIAS_CURTOS, diaSemana, formatarHora, hojeLocal, inicioDoDia, somarDias } from "./util";

type Modo = "semana" | "mes";

function primeiroDoMes(data: string) {
  return `${data.slice(0, 7)}-01`;
}

function periodo(modo: Modo, ref: string): { dias: string[]; de: string; ate: string; titulo: string } {
  if (modo === "semana") {
    const inicio = somarDias(ref, -diaSemana(ref));
    const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
    const [, m1, d1] = dias[0].split("-");
    const [, m2, d2] = dias[6].split("-");
    return { dias, de: dias[0], ate: somarDias(dias[6], 1), titulo: `${d1}/${m1} a ${d2}/${m2}` };
  }
  const p = primeiroDoMes(ref);
  const inicio = somarDias(p, -diaSemana(p));
  const dias = Array.from({ length: 42 }, (_, i) => somarDias(inicio, i));
  const titulo = new Date(`${p}T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return { dias, de: dias[0], ate: somarDias(dias[41], 1), titulo };
}

const COR_SITUACAO: Record<string, string> = {
  programado: "bg-[#e7f6ec] text-[#0a6e3d] border-[#b7e1c6]",
  pausado: "bg-[#f0f2f5] text-[#5f6368] border-[#e3e3e3] line-through",
  publicado: "bg-emerald-600 text-white border-emerald-600",
  publicando: "bg-sky-100 text-sky-800 border-sky-200",
  falhou: "bg-red-100 text-red-800 border-red-200",
  incerto: "bg-amber-100 text-amber-900 border-amber-200",
  perdido: "bg-orange-100 text-orange-900 border-orange-200",
  cancelado: "bg-[#f0f2f5] text-[#9aa0a6] border-[#e3e3e3]",
};

export default function CalendarioStatus({
  ponte,
  aoAbrirConteudo,
  aoAgendarNoDia,
}: {
  ponte: PonteStatus;
  aoAbrirConteudo: (conteudoId: string) => void;
  aoAgendarNoDia: (data: string) => void;
}) {
  const hoje = hojeLocal();
  const [modo, setModo] = useState<Modo>("semana");
  const [ref, setRef] = useState(hoje);
  const [itens, setItens] = useState<ItemCalendario[]>([]);
  const [minimo, setMinimo] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const p = useMemo(() => periodo(modo, ref), [modo, ref]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await ponte.chamar<{ itens: ItemCalendario[]; minimoPorDia: number }>(
        `/api/status/calendario?de=${encodeURIComponent(inicioDoDia(p.de))}&ate=${encodeURIComponent(inicioDoDia(p.ate))}`
      );
      setItens(r.itens);
      setMinimo(r.minimoPorDia || 1);
    } catch (e) {
      ponte.avisar(`⚠️ ${(e as Error).message}`);
    } finally {
      setCarregando(false);
    }
  }, [ponte, p.de, p.ate]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => ponte.ouvir("status:mudou", () => carregar()), [ponte, carregar]);

  const porDia = useMemo(() => {
    const m: Record<string, ItemCalendario[]> = {};
    for (const it of itens) (m[it.data] ||= []).push(it);
    return m;
  }, [itens]);

  const mover = (n: number) => {
    if (modo === "semana") setRef(somarDias(ref, 7 * n));
    else {
      const [a, m] = ref.split("-").map(Number);
      const d = new Date(Date.UTC(a, m - 1 + n, 1));
      setRef(d.toISOString().slice(0, 10));
    }
  };

  const contaNoDia = (d: string) =>
    (porDia[d] || []).filter((i) => ["programado", "publicado", "publicando"].includes(i.situacao)).length;

  const futurosVazios = p.dias.filter((d) => d >= hoje && (modo === "semana" || d.slice(0, 7) === ref.slice(0, 7)) && contaNoDia(d) === 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-lg border border-[#e3e3e3] overflow-hidden" role="tablist">
          {(["semana", "mes"] as Modo[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={modo === m}
              onClick={() => setModo(m)}
              className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${modo === m ? "bg-[#202124] text-white" : "bg-white text-[#3c4043]"}`}
            >
              {m === "semana" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
        <button onClick={() => mover(-1)} aria-label="Anterior" className="rounded-md border border-[#e3e3e3] px-2 py-1 cursor-pointer">
          ‹
        </button>
        <span className="text-sm font-bold capitalize min-w-[140px] text-center">{p.titulo}</span>
        <button onClick={() => mover(1)} aria-label="Próximo" className="rounded-md border border-[#e3e3e3] px-2 py-1 cursor-pointer">
          ›
        </button>
        <button onClick={() => setRef(hoje)} className="text-xs font-semibold text-[#0a6e3d] underline cursor-pointer">
          Hoje
        </button>
        {carregando && <span className="text-xs text-[#5f6368]">carregando…</span>}
        <div className="ml-auto flex flex-wrap gap-2 text-[10px] text-[#5f6368]">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-300" /> sem status</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300" /> poucos</span>
          <span>↻ recorrente</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" /> campanha</span>
        </div>
      </div>

      {futurosVazios.length > 0 && (
        <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Não existem Status programados para {futurosVazios.length} dia(s) deste período. Clique num dia vazio para agendar.
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[720px]">
          {DIAS_CURTOS.map((d) => (
            <div key={d} className="text-[11px] font-semibold text-[#5f6368] uppercase px-1">
              {d}
            </div>
          ))}
          {p.dias.map((d) => {
            const lista = porDia[d] || [];
            const n = contaNoDia(d);
            const futuro = d >= hoje;
            const foraDoMes = modo === "mes" && d.slice(0, 7) !== ref.slice(0, 7);
            const fundo = !futuro || foraDoMes ? "bg-[#fafbfa]" : n === 0 ? "bg-red-50 border-red-200" : n < minimo ? "bg-amber-50 border-amber-200" : "bg-white";
            return (
              <div
                key={d}
                className={`border rounded-lg p-1.5 ${modo === "semana" ? "min-h-[220px]" : "min-h-[104px]"} ${fundo} ${
                  d === hoje ? "ring-2 ring-[#0f9d58]" : "border-[#e3e3e3]"
                } ${foraDoMes ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tabular-nums">{d.slice(8)}</span>
                  {futuro && !foraDoMes && (
                    <button onClick={() => aoAgendarNoDia(d)} aria-label={`Agendar em ${d}`} className="text-[#0a6e3d] text-sm leading-none px-1 hover:bg-[#e7f6ec] rounded cursor-pointer">
                      +
                    </button>
                  )}
                </div>
                {futuro && !foraDoMes && n === 0 && <div className="text-[10px] text-red-700 font-semibold mt-1">sem status</div>}
                <ul className="mt-1 space-y-1">
                  {lista.slice(0, modo === "semana" ? 12 : 3).map((it, i) => (
                    <li key={`${it.agendamentoId}-${it.quando}-${i}`}>
                      <button
                        onClick={() => aoAbrirConteudo(it.conteudoId)}
                        title={`${formatarHora(it.quando)} — ${it.titulo}${it.campanha ? ` · ${it.campanha}` : ""}`}
                        className={`w-full text-left truncate rounded border px-1 py-0.5 text-[10px] cursor-pointer ${COR_SITUACAO[it.situacao] || COR_SITUACAO.programado} ${
                          it.campanha ? "border-l-4 border-l-rose-500" : ""
                        }`}
                      >
                        {formatarHora(it.quando)} {it.recorrente ? "↻ " : ""}
                        {it.titulo}
                      </button>
                    </li>
                  ))}
                  {lista.length > (modo === "semana" ? 12 : 3) && (
                    <li className="text-[10px] text-[#5f6368]">+{lista.length - (modo === "semana" ? 12 : 3)}</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
