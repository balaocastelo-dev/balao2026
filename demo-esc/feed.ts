import { EQUIPE } from "./equipe";
import {
  FEED_VALIDADE_MS,
  STATUS_VALIDOS,
  type AgenteFeed,
  type EventoFeed,
  type FeedStatus,
  type StatusVisual,
} from "./tipos";

const LIMITE_TEXTO = 280;
const LIMITE_AGENTES = 80;
const LIMITE_EVENTOS = 100;

const porId = new Map(EQUIPE.map((agente) => [agente.id, agente]));
const porNome = new Map(EQUIPE.map((agente) => [agente.nome.toLocaleLowerCase("pt-BR"), agente.id]));

export function resolverId(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  if (!limpo) return null;
  if (porId.has(limpo)) return limpo;
  return porNome.get(limpo.toLocaleLowerCase("pt-BR")) ?? limpo;
}

function texto(valor: unknown) {
  if (typeof valor !== "string") return "";
  return valor.trim().slice(0, LIMITE_TEXTO);
}

function statusDe(valor: unknown): StatusVisual {
  if (typeof valor === "string" && (STATUS_VALIDOS as readonly string[]).includes(valor)) {
    return valor as StatusVisual;
  }
  return "ocioso";
}

/**
 * Aceita o JSON do feed e devolve o contrato, ou null se não der para usar.
 * `updatedAt` ausente só passa quando `carimbarData` vem preenchido (POST).
 */
export function normalizarFeed(bruto: unknown, carimbarData?: string): FeedStatus | null {
  if (!bruto || typeof bruto !== "object") return null;
  const corpo = bruto as Record<string, unknown>;
  const updatedAt =
    typeof corpo.updatedAt === "string" && !Number.isNaN(Date.parse(corpo.updatedAt))
      ? corpo.updatedAt
      : carimbarData;
  if (!updatedAt) return null;
  if (!Array.isArray(corpo.agents)) return null;

  const agents: AgenteFeed[] = [];
  for (const item of corpo.agents.slice(0, LIMITE_AGENTES)) {
    if (!item || typeof item !== "object") continue;
    const agente = item as Record<string, unknown>;
    const id = resolverId(agente.id);
    if (!id) continue;
    const cadastro = porId.get(id);
    agents.push({
      id,
      name: texto(agente.name) || cadastro?.nome || id,
      status: statusDe(agente.status),
      currentTask: texto(agente.currentTask),
      lastMessage: texto(agente.lastMessage),
      talkingTo: resolverId(agente.talkingTo),
      whatsappConnected: agente.whatsappConnected === true,
    });
  }

  const events: EventoFeed[] = [];
  if (Array.isArray(corpo.events)) {
    for (const item of corpo.events.slice(0, LIMITE_EVENTOS)) {
      if (!item || typeof item !== "object") continue;
      const evento = item as Record<string, unknown>;
      const at = typeof evento.at === "string" ? evento.at : "";
      if (Number.isNaN(Date.parse(at))) continue;
      const text = texto(evento.text);
      if (!text) continue;
      const from = resolverId(evento.from);
      const to = resolverId(evento.to);
      if (!from || !to) continue;
      events.push({ at, from, to, text });
    }
  }

  return { updatedAt, agents, events };
}

/** Verdadeiro quando a data do feed está a menos de 5 minutos do relógio dado. */
export function feedEstaFresco(updatedAt: string, agoraMs: number) {
  const instante = Date.parse(updatedAt);
  if (Number.isNaN(instante)) return false;
  const idade = agoraMs - instante;
  if (idade > FEED_VALIDADE_MS) return false;
  // Relógio adiantado alguns minutos ainda conta; muito à frente, não.
  if (idade < -2 * 60 * 1000) return false;
  return true;
}
