/**
 * Os funcionários digitais, do lado do site.
 *
 * A tabela mora em `whatsapp-server/agentes.json` porque o contexto do build
 * do Docker na VPS é aquela pasta — o worker precisa do arquivo lá dentro. O
 * site lê o MESMO arquivo, para não existirem duas listas divergindo.
 *
 * Regra que vale para sempre: a CHAVE não muda. Ela é o `autorId` gravado no
 * banco desde setembro, o nome do arquivo do worker, a rota HTTP que o worker
 * chama e o prefixo das variáveis de ambiente. Trocar a chave apagaria a
 * autoria do histórico e deixaria a VPS falando com rota que não existe até o
 * próximo deploy dela. O que se troca é o `nome`.
 */
import bruto from "../whatsapp-server/agentes.json";

export type LinhaAgente = "loja" | "fora" | "email" | "voz";
export type EstadoAgente = "ativo" | "em-construcao";

export interface Agente {
  /** Identidade interna. Nunca muda. */
  chave: string;
  /** O nome que aparece na tela e assina a mensagem. */
  nome: string;
  papel: string;
  resumo: string;
  linha: LinhaAgente;
  estado: EstadoAgente;
}

export const AGENTES: Agente[] = (bruto.agentes as Agente[]).map((a) => ({ ...a }));

const PORCHAVE = new Map(AGENTES.map((a) => [a.chave, a]));

export function agente(chave: string): Agente | null {
  return PORCHAVE.get(chave) || null;
}

/**
 * O nome de um agente, pela chave.
 *
 * Devolve a própria chave quando não conhece — nome errado numa tela é ruim,
 * mas tela vazia no meio de um relatório é pior de diagnosticar.
 */
export function nomeDoAgente(chave: string | null | undefined): string {
  if (!chave) return "";
  return PORCHAVE.get(chave)?.nome || chave;
}

export const AGENTES_ATIVOS = AGENTES.filter((a) => a.estado === "ativo");
