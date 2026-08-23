"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  User,
  Phone,
  MessageCircle,
  Tag as TagIcon,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit3,
  Clock,
  Briefcase,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CrmLead, CrmSeller, CrmTag, FunnelStage, FunnelStageId } from "@/types/crm";

interface CrmKanbanViewProps {
  stages: FunnelStage[];
  leads: CrmLead[];
  tags: CrmTag[];
  sellers: CrmSeller[];
  onMoveLead: (leadId: string, targetStage: FunnelStageId) => void;
  onOpenChat: (chatId: string) => void;
  onSelectLeadDrawer: (lead: CrmLead) => void;
  onCreateLead: (lead: Partial<CrmLead>) => void;
  onDeleteLead: (leadId: string) => void;
}

export default function CrmKanbanView({
  stages,
  leads,
  tags,
  sellers,
  onMoveLead,
  onOpenChat,
  onSelectLeadDrawer,
  onCreateLead,
  onDeleteLead,
}: CrmKanbanViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New lead form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadValue, setNewLeadValue] = useState("0");
  const [newLeadProduct, setNewLeadProduct] = useState("");
  const [newLeadStage, setNewLeadStage] = useState<FunnelStageId>("new_lead");
  const [newLeadSeller, setNewLeadSeller] = useState<string>("wendell");
  const [newLeadTags, setNewLeadTags] = useState<string[]>(["pcgamer"]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.productOfInterest &&
          lead.productOfInterest.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeller =
        selectedSeller === "all" || lead.assignedSellerId === selectedSeller;

      const matchesTag =
        selectedTag === "all" || lead.tags.includes(selectedTag);

      return matchesSearch && matchesSeller && matchesTag;
    });
  }, [leads, searchTerm, selectedSeller, selectedTag]);

  // Group leads by stage
  const stageColumns = useMemo(() => {
    return stages.map((stage) => {
      const stageLeads = filteredLeads.filter((lead) => lead.stage === stage.id);
      const stageValue = stageLeads.reduce((acc, lead) => acc + (lead.dealValue || 0), 0);
      return {
        ...stage,
        leads: stageLeads,
        totalValue: stageValue,
      };
    });
  }, [stages, filteredLeads]);

  const handleStageMove = (leadId: string, targetStage: FunnelStageId) => {
    if (targetStage === "won") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"],
      });
    }
    onMoveLead(leadId, targetStage);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const rawDigits = newLeadPhone.replace(/\D/g, "");
    const formattedDigits = rawDigits.startsWith("55") ? rawDigits : `55${rawDigits}`;
    const chatId = `${formattedDigits}@c.us`;

    onCreateLead({
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      displayNumber: `+${formattedDigits}`,
      chatId,
      dealValue: Number(newLeadValue) || 0,
      productOfInterest: newLeadProduct.trim() || undefined,
      stage: newLeadStage,
      assignedSellerId: newLeadSeller || null,
      tags: newLeadTags,
      unreadCount: 0,
      lastMessageBody: "Lead adicionado manualmente no CRM Balão.",
      lastMessageTimestamp: Date.now(),
      notes: [],
    });

    // Reset
    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadValue("0");
    setNewLeadProduct("");
    setIsCreateModalOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffMin = Math.floor((Date.now() - timestamp) / (60 * 1000));
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}m atrás`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, telefone, PC Gamer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Seller Filter */}
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
            >
              <option value="all">Todos Vendedores</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
            >
              <option value="all">Todas Etiquetas</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-950/40 hover:bg-red-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {stageColumns.map((stage, colIdx) => (
            <div
              key={stage.id}
              className="flex flex-col w-72 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm h-full max-h-full"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    {stage.shortTitle}
                  </h3>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-300">
                    {stage.leads.length}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {formatCurrency(stage.totalValue)}
                </span>
              </div>

              {/* Column Cards Stream */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {stage.leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500 text-xs">
                    <p>Nenhum lead nesta etapa</p>
                  </div>
                ) : (
                  stage.leads.map((lead) => {
                    const assignedSeller = sellers.find(
                      (s) => s.id === lead.assignedSellerId
                    );
                    const leadTags = tags.filter((t) => lead.tags.includes(t.id));

                    return (
                      <div
                        key={lead.id}
                        className="group relative rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-md hover:border-zinc-700 hover:bg-zinc-850 transition-all"
                      >
                        {/* Top: Name & Deal Value */}
                        <div className="flex items-start justify-between gap-2">
                          <div
                            onClick={() => onSelectLeadDrawer(lead)}
                            className="cursor-pointer flex-1"
                          >
                            <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                              {lead.name}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 text-zinc-500" />
                              {lead.phone}
                            </p>
                          </div>
                          {lead.dealValue > 0 && (
                            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                              {formatCurrency(lead.dealValue)}
                            </span>
                          )}
                        </div>

                        {/* Product of interest */}
                        {lead.productOfInterest && (
                          <div className="mt-2 text-[11px] text-zinc-300 bg-zinc-950/60 rounded-md px-2 py-1 border border-zinc-800/60 line-clamp-1">
                            💻 {lead.productOfInterest}
                          </div>
                        )}

                        {/* Last message preview */}
                        {lead.lastMessageBody && (
                          <div className="mt-2 text-[11px] text-zinc-400 line-clamp-2 italic bg-zinc-950/30 p-1.5 rounded border border-zinc-800/40">
                            &ldquo;{lead.lastMessageBody}&rdquo;
                          </div>
                        )}

                        {/* Tags list */}
                        {leadTags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {leadTags.map((tag) => (
                              <span
                                key={tag.id}
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${tag.bgColor}`}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: Seller & Quick Actions */}
                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            {assignedSeller ? (
                              <span
                                title={assignedSeller.name}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/20 text-[10px] font-bold text-red-400 border border-red-500/30"
                              >
                                {assignedSeller.avatar}
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 italic">
                                Sem vendedor
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500">
                              {formatTimeAgo(lead.lastMessageTimestamp)}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            {/* Prev stage */}
                            {colIdx > 0 && (
                              <button
                                title="Voltar etapa"
                                onClick={() =>
                                  handleStageMove(
                                    lead.id,
                                    stages[colIdx - 1].id
                                  )
                                }
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Open Chat */}
                            <button
                              title="Abrir WhatsApp Chat"
                              onClick={() => onOpenChat(lead.chatId)}
                              className="flex items-center gap-1 rounded bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" /> Chat
                            </button>

                            {/* Next stage */}
                            {colIdx < stages.length - 1 && (
                              <button
                                title="Avançar etapa"
                                onClick={() =>
                                  handleStageMove(
                                    lead.id,
                                    stages[colIdx + 1].id
                                  )
                                }
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-red-500" /> Cadastrar Novo Lead no Funil Balão
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Cliente / Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriel Santos (PC Gamer)"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(19) 99999-9999"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="4390"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Produto ou Serviço de Interesse
                </label>
                <input
                  type="text"
                  placeholder="Ex: PC Gamer Ryzen 5 + RTX 4060 ou Troca de Tela iPhone"
                  value={newLeadProduct}
                  onChange={(e) => setNewLeadProduct(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Etapa Inicial
                  </label>
                  <select
                    value={newLeadStage}
                    onChange={(e) => setNewLeadStage(e.target.value as FunnelStageId)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Vendedor Responsável
                  </label>
                  <select
                    value={newLeadSeller}
                    onChange={(e) => setNewLeadSeller(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role.split(" ")[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Etiquetas / Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => {
                    const isSelected = newLeadTags.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewLeadTags(newLeadTags.filter((x) => x !== t.id));
                          } else {
                            setNewLeadTags([...newLeadTags, t.id]);
                          }
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? "bg-red-600 text-white border-red-500"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/50 hover:bg-red-500 transition-colors"
                >
                  Adicionar ao Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
