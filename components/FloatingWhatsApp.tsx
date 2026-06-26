
"use client";

import { MessageCircle } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function FloatingWhatsApp() {
  const handleWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      trackWhatsAppClick({
        page_path: window.location.pathname,
        source: "floating_whatsapp",
        label: "Botao flutuante",
      });
      window.open(BUSINESS_INFO.whatsapp.href, '_blank');
    }
  };

  return (
    <button 
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] transition-all hover:scale-110 animate-bounce-slow"
      title="Fale conosco no WhatsApp"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </button>
  );
}
