// PDV: busca de produtos do site (só do site — nada do cadastro do Bling).
import { NextResponse } from "next/server";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { buscarProdutos } from "@/lib/pdv/produtos";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await operadorDoPdv())) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 120) ?? "";
  try {
    return NextResponse.json({ produtos: await buscarProdutos(q) });
  } catch (e) {
    console.error("[pdv:produtos]", (e as Error).message);
    return NextResponse.json({ produtos: [], erro: "A busca do catálogo não respondeu agora. Tente de novo." }, { status: 503 });
  }
}
