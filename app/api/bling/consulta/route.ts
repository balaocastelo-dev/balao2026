import { NextResponse } from "next/server";
import {
  listarPedidos,
  listarContasAReceber,
  listarContatos,
  contatoPorTelefone,
  resumoDoDia,
  estadoBling,
} from "@/lib/bling";

export const dynamic = "force-dynamic";

/**
 * Leitura do Bling para quem está fora do site — hoje, o servidor MCP.
 *
 * Por que passar por aqui em vez de o MCP falar direto com o Bling: o token
 * do ERP, o refresh e o limite de 3 req/s vivem num lugar só. Um segundo
 * cliente com credencial própria giraria o refresh_token por conta dele e
 * derrubaria a conexão do primeiro — o Bling mata o token anterior a cada
 * renovação. E significa que o desktop do Thiago guarda um token de máquina
 * revogável, não a credencial do ERP inteiro.
 *
 * Somente leitura. Emitir pedido é escrita no faturamento da loja e não entra
 * por uma porta de consulta.
 *
 * GET /api/bling/consulta?recurso=estado
 * GET /api/bling/consulta?recurso=pedidos&de=AAAA-MM-DD&ate=AAAA-MM-DD
 * GET /api/bling/consulta?recurso=contas&de=&ate=
 * GET /api/bling/consulta?recurso=contatos&busca=nome
 * GET /api/bling/consulta?recurso=contato-telefone&telefone=19...
 * GET /api/bling/consulta?recurso=resumo-dia&data=AAAA-MM-DD
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

  const p = new URL(req.url).searchParams;
  const recurso = p.get("recurso") || "estado";
  const de = p.get("de") || undefined;
  const ate = p.get("ate") || undefined;

  try {
    switch (recurso) {
      case "estado":
        return NextResponse.json({ ok: true, ...(await estadoBling()) });

      case "pedidos": {
        const { pedidos, erro } = await listarPedidos({ dataInicial: de, dataFinal: ate });
        return NextResponse.json({ ok: !erro, pedidos, erro });
      }

      case "contas": {
        const { contas, erro } = await listarContasAReceber({ dataInicial: de, dataFinal: ate });
        return NextResponse.json({ ok: !erro, contas, erro });
      }

      case "contatos": {
        const { contatos, erro } = await listarContatos({ pesquisa: p.get("busca") || undefined });
        return NextResponse.json({ ok: !erro, contatos, erro });
      }

      case "contato-telefone": {
        const contato = await contatoPorTelefone(p.get("telefone") || "");
        return NextResponse.json({ ok: true, contato });
      }

      case "resumo-dia":
        return NextResponse.json({ ok: true, resumo: await resumoDoDia(p.get("data") || undefined) });

      default:
        return NextResponse.json({ ok: false, erro: `recurso desconhecido: ${recurso}` }, { status: 400 });
    }
  } catch (erro) {
    return NextResponse.json({ ok: false, erro: (erro as Error).message }, { status: 502 });
  }
}
