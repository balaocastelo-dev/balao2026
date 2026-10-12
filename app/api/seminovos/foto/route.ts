// Envio de foto de seminovo pelo painel. O navegador já reduz a foto do
// celular (até 1600 px, JPEG) antes de mandar; aqui só confere e guarda.

import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { FOTO_MAXIMA, guardarFoto, urlDaFoto } from "@/lib/seminovos/dados";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ erro: "Sessão do painel vencida. Entre de novo." }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  const arquivo = form?.get("foto");
  if (!(arquivo instanceof File)) return NextResponse.json({ erro: "Nenhuma foto recebida." }, { status: 400 });
  if (arquivo.size > FOTO_MAXIMA) return NextResponse.json({ erro: "Foto grande demais (máximo 3 MB)." }, { status: 413 });
  try {
    const chave = await guardarFoto(Buffer.from(await arquivo.arrayBuffer()), arquivo.type);
    return NextResponse.json({ chave, url: urlDaFoto(chave) });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 400 });
  }
}
