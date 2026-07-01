"use client";

import React, { useState, useEffect } from "react";
import { X, MessageCircle, ChevronDown, ChevronUp, CheckCircle, Flame, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface PartItem {
  name: string;
  price: string;
  competitor: string;
}

export default function PromoJulioModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const parts: PartItem[] = [
    { name: "Placa-mãe AORUS WiFi", price: "R$ 2.299,00", competitor: "KaBuM!: R$ 2.439,90" },
    { name: "Intel i9 13900", price: "R$ 3.499,00", competitor: "KaBuM!: R$ 3.699,99" },
    { name: "32GB DDR5 (2x16)", price: "R$ 2.500,00", competitor: "KaBuM!: R$ 2.899,99" },
    { name: "SSD 2TB NVMe", price: "R$ 1.799,00", competitor: "KaBuM!: R$ 3.599,00" },
    { name: "Placa de vídeo 24GB 4090 PNY", price: "R$ 15.999,00", competitor: "KaBuM!: ESGOTADO" },
    { name: "Gabinete Rise Mode Galaxy Glass", price: "R$ 999,00", competitor: "KaBuM!: R$ 1.199,99" },
    { name: "Watercooler 360mm", price: "R$ 229,90", competitor: "KaBuM!: R$ 233,99" },
    { name: "Fonte 1000W", price: "R$ 1.005,00", competitor: "KaBuM!: R$ 1.309,99" },
  ];

  // 1. Session persistence check (24 hour cooldown)
  useEffect(() => {
    const closedTime = localStorage.getItem("balao_julio_promo_closed");
    if (!closedTime) {
      setIsOpen(true);
    } else {
      const parsedTime = parseInt(closedTime, 10);
      const isPast24Hours = Date.now() - parsedTime > 24 * 60 * 60 * 1000;
      if (isPast24Hours) {
        setIsOpen(true);
      }
    }
  }, []);

  // 2. Promo countdown calculation (July 31, 2026 23:59:59)
  useEffect(() => {
    const targetDate = new Date("2026-07-31T23:59:59-03:00").getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft(prev => ({ ...prev, isExpired: true }));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    localStorage.setItem("balao_julio_promo_closed", Date.now().toString());
    setIsOpen(false);
  };

  const getWhatsAppMessage = () => {
    const header = "Olá! Vi o Arraiá de Ofertas de Julho no site e quero garantir o Super PC Gamer Completo!\n\n";
    const specsList = parts.map(p => `• ${p.name}: ${p.price}`).join("\n");
    const total = "\n\nTotal: R$ 28.329,90 em 12x sem juros ou desconto à vista!";
    return encodeURIComponent(header + specsList + total);
  };

  if (!isOpen || timeLeft.isExpired) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-zinc-950/95 border-2 border-red-600 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/30 flex flex-col max-h-[90vh]">
        
        {/* Festive splaying flags (bandeirinhas) */}
        <div className="absolute top-0 left-0 right-0 flex justify-between overflow-hidden px-6 -mt-1 pointer-events-none z-50">
          {[
            { color: "bg-red-500", delay: "delay-[0ms]" },
            { color: "bg-yellow-500", delay: "delay-[150ms]" },
            { color: "bg-green-500", delay: "delay-[300ms]" },
            { color: "bg-blue-500", delay: "delay-[450ms]" },
            { color: "bg-orange-500", delay: "delay-[600ms]" },
            { color: "bg-purple-500", delay: "delay-[750ms]" },
            { color: "bg-yellow-400", delay: "delay-[100ms]" },
            { color: "bg-red-600", delay: "delay-[250ms]" },
            { color: "bg-green-600", delay: "delay-[400ms]" },
            { color: "bg-blue-600", delay: "delay-[550ms]" },
            { color: "bg-orange-600", delay: "delay-[700ms]" },
            { color: "bg-purple-600", delay: "delay-[850ms]" },
          ].map((flag, idx) => (
            <div
              key={idx}
              className={`w-5 h-8 ${flag.color} rounded-b-md transform origin-top animate-sway ${flag.delay} shadow-md`}
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 70%, 0% 100%)",
              }}
            />
          ))}
        </div>

        {/* Header Bar */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🔥</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                ARRAIÁ DE OFERTAS <span className="text-red-500">BALÃO</span>
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-yellow-500 uppercase tracking-widest">
                Promoção de Julho • Válido até 31/07
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-900 active:scale-95"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Side: PC representation & details */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative w-full max-w-[280px] aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-center group overflow-hidden">
                
                {/* Glowing light circle behind */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-red-600/10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                
                {/* Visual indicator of the PC Case */}
                <svg viewBox="0 0 100 100" className="w-40 h-40 text-blue-500/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {/* Case Outer Chassis */}
                  <rect x="20" y="10" width="60" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  {/* Front Glass Panel divider */}
                  <line x1="28" y1="10" x2="28" y2="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  {/* Internal Graphics Card */}
                  <rect x="35" y="42" width="40" height="15" rx="3" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
                  {/* Watercooler pump logo */}
                  <circle cx="55" cy="30" r="7" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                  {/* Fan Rings Glowing (Circular LED) */}
                  <circle cx="55" cy="72" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="55" cy="72" r="3" fill="currentColor" />
                  
                  <circle cx="70" cy="22" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="70" cy="22" r="1.5" fill="currentColor" />
                  
                  <circle cx="70" cy="36" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="70" cy="36" r="1.5" fill="currentColor" />
                </svg>

                <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                  Gabinete Aquário
                </div>
                
                <div className="absolute bottom-2 left-2 bg-blue-900/80 text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Coolers Led Azul
                </div>
              </div>

              <div className="w-full text-left bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                <h3 className="font-extrabold text-white text-lg mb-2">Máquina Gamer Premium</h3>
                <ul className="text-zinc-400 text-xs space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span>Processador Intel Core i9 13900 (High-End)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span>Placa de vídeo 24GB RTX 4090 PNY</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span>32GB Memória RAM DDR5 (2x16GB)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span>SSD 2TB Super Rápido NVMe</span>
                  </li>
                </ul>
              </div>

              {/* Total & Installments Preview */}
              <div className="w-full bg-red-950/20 border border-red-900/30 p-4 rounded-2xl text-center">
                <p className="text-zinc-400 text-xs line-through mb-1">De: R$ 34.999,00</p>
                <div className="text-3xl font-black text-white tracking-tight">
                  R$ 28.329,90 <span className="text-xs font-normal text-zinc-400 block sm:inline">à vista no PIX</span>
                </div>
                <p className="text-sm font-bold text-yellow-500 mt-1">
                  ou em até 12x sem juros no cartão!
                </p>
              </div>
            </div>

            {/* Right Side: Detailed specifications list */}
            <div className="space-y-4">
              <div className="flex items-center justify-between md:hidden">
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold flex items-center justify-between transition-colors text-sm"
                >
                  <span>{showSpecs ? "Ocultar Ficha Técnica" : "Ver Ficha Técnica Completa (Peça por Peça)"}</span>
                  {showSpecs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Specifications Table (Visible on Desktop or expanded on Mobile) */}
              <div className={`${showSpecs ? "block" : "hidden md:block"} space-y-3`}>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400">Peças e Valores Detalhados</h3>
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-bold">
                        <th className="p-3">Componente</th>
                        <th className="p-3 text-right">Nosso Preço</th>
                        <th className="p-3 text-right hidden sm:table-cell">Concorrente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {parts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/40 transition-colors text-zinc-300">
                          <td className="p-3 font-semibold">{p.name}</td>
                          <td className="p-3 text-right text-yellow-500 font-bold">{p.price}</td>
                          <td className="p-3 text-right hidden sm:table-cell text-zinc-500 italic">{p.competitor}</td>
                        </tr>
                      ))}
                      <tr className="bg-zinc-900/40 font-bold text-white">
                        <td className="p-3">Total das peças montadas:</td>
                        <td className="p-3 text-right text-green-400 text-sm">R$ 28.329,90</td>
                        <td className="p-3 text-right hidden sm:table-cell text-zinc-500 font-normal">Economia Garantida</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  *Preços da concorrência pesquisados na KaBuM! para produtos equivalentes em Julho/2026. Economia real de R$ 6.670,00 sobre o preço de mercado.
                </p>
              </div>
            </div>

          </div>

          {/* Real-time Countdown Timer Section */}
          <div className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame className="text-red-500 animate-pulse shrink-0" size={20} />
              <span className="text-xs sm:text-sm font-bold text-zinc-300 text-center sm:text-left">
                Garantia de Preço Baixo! Essa oferta expira em:
              </span>
            </div>
            
            {/* Timer digits */}
            <div className="flex gap-2">
              {[
                { value: timeLeft.days, label: "dias" },
                { value: timeLeft.hours, label: "horas" },
                { value: timeLeft.minutes, label: "min" },
                { value: timeLeft.seconds, label: "seg" },
              ].map((t, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-12 h-10 bg-zinc-850 border border-zinc-700 rounded-lg flex items-center justify-center font-black text-white text-base shadow-inner">
                    {String(t.value).padStart(2, "0")}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 mt-1 font-bold">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Area - Large Action Buttons */}
        <div className="px-6 py-5 bg-zinc-900/50 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
            <ShieldCheck size={16} className="text-green-500 shrink-0" />
            <span>Preço com Garantia Balão • Nota Fiscal Incluso</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${getWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-full flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all hover:scale-105 active:scale-95 duration-200 w-full sm:w-auto text-sm"
            >
              <MessageCircle size={18} />
              Garantir no WhatsApp
            </a>
            
            <button
              onClick={handleClose}
              className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 duration-200 w-full sm:w-auto text-sm shadow-lg shadow-red-600/10"
            >
              Comprar Agora
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
