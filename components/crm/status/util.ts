import type { RegraRecorrencia } from "./tipos";

export const FUSO = "America/Sao_Paulo";
export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function hojeLocal(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());
}

export function somarDias(data: string, n: number): string {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d) + n * 86400000).toISOString().slice(0, 10);
}

export function diaSemana(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

/** "2026-09-22" -> início do dia em São Paulo (ISO). O Brasil está sem horário de verão (UTC-3). */
export function inicioDoDia(data: string): string {
  return `${data}T00:00:00-03:00`;
}

export function formatarQuando(iso: string | null | undefined, comAno = false): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    ...(comAno ? { year: "numeric" } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });
}

export function formatarDataCurta(data: string): string {
  const [, m, d] = data.split("-");
  return `${DIAS_CURTOS[diaSemana(data)]} ${d}/${m}`;
}

export function tempoRelativo(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  return `há ${h} h`;
}

export const ROTULO_ACAO: Record<string, string> = {
  status_criado: "Status criado",
  modelo_criado: "Modelo criado na biblioteca",
  status_editado: "Status editado",
  status_duplicado: "Status duplicado",
  salvo_como_modelo: "Salvo na biblioteca",
  status_excluido: "Status excluído",
  agendado: "Agendado",
  reagendado: "Reagendado",
  pausado: "Pausado",
  reativado: "Reativado",
  cancelado: "Cancelado",
  finalizado: "Agendamento finalizado",
  publicado: "Publicado",
  falhou: "Falhou",
  resultado_incerto: "Resultado incerto",
  perdido: "Horário perdido",
  nova_tentativa: "Nova tentativa",
  config_alterada: "Configuração alterada",
};

export const SITUACAO_EXECUCAO: Record<string, { rotulo: string; cor: string }> = {
  publicando: { rotulo: "Publicando…", cor: "bg-sky-100 text-sky-800" },
  publicado: { rotulo: "Publicado", cor: "bg-emerald-100 text-emerald-800" },
  falhou: { rotulo: "Falhou", cor: "bg-red-100 text-red-800" },
  incerto: { rotulo: "Incerto — conferir", cor: "bg-amber-100 text-amber-900" },
  perdido: { rotulo: "Horário perdido", cor: "bg-orange-100 text-orange-900" },
  cancelado: { rotulo: "Cancelado", cor: "bg-gray-100 text-gray-700" },
};

export function usuarioLegivel(u: string): string {
  if (u === "admin") return "Administração";
  if (u === "site") return "Site";
  if (u === "sistema") return "Sistema (automático)";
  if (u.startsWith("vendedor:")) {
    const nome = u.slice(9);
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
  return u;
}

export function regraPadrao(): RegraRecorrencia {
  const amanha = somarDias(hojeLocal(), 1);
  return { tipo: "unica", data: amanha, hora: "09:00" };
}

export function copiarRegra(r: RegraRecorrencia): RegraRecorrencia {
  return JSON.parse(JSON.stringify(r));
}
