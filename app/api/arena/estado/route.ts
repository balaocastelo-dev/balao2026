// O telão (/arena) pergunta aqui a cada 20 s. Público: sem cliente e sem reais.
import { NextResponse } from "next/server";
import { estadoDoTelao } from "@/lib/arena/estado";

export const dynamic = "force-dynamic";

export async function GET() {
  const estado = await estadoDoTelao();
  if (!estado) return NextResponse.json({ erro: "Arena indisponível" }, { status: 503 });
  return NextResponse.json(estado, { headers: { "Cache-Control": "no-store" } });
}
