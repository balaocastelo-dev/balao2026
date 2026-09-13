"use client";
import { useState } from "react";
import { Calculator, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function SistemasCalculator() {
  const [pages, setPages] = useState(5);
  const [tipo, setTipo] = useState<"site" | "ecommerce" | "sistema">("site");
  const base = tipo === "site" ? 2999 : tipo === "ecommerce" ? 4999 : 7999;
  const extraPages = Math.max(0, pages - 5);
  const total = base + extraPages * 180 + (pages >= 20 ? -500 : 0);
  const pix = Math.round(total * 0.9);
  const wa = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Simulei no site: ${tipo} com ${pages} páginas → R$ ${total.toLocaleString('pt-BR')} (PIX R$ ${pix.toLocaleString('pt-BR')}). Quero proposta detalhada.`)}`;
  return (
    <div className="bg-[#161f32] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E60012] flex items-center justify-center"><Calculator className="w-5 h-5 text-white" /></div>
        <div>
          <h3 className="font-black text-white">Calculadora de Proposta Instantânea</h3>
          <p className="text-xs text-slate-400">Site 5 / 10 / 20 páginas → valor na hora. 10% OFF no PIX.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-300">Tipo de projeto</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="mt-1 w-full bg-[#090d16] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm">
            <option value="site">Site / Landing Page</option>
            <option value="ecommerce">E-commerce</option>
            <option value="sistema">Sistema Sob Medida</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-300">Páginas: {pages}</label>
          <div className="mt-2 flex gap-2">
            {[5,10,20].map(n => (
              <button key={n} onClick={() => setPages(n)} className={`flex-1 py-2 rounded-xl font-black text-sm border ${pages===n ? "bg-[#E60012] text-white border-[#E60012]" : "bg-[#090d16] text-slate-300 border-slate-700"}`}>{n} págs</button>
            ))}
          </div>
          <input type="range" min={5} max={30} value={pages} onChange={e=>setPages(Number(e.target.value))} className="w-full mt-3 accent-[#E60012]" />
        </div>
      </div>
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-black">Investimento estimado</div>
          <div className="text-3xl font-black text-white">R$ {total.toLocaleString('pt-BR')}</div>
          <div className="text-sm text-emerald-400 font-bold">PIX 10% OFF: R$ {pix.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-slate-500">ou 12x de R$ {(total/12).toLocaleString('pt-BR',{minimumFractionDigits:2})} • Entrega 7-15 dias (site)</div>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="bg-[#E60012] hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"><MessageCircle className="w-5 h-5" /> Fechar por esse valor</a>
      </div>
      <p className="text-[11px] text-slate-500 text-center">* Valor simulado para referência. Proposta oficial com escopo fechado em até 2h úteis.</p>
    </div>
  );
}
