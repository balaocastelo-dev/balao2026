import { NextResponse } from "next/server";
import { exigirPainel } from "@/lib/api-guard";
import { listarContatos, resumirContatos } from "@/lib/captura";

export const dynamic = "force-dynamic";

/**
 * Lê os contatos capturados no site.
 *
 * Trancada atrás da senha do painel: é lista de telefone de gente que deixou o
 * contato confiando na loja. Uma rota aberta aqui seria a própria base de
 * clientes disponível para quem descobrisse o endereço.
 *
 * GET /api/captura/lista            -> resumo + últimos 200
 * GET /api/captura/lista?resumo=1   -> só os números, sem telefone nenhum
 * GET /api/captura/lista?limite=500&origem=livros&desde=2026-01-01
 */
export async function GET(request: Request) {
  const barrado = await exigirPainel();
  if (barrado) return barrado;

  const url = new URL(request.url);
  const resumo = await resumirContatos();

  if (url.searchParams.get("resumo")) {
    return NextResponse.json({ ok: true, resumo });
  }

  const contatos = await listarContatos({
    limite: Number(url.searchParams.get("limite")) || 200,
    desde: url.searchParams.get("desde"),
    origem: url.searchParams.get("origem"),
  });

  return NextResponse.json({ ok: true, resumo, contatos });
}
