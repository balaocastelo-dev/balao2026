"use client";

import { useMemo, useState } from "react";
import {
  Send,
  Users,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Tag as TagIcon,
  Filter,
} from "lucide-react";
import { CrmLead, CrmTag, FunnelStage, FunnelStageId } from "@/types/crm";

interface CrmBroadcastViewProps {
  leads: CrmLead[];
  stages: FunnelStage[];
  tags: CrmTag[];
  onExecuteBroadcast: (recipients: { number: string; chatId: string }[], text: string) => void;
}

export default function CrmBroadcastView({
  leads,
  stages,
  tags,
  onExecuteBroadcast,
}: CrmBroadcastViewProps) {
  const [targetStage, setTargetStage] = useState<string>("all");
  const [targetTag, setTargetTag] = useState<string>("all");
  const [broadcastText, setBroadcastText] = useState(
    "Olá, {nome}! Tudo bem? Passando para te avisar que chegaram novas peças e PCs Gamer com condição especial de *10% OFF no Pix* aqui no *Balão da Informática Castelo Campinas*! Se quiser conferir nossa tabela de preços, só me responder por aqui!"
  );
  const [delaySeconds, setDelaySeconds] = useState<number>(10);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter recipients
  const eligibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchStage = targetStage === "all" || lead.stage === targetStage;
      const matchTag = targetTag === "all" || lead.tags.includes(targetTag);
      return matchStage && matchTag;
    });
  }, [leads, targetStage, targetTag]);

  const handleStartCampaign = () => {
    if (!eligibleLeads.length || !broadcastText.trim()) return;

    setIsRunning(true);
    setSentCount(0);
    setFailedCount(0);
    setIsCompleted(false);

    const recipients = eligibleLeads.map((l) => ({
      number: l.phone,
      chatId: l.chatId,
    }));

    onExecuteBroadcast(recipients, broadcastText.trim());

    // Progress simulation
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setSentCount(current);
      if (current >= eligibleLeads.length) {
        clearInterval(interval);
        setIsRunning(false);
        setIsCompleted(true);
      }
    }, Math.max(delaySeconds * 300, 1000));
  };

  const progressPercent = eligibleLeads.length
    ? Math.round((sentCount / eligibleLeads.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-red-500" /> Disparo em Massa & Campanhas (WASeller Broadcast)
          </h2>
          <p className="text-xs text-zinc-400">
            Envio segmentado para base de clientes com proteção inteligente anti-banimento (intervalo programável entre mensagens).
          </p>
        </div>

        {/* Campaign Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Target and Message */}
          <div className="md:col-span-2 space-y-5">
            {/* Audience Segmenter */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Filter className="h-4 w-4 text-red-400" /> 1. Segmentação do Público-Alvo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Filtrar por Etapa do Funil
                  </label>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Todas as Etapas ({leads.length})</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Filtrar por Etiqueta / Tag
                  </label>
                  <select
                    value={targetTag}
                    onChange={(e) => setTargetTag(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="all">Todas as Etiquetas</option>
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                <span>Destinatários selecionados:</span>
                <strong className="text-white font-mono text-sm bg-red-600/20 text-red-300 px-2.5 py-0.5 rounded border border-red-500/30">
                  {eligibleLeads.length} contatos
                </strong>
              </div>
            </div>

            {/* Message Template */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  2. Mensagem da Campanha
                </h3>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" /> Variáveis: {"{nome}"}
                </span>
              </div>

              <textarea
                rows={5}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none leading-relaxed"
              />

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-[11px] text-zinc-500">Modelos rápidos:</span>
                <button
                  type="button"
                  onClick={() =>
                    setBroadcastText(
                      "Olá {nome}! Tudo bem? Passando para te avisar que chegaram novas peças e PCs Gamer com condição especial de 10% OFF no Pix aqui no Balão da Informática Castelo Campinas!"
                    )
                  }
                  className="text-[10px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded"
                >
                  Promoção PC Gamer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBroadcastText(
                      "Oi {nome}! Temos vagas abertas para manutenção preventiva de notebooks e computadores com troca de pasta térmica premium nesta semana no Balão. Quer agendar?"
                    )
                  }
                  className="text-[10px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded"
                >
                  Manutenção Express
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Anti-Ban & Execution Status */}
          <div className="space-y-5">
            {/* Anti-Ban Protection Settings */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Proteção Anti-Ban
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Intervalo de segurança entre cada mensagem enviada para manter o score da sua conta saudável.
              </p>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Delay por contato:</span>
                  <strong className="text-emerald-400 font-mono">{delaySeconds}s</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>5s (Rápido)</span>
                  <span>15s (Recomendado)</span>
                  <span>30s (Seguro)</span>
                </div>
              </div>
            </div>

            {/* Execution Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-4 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-400" /> Monitor do Disparo
              </h3>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">Progresso</span>
                  <span className="text-white font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Enviados</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {sentCount}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Restantes</span>
                  <span className="text-base font-bold font-mono text-zinc-300">
                    {Math.max(eligibleLeads.length - sentCount, 0)}
                  </span>
                </div>
              </div>

              {isCompleted && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Disparo concluído com sucesso!
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={handleStartCampaign}
                disabled={isRunning || eligibleLeads.length === 0}
                className="w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed py-3 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" /> Disparando ({sentCount}/{eligibleLeads.length})...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Iniciar Disparo para {eligibleLeads.length} Contatos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
