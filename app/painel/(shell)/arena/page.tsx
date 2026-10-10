import type { Metadata } from "next";
import { getVendedores, getConfig, getEventosMidia, getVendasRecentes } from "@/app/arena/actions";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import ArenaAdminClient from "./ArenaAdminClient";

export const metadata: Metadata = {
  title: "Arena de vendas",
};

// Depende de dados do banco que mudam a cada venda lançada.
export const dynamic = "force-dynamic";

/**
 * A administração da Arena (a corrida de vendas que passa no telão da loja).
 * Ficava em /arena/admin, aberta e sem senha; agora é uma área do painel.
 */
export default async function PainelArenaPage() {
  // A porta do painel já barra quem não entrou; esta conferência evita montar
  // a tela (e ler o histórico de vendas) se algum dia a porta falhar.
  if (!(await isPainelAuthenticated())) return null;

  const [vendedores, config, eventosMidia, vendasRecentes] = await Promise.all([
    getVendedores(),
    getConfig(),
    getEventosMidia(),
    getVendasRecentes(100),
  ]);

  return (
    <ArenaAdminClient
      vendedoresIniciais={vendedores}
      configInicial={config}
      eventosMidiaIniciais={eventosMidia}
      vendasRecentesIniciais={vendasRecentes}
    />
  );
}
