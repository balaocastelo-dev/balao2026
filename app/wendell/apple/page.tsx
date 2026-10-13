import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/wendell-apple.ts (hub Apple; as páginas de
// cada aparelho continuam em app/wendell/apple/<aparelho>).
export const revalidate = 300;

const pagina = paginaPorSlug("wendell/apple");

export const metadata = metadadosDaPagina(pagina);

export default async function Page() {
  return (
    <PaginaDeCaptacao
      pagina={pagina}
      dados={await carregarDadosDaPagina(pagina)}
      migalhas={[{ name: "Especialista Apple", item: "https://www.balao.info/wendell/apple" }]}
    />
  );
}
