// ============================================================
// Arena: semana e mês no relógio da loja (Campinas, America/Sao_Paulo).
//
// O Bling devolve a data do pedido sem hora ("2026-10-10"), então toda a
// corrida trabalha com DATA local. A semana vai de segunda a domingo; o mês é
// o do calendário. O fim do período é meia-noite (horário da loja) do dia
// seguinte ao último dia — é para lá que o cronômetro do telão conta.
// ============================================================

export type Periodo = "semana" | "mes";

export interface JanelaDoPeriodo {
  periodo: Periodo;
  /** Primeiro dia (AAAA-MM-DD, inclusive). */
  inicio: string;
  /** Último dia (AAAA-MM-DD, inclusive). */
  fim: string;
  /** Instante (ISO, UTC) em que o período acaba no relógio da loja. */
  terminaEm: string;
  /** "Semana de 12/10 a 18/10" / "Outubro de 2026". */
  rotulo: string;
}

const FUSO = "America/Sao_Paulo";
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Data de hoje (AAAA-MM-DD) no relógio da loja. */
export function hojeNaLoja(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(agora);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

/** Diferença em minutos entre o relógio da loja e UTC naquele instante (-180 hoje). */
function deslocamentoMin(instante: Date): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instante);
  const p = (t: string) => Number(partes.find((x) => x.type === t)?.value ?? 0);
  const comoUtc = Date.UTC(p("year"), p("month") - 1, p("day"), p("hour"), p("minute"));
  return Math.round((comoUtc - Math.floor(instante.getTime() / 60000) * 60000) / 60000);
}

/** Meia-noite (horário da loja) do dia informado, como instante UTC. */
export function meiaNoiteNaLoja(dia: string): Date {
  const [a, m, d] = dia.split("-").map(Number);
  const palpite = new Date(Date.UTC(a, m - 1, d, 3, 0)); // UTC-3 na maior parte do ano
  const desloc = deslocamentoMin(palpite);
  return new Date(Date.UTC(a, m - 1, d, 0, 0) - desloc * 60000);
}

function somarDias(dia: string, n: number): string {
  const [a, m, d] = dia.split("-").map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

function diaDaSemana(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
}

const curta = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** Segunda-feira da semana do dia informado. */
export function segundaDaSemana(dia: string): string {
  const dow = diaDaSemana(dia);
  return somarDias(dia, dow === 0 ? -6 : 1 - dow);
}

export function janela(periodo: Periodo, agora: Date = new Date()): JanelaDoPeriodo {
  const hoje = hojeNaLoja(agora);
  if (periodo === "semana") {
    const inicio = segundaDaSemana(hoje);
    const fim = somarDias(inicio, 6);
    return {
      periodo,
      inicio,
      fim,
      terminaEm: meiaNoiteNaLoja(somarDias(fim, 1)).toISOString(),
      rotulo: `Semana de ${curta(inicio)} a ${curta(fim)}`,
    };
  }
  const inicio = `${hoje.slice(0, 7)}-01`;
  const [a, m] = hoje.split("-").map(Number);
  const proximo = m === 12 ? `${a + 1}-01-01` : `${a}-${String(m + 1).padStart(2, "0")}-01`;
  const fim = somarDias(proximo, -1);
  return {
    periodo,
    inicio,
    fim,
    terminaEm: meiaNoiteNaLoja(proximo).toISOString(),
    rotulo: `${MESES[m - 1]} de ${a}`,
  };
}

/** Janela de uma semana passada: `semanasAtras` = 1 é a semana anterior. */
export function semanaAnterior(semanasAtras: number, agora: Date = new Date()): JanelaDoPeriodo {
  const atual = janela("semana", agora);
  const inicio = somarDias(atual.inicio, -7 * semanasAtras);
  const fim = somarDias(inicio, 6);
  return {
    periodo: "semana",
    inicio,
    fim,
    terminaEm: meiaNoiteNaLoja(somarDias(fim, 1)).toISOString(),
    rotulo: `Semana de ${curta(inicio)} a ${curta(fim)}`,
  };
}

/** Janela de um mês passado: `mesesAtras` = 1 é o mês anterior. */
export function mesAnterior(mesesAtras: number, agora: Date = new Date()): JanelaDoPeriodo {
  const hoje = hojeNaLoja(agora);
  let [a, m] = hoje.split("-").map(Number);
  m -= mesesAtras;
  while (m < 1) {
    m += 12;
    a -= 1;
  }
  const inicio = `${a}-${String(m).padStart(2, "0")}-01`;
  const proximo = m === 12 ? `${a + 1}-01-01` : `${a}-${String(m + 1).padStart(2, "0")}-01`;
  const fim = somarDias(proximo, -1);
  return {
    periodo: "mes",
    inicio,
    fim,
    terminaEm: meiaNoiteNaLoja(proximo).toISOString(),
    rotulo: `${MESES[m - 1]} de ${a}`,
  };
}

export function dentro(dia: string, j: Pick<JanelaDoPeriodo, "inicio" | "fim">): boolean {
  return dia >= j.inicio && dia <= j.fim;
}

export { somarDias };
