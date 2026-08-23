import type { Metadata } from "next";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";

export const metadata: Metadata = {
  title: "CRM WhatsApp | Balão da Informática (WASeller)",
  description:
    "Central de atendimento e CRM de vendas do WhatsApp do Balão da Informática com conexão via QR Code, funil Kanban, scripts de vendas e disparos em massa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CrmPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <CrmWhatsAppClient />
    </div>
  );
}
