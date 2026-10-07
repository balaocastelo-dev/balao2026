import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { desfazerTroca, situacaoDaTroca, trocarCatalogo, type CargaInicial } from "@/lib/precos/banco";
import { invalidarCacheCategorias, invalidarCacheProdutos } from "@/lib/cache";
import { motivoDeRecusa, type RegrasDaFonte } from "@/lib/precos/produto";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// A carga vai junto com o deploy (ver outputFileTracingIncludes no
// next.config.ts). É gerada por scripts/precos-carga-inicial.ts.
async function lerCarga(): Promise<CargaInicial> {
  const arquivo = path.join(process.cwd(), "data", "catalogo-inicial.json");
  return JSON.parse(await readFile(arquivo, "utf8")) as CargaInicial;
}

export async function GET() {
  try {
    const [situacao, carga] = await Promise.all([situacaoDaTroca(), lerCarga()]);
    // Conta o que de fato entra: a mesma peneira que a troca aplica
    // (indisponível, pré-venda, fora da faixa, repetido entre fontes).
    const usados = new Set<string>();
    const fontes = carga.fontes.map((f) => {
      const regras: RegrasDaFonte = {
        id: f.id,
        nome: f.nome,
        so_loja: f.so_loja !== false,
        margem: f.margem ?? 33,
        preco_min: f.preco_min ?? null,
        preco_max: f.preco_max ?? null,
        trilha: f.trilha ?? null,
        categoria_destino: f.categoria_destino ?? null,
      };
      let entram = 0;
      for (const item of f.itens) {
        if (usados.has(item.codigo) || motivoDeRecusa(item, regras)) continue;
        usados.add(item.codigo);
        entram++;
      }
      return { nome: f.nome, itens: entram, margem: regras.margem, so_loja: regras.so_loja };
    });
    return NextResponse.json({ ok: true, situacao, carga: { coletadoEm: carga.coletadoEm, fontes } });
  } catch (erro) {
    return falha(erro);
  }
}

/**
 * { "confirmar": "TROCAR" }   — troca o catálogo atual pelo das fontes.
 * { "confirmar": "DESFAZER" } — devolve o catálogo guardado na cópia de segurança.
 *
 * A palavra por extenso é de propósito: esta rota apaga o catálogo inteiro, e
 * um POST vazio enviado por engano não pode fazer isso.
 */
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const pedido = String(corpo?.confirmar || "");

    if (pedido === "DESFAZER") {
      const resultado = await desfazerTroca();
      invalidarCacheProdutos();
      invalidarCacheCategorias();
      return NextResponse.json({ ok: true, desfeita: true, ...resultado });
    }

    if (pedido !== "TROCAR") {
      return falha('Para trocar o catálogo, envie { "confirmar": "TROCAR" }.', 400);
    }

    const situacao = await situacaoDaTroca();
    if (situacao.comFonte > 0 && corpo?.deNovo !== true) {
      return falha("A troca já foi feita: o catálogo já vem das fontes. Use \"Ler agora\" para atualizar os preços.", 409);
    }

    const resultado = await trocarCatalogo(await lerCarga());
    invalidarCacheProdutos();
    invalidarCacheCategorias();
    return NextResponse.json({ ok: true, ...resultado });
  } catch (erro) {
    return falha(erro);
  }
}
