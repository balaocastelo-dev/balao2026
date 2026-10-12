import type { Metadata } from "next";
import PainelLoginForm from "@/components/PainelLoginForm";
import WhatsAppPanelClient from "@/components/WhatsAppPanelClient";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const metadata: Metadata = {
  title: "WhatsApp | Balao da Informatica",
  description: "Painel interno protegido do WhatsApp com QR Code e chat em tempo real.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WhatsAppPage() {
  const authenticated = await isPainelAuthenticated();

  if (!authenticated) {
    return (
      // A moldura do site fixa a altura da tela; o login rola por dentro para
      // caber no celular deitado e em telas baixas.
      <main className="relative h-full overflow-y-auto bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.2),_transparent_35%)]" />
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:gap-10">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-red-300 sm:text-sm">
              www.balao.info/whatsapp
            </p>
            <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Central protegida do WhatsApp com QR Code, chat e atendimento.
            </h2>
            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              Entre com a senha para abrir o painel de atendimento do WhatsApp.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="/whatsapp"
            badgeLabel="WhatsApp Protegido"
            title="Acesso ao WhatsApp"
            description="Entre com a senha do painel para abrir a central interna do WhatsApp."
            submitLabel="Entrar no WhatsApp"
          />
        </div>
      </main>
    );
  }

  // O botão de sair fica dentro da barra do painel, junto das outras ações.
  return <WhatsAppPanelClient />;
}
