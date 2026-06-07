"use client";

import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function WhatsAppButton({ productName }: { productName: string }) {
  const handleWhatsAppClick = () => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const message = `Olá, gostaria de consultar a disponibilidade do produto: ${productName} - ${window.location.href}`;
      const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
      trackWhatsAppClick({
        page_path: window.location.pathname,
        source: "product_whatsapp_button",
        label: productName,
        product_name: productName,
      });
      window.open(url, '_blank');
    }
  };

  return (
    <button 
      onClick={handleWhatsAppClick}
      className="flex items-center gap-2 px-3 py-2 text-xs md:px-4 md:py-2 md:text-base bg-[#25D366] text-white rounded-md font-medium hover:bg-[#128C7E] transition-colors shadow-sm"
      title="Verificar disponibilidade no WhatsApp"
    >
      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
      <span className="md:hidden">Verificar no WhatsApp</span>
      <span className="hidden md:inline">Verificar disponibilidade no WhatsApp</span>
    </button>
  );
}
