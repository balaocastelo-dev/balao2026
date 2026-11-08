// PC da loja → site → MEU BLING: a JUL.IA cria orçamento ou pedido (ver lib/pc/porta.ts).
// O corpo vai como veio para POST /agente/documentos do sistema, que confere tudo.
import { NextResponse } from "next/server";
import { portaDoPC, semCache } from "@/lib/pc/porta";
import { chamarSistema, ErroDoSistema } from "@/lib/pdv/sistema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DocumentoCriado {
  id: number;
  numero: number;
  tipo?: string;
  total: number;
  situacao: unknown;
}

export async function POST(req: Request) {
  const recusa = await portaDoPC(req);
  if (recusa) return recusa;

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return NextResponse.json({ erro: "O corpo precisa ser um objeto." }, { status: 400 });
  }

  try {
    const r = await chamarSistema<{ documento?: DocumentoCriado; criada?: boolean }>("POST", "/agente/documentos", corpo);
    const d = r.documento;
    if (!d) return NextResponse.json({ erro: "O sistema não devolveu o documento." }, { status: 502 });
    const tipo = d.tipo ?? String((corpo as { tipo?: unknown }).tipo ?? "");
    return NextResponse.json(
      { documento: { id: d.id, numero: d.numero, tipo, total: d.total, situacao: d.situacao }, criada: Boolean(r.criada) },
      { status: r.criada ? 201 : 200, headers: semCache }
    );
  } catch (e) {
    if (e instanceof ErroDoSistema) return NextResponse.json({ erro: e.message }, { status: e.status });
    return NextResponse.json({ erro: (e as Error).message || "O sistema não respondeu." }, { status: 503 });
  }
}
