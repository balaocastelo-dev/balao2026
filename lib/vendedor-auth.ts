import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  VendedorRegistro,
  getSenhaVendedor,
  getVendedorPorSlug,
} from "./vendedores";

// ============================================================
// Sessão de vendedor (server-side, cookie httpOnly).
//
// Mesma ideia do painel-auth.ts, mas por pessoa: o cookie guarda um
// token derivado do slug + senha do vendedor, então a sessão do Brendon
// não abre a página de outro vendedor, e a senha nunca vai para o
// navegador.
// ============================================================

export const VENDEDOR_COOKIE_NAME = "balao_vendedor_session";

/** 30 dias — o vendedor não precisa relogar todo dia no PC da loja. */
const MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 30;

function buildToken(slug: string, senha: string) {
  return createHash("sha256")
    .update(`${slug}:${senha}:balao-vendedor`)
    .digest("hex");
}

function comparaSeguro(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function getVendedorSessionToken(vendedor: VendedorRegistro) {
  return buildToken(vendedor.slug, getSenhaVendedor(vendedor));
}

export function isSenhaVendedorValida(vendedor: VendedorRegistro, senha: string) {
  const esperada = getSenhaVendedor(vendedor);
  // Sem senha configurada o acesso fica fechado, em vez de liberar geral.
  if (!esperada) return false;
  return comparaSeguro(buildToken(vendedor.slug, senha), buildToken(vendedor.slug, esperada));
}

/** O cookie guarda `slug.token` para amarrar a sessão a uma pessoa só. */
export function buildCookieValue(vendedor: VendedorRegistro) {
  return `${vendedor.slug}.${getVendedorSessionToken(vendedor)}`;
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEGUNDOS,
  };
}

/** Confere se o cookie atual corresponde ao vendedor informado. */
export async function isVendedorAutenticado(slug: string): Promise<boolean> {
  const vendedor = getVendedorPorSlug(slug);
  if (!vendedor) return false;

  const store = await cookies();
  const valor = store.get(VENDEDOR_COOKIE_NAME)?.value;
  if (!valor) return false;

  const separador = valor.indexOf(".");
  if (separador <= 0) return false;

  const slugCookie = valor.slice(0, separador);
  const tokenCookie = valor.slice(separador + 1);
  if (slugCookie !== vendedor.slug) return false;

  return comparaSeguro(tokenCookie, getVendedorSessionToken(vendedor));
}

/** Qual vendedor está logado neste navegador (ou null). */
export async function getVendedorLogado(): Promise<VendedorRegistro | null> {
  const store = await cookies();
  const valor = store.get(VENDEDOR_COOKIE_NAME)?.value;
  if (!valor) return null;

  const separador = valor.indexOf(".");
  if (separador <= 0) return null;

  const vendedor = getVendedorPorSlug(valor.slice(0, separador));
  if (!vendedor) return null;

  return comparaSeguro(valor.slice(separador + 1), getVendedorSessionToken(vendedor))
    ? vendedor
    : null;
}
