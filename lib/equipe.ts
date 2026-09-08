import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// ============================================================
// Vendedores cadastrados pelo dashboard (/crm), que entram por
// www.balao.info/equipe/<slug>.
//
// Diferença para os seis da equipe fixa (lib/vendedores.ts): aqueles têm a
// senha em variável de ambiente e uma pasta própria em app/. Estes são
// criados pela tela de administração, sem publicar nada — o cadastro vive no
// whatsapp-server, que é quem tem disco.
//
// A senha não existe em lugar nenhum: nem aqui, nem lá. O que se guarda é o
// TOKEN (sha256 de slug + senha), o mesmo formato do vendedor-auth.ts, e a
// conferência é sempre feita contra o servidor de atendimento.
// ============================================================

export const EQUIPE_COOKIE_NAME = "balao_equipe_session";

/** 30 dias, igual ao da equipe fixa: ninguém quer relogar todo dia na loja. */
const MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 30;

export interface VendedorDaEquipe {
  id: string;
  slug: string;
  nome: string;
  cargo: string;
  assinatura: string;
  ativo: boolean;
}

function servidorDeAtendimento() {
  return (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    "http://localhost:4100"
  ).replace(/\/$/, "");
}

/** Precisa ser idêntico ao `buildToken()` de vendedor-auth.ts e ao do painel. */
export function montarTokenDaEquipe(slug: string, senha: string) {
  return createHash("sha256").update(`${slug}:${senha}:balao-vendedor`).digest("hex");
}

function comparaSeguro(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Ficha pública do vendedor, para a tela de login saber o nome dele.
 *
 * Devolve null quando o servidor está fora do ar — a página então mostra o
 * aviso de indisponibilidade em vez de um 404 enganoso, que faria parecer que
 * o cadastro sumiu.
 */
export async function buscarVendedorDaEquipe(slug: string): Promise<VendedorDaEquipe | null> {
  const alvo = String(slug || "").trim().toLowerCase();
  if (!alvo) return null;

  try {
    const resposta = await fetch(
      `${servidorDeAtendimento()}/api/crm/vendedor/${encodeURIComponent(alvo)}`,
      { cache: "no-store", signal: AbortSignal.timeout(6000) }
    );
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados?.vendedor || null;
  } catch {
    return null;
  }
}

/** Confere o token com o servidor de atendimento. */
export async function tokenDaEquipeEhValido(slug: string, token: string): Promise<boolean> {
  const alvo = String(slug || "").trim().toLowerCase();
  if (!alvo || !token) return false;

  try {
    const resposta = await fetch(`${servidorDeAtendimento()}/api/crm/vendedor-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: alvo, token }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!resposta.ok) return false;
    const dados = await resposta.json();
    return Boolean(dados?.ok);
  } catch {
    // Servidor fora do ar não vira acesso liberado.
    return false;
  }
}

export function montarCookieDaEquipe(slug: string, token: string) {
  return `${slug}.${token}`;
}

export function opcoesDoCookieDaEquipe() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEGUNDOS,
  };
}

/**
 * Se este navegador está logado como o vendedor do slug informado.
 *
 * O cookie guarda `slug.token`; o token é conferido no servidor a cada
 * carregamento da página. É uma chamada de rede por acesso, e é de propósito:
 * assim desativar ou remover um vendedor no dashboard tem efeito na hora, sem
 * esperar a sessão dele expirar.
 */
export async function equipeAutenticada(slug: string): Promise<boolean> {
  const alvo = String(slug || "").trim().toLowerCase();
  const armazenamento = await cookies();
  const valor = armazenamento.get(EQUIPE_COOKIE_NAME)?.value;
  if (!valor) return false;

  const separador = valor.indexOf(".");
  if (separador <= 0) return false;

  const slugDoCookie = valor.slice(0, separador);
  const token = valor.slice(separador + 1);
  if (!comparaSeguro(slugDoCookie, alvo)) return false;

  return tokenDaEquipeEhValido(alvo, token);
}
