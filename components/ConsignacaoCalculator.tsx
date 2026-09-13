"use client";
import { useState } from "react";
import { MessageCircle, Camera, Calculator, Upload } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function ConsignacaoCalculator() {
  const [tipo, setTipo] = useState("notebook");
  const [estado, setEstado] = useState("bom");
  const [acessorios, setAcessorios] = useState(true);
  const [nota, setNota] = useState(true);
  const [fotos, setFotos] = useState<FileList | null>(null);

  const base: Record<string, number> = { notebook: 1800, pc_gamer: 2800, macbook: 4500, monitor: 600, placa_video: 1200 };
  const estadoMult: Record<string, number> = { otimo: 1.0, bom: 0.85, regular: 0.65 };
  const bonus = (acessorios ? 150 : 0) + (nota ? 200 : 0);
  const valor = Math.round((base[tipo] || 1500) * (estadoMult[estado] || 1) + bonus);

  const waMsg = `Olá! Quero avaliação para consignação. Tipo: ${tipo} | Estado: ${estado} | Valor simulado: R$ ${valor}. Tenho ${fotos ? fotos.length : 0} foto(s) para enviar.`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calculadora */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#E60012] font-black text-xs uppercase tracking-widest">
          <Calculator className="w-4 h-4" /> Calculadora — Seu usado vale R$ {valor.toLocaleString("pt-BR")}
        </div>
        <h3 className="text-xl font-black text-white">Quanto vale seu usado?</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Tipo de equipamento</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm">
              <option value="notebook">Notebook (i5/Ryzen 5)</option>
              <option value="pc_gamer">PC Gamer (RTX)</option>
              <option value="macbook">MacBook</option>
              <option value="monitor">Monitor Gamer</option>
              <option value="placa_video">Placa de Vídeo</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Estado de conservação</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {["otimo", "bom", "regular"].map((e) => (
                <button key={e} onClick={() => setEstado(e)} className={`py-2.5 rounded-xl text-sm font-bold border ${estado === e ? "bg-[#E60012] border-[#E60012] text-white" : "bg-[#161f32] border-slate-700 text-slate-300"}`}>{e === "otimo" ? "Ótimo" : e === "bom" ? "Bom" : "Regular"}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={acessorios} onChange={(e) => setAcessorios(e.target.checked)} className="accent-[#E60012]" /> Com carregador/caixa</label>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={nota} onChange={(e) => setNota(e.target.checked)} className="accent-[#E60012]" /> Com Nota Fiscal</label>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">Estimativa instantânea</p>
            <p className="text-3xl font-black text-white">R$ {valor.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-slate-400">Valor de vitrine • Pagamento PIX em até 48h após venda • Sem taxa escondida</p>
          </div>
          <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#E60012] hover:bg-red-700 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" /> Enviar para avaliação real
          </a>
        </div>
      </div>

      {/* Formulário com upload 3 fotos */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#E60012] font-black text-xs uppercase tracking-widest">
          <Camera className="w-4 h-4" /> Formulário — Envie 3 fotos
        </div>
        <h3 className="text-xl font-black text-white">Avaliação Grátis em 15 min</h3>
        <p className="text-sm text-slate-400">Fotos: frente, etiqueta de baixo e funcionando. Resposta no WhatsApp com contrato.</p>
        <div className="space-y-4">
          <input type="text" placeholder="Seu nome" className="w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500" />
          <input type="tel" placeholder="WhatsApp (19) 9____-____" className="w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500" />
          <input type="text" placeholder="Modelo ex: Dell G15 5510 i7 / MacBook Air M1" className="w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500" />

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Upload 3 fotos (frente, traseira, etiqueta)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setFotos(e.target.files)} className="mt-1 w-full bg-[#161f32] border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm file:bg-[#E60012] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:font-bold file:mr-3" />
            {fotos && <p className="text-xs text-emerald-400 mt-1">{fotos.length} foto(s) selecionada(s) — serão enviadas via WhatsApp</p>}
          </div>

          <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(waMsg + " Quero enviar 3 fotos para avaliação.")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" /> Enviar Fotos no WhatsApp
          </a>
          <p className="text-[11px] text-slate-500 text-center">Ao enviar você aceita contrato de consignação e LGPD • Selo: Loja Física Cambuí desde 2010</p>
        </div>
      </div>
    </div>
  );
}
