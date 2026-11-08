// ============================================================
// "Me avise se baixar" — regras puras (pedido do Thiago em 25/10).
//
// Na página do produto o cliente deixa o WhatsApp (com o consentimento
// marcado). Quando o preço do produto baixar de verdade em relação ao preço
// que ele viu, a loja manda UM aviso pelo WhatsApp da loja (CRM), com a foto,
// o preço novo e o link. Depois disso o pedido está cumprido e não manda mais.
//
// Regras (testadas em __tests__/lib/avisos-de-preco.test.ts):
//   - "baixou" é a mesma régua da vitrine de Queda de preço (lib/precos/queda.ts):
//     pelo menos 2% e pelo menos R$ 1 abaixo do preço que o cliente viu;
//   - um aviso por produto e por telefone; pedir de novo só atualiza o preço;
//   - no máximo 10 produtos esperando por telefone (segura abuso);
//   - pedido sem queda em 90 dias vence;
//   - por rodada do agendador, no máximo 20 envios.
// ============================================================

import { baixou } from "@/lib/precos/queda";

export const MAXIMO_POR_TELEFONE = 10;
export const DIAS_ATE_VENCER = 90;
export const ENVIOS_POR_RODADA = 20;

/**
 * WhatsApp brasileiro no formato que o servidor da loja usa: 55 + DDD + número.
 * Aceita "(19) 98751-0267", "19987510267", "+55 19 98751-0267".
 * Devolve null se não for um número brasileiro válido.
 */
export function normalizarWhatsApp(entrada: string): string | null {
  let d = String(entrada || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 12 || d.length === 13) {
    if (!d.startsWith("55")) return null;
    d = d.slice(2);
  }
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99 || d[0] === "0") return null;
  // Celular tem 9 dígitos começando com 9; fixo tem 8 começando com 2–5.
  const numero = d.slice(2);
  if (numero.length === 9 && numero[0] !== "9") return null;
  if (numero.length === 8 && !/[2-5]/.test(numero[0])) return null;
  return `55${d}`;
}

/** O preço de agora está abaixo do que o cliente viu, pela régua da Queda de preço? */
export function devoAvisar(precoQuandoPediu: number, precoAgora: number): boolean {
  return baixou(precoQuandoPediu, precoAgora);
}

export function venceu(criadoEm: string, agora = new Date()): boolean {
  const t = Date.parse(criadoEm);
  if (!Number.isFinite(t)) return false;
  return agora.getTime() - t > DIAS_ATE_VENCER * 24 * 60 * 60 * 1000;
}

const reais = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function primeiroNome(nome: string | null | undefined): string {
  const n = String(nome || "").trim().split(/\s+/)[0] || "";
  if (!n || n.length > 30 || /\d/.test(n)) return "";
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}

/** Texto do aviso (vai como legenda da foto do produto). */
export function mensagemDoAviso(dados: {
  nome?: string | null;
  produto: string;
  precoQuandoPediu: number;
  precoAgora: number;
  link: string;
}): string {
  const nome = primeiroNome(dados.nome);
  const pct = Math.max(1, Math.floor(((dados.precoQuandoPediu - dados.precoAgora) / dados.precoQuandoPediu) * 100));
  return [
    `Olá${nome ? `, ${nome}` : ""}! 🎈 Aqui é a Balão da Informática.`,
    "",
    "Você pediu para avisar quando este produto baixasse de preço:",
    `*${dados.produto}*`,
    "",
    `Quando você pediu: ${reais(dados.precoQuandoPediu)}`,
    `Agora: *${reais(dados.precoAgora)}* no Pix (-${pct}%)`,
    "",
    `🔗 ${dados.link}`,
    "",
    "Quer reservar ou tirar alguma dúvida? É só responder aqui.",
    "_Este é um aviso único: não mandamos outro sobre este produto._",
  ].join("\n");
}
