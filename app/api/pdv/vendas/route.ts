// ============================================================
// PDV: vendas do dia (as daqui e as lançadas direto no /sistema) e nova venda.
// Nova venda: grava primeiro (nada se perde) e já leva ao /sistema, com a nota
// se pedida; com o /sistema fora no instante, fica aguardando e segue sozinha.
// ============================================================

import { after, NextResponse } from "next/server";
import { hojeNaLoja } from "@/lib/arena/periodos";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { comprovanteDaVenda, lerEntrada, registrarVenda, seguirPendentes, sincronizarVenda, VendaInvalida, vendasDoDia } from "@/lib/pdv/vendas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

let ultimaVoltaAutomatica = 0;

export async function GET(req: Request) {
  if (!(await operadorDoPdv())) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const dia = new URL(req.url).searchParams.get("dia");
  const valido = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : hojeNaLoja();
  try {
    const resumo = await vendasDoDia(valido);
    // Quem estiver aguardando o /sistema segue em segundo plano (no máximo 1 vez por minuto por servidor).
    if (resumo.totais.aguardando > 0 && Date.now() - ultimaVoltaAutomatica > 60_000) {
      ultimaVoltaAutomatica = Date.now();
      after(async () => {
        try {
          await seguirPendentes(2);
        } catch (e) {
          console.error("[pdv:vendas] pendentes:", (e as Error).message);
        }
      });
    }
    return NextResponse.json(resumo);
  } catch (e) {
    console.error("[pdv:vendas]", (e as Error).message);
    return NextResponse.json({ erro: "Não consegui ler as vendas do dia agora." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const operador = await operadorDoPdv();
  if (!operador) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  let bruto: unknown;
  try {
    bruto = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  try {
    const venda = await registrarVenda(lerEntrada(bruto), operador);
    const depois = (await sincronizarVenda(venda.id, { esperarNota: true })) ?? venda;
    return NextResponse.json({ venda: depois, comprovante: comprovanteDaVenda(depois) });
  } catch (e) {
    if (e instanceof VendaInvalida) return NextResponse.json({ erro: e.message, problemas: e.problemas }, { status: 422 });
    console.error("[pdv:nova venda]", (e as Error).message);
    return NextResponse.json({ erro: "A venda não foi gravada. Nada foi cobrado no sistema; tente de novo." }, { status: 503 });
  }
}
