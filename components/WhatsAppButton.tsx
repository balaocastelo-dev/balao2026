"use client";

import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function WhatsAppButton({ productName, mensagem }: { productName: string; mensagem?: string }) {
  const texto =
    mensagem ||
    `Olá! Vi no site este produto: ${productName}. Pode confirmar estoque, valor final e opção de retirada ou entrega em Campinas?`;
  const url = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(texto)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (typeof window === "undefined") return;
        trackWhatsAppClick({
          page_path: window.location.pathname,
          source: "product_whatsapp_button",
          label: productName,
          product_name: productName,
        });
      }}
      className="flex items-center gap-2 px-3 py-2 text-xs md:px-4 md:py-2 md:text-base bg-[#25D366] text-white rounded-md font-bold hover:bg-[#128C7E] transition-colors shadow-sm"
      title="Confirmar estoque no WhatsApp"
    >
      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
      <span className="md:hidden">WhatsApp</span>
      <span className="hidden md:inline">Confirmar estoque no WhatsApp</span>
    </a>
  );
}
