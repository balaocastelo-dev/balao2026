// ============================================================
// Ferramenta "Enviar promoção" do painel do vendedor.
//
// Funções puras (sem rede) para montar a mensagem da promoção e normalizar o
// telefone do cliente. O envio em si sai pela linha da loja no servidor da VPS
// (lib/avisos-de-preco/disparo.ts → /api/enviar-foto), o mesmo caminho dos
// avisos de preço — então a mensagem já cai registrada no CRM.
// ============================================================

import type { Product } from "@/lib/utils";
import { getProductHref } from "@/lib/utils";

export const LINK_SITE = "https://www.balao.info";

/** Janela de envio permitida para lista (campanha): 9h às 18h, sem domingo. */
export function janelaDeEnvioAberta(agora = new Date()): boolean {
  // Horário de São Paulo (UTC-3). O servidor da Vercel roda em UTC.
  const sp = new Date(agora.getTime() - 3 * 60 * 60 * 1000);
  const hora = sp.getUTCHours();
  const dia = sp.getUTCDay(); // 0 = domingo
  return dia !== 0 && hora >= 9 && hora < 18;
}

/**
 * Normaliza o telefone para o formato que o WhatsApp espera (só dígitos, com
 * o 55 na frente). Aceita o que o vendedor digitar: (19) 98751-0267,
 * 19987510267, +55 19 98751-0267, etc. Devolve null se não der um número BR
 * plausível (10 ou 11 dígitos depois do DDD).
 */
export function normalizarTelefone(bruto: string): string | null {
  let d = (bruto || "").replace(/\D/g, "");
  if (!d) return null;

  // Tira zeros de operadora / 0800 na frente que às vezes vêm colados.
  d = d.replace(/^0+/, "");

  // Já veio com o código do país (55) + DDD + número (12 ou 13 dígitos).
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;

  // DDD + número, sem o 55 (10 dígitos fixo, 11 celular).
  if (d.length === 10 || d.length === 11) return `55${d}`;

  return null;
}

/** Preço do produto como texto já formatado ("R$ 1.234,56" ou "1234.56"). */
function precoTexto(p: Pick<Product, "price">): string {
  const bruto = String(p.price ?? "").trim();
  if (!bruto) return "";
  return bruto.startsWith("R$") ? bruto : `R$ ${bruto}`;
}

export interface OpcoesMensagem {
  /** Chamada opcional no topo, ex: "Oferta de hoje 🔥". */
  chamada?: string;
  /** Assinatura do vendedor (vem de VENDEDORES[].assinatura). */
  assinatura: string;
  /** Acrescenta o rodapé de opt-out (usado no envio em lista). */
  incluirOptout?: boolean;
}

/**
 * Monta a legenda que acompanha a foto do produto. Fala o nome, o preço no
 * Pix, o link do produto e a assinatura do vendedor. Mantém o estilo do site
 * ("à vista no Pix"); não inventa desconto que o produto não tem.
 */
export function montarMensagemPromo(produto: Product, opcoes: OpcoesMensagem): string {
  const partes: string[] = [];

  const chamada = (opcoes.chamada || "").trim();
  if (chamada) partes.push(chamada);

  partes.push(`*${produto.name}*`);

  const preco = precoTexto(produto);
  if (preco) {
    let linha = `${preco} à vista no Pix`;
    if (produto.installment) linha += `\nou ${produto.installment} sem juros`;
    else if (produto.price_card) linha += `\nou ${produto.price_card} no cartão`;
    partes.push(linha);
  }

  const href = getProductHref(produto);
  partes.push(`Ver no site: ${LINK_SITE}${href}`);

  partes.push(opcoes.assinatura);

  if (opcoes.incluirOptout) {
    partes.push("_Para não receber mais ofertas, responda SAIR._");
  }

  return partes.join("\n\n");
}
