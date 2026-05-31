"use client";

import { useEffect, useState } from "react";

import { SITE_CONFIG } from "@/lib/config";
import { Headset, Phone, ShieldCheck, Truck } from "lucide-react";

export default function TopBar() {
  const [dolar, setDolar] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[] | null>(null);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
        const data = await res.json();
        if (data.USDBRL) {
          setDolar(parseFloat(data.USDBRL.bid).toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao buscar dólar", error);
      }
    }
    fetchDolar();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDolar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/topbar", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.messages) && data.messages.length > 0) {
            setMessages(data.messages);
            return;
          }
        }
      } catch {}
      setMessages([
        `Telefone: ${SITE_CONFIG.phone.display}`,
        `WhatsApp: ${SITE_CONFIG.whatsapp.display}`,
        `E-mail: ${SITE_CONFIG.email}`,
        "Horário de Atendimento: Seg a Sex das 09:00 às 18:00",
        `Endereço: ${SITE_CONFIG.address}`
      ]);
    };
    fetchMessages();
  }, []);

  return (
    <div className="w-full bg-zinc-950 text-white/85 text-xs md:text-sm overflow-hidden relative z-50 border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between px-3 py-2">
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 font-semibold">
            <Truck className="h-4 w-4 text-[#E60012]" />
            Atendemos todo o Brasil
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#E60012]" />
            Frete seguro para sua região
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <Headset className="h-4 w-4 text-[#E60012]" />
            Atendimento especializado
          </div>
        </div>

        <div className="md:hidden flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="animate-marquee inline-block">
            {messages?.slice(0, 5).map((m, idx) => (
              <span key={idx} className="mx-4 font-semibold">{m}</span>
            ))}
            {dolar && (
              <>
                <span className="mx-2 text-white/25">|</span>
                <span className="mx-4 font-bold text-white/90">Dólar: R$ {dolar}</span>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 font-extrabold text-white">
          <Phone className="h-4 w-4 text-[#E60012]" />
          {SITE_CONFIG.phone.display}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 35s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
