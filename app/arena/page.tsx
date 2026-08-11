import { getVendedores, getConfig, getEventosMidia, getVendasRecentes } from './actions';
import ArenaClient from './ArenaClient';

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
