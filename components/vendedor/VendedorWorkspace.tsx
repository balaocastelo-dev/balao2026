"use client";

import { useCallback } from "react";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";
import type { VendedorPublico } from "@/lib/vendedores";

type VendedorWorkspaceProps = {
  vendedor: VendedorPublico;
  /** Rota desta área, para onde voltar depois de sair. */
  caminho?: string;
};

/**
 * Área de atendimento de um vendedor.
 *
 * Reaproveita o CRM inteiro (`CrmWhatsAppClient`) — a caixa de conversas é a
 * mesma para todo mundo, porque é o número da loja. O que muda por pessoa é
 * quem está atendendo: assinatura, kanban pessoal e o filtro "meus
 * atendimentos". Como o vendedor já entrou com a senha dele no Next, o
 * portão de PIN interno do CRM é dispensado.
 */
export default function VendedorWorkspace({
  vendedor,
  caminho,
}: VendedorWorkspaceProps) {
  const sair = useCallback(async () => {
    try {
      await fetch("/api/vendedor/logout", { method: "POST" });
    } catch {
      // Mesmo sem resposta do servidor, tira o vendedor da tela.
    }
    // Volta para a própria área, que sem sessão cai na tela de login.
    window.location.href = caminho || `/${vendedor.slug}`;
  }, [caminho, vendedor.slug]);

  return (
    <CrmWhatsAppClient
      vendedorFixo={{
        id: vendedor.id,
        nome: vendedor.nome,
        cargo: vendedor.cargo,
        assinatura: vendedor.assinatura,
      }}
      onSair={sair}
      sairLabel="Sair"
    />
  );
}
