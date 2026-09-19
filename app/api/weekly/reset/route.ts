import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function DELETE(req: Request) {
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
