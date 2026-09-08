import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VendedorLoginForm from "@/components/vendedor/VendedorLoginForm";
import VendedorWorkspace from "@/components/vendedor/VendedorWorkspace";
import { buscarVendedorDaEquipe, equipeAutenticada } from "@/lib/equipe";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Atendimento | Balão da Informática",
  description: "Área interna de atendimento do WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
};

// A sessão vive em cookie e o cadastro vem do servidor de atendimento, então
// a página não pode ser cacheada.
export const dynamic = "force-dynamic";

/**
 * Página de atendimento dos vendedores cadastrados pelo dashboard (/crm).
 *
 * A equipe fixa tem uma pasta própria (app/brendon, app/julia…), porque a
 * senha dela mora em variável de ambiente. Aqui é o caminho para quem foi
 * criado pela tela de administração: nada precisa ser publicado, o cadastro
 * fica no whatsapp-server e a pessoa já entra.
 */
export default async function PaginaDaEquipe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendedor = await buscarVendedorDaEquipe(slug);
  if (!vendedor) notFound();

  if (vendedor.ativo === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <h1 className="text-lg font-bold text-amber-200">Acesso desativado</h1>
          <p className="mt-2 text-sm text-amber-100/80">
            O acesso de {vendedor.nome} está desativado no painel da loja. Fale com a
            administração para reativar.
          </p>
        </div>
      </main>
    );
  }

  if (!(await equipeAutenticada(slug))) {
    return (
      <VendedorLoginForm
        slug={vendedor.slug}
        nome={vendedor.nome}
        cargo={vendedor.cargo}
        redirectTo={`/equipe/${vendedor.slug}`}
        numeroLoja={SITE_CONFIG.whatsapp.display}
        endpoint="/api/equipe/login"
      />
    );
  }

  return (
    <VendedorWorkspace
      vendedor={{
        id: vendedor.id,
        slug: vendedor.slug,
        nome: vendedor.nome,
        cargo: vendedor.cargo,
        assinatura: vendedor.assinatura,
      }}
      caminho={`/equipe/${vendedor.slug}`}
      rotaDeSaida="/api/equipe/logout"
    />
  );
}
