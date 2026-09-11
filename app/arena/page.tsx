import type { Metadata } from "next";
import { getVendedores, getConfig, getEventosMidia, getVendasRecentes } from './actions';
import ArenaClient from './ArenaClient';

export const metadata: Metadata = {
  title: "Arena de Vendas | Balão da Informática",
  description: "Painel de acompanhamento de vendas da equipe do Balão da Informática.",
  alternates: { canonical: "https://www.balao.info/arena" },
  robots: { index: false, follow: true },
};


// Força renderização dinâmica
export const dynamic = 'force-dynamic';

export default async function ArenaPage() {
  const [vendedores, config, eventos, vendasRecentes] = await Promise.all([
    getVendedores(),
    getConfig(),
    getEventosMidia(),
    getVendasRecentes(10)
  ]);

  return (
    <ArenaClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
      eventosIniciais={eventos}
      vendasRecentesIniciais={vendasRecentes}
    />
  );
}
