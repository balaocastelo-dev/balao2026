"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackWhatsAppClick } from "@/lib/tracking";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  if (
    pathname === "/crm" ||
    pathname.startsWith("/crm/") ||
    pathname === "/whatsapp" ||
    pathname === "/painel" ||
    pathname.startsWith("/painel/")
  ) {
    return null;
  }

  // Na /seminovos o celular tem a barra de pedido da própria página; o botão
  // fica só no computador, com a mensagem de seminovos.
  const naSeminovos = pathname === "/seminovos";
  const mensagem = naSeminovos
    ? "Olá! Vim pela página de seminovos e quero ver os notebooks que vocês têm hoje."
    : SITE_CONFIG.whatsapp.messageDefault;

  const handleWhatsAppClick = () => {
    if (typeof window === "undefined") return;

    // Páginas de captação deixam a mensagem do assunto delas (BarraDoCelular).
    const daPagina = window.__balaoWhats;

    trackWhatsAppClick({
      page_path: window.location.pathname,
      source: daPagina ? `flutuante_${daPagina.origem}` : "floating_whatsapp_btn",
      label: "Chamar no WhatsApp agora",
      product_name: "Geral",
    });

    window.open(
      `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
        daPagina?.mensagem || mensagem
      )}`,
      "_blank"
    );
  };

  return (
    <div className={`balao-whats-flutuante fixed bottom-6 right-6 z-[9990] ${naSeminovos ? "hidden sm:flex" : "flex"} flex-col items-end gap-2 pointer-events-none`}>
      {/* Badge with help text */}
      <div 
        onClick={handleWhatsAppClick}
        className="bg-zinc-950/90 text-zinc-200 border border-zinc-800 px-4 py-2 rounded-2xl shadow-xl text-xs md:text-sm font-semibold backdrop-blur-md opacity-0 translate-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-forwards pointer-events-auto hover:scale-105 transition-transform max-w-[260px] md:max-w-xs text-right cursor-pointer select-none"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="text-[#25D366] font-bold animate-pulse mr-1">●</span> Consultar estoque e entrega em Campinas
      </div>
      
      {/* Main Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="pointer-events-auto bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
        aria-label="Chamar no WhatsApp"
      >
        <MessageCircle size={28} className="transition-transform group-hover:rotate-12" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-500 ease-out font-black text-sm uppercase tracking-wider whitespace-nowrap">
          Chamar no WhatsApp agora
        </span>
      </button>
    </div>
  );
}
