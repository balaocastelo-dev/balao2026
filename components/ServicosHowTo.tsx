"use client";
import { useState } from "react";
import { CheckCircle, MessageCircle, Wrench, ShoppingBag, Truck, Clock } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const STEPS = [
  { id: 1, title: "1. Diagnóstico Grátis no WhatsApp", desc: "Envie foto/vídeo do defeito e receba orçamento em até 30 min. Sem compromisso.", icon: MessageCircle },
  { id: 2, title: "2. Escolha Peça com Desconto", desc: "SSD, RAM, placa ou fonte com 10% OFF no PIX quando contratar instalação.", icon: ShoppingBag },
  { id: 3, title: "3. Instalação Profissional", desc: "Nossa bancada no Cambuí faz cable management, testes e garantia de serviço.", icon: Wrench },
  { id: 4, title: "4. Retirada em 30 min ou Entrega", desc: "Pronto para uso, com Nota Fiscal e suporte pós-venda real.", icon: Truck },
];

export default function ServicosHowTo() {
  const [active, setActive] = useState(1);
  const activeStep = STEPS.find(s => s.id === active)!;
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest"><Clock className="w-3.5 h-3.5"/> Como funciona em 4 passos</div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">Contrate sem sair do WhatsApp</h2>
        <p className="text-sm text-slate-400 mt-2">Toque no passo para ver detalhes — ao final, fale com um técnico com seu caso já pré-preenchido.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STEPS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} className={`text-left rounded-2xl p-4 border transition-all ${active===s.id ? "bg-[#E60012] border-[#E60012] text-white shadow-xl scale-[1.02]" : "bg-[#161f32] border-slate-700 text-slate-200 hover:border-slate-600"}`}>
            <s.icon className={`w-5 h-5 ${active===s.id?"text-white":"text-[#E60012]"}`}/>
            <div className="mt-2 text-sm font-bold leading-tight">{s.title}</div>
          </button>
        ))}
      </div>
      <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E60012]/20 flex items-center justify-center shrink-0"><activeStep.icon className="w-5 h-5 text-[#E60012]"/></div>
          <div>
            <div className="font-black text-white">{activeStep.title}</div>
            <div className="text-sm text-slate-300 mt-1">{activeStep.desc}</div>
          </div>
        </div>
        <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Quero ${activeStep.title} — meu caso é: `)}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors"><MessageCircle className="w-5 h-5"/> Chamar no WhatsApp</a>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-400 justify-center"><span className="inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>Diagnóstico sem compromisso</span><span>•</span><span className="inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>Desconto na mão de obra</span><span>•</span><span className="inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>Garantia Balão</span></div>
    </div>
  );
}
