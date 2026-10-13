import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/assistenciagames.ts. A página sai pronta do
// servidor e é refeita a cada 5 minutos (preços e estoque da vitrine).
export const revalidate = 300;

const pagina = paginaPorSlug("assistenciagames");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return <PaginaDeCaptacao pagina={pagina} dados={await carregarDadosDaPagina(pagina)} />;
}
