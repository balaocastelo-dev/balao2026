import { notFound, redirect } from "next/navigation";
import VendedorLoginForm from "@/components/vendedor/VendedorLoginForm";
import VendedorWorkspace from "@/components/vendedor/VendedorWorkspace";
import { resolverVendedor, vendedorAutenticadoNaPagina } from "@/lib/vendedor-pagina";
import { SITE_CONFIG } from "@/lib/config";

/**
 * Página pessoal de atendimento.
 *
 * O endereço é o slug do nome no CRM (www.balao.info/gabriel). Sem o PIN
 * daquele vendedor, fica na tela de entrada. Com o PIN, o CRM abre já
 * atendendo como ele, com a assinatura dele e o filtro "Meus".
 * A senha de administração do painel não entra aqui.
 */
export default async function PaginaVendedor({ slug }: { slug: string }) {
  const limpo = String(slug || "").trim().toLowerCase();
  if (slug !== limpo && limpo) {
    const canonico = await resolverVendedor(limpo);
    if (canonico) redirect(`/${canonico.slug}`);
    notFound();
  }

  const vendedor = await resolverVendedor(limpo);
  if (!vendedor) notFound();

  const autenticado = await vendedorAutenticadoNaPagina(vendedor);

  if (!autenticado) {
    return (
      <div data-pagina-vendedor="">
        <VendedorLoginForm
          slug={vendedor.slug}
          nome={vendedor.nome}
          cargo={vendedor.cargo}
          redirectTo={`/${vendedor.slug}`}
          numeroLoja={SITE_CONFIG.whatsapp.display}
        />
      </div>
    );
  }

  return (
    <div data-pagina-vendedor="" className="h-full min-h-0">
      <VendedorWorkspace
        vendedor={{
          id: vendedor.id,
          slug: vendedor.slug,
          nome: vendedor.nome,
          cargo: vendedor.cargo,
          assinatura: vendedor.assinatura,
        }}
        caminho={`/${vendedor.slug}`}
      />
    </div>
  );
}
