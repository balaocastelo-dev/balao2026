"use client";

import { useCallback } from "react";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";

/**
 * Visão de administração do CRM (/painel/crm).
 *
 * A senha do painel já foi conferida no servidor antes desta tela aparecer,
 * então o portão de PIN interno do CRM é dispensado — ele só trancava quem
 * precisa ler o QR Code e cadastrar a equipe. Vendedor do dia a dia entra
 * pela própria página (ex.: /brendon), com a senha dele.
 *
 * O atendimento ocupa o monitor inteiro, sem o menu do painel ao lado. Por
 * isso o botão do topo não encerra a sessão: ele volta para o painel, de onde
 * se chega a todas as outras áreas (e onde fica o "Sair").
 */
export default function CrmAdminClient() {
  const voltarAoPainel = useCallback(() => {
    window.location.href = "/painel";
  }, []);

  return (
    <CrmWhatsAppClient
      admin
      onSair={voltarAoPainel}
      sairLabel="Painel"
      sairTitulo="Voltar ao painel (a sessão continua aberta)"
    />
  );
}
