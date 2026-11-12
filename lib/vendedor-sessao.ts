import { createHash, createHmac, timingSafeEqual } from "crypto";

// ============================================================
// Sessão da página pessoal, depois que o PIN confere.
//
// O cookie guarda id, slug e validade, assinados com o segredo do site.
// O PIN não entra no cookie, na assinatura nem no que volta para o
// navegador: sem ele aqui, trocar o PIN não dá para "descobrir" lendo
// o cookie, e o cookie não serve para entrar como outra pessoa.
// ============================================================

const PREFIXO = "v2";
/** 30 dias — o mesmo prazo da sessão antiga, no PC da loja. */
export const IDADE_COOKIE_VENDEDOR = 60 * 60 * 24 * 30;

export type SessaoVendedor = { id: string; slug: string; exp: number };

function segredo(): Buffer | null {
  const base = process.env.WHATSAPP_TICKET_SECRET || process.env.PAINEL_PASSWORD || "";
  if (!base) return null;
  return createHash("sha256").update(`balao-vendedor-pin:${base}`).digest();
}

function assinar(corpo: string, chave: Buffer) {
  return createHmac("sha256", chave).update(corpo).digest("base64url");
}

function compara(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function criarSessaoVendedor(id: string, slug: string, agora = Date.now()): string | null {
  const chave = segredo();
  if (!chave || !id || !slug) return null;
  const exp = Math.floor(agora / 1000) + IDADE_COOKIE_VENDEDOR;
  const corpo = Buffer.from(JSON.stringify({ id: String(id), slug: String(slug), exp })).toString("base64url");
  return `${PREFIXO}.${corpo}.${assinar(corpo, chave)}`;
}

export function lerSessaoVendedor(
  valor: string | undefined | null,
  agora = Date.now()
): SessaoVendedor | null {
  if (!valor || !valor.startsWith(`${PREFIXO}.`)) return null;
  const chave = segredo();
  if (!chave) return null;

  const resto = valor.slice(PREFIXO.length + 1);
  const ponto = resto.lastIndexOf(".");
  if (ponto <= 0) return null;
  const corpo = resto.slice(0, ponto);
  const assinatura = resto.slice(ponto + 1);
  if (!compara(assinatura, assinar(corpo, chave))) return null;

  try {
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as SessaoVendedor;
    if (!dados?.id || !dados.slug || !dados.exp || dados.exp * 1000 <= agora) return null;
    return { id: String(dados.id), slug: String(dados.slug), exp: Number(dados.exp) };
  } catch {
    return null;
  }
}
