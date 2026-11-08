import { NextResponse } from "next/server";
import { getCachedProductByIdentifier } from "@/lib/cache";
import { isTursoActive } from "@/lib/turso";
import { parsePriceToNumber } from "@/lib/utils";
import { normalizarWhatsApp } from "@/lib/avisos-de-preco/regras";
import { LimiteDeAvisos, registrarAviso } from "@/lib/avisos-de-preco/banco";

// ============================================================
// POST /api/avisos-de-preco — "Me avise se baixar" (página do produto).
// { produto, whatsapp, nome?, consentimento: true, origem?, site? }
// O preço guardado é o do catálogo agora (não o que o navegador mandou).
// `site` é armadilha para robô: gente de verdade não vê nem preenche.
// ============================================================

export async function POST(req: Request) {
  if (!isTursoActive()) {
    return NextResponse.json({ ok: false, erro: "Banco indisponível. Tente pelo WhatsApp." }, { status: 503 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  }

  if (typeof body.site === "string" && body.site.trim()) {
    return NextResponse.json({ ok: true }); // robô: finge que deu certo
  }
  if (body.consentimento !== true) {
    return NextResponse.json({ ok: false, erro: "Marque a autorização para receber o aviso no WhatsApp." }, { status: 400 });
  }
  const telefone = normalizarWhatsApp(String(body.whatsapp || ""));
  if (!telefone) {
    return NextResponse.json({ ok: false, erro: "Confira o WhatsApp com DDD, por exemplo (19) 98751-0267." }, { status: 400 });
  }
  const identificador = String(body.produto || "").trim();
  const produto = identificador ? await getCachedProductByIdentifier(identificador).catch(() => null) : null;
  const preco = produto ? parsePriceToNumber(produto.price) : 0;
  if (!produto || !(preco > 0)) {
    return NextResponse.json({ ok: false, erro: "Produto não encontrado." }, { status: 404 });
  }

  const nome = typeof body.nome === "string" ? body.nome.trim().slice(0, 80) || null : null;
  const origem = typeof body.origem === "string" ? body.origem.trim().slice(0, 80) || null : null;
  try {
    await registrarAviso({ produtoId: String(produto.id), produtoNome: produto.name, telefone, nome, preco, origem });
  } catch (e) {
    if (e instanceof LimiteDeAvisos) {
      return NextResponse.json({ ok: false, erro: e.message }, { status: 429 });
    }
    console.error("[avisos-de-preco] erro ao gravar:", (e as Error).message);
    return NextResponse.json({ ok: false, erro: "Não consegui guardar agora. Tente de novo ou chame no WhatsApp." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
