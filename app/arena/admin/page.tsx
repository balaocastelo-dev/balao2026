import { getVendedores, getConfig, getEventosMidia, getVendasRecentes } from '../actions';
import AdminClient from './AdminClient';

// Força renderização dinâmica pois depende de dados do banco que mudam
export const dynamic = 'force-dynamic';

export default async function ArenaAdminPage() {
  const [vendedores, config, eventosMidia, vendasRecentes] = await Promise.all([
    getVendedores(),
    getConfig(),
    getEventosMidia(),
    getVendasRecentes(100)
  ]);

  return (
    <AdminClient 
      vendedoresIniciais={vendedores} 
      configInicial={config} 
      eventosMidiaIniciais={eventosMidia}
      vendasRecentesIniciais={vendasRecentes}
    />
  );
}
