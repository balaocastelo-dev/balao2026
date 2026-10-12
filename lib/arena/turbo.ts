// ============================================================
// Arena: hora do turbo — pontos multiplicados num horário fraco.
//
// Pedido do Thiago (12/10/2026). Duas formas de ligar, no painel:
//  - janelas fixas (ex.: seg a sex, 14:00–16:00, pontos em dobro);
//  - "ligar agora" por X minutos.
//
// O Bling não guarda a HORA do pedido (só o dia), então vale a hora em que o
// documento chegou à Arena pelo vigia (que olha o Bling a cada 2 minutos).
// Por isso há uma tolerância: documento que chega até 5 min depois do fim da
// janela ainda ganha o turbo. Documento de carga histórica nunca ganha.
//
// Funções puras, usadas no servidor (ao pontuar) e no telão (faixa "turbo").
// ============================================================

import type { AjustesDoTurbo, JanelaDoTurbo } from "./tipos";
import { TURBO_PADRAO } from "./tipos";

export const TOLERANCIA_MS = 5 * 60_000;

/** Dia da semana (0 = domingo) e minuto do dia no relógio da loja. */
export function relogioDaLoja(instante: Date): { dia: number; minuto: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "";
  const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { dia: Math.max(0, dias.indexOf(p("weekday"))), minuto: Number(p("hour")) * 60 + Number(p("minute")) };
}

function minutos(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 24 || mi > 59) return null;
  return Math.min(24 * 60, h * 60 + mi);
}

function dentroDaJanela(j: JanelaDoTurbo, instante: Date): boolean {
  const { dia, minuto } = relogioDaLoja(instante);
  const das = minutos(j.das);
  const ate = minutos(j.ate);
  if (das == null || ate == null || ate <= das) return false;
  return j.dias.includes(dia) && minuto >= das && minuto < ate;
}

export interface TurboAgora {
  ativo: boolean;
  multiplicador: number;
  /** Quando acaba (ISO), se ativo. */
  ate: string | null;
  origem: "manual" | "janela" | null;
}

/** O turbo está ligado neste instante? (sem tolerância: é o que o telão mostra) */
export function turboAgora(t: AjustesDoTurbo | null | undefined, agora = new Date()): TurboAgora {
  const a = t ?? TURBO_PADRAO;
  if (a.manualAte && Date.parse(a.manualAte) > agora.getTime()) {
    return { ativo: true, multiplicador: a.manualMultiplicador, ate: a.manualAte, origem: "manual" };
  }
  for (const j of a.janelas) {
    if (!dentroDaJanela(j, agora)) continue;
    // Fim da janela hoje: agora + (ate - minuto atual).
    const { minuto } = relogioDaLoja(agora);
    const fim = new Date(agora.getTime() + ((minutos(j.ate) ?? minuto) - minuto) * 60_000);
    fim.setSeconds(0, 0);
    return { ativo: true, multiplicador: a.multiplicador, ate: fim.toISOString(), origem: "janela" };
  }
  return { ativo: false, multiplicador: 1, ate: null, origem: null };
}

/**
 * Multiplicador para um documento que chegou agora. Com a tolerância: se o
 * turbo estava ligado há até 5 min, o documento (criado no Bling enquanto o
 * vigia ainda não tinha passado) ainda ganha.
 */
export function multiplicadorNaChegada(t: AjustesDoTurbo | null | undefined, chegada = new Date()): number {
  const agora = turboAgora(t, chegada);
  if (agora.ativo) return agora.multiplicador;
  const antes = turboAgora(t, new Date(chegada.getTime() - TOLERANCIA_MS));
  return antes.ativo ? antes.multiplicador : 1;
}

/** Próxima janela que vai começar (para o telão e a página do piloto dizerem "turbo às 14h"). */
export function proximoTurbo(t: AjustesDoTurbo | null | undefined, agora = new Date()): { inicio: string; multiplicador: number } | null {
  const a = t ?? TURBO_PADRAO;
  if (!a.janelas.length) return null;
  // Procura de 5 em 5 minutos nos próximos 7 dias (barato e sem fuso para errar).
  const passo = 5 * 60_000;
  const base = Math.ceil(agora.getTime() / passo) * passo;
  for (let i = 0; i < (7 * 24 * 60) / 5; i++) {
    const instante = new Date(base + i * passo);
    if (a.janelas.some((j) => dentroDaJanela(j, instante))) return { inicio: instante.toISOString(), multiplicador: a.multiplicador };
  }
  return null;
}

export function normalizarTurbo(e: unknown): AjustesDoTurbo {
  const o = (e && typeof e === "object" ? e : {}) as Record<string, unknown>;
  const mult = (v: unknown, p: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 ? Math.min(5, Math.round(n * 10) / 10) : p;
  };
  const janelas = Array.isArray(o.janelas)
    ? o.janelas
        .map((j) => {
          const x = (j ?? {}) as Record<string, unknown>;
          const dias = Array.isArray(x.dias) ? [...new Set(x.dias.map(Number).filter((d) => d >= 0 && d <= 6))].sort() : [];
          const das = String(x.das ?? "");
          const ate = String(x.ate ?? "");
          if (!dias.length || minutos(das) == null || minutos(ate) == null || minutos(ate)! <= minutos(das)!) return null;
          return { dias, das, ate };
        })
        .filter((j): j is JanelaDoTurbo => j !== null)
        .slice(0, 12)
    : [];
  const manualAte = typeof o.manualAte === "string" && !Number.isNaN(Date.parse(o.manualAte)) ? new Date(o.manualAte).toISOString() : null;
  return {
    janelas,
    multiplicador: mult(o.multiplicador, TURBO_PADRAO.multiplicador),
    manualAte,
    manualMultiplicador: mult(o.manualMultiplicador, TURBO_PADRAO.manualMultiplicador),
  };
}

const NOMES_DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "seg a sex, 14:00–16:00" */
export function descreverJanela(j: JanelaDoTurbo): string {
  const d = [...j.dias].sort();
  const seguidos = d.length > 2 && d.every((x, i) => i === 0 || x === d[i - 1] + 1);
  const dias = seguidos ? `${NOMES_DIAS[d[0]]} a ${NOMES_DIAS[d[d.length - 1]]}` : d.map((x) => NOMES_DIAS[x]).join(", ");
  return `${dias}, ${j.das}–${j.ate}`;
}
