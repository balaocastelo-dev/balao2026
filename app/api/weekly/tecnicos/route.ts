// Técnicos da Arena (pilotos com função "técnico"), para o Fechamento da
// assistência escolher de quem é cada OS. Só id e nome: são os mesmos nomes
// que já aparecem no telão.
import { NextResponse } from "next/server";
import { listarTecnicos } from "@/lib/arena/dados";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listarTecnicos(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[weekly:tecnicos]", (e as Error).message);
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
