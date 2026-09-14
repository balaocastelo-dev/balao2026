import { NextResponse } from "next/server";
import { exigirPainel } from "@/lib/api-guard";
import { estadoBling } from "@/lib/bling";

export const dynamic = "force-dynamic";

/** Estado da conexão com o Bling para o painel. Nunca devolve o token. */
export async function GET() {
  const barrado = await exigirPainel();
  if (barrado) return barrado;
  return NextResponse.json({ ok: true, ...(await estadoBling()) });
}
