import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";

const COUPON_COLS = [
  'id', 'code', 'discount_type', 'discount_value', 'expiration_date',
  'max_uses', 'current_uses', 'status', 'min_purchase_value',
  'applicable_products', 'applicable_categories',
] as const;

function normalizeValue(v: unknown) {
  if (v === true) return 1;
  if (v === false) return 0;
  if (v !== null && typeof v === 'object') return JSON.stringify(v);
  return v ?? null;
}

export async function GET(request: Request) {
  try {
    const res = await turso.execute("SELECT * FROM coupons ORDER BY created_at DESC");
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check for duplicate code
    const dup = await turso.execute({
      sql: "SELECT id FROM coupons WHERE code = ? LIMIT 1",
      args: [body.code],
    });
    if (dup.rows.length > 0) {
      return NextResponse.json({ error: "Código de cupom já existe." }, { status: 400 });
    }

    const id = body.id ?? randomUUID();
    const cols: string[] = ['id'];
    const args: unknown[] = [id];
    for (const col of COUPON_COLS) {
      if (col === 'id') continue;
      if (body[col] !== undefined) {
        cols.push(col);
        args.push(normalizeValue(body[col]));
      }
    }
    cols.push('created_at', 'updated_at');
    args.push(new Date().toISOString(), new Date().toISOString());

    await turso.execute({
      sql: `INSERT INTO coupons (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      args: args as any[],
    });

    const res = await turso.execute({ sql: "SELECT * FROM coupons WHERE id = ?", args: [id] });
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const sets: string[] = [];
    const args: unknown[] = [];
    for (const col of COUPON_COLS) {
      if (col === 'id') continue;
      if (updates[col] !== undefined) {
        sets.push(`"${col}" = ?`);
        args.push(normalizeValue(updates[col]));
      }
    }
    sets.push('"updated_at" = ?');
    args.push(new Date().toISOString());
    args.push(id);

    await turso.execute({
      sql: `UPDATE coupons SET ${sets.join(', ')} WHERE id = ?`,
      args: args as any[],
    });

    const res = await turso.execute({ sql: "SELECT * FROM coupons WHERE id = ?", args: [id] });
    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Soft delete
    await turso.execute({
      sql: "UPDATE coupons SET status = 'inactive', updated_at = ? WHERE id = ?",
      args: [new Date().toISOString(), id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
