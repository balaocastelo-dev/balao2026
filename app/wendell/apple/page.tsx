import PaginaDeCaptacao from "@/components/landing/PaginaDeCaptacao";
import { carregarDadosDaPagina } from "@/lib/landing/dados";
import { metadadosDaPagina } from "@/lib/landing/metadados";
import { paginaPorSlug } from "@/lib/landing/paginas";

// Conteúdo em lib/landing/paginas/wendell-apple.ts. MacBook, iMac e iPhone
// estão em /macbook, /imac e /iphone. iPad, Mac mini e Apple Watch seguem aqui.
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
