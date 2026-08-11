'use client';

import { ArrowRight } from "lucide-react";

export default function HeroCTA() {
  const scrollToProducts = () => {
    const element = document.getElementById('ofertas');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={scrollToProducts}
      className="group bg-white text-slate-900 hover:bg-emerald-50 transition-all duration-300 font-bold text-base md:text-lg px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000"
    >
      <span>VER OFERTAS DISPONÍVEIS</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
