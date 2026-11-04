import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Hub em lib/landing/paginas/microsoft.ts. Os filhos ficam em
// app/microsoft/windows, windows-server e office-365: são rotas próprias,
// então /microsoft continua no endereço que já estava no ar.
// A página sai pronta do servidor e é refeita a cada 5 minutos.
export const revalidate = 300;

const pagina = paginaPorSlug("microsoft");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return <PaginaDeCaptacao pagina={pagina} dados={await carregarDadosDaPagina(pagina)} />;
}
