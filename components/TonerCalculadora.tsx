"use client";
import { useState } from "react";
import { Calculator, MessageCircle, Printer } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function TonerCalculadora() {
  const [preco, setPreco] = useState(149);
  const [paginas, setPaginas] = useState(2600);
  const [consumo, setConsumo] = useState(800);

  const custoPagina = preco / paginas;
  const custoMes = custoPagina * consumo;
  const custoAno = custoMes * 12;
  const economiaVsOriginal = (0.12 - custoPagina) * consumo * 12; //假设 original 12 centavos

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-2 text-[#E60012] font-black text-xs uppercase tracking-widest">
        <Calculator className="w-4 h-4" /> Calculadora — Custo por Página (ISO 19752)
      </div>
      <h3 className="text-xl font-black text-white">Quanto sua impressão realmente custa?</h3>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Preço do toner (R$)</label>
            <input type="range" min={59} max={499} value={preco} onChange={(e) => setPreco(Number(e.target.value))} className="w-full accent-[#E60012]" />
            <div className="flex justify-between text-sm font-black text-white"><span>R$ {preco}</span><span className="text-slate-400 text-xs">Arraste</span></div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Rendimento ISO (páginas)</label>
            <input type="range" min={1000} max={12000} step={100} value={paginas} onChange={(e) => setPaginas(Number(e.target.value))} className="w-full accent-[#E60012]" />
            <div className="flex justify-between text-sm font-black text-white"><span>{paginas.toLocaleString("pt-BR")} págs</span><span className="text-slate-400 text-xs">Ex: TN-1060 1.000 | TN-3472 12.000</span></div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Seu consumo mensal (páginas)</label>
            <select value={consumo} onChange={(e) => setConsumo(Number(e.target.value))} className="mt-1 w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm">
              <option value={300}>300 págs (pequeno escritório)</option>
              <option value={800}>800 págs (médio)</option>
              <option value={2000}>2.000 págs (alto)</option>
              <option value={5000}>5.000 págs (corporativo)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-5 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Seu custo por página</p>
            <p className="text-4xl font-black text-white">R$ {custoPagina.toFixed(3).replace(".", ",")}</p>
            <p className="text-xs text-slate-400">Preço ÷ rendimento ISO 5% cobertura</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Custo mês</p>
              <p className="text-xl font-black text-white">R$ {custoMes.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="bg-[#161f32] border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Custo ano</p>
              <p className="text-xl font-black text-[#E60012]">R$ {custoAno.toFixed(2).replace(".", ",")}</p>
            </div>
          </div>
          {economiaVsOriginal > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-center text-sm text-emerald-300">
              Economia de <b>R$ {economiaVsOriginal.toFixed(0).replace(".", ",")}/ano</b> vs toner original (R$ 0,12/pág)
            </div>
          )}
          <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Fiz a conta: R$ ${custoPagina.toFixed(3)} por página, consumo ${consumo} págs/mês = R$ ${custoMes.toFixed(2)}/mês. Quero cotação de toner com melhor custo.`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#E60012] hover:bg-red-700 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2">
            <Printer className="w-5 h-5" /> Cotar Toner Mais Barato
          </a>
          <p className="text-[11px] text-slate-500 text-center">Faturamento boleto CNPJ • 10% OFF PIX • Entrega motoboy</p>
        </div>
      </div>
    </div>
  );
}
