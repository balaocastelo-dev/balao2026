import { NextResponse } from "next/server";
import { marcar, devolverParaFila } from "@/lib/beto";

export const dynamic = "force-dynamic";

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

const STATUS_VALIDOS = ["novo", "fila", "contatado", "respondeu", "convertido", "descartado", "optout"] as const;

/**
 * A VPS avisa o resultado de cada envio do Beto:
 *   status=contatado   mensagem enviada
 *   status=novo        envio falhou (volta pra fila e conta tentativa)
 *   status=respondeu   o prospect respondeu
 *   status=optout      pediu para não ser contatado
 */
export async function POST(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const whatsapp = String(body?.whatsapp || "").replace(/\D/g, "");
  const status = String(body?.status || "").trim();
  const observacao = String(body?.observacao || "").slice(0, 300);

  if (!whatsapp || !STATUS_VALIDOS.includes(status as (typeof STATUS_VALIDOS)[number])) {
    return NextResponse.json({ ok: false, erro: "whatsapp e status válido são obrigatórios" }, { status: 400 });
  }

  if (status === "novo") {
    const { error } = await devolverParaFila(whatsapp, observacao || "envio falhou");
    if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await marcar(whatsapp, status as (typeof STATUS_VALIDOS)[number], observacao || undefined);
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
