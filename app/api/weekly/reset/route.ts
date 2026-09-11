import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { exigirPainel } from "@/lib/api-guard";

export async function DELETE(req: Request) {
  const barrado = await exigirPainel();
  if (barrado) return barrado;

  try {
    // Apaga todos os registros
    await turso.batch([
      { sql: "DELETE FROM weekly_orders", args: [] },
      { sql: "DELETE FROM weekly_expenses", args: [] },
    ], 'write');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
