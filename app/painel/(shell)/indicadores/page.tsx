import type { Metadata } from "next";
import PainelDashboard from "@/components/PainelDashboard";

export const metadata: Metadata = {
  title: "Indicadores",
};

/** Os números de venda da loja por período (era a tela inteira do /painel). */
export default function PainelIndicadoresPage() {
  return (
    <PainelDashboard
      endpoint="/api/painel/metrics"
      title="Indicadores"
      description="Vendas, ordens de serviço, visitas e contatos do site, no período que você escolher."
      footerText="Os números vêm do banco de dados da loja e se atualizam sozinhos quando o período é hoje."
    />
  );
}
