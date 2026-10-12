// ============================================================
// Entregas por motoboy — as regras que valem antes de falar com a 99.
//
// Limites publicados pela 99 para o 99Entrega (conferido em 12/10/2026 em
// 99app.com/passageiro/99-entrega): na moto o volume tem de caber no baú
// (35 × 40 × 30 cm, até 10 kg) e o valor do item não pode passar de R$ 500,
// na moto e no carro. Notebook, placa de vídeo, monitor e PC ficam de fora
// enquanto a 99 Empresas não confirmar outro limite (pergunta feita no e-mail
// de 12/10). Se a 99 liberar mais, troque LIMITE_DE_VALOR aqui.
// ============================================================

import type { Cotacao, Endereco, SituacaoDaEntrega, VeiculoDaEntrega } from "./tipos";

export const LIMITE_DE_VALOR: Record<VeiculoDaEntrega, number> = { moto: 500, carro: 500 };

/** A loja: Av. Anchieta, 789 — Cambuí, Campinas. */
export const ORIGEM: Endereco & { lat: number; lng: number } = {
  cep: "13015-101",
  rua: "Av. Anchieta",
  numero: "789",
  bairro: "Cambuí",
  cidade: "Campinas",
  uf: "SP",
  lat: -22.9015,
  lng: -47.0545,
};

/** Até onde vale chamar motoboy a partir da loja (linha reta). */
export const RAIO_MAXIMO_KM = 25;
/** Quando o CEP não traz coordenada, a cotação simulada usa esta distância. */
export const DISTANCIA_PADRAO_KM = 8;

/**
 * Tabela da cotação SIMULADA. Não é preço da 99: serve para a tela e os testes
 * funcionarem até o token chegar. Com a API real, quem diz o preço é a 99.
 */
export const TABELA_SIMULADA: Record<VeiculoDaEntrega, { saida: number; porKm: number; minimo: number }> = {
  moto: { saida: 7.5, porKm: 1.7, minimo: 9 },
  carro: { saida: 9, porKm: 2.2, minimo: 12 },
};

export const somenteDigitos = (s: string) => String(s || "").replace(/\D/g, "");

/** CEP da região de Campinas e vizinhas (13xxx-xxx). */
export function cepAtendido(cep: string): boolean {
  const d = somenteDigitos(cep);
  return d.length === 8 && d.startsWith("13");
}

export function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const centavos = (v: number) => Math.round(v * 100) / 100;

/** Diz por que o pedido não pode ir de motoboy, ou null se pode. */
export function motivoParaRecusar(dados: {
  cep: string;
  valorDosProdutos: number;
  veiculo: VeiculoDaEntrega;
  distanciaKm: number | null;
}): string | null {
  if (!cepAtendido(dados.cep)) return "Entrega por motoboy só para Campinas e região (CEP 13xxx).";
  if (!Number.isFinite(dados.valorDosProdutos) || dados.valorDosProdutos <= 0) return "Pedido sem valor.";
  const limite = LIMITE_DE_VALOR[dados.veiculo];
  if (dados.valorDosProdutos > limite) {
    return `A 99 só leva itens de até R$ ${limite.toFixed(2).replace(".", ",")}. Este pedido vai por outro meio.`;
  }
  if (dados.distanciaKm != null && dados.distanciaKm > RAIO_MAXIMO_KM) {
    return `Endereço a ${Math.round(dados.distanciaKm)} km da loja; o motoboy atende até ${RAIO_MAXIMO_KM} km.`;
  }
  return null;
}

export function cotacaoSimulada(veiculo: VeiculoDaEntrega, km: number | null): Cotacao {
  const distancia = km ?? DISTANCIA_PADRAO_KM;
  const t = TABELA_SIMULADA[veiculo];
  return {
    modo: "simulado",
    veiculo,
    preco: centavos(Math.max(t.minimo, t.saida + t.porKm * distancia)),
    minutos: Math.round(15 + distancia * 3),
    distanciaKm: centavos(distancia),
    distanciaEstimada: km == null,
  };
}

/** A ordem natural de uma corrida; serve para não andar para trás. */
const ORDEM: SituacaoDaEntrega[] = ["solicitada", "a_caminho_da_loja", "coletada", "entregue"];

export function encerrada(s: SituacaoDaEntrega) {
  return s === "entregue" || s === "cancelada" || s === "falhou";
}

/** Uma mudança de situação faz sentido? (webhook repetido ou fora de ordem não volta atrás) */
export function podeMudar(de: SituacaoDaEntrega, para: SituacaoDaEntrega): boolean {
  if (de === para || encerrada(de)) return false;
  if (para === "cancelada" || para === "falhou") return true;
  return ORDEM.indexOf(para) > ORDEM.indexOf(de);
}

export function proximaSituacao(s: SituacaoDaEntrega): SituacaoDaEntrega | null {
  const i = ORDEM.indexOf(s);
  return i >= 0 && i < ORDEM.length - 1 ? ORDEM[i + 1] : null;
}

export const ROTULO_DA_SITUACAO: Record<SituacaoDaEntrega, string> = {
  solicitada: "Procurando entregador",
  a_caminho_da_loja: "Entregador indo à loja",
  coletada: "Saiu para entrega",
  entregue: "Entregue",
  cancelada: "Cancelada",
  falhou: "Não deu certo",
};

/**
 * Traduz a situação que vier da 99 (nome ainda desconhecido: a documentação
 * chega com o token) para a nossa. Aceita as palavras mais prováveis em
 * português e inglês; o que não reconhecer devolve null e fica registrado.
 */
export function situacaoDaParceira(bruta: unknown): SituacaoDaEntrega | null {
  const s = String(bruta ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z_]/g, "_");
  if (!s) return null;
  if (/cancel/.test(s)) return "cancelada";
  if (/fail|falh|expir|reject|recus/.test(s)) return "falhou";
  if (/delivered|entregue|finish|complet|conclu/.test(s)) return "entregue";
  if (/picked|collect|colet|transit|delivering|on_the_way_to_dest|em_rota/.test(s)) return "coletada";
  if (/accept|aceit|assign|arriv|pickup|on_the_way|a_caminho/.test(s)) return "a_caminho_da_loja";
  if (/creat|request|solicit|search|pend|wait/.test(s)) return "solicitada";
  return null;
}
