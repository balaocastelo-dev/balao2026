import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";

/**
 * Conversas do número do Beto, para a aba dele no /crm.
 *
 * O navegador não fala direto com o container do Beto: telefone de cliente
 * não trafega por rota aberta. Aqui a porta é a senha do painel (cookie) e o
 * site é quem guarda o BETO_PANEL_TOKEN que o container exige.
 */
export async function GET() {
  const autenticado = await isPainelAuthenticated();
  if (!autenticado) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const base = (process.env.BETO_PANEL_SERVER_URL || "https://srv1963897.hstgr.cloud/beto").replace(/\/$/, "");
  const token = (process.env.BETO_PANEL_TOKEN || "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, conversas: [], erro: "BETO_PANEL_TOKEN ausente" });
  }

  try {
    const resposta = await fetch(`${base}/api/crm/conversas-recentes?limite=15`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15_000),
    });
    const dados = await resposta.json();
    return NextResponse.json({ ok: true, conversas: dados?.conversas || [] });
  } catch {
    return NextResponse.json({ ok: false, conversas: [], erro: "servidor do Beto fora do ar" });
  }
}
