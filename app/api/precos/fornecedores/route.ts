import { NextResponse } from "next/server";
import { cadastrarFornecedorKyte, fonteDoHost, MARGEM_PADRAO_DE_FORNECEDOR } from "@/lib/precos/importacao";
import { identificarLink } from "@/lib/precos/techsupri";
import { lerRegra } from "@/lib/precos/margem";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";

// Protegida pelo proxy (/api/precos exige a sessão do painel).

/**
 * GET ?url=<link colado>  ou  ?host=<endereço do catálogo>
 * Diz de que plataforma é o link e se o fornecedor já está cadastrado.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const texto = searchParams.get("url") || (searchParams.get("host") ? `https://${searchParams.get("host")}/` : "");
    const link = identificarLink(texto);
    if (!link) return NextResponse.json({ ok: true, link: null, fonte: null });
    const fonte = link.plataforma === "kyte" ? await fonteDoHost(link.host) : null;
    return NextResponse.json({ ok: true, link, fonte, margemPadrao: MARGEM_PADRAO_DE_FORNECEDOR });
  } catch (erro) {
    return falha(erro);
  }
}

/**
 * Cadastra um fornecedor da Kyte pelo link do catálogo.
 * { url, nome?, margem? (padrão 66), regra_margem?, pronta_entrega? (padrão true) }
 */
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const link = identificarLink(String(corpo?.url || ""));
    if (!link) return falha("Não reconheci esse link. Por enquanto o painel lê catálogos da KaBuM! e da Kyte.", 400);
    if (link.plataforma === "kabum") {
      return falha("Link da KaBuM!: cadastre pela categoria (Nova fonte, com Testar link).", 400);
    }
    if (corpo?.margem !== undefined && !(Number(corpo.margem) >= 0 && Number(corpo.margem) <= 500)) {
      return falha("A margem precisa ser um número entre 0 e 500.", 400);
    }
    const fonte = await cadastrarFornecedorKyte({
      url: link.url,
      nome: corpo?.nome,
      margem: corpo?.margem === undefined ? undefined : Number(corpo.margem),
      regra_margem: corpo?.regra_margem ? lerRegra(corpo.regra_margem) : null,
      pronta_entrega: corpo?.pronta_entrega !== false,
    });
    return NextResponse.json({ ok: true, fonte });
  } catch (erro) {
    const mensagem = String((erro as Error)?.message || erro);
    return falha(erro, mensagem.includes("já está cadastrado") ? 409 : 500);
  }
}
