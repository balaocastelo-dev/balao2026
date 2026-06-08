import type { Metadata } from "next";
import PainelLoginForm from "@/components/PainelLoginForm";
import PainelLogoutButton from "@/components/PainelLogoutButton";
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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.2),_transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-start">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-red-300">
              www.balao.info/whatsapp
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Central protegida do WhatsApp com QR Code, chat e atendimento.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Entre com a senha para abrir o painel de atendimento do WhatsApp.
            </p>
          </div>
          <PainelLoginForm
            redirectTo="/whatsapp"
            badgeLabel="WhatsApp Protegido"
            title="Acesso ao WhatsApp"
            description="Entre com a senha 56676009 para abrir a central interna do WhatsApp."
            submitLabel="Entrar no WhatsApp"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f7]">
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <div className="mb-4 flex justify-end">
          <PainelLogoutButton redirectTo="/whatsapp" label="Sair do WhatsApp" />
        </div>
      </div>
      <WhatsAppPanelClient />
    </main>
  );
}
