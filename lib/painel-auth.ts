import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const PAINEL_COOKIE_NAME = "balao_painel_session";

// A senha do painel vem de variável de ambiente (PAINEL_PASSWORD).
// Sem a variável definida, o painel fica INACESSÍVEL (falha fechada, por segurança).
const PAINEL_PASSWORD = process.env.PAINEL_PASSWORD ?? "";

function buildSessionToken(password: string) {
  return createHash("sha256")
    .update(`${password}:balao-painel`)
    .digest("hex");
}

const EXPECTED_TOKEN = buildSessionToken(PAINEL_PASSWORD);

export function isPainelPasswordValid(password: string) {
  const received = buildSessionToken(password);
  const a = Buffer.from(received);
  const b = Buffer.from(EXPECTED_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function getPainelSessionToken() {
  return EXPECTED_TOKEN;
}

export async function isPainelAuthenticated() {
  const store = await cookies();
  const session = store.get(PAINEL_COOKIE_NAME)?.value;
  if (!session) return false;

  const a = Buffer.from(session);
  const b = Buffer.from(EXPECTED_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}
