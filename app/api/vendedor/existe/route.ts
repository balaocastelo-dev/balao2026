import { NextResponse } from "next/server";
import { resolverVendedor } from "@/lib/vendedor-pagina";

export const dynamic = "force-dynamic";

/**
 * A tranca do site pergunta isto antes de deixar um endereço de uma palavra
 * seguir. Não devolve nome, cargo, assinatura nem PIN — só se a página existe.
 */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  const vendedor = await resolverVendedor(slug);
  if (!vendedor) {
    return NextResponse.json({ ok: false }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
