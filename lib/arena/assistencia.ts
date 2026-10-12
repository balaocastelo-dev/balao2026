// ============================================================
// Arena: traz para a corrida as OS que já estão no Fechamento da assistência
// (tabela weekly_orders, no MySQL). Cada OS nova já entra sozinha quando é
// salva lá; isto é para as que foram lançadas antes de 12/10 (tarde) e para
// conferir. OS sem técnico entra, mas só conta depois que alguém for escolhido
// (no Fechamento ou no painel da Arena).
// ============================================================

import { registrarOS } from "./dados";

export async function trazerOSDoFechamento(): Promise<{ trazidas: number; semTecnico: number }> {
  const { turso } = await import("@/lib/turso");
  const r = await turso.execute("SELECT * FROM weekly_orders");
  let trazidas = 0;
  let semTecnico = 0;
  for (const x of r.rows as Record<string, unknown>[]) {
    const data = String(x.date ?? "");
    if (!x.id || !/^\d{4}-\d{2}-\d{2}$/.test(data)) continue;
    const tecnicoId = x.tecnico_id ? String(x.tecnico_id) : null;
    await registrarOS({
      id: String(x.id),
      numero: x.os_number ? String(x.os_number) : null,
      data,
      valor: (Number(x.labor_income) || 0) + (Number(x.parts_income) || 0),
      tecnicoId,
      status: x.status ? String(x.status) : null,
    });
    trazidas++;
    if (!tecnicoId) semTecnico++;
  }
  return { trazidas, semTecnico };
}
