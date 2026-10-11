import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { fonteDaTechsupri, importarDoFornecedor, importarTechsupri, SITES_POR_IMPORTACAO } from "@/lib/precos/importacao";
import { buscarFonte } from "@/lib/precos/banco";
import { produtosDaCaptura, type ProdutoCapturado } from "@/lib/precos/techsupri";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Protegida pelo proxy (/api/precos exige a sessão do painel ou o token de admin).

/** Situação da fonte da TechSupri. */
export async function GET() {
  try {
    const fonte = await fonteDaTechsupri();
    return NextResponse.json({ ok: true, fonte });
  } catch (erro) {
    return falha(erro);
  }
}

/**
 * Importa o catálogo da TechSupri.
 *
 * { "fornecedor": "techsupri", "arquivo": true }
 *    usa a captura que foi junto com o deploy (data/techsupri-catalogo.json),
 *    numa passada só.
 * { "fornecedor": "techsupri", "produtos": [...] | "linhas": "id|nome|preço|promo|categoria|X\n...",
 *   "inicio"?: "...", "final"?: true }
 *    lote vindo do navegador. O primeiro lote devolve `inicio`; os seguintes
 *    repetem esse valor e o último manda `final: true`.
 */
/** Só os campos do produto que a importação usa (o resto do que vem da Kyte é descartado). */
function limparProduto(p: Record<string, unknown>): ProdutoCapturado | null {
  if (!p || typeof p !== "object") return null;
  const categoria = p.category as { name?: unknown } | null | undefined;
  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);
  return {
    id: String(p.id ?? "").slice(0, 64),
    name: String(p.name ?? "").slice(0, 300),
    salePrice: Number(p.salePrice) || 0,
    salePromotionalPrice: Number(p.salePromotionalPrice) || null,
    category: { name: texto(categoria?.name, 120) || undefined },
    active: p.active !== false,
    showOnCatalog: p.showOnCatalog !== false,
    stockActive: p.stockActive === true,
    stock: typeof p.stock === "number" ? p.stock : p.stock && typeof p.stock === "object" ? { current: Number((p.stock as { current?: unknown }).current) } : null,
    stockStatus: texto(p.stockStatus, 40),
    url: texto(p.url, 400),
    image: texto(p.image, 600),
    gallery: Array.isArray(p.gallery) ? p.gallery.slice(0, 8).map((g) => texto(g, 600)) : null,
    foto: texto(p.foto, 600),
    fotos: Array.isArray(p.fotos) ? (p.fotos.slice(0, 8).map((g) => texto(g, 600)).filter(Boolean) as string[]) : null,
  };
}

export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));

    // Qualquer fornecedor da Kyte, pela fonte: { fonte_id, produtos, inicio?, final? }
    if (corpo?.fonte_id) {
      const fonte = await buscarFonte(String(corpo.fonte_id));
      if (!fonte) return NextResponse.json({ ok: false, erro: "Fornecedor não encontrado." }, { status: 404 });
      if (!SITES_POR_IMPORTACAO.includes(fonte.site)) {
        return NextResponse.json({ ok: false, erro: "Esta fonte é lida pelo servidor, não por importação." }, { status: 400 });
      }
      const lista = Array.isArray(corpo.produtos) ? corpo.produtos : [];
      if (lista.length > 1000) return NextResponse.json({ ok: false, erro: "Mande no máximo 1000 produtos por lote." }, { status: 400 });
      const produtos = lista.map(limparProduto).filter((p: ProdutoCapturado | null): p is ProdutoCapturado => !!p && !!p.id && !!p.name);
      const resultado = await importarDoFornecedor(fonte, produtos, {
        inicio: corpo.inicio || null,
        final: corpo.final === true,
        limiteMs: Date.now() + 80_000,
      });
      const depois = await buscarFonte(fonte.id);
      return NextResponse.json({ ok: true, resultado, fonte: depois });
    }

    if (String(corpo?.fornecedor || "") !== "techsupri") {
      return NextResponse.json({ ok: false, erro: "Fornecedor desconhecido." }, { status: 400 });
    }

    if (corpo.arquivo === true) {
      const arquivo = path.join(process.cwd(), "data", "techsupri-catalogo.json");
      const carga = JSON.parse(await readFile(arquivo, "utf8")) as { capturadoEm?: string; produtos: ProdutoCapturado[] };
      // As fotos da carga já foram procuradas ao montar o arquivo.
      const resultado = await importarTechsupri(carga.produtos || [], { final: true, buscarFotos: false });
      return NextResponse.json({ ok: true, capturadoEm: carga.capturadoEm || null, resultado });
    }

    // `linhas` é o texto da captura do navegador (o mesmo formato do script).
    const produtos =
      typeof corpo.linhas === "string"
        ? produtosDaCaptura(corpo.linhas)
        : Array.isArray(corpo.produtos)
          ? (corpo.produtos as ProdutoCapturado[])
          : [];
    if (produtos.length > 1000) {
      return NextResponse.json({ ok: false, erro: "Mande no máximo 1000 produtos por lote." }, { status: 400 });
    }
    const resultado = await importarTechsupri(produtos, {
      inicio: corpo.inicio || null,
      final: corpo.final === true,
      limiteMs: Date.now() + 80_000,
    });
    return NextResponse.json({ ok: true, resultado });
  } catch (erro) {
    return falha(erro);
  }
}
