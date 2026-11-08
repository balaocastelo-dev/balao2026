// PC da loja → site → MEU BLING: vendas de um período, com os totais (ver lib/pc/porta.ts).
import { NextResponse } from "next/server";
import { portaDoPC, semCache } from "@/lib/pc/porta";
import { ErroDoSistema } from "@/lib/pdv/sistema";
import { diasEntre, lerVendasDoSistema, MAX_DIAS_POR_PEDIDO, totaisDasVendas } from "@/lib/arena/sistema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DIA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const recusa = await portaDoPC(req);
  if (recusa) return recusa;

  const q = new URL(req.url).searchParams;
  const de = q.get("de") || "";
  const ate = q.get("ate") || "";
  if (!DIA.test(de) || !DIA.test(ate) || Number.isNaN(Date.parse(de)) || Number.isNaN(Date.parse(ate))) {
    return NextResponse.json({ erro: "Informe de=AAAA-MM-DD e ate=AAAA-MM-DD." }, { status: 400 });
  }
  if (de > ate) return NextResponse.json({ erro: "A data inicial (de) é depois da final (ate)." }, { status: 400 });
  if (diasEntre(de, ate).length > MAX_DIAS_POR_PEDIDO) {
    return NextResponse.json({ erro: `No máximo ${MAX_DIAS_POR_PEDIDO} dias por consulta.` }, { status: 400 });
  }

  try {
    const leitura = await lerVendasDoSistema(de, ate, { limiteMs: 50_000 });
    if (!leitura.completo) {
      return NextResponse.json({ erro: "O sistema demorou demais para devolver o período inteiro; peça um período menor." }, { status: 504 });
    }
    return NextResponse.json({ de, ate, vendas: leitura.vendas, totais: totaisDasVendas(leitura.vendas) }, { headers: semCache });
  } catch (e) {
    if (e instanceof ErroDoSistema) return NextResponse.json({ erro: e.message }, { status: e.status });
    return NextResponse.json({ erro: (e as Error).message || "O sistema não respondeu." }, { status: 503 });
  }
}
