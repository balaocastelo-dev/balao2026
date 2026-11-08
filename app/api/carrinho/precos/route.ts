import { NextResponse } from "next/server";
import { getCachedProductByIdentifier } from "@/lib/cache";
import { MAXIMO_DE_ITENS, precoAtualDe, type PrecoAtual } from "@/lib/carrinho/precos";

// ============================================================
// POST /api/carrinho/precos  { ids: string[] }
// Devolve o preço de AGORA de cada produto do carrinho, para o navegador
// trocar a cópia antiga guardada no localStorage (lib/carrinho/precos.ts).
// Usa o cache do catálogo (2 min, derrubado a cada gravação de preço) para
// não gastar a cota de conexões do banco a cada carrinho aberto.
// ============================================================

export async function POST(req: Request) {
  let ids: string[] = [];
  try {
    const body = (await req.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      ids = body.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
    }
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  ids = [...new Set(ids)].slice(0, MAXIMO_DE_ITENS);
  const produtos: Record<string, PrecoAtual> = {};

  await Promise.all(
    ids.map(async (id) => {
      const p = await getCachedProductByIdentifier(id).catch(() => null);
      if (p && p.price) produtos[id] = { ...precoAtualDe(p), id };
    })
  );

  return NextResponse.json({ produtos }, { headers: { "Cache-Control": "no-store" } });
}
