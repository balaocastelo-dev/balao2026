"use client";

import { useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import { CrmLead, ScheduledMessage } from "@/types/crm";

interface CrmScheduleViewProps {
  schedules: ScheduledMessage[];
  leads: CrmLead[];
  onCancelSchedule: (id: string) => void;
  onAddSchedule: (schedule: Omit<ScheduledMessage, "id" | "createdAt">) => void;
}

export default function CrmScheduleView({
  schedules,
  leads,
  onCancelSchedule,
  onAddSchedule,
}: CrmScheduleViewProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "sent">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || "");
  const [customPhone, setCustomPhone] = useState("");
  const [scheduleDatetime, setScheduleDatetime] = useState("");
  const [scheduleText, setScheduleText] = useState("");

  const filteredSchedules = schedules.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleText.trim() || !scheduleDatetime) return;

    const lead = leads.find((l) => l.id === selectedLeadId);
    const phone = lead ? lead.phone : customPhone;
    const name = lead ? lead.name : "Contato Agendado";

    onAddSchedule({
      leadId: lead?.id,
      leadName: name,
      phone,
      message: scheduleText.trim(),
      sendAt: scheduleDatetime,
      status: "pending",
      sellerId: lead?.assignedSellerId || null,
    });

    setScheduleText("");
    setScheduleDatetime("");
    setIsCreateModalOpen(false);
  };

  const formatScheduleDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Agendamentos & Follow-ups Automáticos
          </h2>
          <p className="text-xs text-zinc-400">
            Mensagens programadas para envio em data/hora futura para reengajar clientes do Balão.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-950/40 hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
            filter === "all"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Todos ({schedules.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
            filter === "pending"
              ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Pendentes ({schedules.filter((s) => s.status === "pending").length})
        </button>
        <button
          onClick={() => setFilter("sent")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
            filter === "sent"
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Enviados ({schedules.filter((s) => s.status === "sent").length})
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-xs text-zinc-500">
            <Clock className="h-10 w-10 text-zinc-700 mb-2" />
            <p>Nenhuma mensagem agendada com este filtro.</p>
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-zinc-700 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      schedule.status === "pending"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : schedule.status === "sent"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {schedule.status === "pending"
                      ? "Pendente"
                      : schedule.status === "sent"
                      ? "Enviado"
                      : "Cancelado"}
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    {schedule.leadName || schedule.phone}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {schedule.phone}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 whitespace-pre-wrap bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60 font-sans">
                  {schedule.message}
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Data Programada
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatScheduleDate(schedule.sendAt)}
                  </span>
                </div>

                {schedule.status === "pending" && (
                  <button
                    onClick={() => onCancelSchedule(schedule.id)}
                    className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
            <div className="border-b border-zinc-800 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" /> Programar Follow-up
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
                  Selecione o Lead / Cliente *
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} - {l.phone} ({l.productOfInterest || "Geral"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Data e Hora do Envio *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDatetime}
                  onChange={(e) => setScheduleDatetime(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Mensagem Automática *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mensagem a ser enviada no WhatsApp..."
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-950/50"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
