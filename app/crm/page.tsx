import type { Metadata } from "next";
import CrmAdminClient from "@/components/crm/CrmAdminClient";
import PainelLoginForm from "@/components/PainelLoginForm";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  title: "CRM WhatsApp | Balão da Informática (WASeller)",
  description:
    "Central de atendimento e CRM de vendas do WhatsApp do Balão da Informática com conexão via QR Code, funil Kanban, scripts de vendas e disparos em massa.",
  robots: {
    index: false,
    follow: false,
  },
};

// A sessão vive em cookie, então a página não pode ser cacheada estática.
export const dynamic = "force-dynamic";

/**
 * Visão de administração do CRM: conecta o QR Code, cadastra vendedores e
 * abre a caixa da loja inteira. Pede a senha do painel, porque o portão de
 * PIN de dentro do componente é só do lado do navegador — sozinho ele não
 * impede ninguém de carregar a página e ver a estrutura do atendimento.
 *
 * Vendedor do dia a dia não entra por aqui: entra pela página pessoal
 * (ex.: /brendon), com a própria senha.
 */
export default async function CrmPage() {
  const autenticado = await isPainelAuthenticated();

  if (!autenticado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.2),_transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-red-300">
              www.balao.info/crm
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Administração do CRM de WhatsApp.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Conexão do QR Code, cadastro de vendedores e caixa completa da loja.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              É vendedor? Entre pela sua página pessoal (ex.:{" "}
              <span className="font-semibold text-slate-200">www.balao.info/brendon</span>) com a
              sua senha.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="/crm"
            badgeLabel="CRM Protegido"
            title="Acesso ao CRM"
            description="Entre com a senha do painel para abrir a administração do CRM."
            submitLabel="Entrar no CRM"
          />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <CrmAdminClient />
    </div>
  );
}
