import { NextResponse } from "next/server";

/** Erro em português, do jeito que a tela do painel mostra. */
export function falha(erro: unknown, status = 500) {
  const mensagem = String((erro as Error)?.message || erro || "Erro desconhecido");
  console.error("[precos]", mensagem);
  return NextResponse.json({ ok: false, erro: mensagem }, { status });
}
