"use client";

import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function WhatsAppButton({ productName }: { productName: string }) {
  const handleWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      const message = [
        `Olá! Vi no site este produto: ${productName}`,
        `Link: ${window.location.href}`,
        "Pode confirmar estoque, valor final e opção de retirada/entrega em Campinas?",
      ].join("\n");
      const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
      trackWhatsAppClick({
        page_path: window.location.pathname,
        source: "product_whatsapp_button",
        label: productName,
        product_name: productName,
      });
      window.open(url, "_blank");
    }
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="flex items-center gap-2 px-3 py-2 text-xs md:px-4 md:py-2 md:text-base bg-[#25D366] text-white rounded-md font-bold hover:bg-[#128C7E] transition-colors shadow-sm"
      title="Confirmar estoque no WhatsApp"
    >
      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
      <span className="md:hidden">WhatsApp</span>
      <span className="hidden md:inline">Confirmar estoque no WhatsApp</span>
    </button>
  );
}
