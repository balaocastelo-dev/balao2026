"use client";

import { useCallback, useState } from "react";
import CrmDashboard from "@/components/crm/CrmDashboard";
import CrmWhatsAppClient from "@/components/crm/CrmWhatsAppClient";

/**
 * Visão de administração do CRM (/crm).
 *
 * Duas telas no mesmo endereço: o painel de números (o que está acontecendo na
 * loja, quem está atendendo, quanto entrou) e a caixa de atendimento completa.
 *
 * A senha do painel já foi conferida no servidor antes desta tela aparecer,
 * então o portão de PIN interno do CRM é dispensado — ele só trancava quem
 * precisa ler o QR Code e cadastrar a equipe. Vendedor do dia a dia entra
 * pela própria página (ex.: /brendon), com a senha dele.
 */
export default function CrmAdminClient() {
  const [tela, setTela] = useState<"painel" | "atendimento">("painel");

  const sair = useCallback(async () => {
    try {
      await fetch("/api/painel/logout", { method: "POST" });
    } catch {
      // Mesmo sem resposta do servidor, volta para a tela de senha.
    }
    window.location.href = "/crm";
  }, []);

  // O atendimento ocupa a tela inteira de propósito (é a exigência de quem
  // atende o dia todo), então ele entra sem a barra de cima.
  if (tela === "atendimento") {
    return (
      <CrmWhatsAppClient
        admin
        onSair={sair}
        sairLabel="Sair do painel"
        onVoltarPainel={() => setTela("painel")}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
            Balão · administração
          </span>
          <div className="flex items-center gap-2">
            {/* Baixar uma cópia do banco para o próprio computador.
                A VPS já guarda uma por dia; isto é para quando você quiser
                levar uma cópia embora — antes de uma importação grande, por
                exemplo. É link normal, não botão com JavaScript: arquivo de
                alguns MB o navegador baixa melhor sozinho. */}
            <a
              href="/api/backup"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              title="Baixa todas as tabelas do banco em um arquivo JSON"
            >
              Baixar backup
            </a>

            <button
              onClick={() => setTela("atendimento")}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
            >
              Abrir atendimento
            </button>
            <button
              onClick={sair}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <CrmDashboard />
      </div>
    </div>
  );
}
