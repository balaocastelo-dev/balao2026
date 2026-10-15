"use client";

import { useEffect, useState } from "react";
import { LINK_QUERO } from "../_dados/oferta";

/**
 * No celular, o botão principal fica preso embaixo depois que o topo sai da
 * tela, e some de novo quando a chamada final aparece (para não ter dois).
 */
export default function BarraCelular() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const topo = document.getElementById("oc-topo");
    const fim = document.getElementById("oc-chamada-final");
    if (!topo || !fim || !("IntersectionObserver" in window)) return;
    const estado = { topo: true, fim: false };
    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === topo) estado.topo = e.isIntersecting;
        if (e.target === fim) estado.fim = e.isIntersecting;
      }
      setVisivel(!estado.topo && !estado.fim);
    });
    observador.observe(topo);
    observador.observe(fim);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-(--oc-linha) bg-(--oc-fundo)/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${
        visivel ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visivel}
    >
      <a
        href={LINK_QUERO}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visivel ? 0 : -1}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-(--oc-laranja) px-4 text-[1.05rem] font-bold text-(--oc-fundo)"
      >
        Quero o Overclock na minha loja
      </a>
    </div>
  );
}
