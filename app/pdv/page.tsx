// ============================================================
// PDV (www.balao.info/pdv) — refeito em 12/10/2026; desde 22/10/2026 ligado
// ao /sistema (MEU BLING) em vez do Bling. Produtos do site; vendedores,
// clientes, vendas e nota fiscal do /sistema, nos dois sentidos. Entra quem
// tem a senha do dia do balcão ou a do painel.
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
