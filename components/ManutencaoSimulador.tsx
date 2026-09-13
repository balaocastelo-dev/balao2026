"use client";
import { useState } from "react";
import { MessageCircle, Zap, ThermometerSun, AlertTriangle, CheckCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

type Sintoma = "lento" | "quente" | "tela_azul" | "nao_liga";

const SOLUCOES: Record<Sintoma, { titulo: string; preco: string; desc: string; wa: string }> = {
  lento: {
    titulo: "PC / Notebook Lento",
    preco: "a partir de R$ 89",
    desc: "Upgrade SSD NVMe + 8GB RAM + limpeza e otimização. Até 10x mais rápido. Backup incluso.",
    wa: "Olá! Meu PC/notebook está LENTO. Quero orçamento para upgrade SSD + memória na Balão.",
  },
  quente: {
    titulo: "PC Quente / Desligando",
    preco: "a partir de R$ 79",
    desc: "Limpeza completa, troca de pasta térmica prata e teste térmico. Reduz até 20°C.",
    wa: "Olá! Meu PC/notebook está ESQUENTANDO/DESLIGANDO sozinho. Quero orçamento de limpeza térmica.",
  },
  tela_azul: {
    titulo: "Tela Azul / Travando",
    preco: "a partir de R$ 99",
    desc: "Diagnóstico de memória, HD/SSD e drivers + formatação limpa com backup. Sem perda de arquivos.",
    wa: "Olá! Meu PC está com TELA AZUL/travamentos. Quero diagnóstico e orçamento na Balão.",
  },
  nao_liga: {
    titulo: "Não Liga / Sem Vídeo",
    preco: "diagnóstico grátis",
    desc: "Teste de fonte, placa-mãe e curto com osciloscópio. Orçamento em 24h, sem compromisso.",
    wa: "Olá! Meu PC/notebook NÃO LIGA / sem vídeo. Quero diagnóstico gratuito na Balão.",
  },
};

export default function ManutencaoSimulador() {
  const [sel, setSel] = useState<Sintoma>("lento");
  const s = SOLUCOES[sel];
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-black uppercase tracking-widest">
            <CheckCircle className="w-3.5 h-3.5" /> Orçamento Grátis • Sem Compromisso
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-3">Simulador de Orçamento — Meu PC está...</h3>
          <p className="text-sm text-slate-400">Selecione o sintoma e veja a solução recomendada em segundos.</p>
        </div>
        <div className="text-xs bg-[#E60012] text-white font-black px-3 py-1.5 rounded-full">Triagem 24h • Selo Garantia 90 dias</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          { id: "lento" as Sintoma, label: "Lento / Travando", icon: Zap },
          { id: "quente" as Sintoma, label: "Quente / Barulhento", icon: ThermometerSun },
          { id: "tela_azul" as Sintoma, label: "Tela Azul", icon: AlertTriangle },
          { id: "nao_liga" as Sintoma, label: "Não Liga", icon: CheckCircle },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSel(id)}
            className={`p-4 rounded-2xl border text-left transition font-bold text-sm flex flex-col gap-2 ${sel === id ? "bg-[#E60012] border-[#E60012] text-white shadow-lg" : "bg-[#161f32] border-slate-700 text-slate-300 hover:border-[#E60012]/50"}`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#E60012] uppercase tracking-wider">Ver solução → {s.titulo}</p>
          <p className="text-lg font-black text-white">{s.preco}</p>
          <p className="text-sm text-slate-300 mt-1">{s.desc}</p>
        </div>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(s.wa)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-[#E60012] hover:bg-red-700 text-white font-black py-3 px-6 rounded-2xl flex items-center gap-2 justify-center transition"
        >
          <MessageCircle className="w-5 h-5" />
          Ver solução no WhatsApp
        </a>
      </div>
    </div>
  );
}
