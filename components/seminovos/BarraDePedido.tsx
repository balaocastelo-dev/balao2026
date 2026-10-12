"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { linkDoWhatsApp, mensagemDoPedido } from "@/lib/seminovos/whatsapp";
import { trackWhatsAppClick } from "@/lib/tracking";

/** Barra fixa no rodapé do celular, depois que o formulário do topo sai da tela. */
export default function BarraDePedido() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById("pedido");
    if (!alvo || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => setVisivel(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[70] border-t border-slate-800 bg-[#090d16]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur transition-transform duration-300 sm:hidden ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visivel}
    >
      <div className="flex gap-3">
        <a
          href="#pedido"
          tabIndex={visivel ? 0 : -1}
          className="flex-1 rounded-2xl bg-[#E60012] py-3.5 text-center font-black text-white active:scale-[0.98]"
        >
          Receber opções
        </a>
        <a
          href={linkDoWhatsApp(mensagemDoPedido({ interesse: "comprar" }))}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visivel ? 0 : -1}
          onClick={() => trackWhatsAppClick({ source: "seminovos_barra", page_path: "/seminovos" })}
          className="flex items-center justify-center rounded-2xl bg-[#25D366] px-5 text-[#0b2b17]"
          aria-label="Chamar no WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
