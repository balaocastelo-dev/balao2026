"use client";

import { MessageCircle } from "lucide-react";

import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function FloatingWhatsApp() {
  const message = "OlÃ¡! Vim pelo site da BalÃ£o da InformÃ¡tica e quero atendimento rÃ¡pido em Campinas.";
  const href = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    if (typeof window === "undefined") return;
    trackWhatsAppClick({
      page_path: window.location.pathname,
      source: "floating_whatsapp",
      label: "WhatsApp fixo",
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      aria-label="Chamar BalÃ£o da InformÃ¡tica no WhatsApp"
      className="fixed bottom-4 right-4 z-[950] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-2xl shadow-green-300/50 transition hover:bg-[#128C7E] active:scale-95 sm:px-5 print:hidden"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">WhatsApp agora</span>
    </a>
  );
}
