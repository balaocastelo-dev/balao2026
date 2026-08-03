import type { Metadata } from "next";
import PainelDashboard from "@/components/PainelDashboard";
import PainelLoginForm from "@/components/PainelLoginForm";
import PainelLogoutButton from "@/components/PainelLogoutButton";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  title: "Painel",
  description: "Painel interno protegido por senha.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PainelPage() {
  const authenticated = await isPainelAuthenticated();

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              www.balao.info/painel
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Painel interno para acompanhar vendas, visitas e operacao.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Esta area e privada e fica disponivel em <strong>/painel</strong> com
              acesso por senha.
            </p>
          </div>
          <PainelLoginForm />
        </div>
      </main>
    );
  }

  return (
    <PainelDashboard
      endpoint="/api/painel/metrics"
      title="Painel Balão"
      description="Area protegida com visao de vendas, ordens de servico e visitas do site."
      footerText="Painel interno protegido por cookie de sessao."
      actions={<PainelLogoutButton />}
    />
  );
}
