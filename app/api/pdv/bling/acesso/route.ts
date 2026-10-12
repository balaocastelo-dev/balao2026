// ============================================================
// PDV: o vigia do PC entrega aqui o access_token do Bling (só ele — o
// refresh_token nunca sai do PC, e só a sentinela do Bionic renova).
// A porta é a mesma chave do vigia da Arena (pareada em /painel/arena).
// Assim que o acesso chega, as vendas que esperavam o Bling seguem.
// ============================================================

import { after, NextResponse } from "next/server";
import { chaveConfere, lerConfig } from "@/lib/arena/dados";
import { guardarAcesso } from "@/lib/pdv/acesso";
import { seguirPendentes } from "@/lib/pdv/vendas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  let config;
  try {
    config = await lerConfig();
  } catch {
    return NextResponse.json({ erro: "Gaveta indisponível agora; o vigia tenta de novo." }, { status: 503 });
  }
  if (!chaveConfere(m ? m[1].trim() : null, config.chaveHash)) {
    return NextResponse.json({ erro: "Chave do vigia inválida." }, { status: 401 });
  }
  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  try {
    const mudou = await guardarAcesso({
      token: String(corpo.accessToken ?? ""),
      expiraEm: String(corpo.expiraEm ?? ""),
      maquina: corpo.maquina ? String(corpo.maquina).slice(0, 60) : null,
    });
    after(async () => {
      try {
        await seguirPendentes(5);
      } catch (e) {
        console.error("[pdv:acesso] pendentes:", (e as Error).message);
      }
    });
    return NextResponse.json({ ok: true, mudou });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 400 });
  }
}
