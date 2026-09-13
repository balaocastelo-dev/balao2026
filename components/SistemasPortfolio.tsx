"use client";
import { ExternalLink, ShoppingCart, Building2, LayoutDashboard, Globe, Smartphone, ArrowRight } from "lucide-react";

const CASES = [
  { title: "E-commerce Moda Campinas", tipo: "Loja Virtual", tech: "Next.js + Checkout PIX", result: "+187% conversão", icon: ShoppingCart, color: "text-pink-400" },
  { title: "Clínica Estética Cambuí", tipo: "Landing + Agenda", tech: "WhatsApp + Pixel", result: "42 leads/semana", icon: Smartphone, color: "text-emerald-400" },
  { title: "Indústria Metalúrgica", tipo: "Site Institucional 20p", tech: "SEO + Blog", result: "Top 3 Google", icon: Building2, color: "text-blue-400" },
  { title: "ERP Oficina Mecânica", tipo: "Sistema Sob Medida", tech: "Ordem serviço + NF", result: "-60% retrabalho", icon: LayoutDashboard, color: "text-orange-400" },
  { title: "Portal Imobiliário RMC", tipo: "Portal + CRM", tech: "Filtros + Maps", result: "1.200 imóveis", icon: Globe, color: "text-cyan-400" },
  { title: "Delivery Gourmet", tipo: "Cardápio Online", tech: "PIX + Motoboy", result: "Ticket +34%", icon: ShoppingCart, color: "text-[#E60012]" },
];

export default function SistemasPortfolio() {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white">Portfólio — 6 Cases Reais</h2>
        <p className="text-sm text-slate-400">Projetos entregues com performance 90+ no PageSpeed e tracking completo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CASES.map((c) => (
          <div key={c.title} className="bg-[#161f32] border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-[#E60012]/50 transition-colors group">
            <c.icon className={`w-8 h-8 ${c.color}`} />
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">{c.tipo}</div>
            <h3 className="font-bold text-white group-hover:text-[#E60012] transition-colors">{c.title}</h3>
            <p className="text-xs text-slate-300">{c.tech}</p>
            <div className="inline-flex px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-xs font-black">{c.result}</div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <a href="https://wa.me/5519987510267?text=Quero%20ver%20portfolio%20completo%20de%20sites%20e%20sistemas" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#E60012] hover:text-white transition-colors">Ver portfólio completo no WhatsApp <ArrowRight className="w-4 h-4" /></a>
      </div>
    </div>
  );
}
