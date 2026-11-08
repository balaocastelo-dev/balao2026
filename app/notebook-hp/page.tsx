import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

export const revalidate = 300;

const pagina = paginaPorSlug("notebook-hp");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return <PaginaDeCaptacao pagina={pagina} dados={await carregarDadosDaPagina(pagina)} />;
}
