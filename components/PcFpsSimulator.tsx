"use client";
import { useState, useMemo } from "react";
import { Gauge, MonitorPlay, Trophy } from "lucide-react";

const GPU_FPS: Record<string, number> = {
  "rtx 4090": 240, "rtx 4080": 210, "rtx 4070": 165, "rtx 4060": 135, "rtx 3060": 110, "rx 7900": 220, "rx 7800": 170, "rx 7600": 120, "gtx 1660": 85,
};
const CPU_BOOST: Record<string, number> = {
  "i9": 10, "i7": 6, "i5": 0, "ryzen 9": 10, "ryzen 7": 6, "ryzen 5": 0,
};

export default function PcFpsSimulator({ products }: { products: any[] }) {
  const [gpuKey, setGpuKey] = useState("rtx 4060");
  const [cpuKey, setCpuKey] = useState("i5");
  const [res, setRes] = useState<"1080p"|"1440p"|"4k">("1080p");
  const fps = useMemo(() => {
    const base = GPU_FPS[gpuKey] ?? 120;
    const boost = CPU_BOOST[cpuKey] ?? 0;
    const resFactor = res==="1080p"?1 : res==="1440p"?0.72 : 0.45;
    return Math.round((base + boost) * resFactor);
  }, [gpuKey, cpuKey, res]);
  const level = fps >= 165 ? "Competitivo 240Hz" : fps >= 120 ? "Alta fluidez 144Hz" : fps >= 60 ? "Jogável 60fps+" : "Upgrade recomendado";
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E60012] flex items-center justify-center"><Gauge className="w-5 h-5 text-white" /></div>
        <div>
          <h3 className="font-black text-white">Simulador FPS — Veja antes de comprar</h3>
          <p className="text-xs text-slate-400">Estimativa baseada no hardware selecionado no builder. Valores médios em Warzone / Fortnite / Valorant.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={gpuKey} onChange={e=>setGpuKey(e.target.value)} className="bg-[#090d16] border border-slate-700 rounded-xl px-3 py-3 text-white text-sm">
          {Object.keys(GPU_FPS).map(k=> <option key={k} value={k}>{k.toUpperCase()}</option>)}
        </select>
        <select value={cpuKey} onChange={e=>setCpuKey(e.target.value)} className="bg-[#090d16] border border-slate-700 rounded-xl px-3 py-3 text-white text-sm">
          {Object.keys(CPU_BOOST).map(k=> <option key={k} value={k}>{k.toUpperCase()}</option>)}
        </select>
        <div className="flex bg-[#090d16] border border-slate-700 rounded-xl p-1">
          {(["1080p","1440p","4k"] as const).map(r=>(
            <button key={r} onClick={()=>setRes(r)} className={`flex-1 py-1.5 rounded-lg text-xs font-black ${res===r?"bg-[#E60012] text-white":"text-slate-400"}`}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest font-black text-slate-400">FPS estimado</div>
          <div className="text-4xl font-black text-[#E60012]">{fps} <span className="text-xl text-white">FPS</span></div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" /> {level}</div>
        </div>
        <div className="text-right">
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#E60012] to-orange-500" style={{width: `${Math.min(100, fps/2.4)}%`}} /></div>
          <div className="text-[11px] text-slate-500 mt-2">{res} • Ultra • DLSS ON</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 text-center">* Simulação ilustrativa. Benchmark real feito na entrega com FurMark/Cinebench. Fale no WhatsApp para ajuste fino.</p>
    </div>
  );
}
