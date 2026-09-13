"use client";
import { Star, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function StickyWhatsBar() {
  return (
    <div className="sticky bottom-0 z-40 backdrop-blur bg-[#0f172a]/95 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 bg-white text-slate-900 rounded-full px-3 py-1 text-xs font-black">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400"/> 4.9★ <span className="font-normal text-slate-600">no Google • 1.200+ avaliações</span>
          </div>
          <span className="hidden sm:inline text-sm text-slate-300">Resposta em até <b className="text-white">5 min</b> no WhatsApp</span>
        </div>
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Vim pela página de Serviços e quero orçamento.")}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle className="w-5 h-5"/> Falar com técnico agora
        </a>
      </div>
    </div>
  );
}
