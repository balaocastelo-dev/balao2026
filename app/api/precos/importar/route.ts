import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { fonteDaTechsupri, importarTechsupri } from "@/lib/precos/importacao";
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
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
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
