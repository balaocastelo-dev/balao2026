import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { getVendedorLogado } from "@/lib/vendedor-auth";
import { emitirSocketToken, socketTokenConfigurado } from "@/lib/socket-token";

export const dynamic = "force-dynamic";

/**
 * Entrega o bilhete que abre o socket do WhatsApp.
 *
 * Aceita as DUAS portas que existem hoje: a senha do painel (admin, /crm) e a
 * senha do vendedor (a página pessoal, ex.: /thiago). Aceitar só a do painel
 * trancaria todos os vendedores fora da caixa de atendimento no meio do
 * expediente — que é o jeito mais rápido de um conserto de segurança ser
 * desfeito às pressas.
 */
export async function GET() {
  if (!socketTokenConfigurado()) {
    return NextResponse.json(
      { ok: false, erro: "PANEL_SOCKET_SECRET não configurado no site" },
      { status: 503 }
    );
  }

  const [painel, vendedor] = await Promise.all([
    isPainelAuthenticated(),
    getVendedorLogado(),
  ]);

  if (!painel && !vendedor) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const bilhete = emitirSocketToken();
  return NextResponse.json({
    ok: true,
    ...bilhete,
    quem: painel ? "painel" : vendedor?.slug || "vendedor",
  });
}
