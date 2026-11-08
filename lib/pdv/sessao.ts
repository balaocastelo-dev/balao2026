// ============================================================
// PDV: quem pode usar o caixa.
//
// Até 12/10/2026 o /pdv abria para qualquer pessoa na internet. Agora, com
// emissão de nota fiscal e venda no /sistema, entra quem tem uma das duas
// senhas da loja (as mesmas do resto do sistema):
//   - a senha do painel (cookie do /painel), ou
//   - a senha do dia do balcão (a mesma do /controle e do /fechamento).
// ============================================================

import { cookies } from "next/headers";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { CONTROLE_ADMIN_COOKIE, isControleAdminSessionValid } from "@/lib/controle/auth";

export async function operadorDoPdv(): Promise<string | null> {
  if (await isPainelAuthenticated()) return "Painel";
  const c = await cookies();
  if (isControleAdminSessionValid(c.get(CONTROLE_ADMIN_COOKIE)?.value)) return "Balcão";
  return null;
}

export const RESPOSTA_SEM_SESSAO = { erro: "Entre no PDV com a senha do dia ou a do painel." };
