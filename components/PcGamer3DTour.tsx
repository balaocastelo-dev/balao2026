"use client";
import { useState } from "react";
import { Eye, Box, Maximize2, Rotate3D } from "lucide-react";

export default function PcGamer3DTour() {
  const [mode, setMode] = useState<"3d"|"360">("3d");
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">Tour 360º + Ver em 3D — Exclusivo PC Gamer 3D</h3>
          <p className="text-sm text-slate-400">Gire, dê zoom e veja o cable management por dentro. Diferencial vs página PC Gamer tradicional (só fotos).</p>
        </div>
        <div className="flex bg-[#161f32] border border-slate-800 rounded-full p-1">
          <button onClick={()=>setMode("3d")} className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${mode==="3d"?"bg-[#E60012] text-white":"text-slate-400"}`}><Box className="w-4 h-4" /> Ver em 3D</button>
          <button onClick={()=>setMode("360")} className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${mode==="360"?"bg-[#E60012] text-white":"text-slate-400"}`}><Rotate3D className="w-4 h-4" /> Tour 360º</button>
        </div>
      </div>
      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] relative flex items-center justify-center">
        {mode==="3d" ? (
          <div className="absolute inset-0">
            <iframe title="PC Gamer 3D" src="https://sketchfab.com/models/44833fc6db3a43ce88be66609c1fe619/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=1&ui_general_controls=1&ui_fullscreen=1&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1" className="w-full h-full" allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Arraste para orbitar • Scroll para zoom</div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-3">
            <div className="w-full h-64 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,18,0.15),transparent_70%)]" />
              <span className="text-6xl">🖥️</span>
              <div className="absolute bottom-2 text-xs text-slate-400">360º — Simulação de gabinete aquário com 6 fans ARGB (fotos reais sob consulta)</div>
            </div>
            <p className="text-xs text-slate-400">Tour 360º em desenvolvimento com fotos 8K da bancada. Enquanto isso, veja o modelo 3D ao lado ou agende visita ao Cambuí.</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-[#161f32] border border-slate-800 rounded-xl p-3"><p className="font-black text-white">Cable management</p><p className="text-slate-400">Nota 10/10</p></div>
        <div className="bg-[#161f32] border border-slate-800 rounded-xl p-3"><p className="font-black text-white">Airflow</p><p className="text-slate-400">Pressão positiva</p></div>
        <div className="bg-[#161f32] border border-slate-800 rounded-xl p-3"><p className="font-black text-white">Ruído</p><p className="text-slate-400">&lt;35 dB</p></div>
      </div>
    </div>
  );
}
