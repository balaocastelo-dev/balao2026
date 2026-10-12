// ============================================================
// PDV (www.balao.info/pdv) — refeito em 12/10/2026.
// Produtos do site; vendedores, vendas e nota fiscal do Bling, nos dois
// sentidos. Entra quem tem a senha do dia do balcão ou a do painel.
// Detalhes em docs/pdv.md.
// ============================================================

import { operadorDoPdv } from "@/lib/pdv/sessao";
import Caixa from "./_componentes/Caixa";
import Entrada from "./_componentes/Entrada";

export const dynamic = "force-dynamic";

export default async function PdvPage() {
  const operador = await operadorDoPdv();
  return operador ? <Caixa operador={operador} /> : <Entrada />;
}
