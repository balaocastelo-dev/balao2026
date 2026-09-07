import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const PAINEL_COOKIE_NAME = "balao_painel_session";

// A senha do painel vem de variável de ambiente (PAINEL_PASSWORD).
//
// Sem a variável definida, o painel fica INACESSÍVEL — e isso precisa ser
// checado explicitamente. O hash de uma senha vazia é um hash válido como
// qualquer outro: sem a guarda abaixo, quem mandasse senha em branco casaria
// com o token esperado e entraria. Ou seja, esquecer a variável (num preview,
// num ambiente novo) abriria o WhatsApp inteiro da loja em vez de trancá-lo.
const PAINEL_PASSWORD = process.env.PAINEL_PASSWORD ?? "";

/** Se o painel chegou a ser configurado. Sem isso, ninguém entra. */
export function isPainelConfigurado() {
  return PAINEL_PASSWORD.length > 0;
}

function buildSessionToken(password: string) {
  return createHash("sha256")
    .update(`${password}:balao-painel`)
    .digest("hex");
}

const EXPECTED_TOKEN = buildSessionToken(PAINEL_PASSWORD);

export function isPainelPasswordValid(password: string) {
  if (!isPainelConfigurado()) return false;
  const received = buildSessionToken(password);
  const a = Buffer.from(received);
  const b = Buffer.from(EXPECTED_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function getPainelSessionToken() {
  return EXPECTED_TOKEN;
}

export async function isPainelAuthenticated() {
  // Mesma guarda do login: sem senha configurada, nem um cookie antigo vale.
  if (!isPainelConfigurado()) return false;

  const store = await cookies();
  const session = store.get(PAINEL_COOKIE_NAME)?.value;
  if (!session) return false;

  const a = Buffer.from(session);
  const b = Buffer.from(EXPECTED_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}
