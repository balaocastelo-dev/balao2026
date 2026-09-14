import { NextResponse } from "next/server";
import { relatorioDaManha, relatorioDoFechamento } from "@/lib/rafa";

export const dynamic = "force-dynamic";

/**
 * Relatórios do Rafa. A VPS chama, monta nada e manda o texto no WhatsApp.
 *
 * A apuração mora aqui, não no worker, porque é aqui que estão as chaves do
 * Bling e o acesso ao banco. O worker só sabe a hora e o número.
 *
 * Mesma porta do Beto e da Carla (BETO_TOKEN): é a mesma máquina. Sem o token
 * configurado a porta fica FECHADA — o fechamento do dia traz faturamento e
 * nome de cliente.
 *
 * GET /api/rafa/relatorio?tipo=manha
 * GET /api/rafa/relatorio?tipo=fechamento[&data=AAAA-MM-DD]
 */
function tokenConfere(req: Request) {
  const esperado = (process.env.BETO_TOKEN || "").trim();
  if (!esperado) return false;
  const veio = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!veio || veio.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= esperado.charCodeAt(i) ^ veio.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function GET(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") || "manha";

  try {
    const texto =
      tipo === "fechamento"
        ? await relatorioDoFechamento(url.searchParams.get("data") || undefined)
        : await relatorioDaManha();

    return NextResponse.json({ ok: true, tipo, texto });
  } catch (erro) {
    // 502 e não um texto inventado: o worker precisa saber que falhou para
    // não mandar um relatório vazio como se fosse o resumo do dia.
    return NextResponse.json(
      { ok: false, erro: (erro as Error).message },
      { status: 502 }
    );
  }
}
