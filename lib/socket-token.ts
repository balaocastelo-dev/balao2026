import { createHmac, timingSafeEqual } from "crypto";

// ============================================================
// Bilhete de entrada do socket do WhatsApp.
//
// O servidor da VPS transmite `whatsapp:chats` e `whatsapp:messages` para
// quem estiver conectado. Até 14/09 ele aceitava qualquer conexão: dava para
// abrir um socket de fora, sem credencial nenhuma, e receber 515 conversas e
// 300 mensagens — nome, telefone e conteúdo de cliente. O endereço do
// servidor está no JavaScript público do site por definição, então "ninguém
// sabe o endereço" nunca foi proteção.
//
// O navegador não pode carregar um segredo, e a VPS não enxerga o cookie do
// site (origem diferente). Então o site, que JÁ sabe quem passou pela senha
// do painel ou entrou como vendedor, assina um bilhete curto; a VPS confere
// a assinatura com o mesmo segredo e não precisa saber de cookie nenhum.
// ============================================================

const SEGREDO = process.env.PANEL_SOCKET_SECRET || "";

/** Uma jornada de trabalho. Curto o bastante para um bilhete vazado morrer
 *  no mesmo dia, longo o bastante para o vendedor não relogar no meio do
 *  atendimento. */
const VALIDADE_MS = 8 * 60 * 60 * 1000;

export function socketTokenConfigurado(): boolean {
  return SEGREDO.length > 0;
}

function assinar(expira: number): string {
  return createHmac("sha256", SEGREDO).update(String(expira)).digest("hex");
}

/** Bilhete no formato `expira.assinatura`. */
export function emitirSocketToken(): { token: string; expira: number } | null {
  if (!socketTokenConfigurado()) return null;
  const expira = Date.now() + VALIDADE_MS;
  return { token: `${expira}.${assinar(expira)}`, expira };
}

/**
 * Confere um bilhete. Usada nos testes aqui e reimplementada em JS puro no
 * servidor da VPS, que não compila TypeScript.
 */
export function conferirSocketToken(token: string): boolean {
  if (!socketTokenConfigurado()) return false;

  const partes = String(token || "").split(".");
  if (partes.length !== 2) return false;

  const expira = Number(partes[0]);
  if (!Number.isFinite(expira) || expira < Date.now()) return false;

  const esperado = Buffer.from(assinar(expira));
  const veio = Buffer.from(partes[1]);
  return esperado.length === veio.length && timingSafeEqual(esperado, veio);
}
