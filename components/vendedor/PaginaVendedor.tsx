import { notFound } from "next/navigation";
import VendedorLoginForm from "@/components/vendedor/VendedorLoginForm";
import VendedorWorkspace from "@/components/vendedor/VendedorWorkspace";
import { isVendedorAutenticado } from "@/lib/vendedor-auth";
import {
  getVendedorPorSlug,
  temSenhaConfigurada,
  vendedorPublico,
} from "@/lib/vendedores";
import { SITE_CONFIG } from "@/lib/config";

/**
 * Página pessoal de atendimento de um vendedor.
 *
 * Cada rota `app/<slug>/page.tsx` é só uma casca chamando este componente —
 * assim as seis páginas não saem de sincronia quando algo muda aqui.
 */
export default async function PaginaVendedor({ slug }: { slug: string }) {
  const vendedor = getVendedorPorSlug(slug);
  if (!vendedor) notFound();

  const autenticado = await isVendedorAutenticado(slug);

  if (!autenticado) {
    return (
      <VendedorLoginForm
        slug={vendedor.slug}
        nome={vendedor.nome}
        cargo={vendedor.cargo}
        redirectTo={`/${vendedor.slug}`}
        numeroLoja={SITE_CONFIG.whatsapp.display}
        // Sem a variável de ambiente, nenhuma senha entra. Avisar isso na tela
        // evita o vendedor ficar tentando senha achando que errou a dele.
        senhaConfigurada={temSenhaConfigurada(vendedor)}
        nomeVariavelSenha={vendedor.envSenha}
      />
    );
  }

  return (
    <VendedorWorkspace
      vendedor={vendedorPublico(vendedor)}
      caminho={`/${vendedor.slug}`}
    />
  );
}
