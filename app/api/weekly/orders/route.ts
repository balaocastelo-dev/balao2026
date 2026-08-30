import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

function mapRow(item: any) {
  return {
    id: item.id,
    osNumber: item.os_number,
    status: item.status,
    date: item.date,
    laborIncome: Number(item.labor_income),
    partsIncome: Number(item.parts_income),
    laborExpense: Number(item.labor_expense),
    partsExpense: Number(item.parts_expense),
    paymentMethod: item.payment_method
  };
}

export async function GET() {
  try {
    const res = await turso.execute("SELECT * FROM weekly_orders ORDER BY date DESC");
    return NextResponse.json(res.rows.map(mapRow));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Map camelCase to snake_case (idempotente por id)
    await turso.execute({
      sql: `INSERT INTO weekly_orders (id, os_number, status, date, labor_income, parts_income, labor_expense, parts_expense, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              os_number = VALUES(os_number),
              status = VALUES(status),
              date = VALUES(date),
              labor_income = VALUES(labor_income),
              parts_income = VALUES(parts_income),
              labor_expense = VALUES(labor_expense),
              parts_expense = VALUES(parts_expense),
              payment_method = VALUES(payment_method)`,
      args: [
        body.id,
        body.osNumber,
        body.status,
        body.date,
        body.laborIncome ?? null,
        body.partsIncome ?? null,
        body.laborExpense ?? null,
        body.partsExpense ?? null,
        body.paymentMethod ?? null
      ]
    });

    const res = await turso.execute({
      sql: "SELECT * FROM weekly_orders WHERE id = ?",
      args: [body.id]
    });
    const row = res.rows[0];
    if (!row) throw new Error("Registro não encontrado após gravação");

    return NextResponse.json(mapRow(row));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await turso.execute({
      sql: "DELETE FROM weekly_orders WHERE id = ?",
      args: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
