import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Filho de /microsoft. A página do hub continua em app/microsoft/page.tsx;
// o App Router entrega este endereço sem mexer na URL que já existia.
export const revalidate = 300;

const pagina = paginaPorSlug("microsoft/windows");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={await carregarDadosDaPagina(pagina)}
      migalhas={[
        { name: "Licenciamento Microsoft", item: "https://www.balao.info/microsoft" },
        { name: "Windows", item: "https://www.balao.info/microsoft/windows" },
      ]}
    />
  );
}
