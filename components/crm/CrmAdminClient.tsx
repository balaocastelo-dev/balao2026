"use client";

import { useCallback } from "react";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";

/**
 * Visão de administração do CRM (/crm).
 *
 * A senha do painel já foi conferida no servidor antes desta tela aparecer,
 * então o portão de PIN interno do CRM é dispensado — ele só trancava quem
 * precisa ler o QR Code e cadastrar a equipe. Vendedor do dia a dia entra
 * pela própria página (ex.: /brendon), com a senha dele.
 */
export default function CrmAdminClient() {
  const sair = useCallback(async () => {
    try {
      await fetch("/api/painel/logout", { method: "POST" });
    } catch {
      // Mesmo sem resposta do servidor, volta para a tela de senha.
    }
    window.location.href = "/crm";
  }, []);

  return <CrmWhatsAppClient admin onSair={sair} sairLabel="Sair do painel" />;
}
