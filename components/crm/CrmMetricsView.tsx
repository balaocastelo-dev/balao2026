"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Download,
  Percent,
  Award,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { CrmLead, CrmSeller, FunnelStage } from "@/types/crm";

interface CrmMetricsViewProps {
  leads: CrmLead[];
  stages: FunnelStage[];
  sellers: CrmSeller[];
}

export default function CrmMetricsView({
  leads,
  stages,
  sellers,
}: CrmMetricsViewProps) {
  // Calculations
  const totalLeads = leads.length;

  const wonLeads = useMemo(
    () => leads.filter((l) => l.stage === "won"),
    [leads]
  );
  const openLeads = useMemo(
    () => leads.filter((l) => l.stage !== "won" && l.stage !== "lost"),
    [leads]
  );

  const totalWonValue = useMemo(
    () => wonLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0),
    [wonLeads]
  );

  const totalPipelineValue = useMemo(
    () => openLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0),
    [openLeads]
  );

  const conversionRate = totalLeads
    ? ((wonLeads.length / totalLeads) * 100).toFixed(1)
    : "0.0";

  const averageTicket = wonLeads.length
    ? Math.round(totalWonValue / wonLeads.length)
    : 0;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      "Nome",
      "Telefone",
      "Etapa",
      "Valor_RS",
      "Produto_Interesse",
      "Vendedor",
      "Etiquetas",
      "Cidade",
      "Ultima_Mensagem",
      "Data_Criacao",
    ];

    const rows = leads.map((l) => {
      const stage = stages.find((s) => s.id === l.stage)?.title || l.stage;
      const seller = sellers.find((s) => s.id === l.assignedSellerId)?.name || "Sem Vendedor";
      return [
        `"${l.name}"`,
        `"${l.phone}"`,
        `"${stage}"`,
        l.dealValue || 0,
        `"${l.productOfInterest || ""}"`,
        `"${seller}"`,
        `"${l.tags.join("; ")}"`,
        `"${l.city || ""}"`,
        `"${(l.lastMessageBody || "").replace(/"/g, '""')}"`,
        `"${new Date(l.createdAt).toLocaleDateString("pt-BR")}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `balao_crm_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-red-500" /> Métricas & Faturamento do Funil Balão
          </h2>
          <p className="text-xs text-zinc-400">
            Acompanhamento de conversão, vendas ganhas e desempenho de vendas no WhatsApp.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-white transition-colors shadow"
        >
          <Download className="h-4 w-4 text-emerald-400" /> Exportar Leads para CSV / Excel
        </button>
      </div>

      {/* 4 Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline In Negotiation */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Em Aberto no Funil
            </span>
            <span className="text-xl font-black font-mono text-white">
              {formatCurrency(totalPipelineValue)}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              {openLeads.length} negócios em andamento
            </span>
          </div>
        </div>

        {/* Won Value */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Vendas Fechadas
            </span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {formatCurrency(totalWonValue)}
            </span>
            <span className="text-[10px] text-zinc-400 block">
              {wonLeads.length} vendas concluídas
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Taxa de Conversão
            </span>
            <span className="text-xl font-black font-mono text-white">
              {conversionRate}%
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Do lead até o ganho
            </span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Ticket Médio
            </span>
            <span className="text-xl font-black font-mono text-white">
              {formatCurrency(averageTicket)}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Por pedido concluído
            </span>
          </div>
        </div>
      </div>

      {/* Stage Distribution Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Distribuição dos Leads por Etapa do Funil
        </h3>

        <div className="space-y-3">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.id);
            const count = stageLeads.length;
            const stageSum = stageLeads.reduce((acc, l) => acc + (l.dealValue || 0), 0);
            const percent = totalLeads ? Math.round((count / totalLeads) * 100) : 0;

            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-semibold text-zinc-200">{stage.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{count} leads ({percent}%)</span>
                    <span className="font-mono font-bold text-white w-24 text-right">
                      {formatCurrency(stageSum)}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seller Performance Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Desempenho por Vendedor / Atendente Balão
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Vendedor</th>
                <th className="pb-3">Especialidade</th>
                <th className="pb-3 text-center">Leads Ativos</th>
                <th className="pb-3 text-center">Vendas Fechadas</th>
                <th className="pb-3 text-right">Faturamento Ganho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sellers.map((seller) => {
                const sellerLeads = leads.filter((l) => l.assignedSellerId === seller.id);
                const sellerWon = sellerLeads.filter((l) => l.stage === "won");
                const sellerWonVal = sellerWon.reduce((acc, l) => acc + (l.dealValue || 0), 0);

                return (
                  <tr key={seller.id} className="hover:bg-zinc-850/50">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/20 text-red-400 font-bold text-xs border border-red-500/30">
                        {seller.avatar}
                      </div>
                      {seller.name}
                    </td>
                    <td className="py-3 text-zinc-400">{seller.role}</td>
                    <td className="py-3 text-center font-mono font-bold text-zinc-300">
                      {sellerLeads.length}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-emerald-400">
                      {sellerWon.length}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(sellerWonVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
