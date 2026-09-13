"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Smartphone, Battery, Zap, Camera, Droplets, WifiOff } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const SYMPTOMS = [
  { label: "Tela quebrada / trincada", kw: "tela", href: "/wendell/apple/iphone", icon: Smartphone, desc: "OLED com True Tone" },
  { label: "Bateria viciada / descarrega rápido", kw: "bateria", href: "/wendell/apple/iphone", icon: Battery, desc: "Saúde 100%" },
  { label: "Não carrega / conector", kw: "conector", href: "/wendell/apple/iphone", icon: Zap, desc: "Carga e dock" },
  { label: "Câmera embaçada / Face ID", kw: "camera", href: "/wendell/apple/iphone", icon: Camera, desc: "Lentes e sensores" },
  { label: "Molhou / oxidação", kw: "oxidação", href: "/wendell/apple/macbook", icon: Droplets, desc: "Desoxidação química" },
  { label: "Não liga / placa lógica", kw: "placa", href: "/wendell/apple/macbook", icon: WifiOff, desc: "Micro-soldagem" },
];

export default function AppleSymptomSearch() {
  const [q, setQ] = useState("");
  const filtered = SYMPTOMS.filter(s => s.label.toLowerCase().includes(q.toLowerCase()) || s.kw.includes(q.toLowerCase()));
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-xl font-black text-white">Busque por sintoma — achamos a solução</h3>
        <p className="text-sm text-slate-400">Digite “tela”, “bateria”, “não carrega”...</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex: Tela quebrada, bateria, molhou..." className="w-full bg-[#090d16] border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:border-[#E60012] outline-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(filtered.length? filtered : SYMPTOMS).map(s=>(
          <Link key={s.label} href={s.href} className="bg-[#161f32] border border-slate-800 rounded-2xl p-4 flex items-center gap-3 hover:border-[#E60012] transition-colors group">
            <s.icon className="w-8 h-8 text-[#E60012] shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight group-hover:text-[#E60012]">{s.label}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Meu Apple está com: "+ (q || "defeito, preciso de diagnóstico"))}`} target="_blank" rel="noopener noreferrer" className="bg-[#E60012] hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-sm">Falar com técnico agora</a>
        <span className="text-xs text-slate-500 py-3">Diagnóstico em até 30 min • Orçamento sem compromisso</span>
      </div>
    </div>
  );
}
