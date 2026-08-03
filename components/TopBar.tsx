"use client";

import { useEffect, useState } from "react";

import { SITE_CONFIG } from "@/lib/config";

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
        console.error("Erro ao buscar dÃ³lar", error);
      }
    }
    fetchDolar();
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
        `Loja física em Campinas: ${SITE_CONFIG.addressShort || SITE_CONFIG.address}`,
        `WhatsApp rápido: ${SITE_CONFIG.whatsapp.display}`,
        "Retire na loja ou consulte entrega para Campinas e região",
        `Horário: ${SITE_CONFIG.openingHoursDisplay}`,
        `Telefone: ${SITE_CONFIG.phone.display}`,
      ]);
    };
    fetchMessages();
  }, []);

  return (
    <div className="relative z-50 w-full max-w-full overflow-hidden border-b border-red-700 bg-[#E60012] py-1 text-xs text-white md:text-sm">
      <div className="container mx-auto flex max-w-full items-center justify-between px-2">
         <div className="flex-1 overflow-hidden whitespace-nowrap relative">
            <div className="animate-marquee inline-block">
              {messages?.map((m, idx) => (
                <span key={idx} className="mx-4 font-semibold">{m}</span>
              ))}
              <span className="mx-2 text-red-200">|</span>
               {dolar && (
                <>
                  <span className="mx-2 text-red-200">|</span>
                  <span className="mx-4 font-bold text-yellow-300 bg-red-800 px-2 py-0.5 rounded">Dólar Hoje: R$ {dolar}</span>
                </>
              )}
            </div>
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
