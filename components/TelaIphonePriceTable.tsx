"use client";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const PRICES = [
  { model: "iPhone 11", tela: "R$ 280", bateria: "R$ 180", destaque: false },
  { model: "iPhone 12", tela: "R$ 350", bateria: "R$ 220", destaque: false },
  { model: "iPhone 12 Pro", tela: "R$ 420", bateria: "R$ 240", destaque: false },
  { model: "iPhone 13", tela: "R$ 380", bateria: "R$ 230", destaque: true },
  { model: "iPhone 13 Pro", tela: "R$ 520", bateria: "R$ 260", destaque: false },
  { model: "iPhone 14", tela: "R$ 480", bateria: "R$ 280", destaque: false },
  { model: "iPhone 14 Pro Max", tela: "R$ 680", bateria: "R$ 320", destaque: false },
  { model: "iPhone 15", tela: "R$ 580", bateria: "R$ 300", destaque: true },
  { model: "iPhone 15 Pro Max", tela: "R$ 750", bateria: "R$ 350", destaque: false },
];

export default function TelaIphonePriceTable() {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white">Tabela de Preços — Toque para Orçar</h3>
        <span className="text-xs font-bold text-slate-400 bg-[#161f32] px-3 py-1 rounded-full border border-slate-700">Atualizado hoje • Peças premium</span>
      </div>
      <p className="text-xs text-slate-400">Valores a partir de — clique no modelo e fale direto com o técnico no WhatsApp. True Tone + vedação inclusos.</p>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
              <th className="text-left py-3 px-2">Modelo</th>
              <th className="text-center py-3 px-2">Tela OLED</th>
              <th className="text-center py-3 px-2">Bateria 100%</th>
              <th className="text-right py-3 px-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {PRICES.map((p) => (
              <tr key={p.model} className={`border-b border-slate-800/50 hover:bg-[#161f32] transition-colors ${p.destaque ? "bg-[#E60012]/5" : ""}`}>
                <td className="py-3 px-2 font-bold text-white">{p.model} {p.destaque && <span className="ml-2 text-[10px] bg-[#E60012] text-white px-2 py-0.5 rounded-full">MAIS PEDIDO</span>}</td>
                <td className="py-3 px-2 text-center font-black text-[#E60012]">{p.tela}</td>
                <td className="py-3 px-2 text-center font-bold text-white">{p.bateria}</td>
                <td className="py-3 px-2 text-right">
                  <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Quero orçamento para ${p.model} - Tela ${p.tela} / Bateria ${p.bateria}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-[#E60012] hover:bg-red-700 text-white text-xs font-black px-3 py-1.5 rounded-full transition-colors"> <MessageCircle className="w-3 h-3" /> Orçar </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">* Valores indicativos sujeitos a confirmação no diagnóstico. Garantia de até 1 ano em telas e 6 meses em baterias. Parcelamos em até 12x.</p>
    </div>
  );
}
