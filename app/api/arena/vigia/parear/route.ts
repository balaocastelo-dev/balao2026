// Pareamento do vigia da Arena (ver lib/arena/pareamento.ts).
import { NextResponse } from "next/server";
import { buscarChavePareada, pedirPareamento } from "@/lib/arena/pareamento";

export const dynamic = "force-dynamic";

// Só para segurar abuso: um pedido novo a cada 20 s por instância.
let ultimoPedido = 0;

export async function POST(req: Request) {
  if (Date.now() - ultimoPedido < 20_000) {
    return NextResponse.json({ erro: "Espere alguns segundos e tente de novo." }, { status: 429 });
  }
  ultimoPedido = Date.now();
  const corpo = (await req.json().catch(() => ({}))) as { maquina?: string };
  try {
    return NextResponse.json(await pedirPareamento(String(corpo.maquina ?? "")));
  } catch (e) {
    console.error("[arena:parear]", (e as Error).message);
    return NextResponse.json({ erro: "Arena sem acesso à gaveta agora." }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const pedido = new URL(req.url).searchParams.get("pedido") || "";
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  try {
    const r = await buscarChavePareada(pedido.slice(0, 40), token.slice(0, 100));
    if (r === null) return NextResponse.json({ aprovado: false }, { headers: { "Cache-Control": "no-store" } });
    if ("erro" in r) return NextResponse.json(r, { status: 403, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ aprovado: true, chave: r.chave }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[arena:parear]", (e as Error).message);
    return NextResponse.json({ erro: "Arena sem acesso à gaveta agora." }, { status: 503 });
  }
}
