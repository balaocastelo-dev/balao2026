import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { getCachedProductByIdentifier } from "@/lib/cache";
import { parsePriceToNumber } from "@/lib/utils";
import { mensagemDoAviso, normalizarWhatsApp } from "@/lib/avisos-de-preco/regras";
import { enviarNoWhatsApp } from "@/lib/avisos-de-preco/disparo";

// ============================================================
// POST /api/avisos-de-preco/teste  { whatsapp, produto }  — só com o painel aberto.
// Manda UM aviso de exemplo (marcado [TESTE]) para o número informado, para
// conferir como o cliente recebe. Regra da casa: teste só para os números do
// Thiago, nunca para cliente.
// ============================================================

export async function POST(req: Request) {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ ok: false, erro: "Entre no painel primeiro." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const telefone = normalizarWhatsApp(String(body.whatsapp || ""));
  if (!telefone) return NextResponse.json({ ok: false, erro: "WhatsApp inválido." }, { status: 400 });
  const produto = await getCachedProductByIdentifier(String(body.produto || "")).catch(() => null);
  const preco = produto ? parsePriceToNumber(produto.price) : 0;
  if (!produto || !(preco > 0)) return NextResponse.json({ ok: false, erro: "Produto não encontrado." }, { status: 404 });

  const texto =
    "[TESTE do aviso de queda de preço]\n\n" +
    mensagemDoAviso({
      nome: "Thiago",
      produto: produto.name,
      precoQuandoPediu: Math.round(preco * 1.1 * 100) / 100,
      precoAgora: preco,
      link: `https://www.balao.info/product/${encodeURIComponent(produto.slug || produto.id)}`,
    });
  try {
    await enviarNoWhatsApp(telefone, texto, produto.image);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: (e as Error).message }, { status: 502 });
  }
  return NextResponse.json({ ok: true, enviadoPara: telefone });
}
