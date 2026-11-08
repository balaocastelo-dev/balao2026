import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/tonner.ts. A página sai pronta do
// servidor e é refeita a cada 5 minutos (preços e estoque da vitrine).
// O endereço antigo /tonner redireciona para cá (301 em next.config.ts).
export const revalidate = 300;

const pagina = paginaPorSlug("toner");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return <PaginaDeCaptacao pagina={pagina} dados={await carregarDadosDaPagina(pagina)} />;
}
