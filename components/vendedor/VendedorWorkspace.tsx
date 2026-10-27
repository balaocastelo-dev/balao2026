"use client";

import { useCallback, useState } from "react";
import { MessageSquare, Megaphone } from "lucide-react";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";
import EnviarPromocao from "@/components/vendedor/EnviarPromocao";
import type { VendedorPublico } from "@/lib/vendedores";

type VendedorWorkspaceProps = {
  vendedor: VendedorPublico;
  /** Rota desta área, para onde voltar depois de sair. */
  caminho?: string;
};

type Aba = "atendimento" | "promocao";

/**
 * Área de atendimento de um vendedor.
 *
 * Reaproveita o CRM inteiro (`CrmWhatsAppClient`) — a caixa de conversas é a
 * mesma para todo mundo, porque é o número da loja. O que muda por pessoa é
 * quem está atendendo: assinatura, kanban pessoal e o filtro "meus
 * atendimentos". Como o vendedor já entrou com a senha dele no Next, o
 * portão de PIN interno do CRM é dispensado.
 *
 * A aba "Enviar promoção" é a ferramenta de mandar um produto do site para o
 * WhatsApp do cliente pela linha da loja (components/vendedor/EnviarPromocao).
 */
export default function VendedorWorkspace({
  vendedor,
  caminho,
}: VendedorWorkspaceProps) {
  const [aba, setAba] = useState<Aba>("atendimento");

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
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2">
        <button
          onClick={() => setAba("atendimento")}
          className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition-colors ${
            aba === "atendimento"
              ? "border-[#E60012] text-[#E60012]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare size={16} /> Atendimento
        </button>
        <button
          onClick={() => setAba("promocao")}
          className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-bold transition-colors ${
            aba === "promocao"
              ? "border-[#E60012] text-[#E60012]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Megaphone size={16} /> Enviar promoção
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {aba === "atendimento" ? (
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
        ) : (
          <EnviarPromocao />
        )}
      </div>
    </div>
  );
}
