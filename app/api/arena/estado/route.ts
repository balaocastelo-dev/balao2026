// O telão (/arena) e as páginas dos pilotos perguntam aqui. Público: sem cliente e sem reais.
//
// A resposta fica guardada na CDN da Vercel por alguns segundos: várias TVs e
// celulares abertos viram uma leitura só da gaveta.
import { NextResponse } from "next/server";
import { estadoDoTelao } from "@/lib/arena/estado";
import { tipoDaGaveta } from "@/lib/arena/gaveta";

export const dynamic = "force-dynamic";

export async function GET() {
  const estado = await estadoDoTelao();
  if (!estado) return NextResponse.json({ erro: "Arena indisponível" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const s = tipoDaGaveta() === "banco" ? 60 : 10;
  return NextResponse.json(estado, {
    headers: { "Cache-Control": `public, max-age=0, s-maxage=${s}, stale-while-revalidate=600` },
  });
}
