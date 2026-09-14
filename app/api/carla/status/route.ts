import { NextResponse } from "next/server";
import { registrar, estatisticas } from "@/lib/carla";

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

const STATUS = ["enviado", "respondeu", "optout", "descartado"] as const;
const TIPOS = ["cobranca", "reativacao"] as const;

/**
 * A VPS registra o resultado de cada contato da Carla.
 */
export async function POST(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const whatsapp = String(body?.whatsapp || "").replace(/\D/g, "");
  const tipo = String(body?.tipo || "");
  const status = String(body?.status || "");
  const mensagem = String(body?.mensagem || "").slice(0, 300);

  if (!whatsapp || !TIPOS.includes(tipo as (typeof TIPOS)[number]) || !STATUS.includes(status as (typeof STATUS)[number])) {
    return NextResponse.json({ ok: false, erro: "whatsapp, tipo e status válidos são obrigatórios" }, { status: 400 });
  }

  const { error } = await registrar(
    whatsapp,
    tipo as (typeof TIPOS)[number],
    status as (typeof STATUS)[number],
    mensagem || undefined
  );
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, stats: await estatisticas() });
}
