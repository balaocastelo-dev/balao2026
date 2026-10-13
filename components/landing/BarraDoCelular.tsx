"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { trackPhoneClick, trackWhatsAppClick } from "@/lib/tracking";

declare global {
  interface Window {
    /** Mensagem e origem do botão flutuante de WhatsApp na página atual. */
    __balaoWhats?: { mensagem: string; origem: string };
  }
}

/**
 * No celular, depois que o topo sai da tela, uma barra fixa com as duas
 * saídas: WhatsApp com a mensagem da página e a ligação para a loja.
 * Também entrega a mensagem da página ao botão flutuante do site.
 */
export default function BarraDoCelular({ mensagem, origem, rotulo }: { mensagem: string; origem: string; rotulo: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    window.__balaoWhats = { mensagem, origem };
    // No celular a barra substitui o botão flutuante (captacao.css).
    document.documentElement.dataset.barraWhats = "1";
    const aoRolar = () => setVisivel(window.scrollY > window.innerHeight * 0.75);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      if (window.__balaoWhats?.origem === origem) delete window.__balaoWhats;
      delete document.documentElement.dataset.barraWhats;
    };
  }, [mensagem, origem]);

  const link = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;

  return (
    <div className="cpt-barra" data-visivel={visivel} aria-hidden={!visivel}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visivel ? 0 : -1}
        className="cpt-botao cpt-botao--acao flex-1 !min-h-[3rem] !px-4"
        onClick={() => trackWhatsAppClick({ page_path: `/${origem}`, source: `barra_${origem}`, label: rotulo })}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {rotulo}
      </a>
      <a
        href={`tel:+${SITE_CONFIG.phone.number}`}
        tabIndex={visivel ? 0 : -1}
        className="cpt-botao cpt-botao--linha !min-h-[3rem] !px-4"
        aria-label={`Ligar para a loja: ${SITE_CONFIG.phone.display}`}
        onClick={() => trackPhoneClick({ page_path: `/${origem}`, source: `barra_${origem}` })}
      >
        <Phone className="h-5 w-5" aria-hidden />
      </a>
    </div>
  );
}
