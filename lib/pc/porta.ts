// ============================================================
// Porta das rotas do PC da loja (/api/pc/*).
//
// Decisão do Thiago (25/10/2026): o Bling sai de tudo e o PC da loja (JUL.IA,
// relatórios do Telegram) fala com o MEU BLING passando pelo site. O PC não
// recebe chave nova: usa a que já tem, a antiga "chave do vigia" da Arena
// (pareada em /painel/arena), agora chamada "chave do PC da loja". O site
// guarda só o resumo dela (config.chaveHash da Arena).
// ============================================================

import { NextResponse } from "next/server";
import { chaveConfere, lerConfig } from "@/lib/arena/dados";

function chaveDoPedido(req: Request): string | null {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

/** null = pode passar; senão, a resposta de recusa (401, ou 503 se a gaveta estiver fora). */
export async function portaDoPC(req: Request): Promise<NextResponse | null> {
  try {
    const config = await lerConfig();
    if (chaveConfere(chaveDoPedido(req), config.chaveHash)) return null;
    return NextResponse.json({ erro: "Chave do PC da loja inválida. Pareie de novo em /painel/arena → Ligação com o MEU BLING." }, { status: 401 });
  } catch (e) {
    console.error("[pc:porta]", (e as Error).message);
    return NextResponse.json({ erro: "O site está sem acesso à gaveta agora; tente de novo." }, { status: 503 });
  }
}

export const semCache = { "Cache-Control": "no-store" };
