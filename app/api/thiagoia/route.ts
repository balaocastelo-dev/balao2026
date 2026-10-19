import { NextRequest, NextResponse } from "next/server";
import turso from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAVE = "thiagoia_url";

async function garantirTabela(): Promise<void> {
  await turso.execute(
    "CREATE TABLE IF NOT EXISTS herrera_runtime (" +
      "chave VARCHAR(64) PRIMARY KEY, " +
      "valor TEXT, " +
      "atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
      ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    await garantirTabela();
    const r = await turso.execute({
      sql: "SELECT valor FROM herrera_runtime WHERE chave = ?",
      args: [CHAVE],
    });
    const url = (r.rows[0]?.valor as string | undefined) ?? "";
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { url: "", erro: String(e) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const segredo = process.env.HERRERA_PONTE_SEGREDO ?? "";
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  if (!segredo || body.segredo !== segredo) {
    return NextResponse.json({ ok: false, erro: "nao autorizado" }, { status: 401 });
  }
  const url = String(body.url ?? "").trim();
  if (!/^https:\/\/[a-z0-9.-]+/i.test(url)) {
    return NextResponse.json({ ok: false, erro: "url invalida" }, { status: 400 });
  }
  try {
    await garantirTabela();
    await turso.execute({
      sql:
        "INSERT INTO herrera_runtime (chave, valor) VALUES (?, ?) " +
        "ON DUPLICATE KEY UPDATE valor = VALUES(valor)",
      args: [CHAVE, url],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: String(e) }, { status: 500 });
  }
}
