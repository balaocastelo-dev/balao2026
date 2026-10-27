import { NextResponse } from "next/server";
import { getVendedorLogado } from "@/lib/vendedor-auth";
import { getProductById } from "@/lib/db";
import { getCachedProductByIdentifier } from "@/lib/cache";
import { enviarNoWhatsApp, WhatsAppDesconectado } from "@/lib/avisos-de-preco/disparo";
import { montarMensagemPromo, normalizarTelefone, janelaDeEnvioAberta } from "@/lib/promocoes/mensagem";
import type { Product } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ============================================================
// POST /api/vendedor/promocao
// Envia UM produto para UM cliente pela linha da loja (VPS /api/enviar-foto).
// Só responde para vendedor logado (cookie de sessão). O envio em lista é o
// navegador chamando esta rota uma vez por cliente, com pausa entre cada um
// (components/vendedor/EnviarPromocao.tsx) — assim respeita intervalo, janela
// de horário e teto sem depender de processo longo na Vercel.
// ============================================================

async function buscarProduto(id: string): Promise<Product | null> {
  const direto = await getProductById(id).catch(() => null);
  if (direto) return direto;
  return getCachedProductByIdentifier(id).catch(() => null);
}

export async function POST(req: Request) {
  const vendedor = await getVendedorLogado();
  if (!vendedor) {
    return NextResponse.json({ ok: false, erro: "Entre com o seu login de vendedor." }, { status: 401 });
  }

  let body: { productId?: unknown; telefone?: unknown; chamada?: unknown; emLista?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  const telefoneBruto = typeof body.telefone === "string" ? body.telefone : "";
  const chamada = typeof body.chamada === "string" ? body.chamada : "";
  const emLista = body.emLista === true;

  if (!productId) {
    return NextResponse.json({ ok: false, erro: "Escolha um produto." }, { status: 400 });
  }

  const telefone = normalizarTelefone(telefoneBruto);
  if (!telefone) {
    return NextResponse.json(
      { ok: false, erro: `Telefone inválido: "${telefoneBruto}". Use DDD + número.` },
      { status: 400 }
    );
  }

  // Em lista (campanha), respeita a janela de 9h–18h, sem domingo — a mesma
  // regra do disparo por tema. Um cliente avulso o vendedor manda quando quiser.
  if (emLista && !janelaDeEnvioAberta()) {
    return NextResponse.json(
      { ok: false, erro: "Fora do horário de envio em massa (9h–18h, exceto domingo).", foraDeJanela: true },
      { status: 409 }
    );
  }

  const produto = await buscarProduto(productId);
  if (!produto) {
    return NextResponse.json({ ok: false, erro: "Produto não encontrado no catálogo." }, { status: 404 });
  }

  const texto = montarMensagemPromo(produto, {
    chamada,
    assinatura: vendedor.assinatura,
    incluirOptout: emLista,
  });

  try {
    await enviarNoWhatsApp(telefone, texto, produto.image);
    return NextResponse.json({ ok: true, enviadoPara: telefone, produto: produto.name });
  } catch (e) {
    if (e instanceof WhatsAppDesconectado) {
      return NextResponse.json(
        { ok: false, erro: "A linha de WhatsApp da loja está fora do ar. Tente de novo em instantes." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false, erro: (e as Error).message || "Falha ao enviar." },
      { status: 502 }
    );
  }
}
