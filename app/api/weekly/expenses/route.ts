import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET() {
  try {
    const res = await turso.execute("SELECT * FROM weekly_expenses ORDER BY date DESC");
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await turso.execute({
      sql: `INSERT INTO weekly_expenses (id, description, value, category, date)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              description = VALUES(description),
              value = VALUES(value),
              category = VALUES(category),
              date = VALUES(date)`,
      args: [
        body.id,
        body.description ?? null,
        body.value ?? null,
        body.category ?? null,
        body.date ?? null
      ]
    });

    const res = await turso.execute({
      sql: "SELECT * FROM weekly_expenses WHERE id = ?",
      args: [body.id]
    });
    return NextResponse.json(res.rows[0] ?? null);
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
      sql: "DELETE FROM weekly_expenses WHERE id = ?",
      args: [id]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
