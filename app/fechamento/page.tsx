import type { Metadata } from "next";
import FechamentoClient from "./FechamentoClient";
import PainelLoginForm from "@/components/PainelLoginForm";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  title: "Fechamento de Caixa | Balão da Informática",
  description: "Controle interno de ordens de serviço e despesas da assistência técnica.",
  robots: { index: false, follow: false },
};

// A sessão vive em cookie, então a página não pode ser cacheada.
export const dynamic = "force-dynamic";

/**
 * Fechamento de caixa da assistência técnica.
 *
 * A senha é conferida NO SERVIDOR antes de a tela existir. Antes o portão era
 * só do navegador — a "senha do dia" ficava no JavaScript da página, à vista de
 * quem abrisse o console, e as rotas `/api/weekly/*` não exigiam nem isso:
 * qualquer pessoa com o endereço lia faturamento, despesas e salários da loja,
 * e podia apagar tudo.
 */
export default async function FechamentoPage() {
  if (!(await isPainelAuthenticated())) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              www.balao.info/fechamento
            </p>
            <h2 className="text-4xl font-bold leading-tight">Fechamento de caixa.</h2>
            <p className="mt-4 text-base text-slate-300">
              Ordens de serviço, despesas e o resultado da semana da assistência técnica.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              O acesso agora é com a <span className="font-semibold text-slate-200">senha do painel</span>,
              a mesma do /crm — não mais a senha do dia.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="/fechamento"
            badgeLabel="Área Financeira"
            title="Acesso ao fechamento"
            description="Entre com a senha do painel para abrir o fechamento de caixa."
            submitLabel="Entrar"
          />
        </div>
      </main>
    );
  }

  return <FechamentoClient />;
}
