import React from "react";
import Image from "next/image";
import { RefreshCw, MessageCircle, ShieldCheck, Cpu } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balão.info - Sistema Calibrando Catálogo Oficial",
  description: "Estamos atualizando nosso catálogo oficial com inteligência artificial, preços calibrados e fotos em Ultra HD. Fale conosco no WhatsApp.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#07080a] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Luzes de Fundo Futuristas / Efeito Neon Cyberpunk */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
        {/* Badge Animado de IA */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 animate-pulse shadow-lg shadow-red-900/20">
          <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
          IA Sincronizando & Calibrando Catálogo Oficial
        </div>

        {/* Título Oficial */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3">
          Balão<span className="text-red-500">.info</span>
        </h1>

        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-100 mb-6 max-w-2xl leading-tight">
          Estamos atualizando todo o site com inteligência artificial! 🚀
        </h2>

        {/* Imagem de IA Gerada */}
        <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8 group">
          <Image
            src="/manutencao_ia.jpg"
            alt="Balão.info IA Calibrando Hardware"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-gray-300">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <span>SISTEMA_IA: Indexando 3.926 produtos com Ultra HD e especificações completas</span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
          Nossa inteligência artificial está processando todo o catálogo, revisando preços, especificações técnicas detalhadas e imagens em altíssima resolução.
        </p>

        {/* Barra de Progresso Visual de IA */}
        <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-md">
          <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-2.5 font-mono">
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-red-400" /> REVISÃO_DE_PREÇOS</span>
            <span className="text-red-400 font-bold">EM ANDAMENTO (85%)</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 rounded-full w-[85%] animate-pulse" />
          </div>
        </div>

        {/* Botão de Contato WhatsApp */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-10">
          <a
            href="https://wa.me/5519987510267?text=Olá!%20Gostaria%20de%20consultar%20um%20produto%20no%20Balão.info."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-base transition-all duration-200 shadow-xl shadow-green-500/20 hover:scale-105 w-full sm:w-auto cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-black text-black" />
            Atendimento Rápido no WhatsApp
          </a>
        </div>

        {/* Informações Institucionais */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500 border-t border-white/5 pt-6 w-full max-w-lg">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-red-500" /> Garantia Balão.info</span>
          <span>•</span>
          <span>Av. Anchieta, 789 - Cambuí, Campinas/SP</span>
        </div>
      </div>
    </div>
  );
}
