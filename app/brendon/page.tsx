import type { Metadata } from "next";
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

const SLUG = "brendon";

// Área de trabalho do Brendon: é aqui que ele responde os clientes.
// Substituiu a antiga página pública de perfil que ficava nesta rota — se ela
// for necessária de novo, está no histórico do git (commit fbd6db5).
const CAMINHO = `/${SLUG}`;

export const metadata: Metadata = {
  title: "Atendimento | Balão da Informática",
  description: "Área interna de atendimento do WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
};

// A sessão vive em cookie, então a página não pode ser cacheada estática.
export const dynamic = "force-dynamic";

export default async function BrendonPage() {
  const vendedor = getVendedorPorSlug(SLUG);
  if (!vendedor) notFound();

  const autenticado = await isVendedorAutenticado(SLUG);

  if (!autenticado) {
    return (
      <VendedorLoginForm
        slug={vendedor.slug}
        nome={vendedor.nome}
        cargo={vendedor.cargo}
        redirectTo={CAMINHO}
        numeroLoja={SITE_CONFIG.whatsapp.display}
        // Sem a variável de ambiente, nenhuma senha entra. Avisar isso na tela
        // evita o vendedor ficar tentando senha achando que errou a dele.
        senhaConfigurada={temSenhaConfigurada(vendedor)}
        nomeVariavelSenha={vendedor.envSenha}
      />
    );
  }

  return <VendedorWorkspace vendedor={vendedorPublico(vendedor)} caminho={CAMINHO} />;
}
