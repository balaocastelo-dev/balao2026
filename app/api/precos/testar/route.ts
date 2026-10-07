import { NextResponse } from "next/server";
import { calcularVenda, normalizarMargem } from "@/lib/precos/calculo";
import { interpretarLinkKabum, lerPaginaDaCategoria } from "@/lib/precos/kabum";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Prévia de um link antes de cadastrar: lê só a primeira página e não grava nada. */
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const link = interpretarLinkKabum(String(corpo?.url || ""));
    if (!link) return falha("Esse link não é de uma categoria da KaBuM!.", 400);

    const soLoja = corpo?.so_loja === undefined ? true : Boolean(corpo.so_loja);
    const margem = normalizarMargem(corpo?.margem ?? 33);

    const leitura = await lerPaginaDaCategoria(link.caminho, soLoja, 1);
    if (!leitura.ok) {
      return falha(`Não consegui ler essa categoria agora: ${leitura.detalhe}.`, leitura.motivo === "bloqueado" ? 503 : 400);
    }

    const { itens, anunciado, totalDePaginas, trilha } = leitura.pagina;
    const disponiveis = itens.filter((i) => i.disponivel && i.pix > 0 && !i.openbox && !i.preVenda);
    return NextResponse.json({
      ok: true,
      caminho: link.caminho,
      trilha,
      anunciado,
      totalDePaginas,
      vendedores: [...new Set(itens.map((i) => i.vendedor || "—"))].slice(0, 12),
      amostra: disponiveis.slice(0, 8).map((i) => {
        const venda = calcularVenda({ pix: i.pix, cartao: i.cartao, parcelas: i.parcelas }, margem);
        return {
          nome: i.nome,
          vendedor: i.vendedor,
          origemPix: i.pix,
          origemCartao: i.cartao,
          vendaPix: venda.pix,
          vendaCartao: venda.cartao,
          oferta: i.oferta,
        };
      }),
    });
  } catch (erro) {
    return falha(erro);
  }
}
