import type { Metadata } from "next";
import CrmAdminClient from "@/components/crm/CrmAdminClient";

export const metadata: Metadata = {
  title: "Atendimento no WhatsApp",
};

/**
 * O CRM de WhatsApp, visão de administração: conecta o QR Code, cadastra
 * vendedores e abre a caixa da loja inteira.
 *
 * A senha quem confere é a porta do painel (app/painel/layout.tsx). Vendedor
 * do dia a dia não entra por aqui: entra pela página pessoal (ex.: /brendon),
 * com a própria senha.
 */
export default function PainelCrmPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <CrmAdminClient />
    </div>
  );
}
