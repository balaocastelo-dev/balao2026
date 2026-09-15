import { NextResponse } from "next/server";
import { estadoDaProspeccao, podeProspectar } from "@/lib/livia";
import { tokenDaVpsConfere } from "@/lib/livia-auth";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";

/**
 * Onde a LIV.IA está: modo, rampa de aquecimento e alarme de rejeição.
 *
 * Aberta às duas portas que existem — o token da VPS e a senha do painel —
 * porque quem precisa deste número é o worker (para saber se pode mandar) e
 * o Thiago (para ver antes de a reputação cair).
 */
export async function GET(req: Request) {
  const daVps = tokenDaVpsConfere(req);
  const doPainel = daVps ? false : await isPainelAuthenticated();
  if (!daVps && !doPainel) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const [estado, permissao] = await Promise.all([estadoDaProspeccao(), podeProspectar()]);

  return NextResponse.json({
    ok: true,
    modo: (process.env.LIVIA_MODO || "rascunho") as "rascunho" | "automatico",
    ativo: String(process.env.LIVIA_ATIVO || "").toLowerCase() === "true",
    prospeccao: estado,
    podeProspectar: permissao.pode,
    motivo: permissao.motivo,
  });
}
