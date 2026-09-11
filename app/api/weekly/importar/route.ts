import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { exigirPainel } from "@/lib/api-guard";

/**
 * Restaura o histórico do fechamento a partir do backup do banco antigo.
 *
 * O `/fechamento` perdeu 276 ordens de serviço e 24 despesas na migração do
 * Supabase/Turso para o MySQL. O backup existe em disco; esta rota recebe o
 * conteúdo dele e grava de volta.
 *
 * A importação é IDEMPOTENTE: cada registro tem id próprio e é regravado por
 * cima, então rodar duas vezes não duplica nada — importante porque uma
 * importação interrompida no meio precisa poder ser repetida sem medo.
 *
 * Nada é apagado aqui: o que já existe com outro id permanece.
 */

type Ordem = Record<string, unknown>;

const texto = (v: unknown) => (v === null || v === undefined ? null : String(v));
const numero = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function POST(req: Request) {
  const barrado = await exigirPainel();
  if (barrado) return barrado;

  try {
    const corpo = await req.json();
    const ordens: Ordem[] = Array.isArray(corpo?.ordens) ? corpo.ordens : [];
    const despesas: Ordem[] = Array.isArray(corpo?.despesas) ? corpo.despesas : [];

    if (ordens.length === 0 && despesas.length === 0) {
      return NextResponse.json(
        { error: "Nenhum registro para importar. Confira os arquivos escolhidos." },
        { status: 400 }
      );
    }

    let ordensGravadas = 0;
    let despesasGravadas = 0;
    const problemas: string[] = [];

    for (const o of ordens) {
      // Sem id não dá para regravar com segurança: numa segunda tentativa
      // viraria registro duplicado.
      if (!o.id) {
        problemas.push("ordem sem id ignorada");
        continue;
      }
      try {
        await turso.execute({
          sql: `INSERT INTO weekly_orders
                  (id, os_number, status, date, labor_income, parts_income, labor_expense, parts_expense, payment_method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  os_number = VALUES(os_number), status = VALUES(status), date = VALUES(date),
                  labor_income = VALUES(labor_income), parts_income = VALUES(parts_income),
                  labor_expense = VALUES(labor_expense), parts_expense = VALUES(parts_expense),
                  payment_method = VALUES(payment_method)`,
          args: [
            texto(o.id),
            texto(o.os_number ?? o.osNumber),
            texto(o.status),
            texto(o.date),
            numero(o.labor_income ?? o.laborIncome),
            numero(o.parts_income ?? o.partsIncome),
            numero(o.labor_expense ?? o.laborExpense),
            numero(o.parts_expense ?? o.partsExpense),
            texto(o.payment_method ?? o.paymentMethod),
          ],
        });
        ordensGravadas++;
      } catch (e: unknown) {
        problemas.push(`OS ${texto(o.os_number ?? o.id)}: ${(e as Error).message}`);
      }
    }

    for (const d of despesas) {
      if (!d.id) {
        problemas.push("despesa sem id ignorada");
        continue;
      }
      try {
        await turso.execute({
          sql: `INSERT INTO weekly_expenses (id, description, value, category, date)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  description = VALUES(description), value = VALUES(value),
                  category = VALUES(category), date = VALUES(date)`,
          args: [
            texto(d.id),
            texto(d.description),
            numero(d.value),
            texto(d.category),
            texto(d.date),
          ],
        });
        despesasGravadas++;
      } catch (e: unknown) {
        problemas.push(`Despesa ${texto(d.description ?? d.id)}: ${(e as Error).message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      ordensGravadas,
      despesasGravadas,
      // Os primeiros problemas bastam para entender o que houve; a lista
      // inteira só encheria a tela.
      problemas: problemas.slice(0, 10),
      totalDeProblemas: problemas.length,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
