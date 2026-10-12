import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { apagarOS, registrarOS } from "@/lib/arena/dados";
import { reconstruirTelao } from "@/lib/arena/estado";

// Desde 12/10/2026 cada OS conta na Arena de vendas: o valor (mão de obra +
// peças) vai para o técnico escolhido aqui. A coluna tecnico_id chegou depois
// da tabela; é criada na primeira gravação. Se a Arena falhar, a OS é salva
// do mesmo jeito (o Fechamento não pode parar por causa do telão).

let colunaConferida = false;
async function garantirColunaDoTecnico() {
  if (colunaConferida) return;
  const r = await turso.execute(
    "SELECT COLUMN_NAME AS nome FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'weekly_orders' AND COLUMN_NAME = 'tecnico_id'"
  );
  if (r.rows.length === 0) await turso.execute("ALTER TABLE weekly_orders ADD COLUMN tecnico_id VARCHAR(64) NULL");
  colunaConferida = true;
}

async function levarParaArena(o: ReturnType<typeof mapRow>) {
  try {
    await registrarOS({
      id: String(o.id),
      numero: o.osNumber ? String(o.osNumber) : null,
      data: String(o.date ?? ""),
      valor: (Number(o.laborIncome) || 0) + (Number(o.partsIncome) || 0),
      tecnicoId: o.tecnicoId,
      status: o.status ? String(o.status) : null,
    });
    await reconstruirTelao();
  } catch (e) {
    console.error("[weekly:arena]", (e as Error).message);
  }
}

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
    paymentMethod: item.payment_method,
    tecnicoId: item.tecnico_id ? String(item.tecnico_id) : null
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
    await garantirColunaDoTecnico();
    const tecnicoId = body.tecnicoId ? String(body.tecnicoId).slice(0, 64) : null;

    // Map camelCase to snake_case (idempotente por id)
    await turso.execute({
      sql: `INSERT INTO weekly_orders (id, os_number, status, date, labor_income, parts_income, labor_expense, parts_expense, payment_method, tecnico_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              os_number = VALUES(os_number),
              status = VALUES(status),
              date = VALUES(date),
              labor_income = VALUES(labor_income),
              parts_income = VALUES(parts_income),
              labor_expense = VALUES(labor_expense),
              parts_expense = VALUES(parts_expense),
              payment_method = VALUES(payment_method),
              tecnico_id = VALUES(tecnico_id)`,
      args: [
        body.id,
        body.osNumber,
        body.status,
        body.date,
        body.laborIncome ?? null,
        body.partsIncome ?? null,
        body.laborExpense ?? null,
        body.partsExpense ?? null,
        body.paymentMethod ?? null,
        tecnicoId
      ]
    });

    const res = await turso.execute({
      sql: "SELECT * FROM weekly_orders WHERE id = ?",
      args: [body.id]
    });
    const row = res.rows[0];
    if (!row) throw new Error("Registro não encontrado após gravação");

    const salva = mapRow(row);
    await levarParaArena(salva);
    return NextResponse.json(salva);
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

    // A OS apagada sai da corrida. (O "zerar a semana" do Fechamento NÃO tira
    // nada da Arena: lá é só a planilha da semana sendo limpa.)
    try {
      await apagarOS(id);
      await reconstruirTelao();
    } catch (e) {
      console.error("[weekly:arena]", (e as Error).message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
