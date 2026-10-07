import { NextResponse } from "next/server";
import { criarFonte, listarFontes, situacaoDaTroca } from "@/lib/precos/banco";
import { interpretarLinkKabum, lerPaginaDaCategoria } from "@/lib/precos/kabum";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// A trava de senha fica no proxy.ts: /api/precos exige a sessão do painel em
// qualquer método, porque até a leitura expõe as margens da loja.

export async function GET() {
  try {
    const [fontes, troca] = await Promise.all([listarFontes({ comContagem: true }), situacaoDaTroca()]);
    return NextResponse.json({ ok: true, fontes, troca });
  } catch (erro) {
    return falha(erro);
  }
}

export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const link = interpretarLinkKabum(String(corpo?.url || ""));
    if (!link) {
      return falha("Cole o link de uma categoria da KaBuM! (ex.: https://www.kabum.com.br/hardware/ssd-2-5).", 400);
    }

    const soLoja = corpo?.so_loja === undefined ? true : Boolean(corpo.so_loja);

    // Confere o link lendo a primeira página: se não vier produto, não adianta cadastrar.
    const leitura = await lerPaginaDaCategoria(link.caminho, soLoja, 1);
    if (!leitura.ok) {
      return falha(`Não consegui ler essa categoria agora: ${leitura.detalhe}.`, leitura.motivo === "bloqueado" ? 503 : 400);
    }
    if (leitura.pagina.itens.length === 0) {
      return falha("Essa categoria não devolveu nenhum produto com o filtro escolhido.", 400);
    }

    const trilha = leitura.pagina.trilha;
    const nome = String(corpo?.nome || "").trim() || trilha.split("/").pop() || link.caminho;

    const fonte = await criarFonte({
      nome,
      url: `https://www.kabum.com.br/${link.caminho}`,
      caminho: link.caminho,
      so_loja: soLoja,
      margem: Number(corpo?.margem ?? 33),
      intervalo_min: Number(corpo?.intervalo_min ?? 120),
      preco_min: corpo?.preco_min ?? null,
      preco_max: corpo?.preco_max ?? null,
      trilha,
      categoria_destino: corpo?.categoria_destino || null,
    });
    return NextResponse.json({ ok: true, fonte, anunciado: leitura.pagina.anunciado });
  } catch (erro) {
    const mensagem = String((erro as Error)?.message || erro);
    return falha(erro, mensagem.includes("já está cadastrada") ? 409 : 500);
  }
}
