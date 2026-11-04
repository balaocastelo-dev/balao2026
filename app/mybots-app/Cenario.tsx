"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AMEBAS, balancoDoHero, deslocamentoDaAmeba } from "@/lib/mybots-landing";
import estilos from "./estilos.module.css";

/**
 * Fundo com parallax (a variável --rolagem) e as amebas acompanhando a rolagem.
 * No computador elas andam nas bordas. No celular ficam duas no hero.
 * prefers-reduced-motion: nada se move.
 */
export default function Cenario({
  children,
  classeFonte,
}: {
  children: ReactNode;
  classeFonte: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const aplicarRef = useRef<() => void>(() => {});
  const [parade, setParade] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const movimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const largo = window.matchMedia("(min-width: 1100px)");
    let frame = 0;

    const aplicar = () => {
      frame = 0;
      if (movimento.matches) {
        root.style.setProperty("--rolagem", "0");
        root.querySelectorAll<HTMLElement>("[data-ameba]").forEach((el) => {
          el.style.transform = "";
        });
        return;
      }
      const maximo = document.documentElement.scrollHeight - window.innerHeight;
      const progresso = maximo > 0 ? window.scrollY / maximo : 0;
      root.style.setProperty("--rolagem", progresso.toFixed(4));
      root.querySelectorAll<HTMLElement>("[data-ameba]").forEach((el) => {
        const indice = Number(el.dataset.indice || 0);
        const mov =
          el.dataset.papel === "hero"
            ? balancoDoHero(progresso, indice)
            : deslocamentoDaAmeba(progresso, indice, window.innerHeight);
        el.style.transform = `translate3d(${mov.x}px, ${mov.y}px, 0) rotate(${mov.giro}deg)`;
      });
    };

    aplicarRef.current = aplicar;

    const aoRolar = () => {
      if (frame) return;
      frame = requestAnimationFrame(aplicar);
    };
    const sincronizar = () => setParade(largo.matches);

    sincronizar();
    aplicar();
    largo.addEventListener("change", sincronizar);
    movimento.addEventListener("change", aplicar);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      largo.removeEventListener("change", sincronizar);
      movimento.removeEventListener("change", aplicar);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  useEffect(() => {
    aplicarRef.current();
  }, [parade]);

  return (
    <div ref={ref} className={`${estilos.pagina} ${classeFonte}`}>
      <div className={estilos.estrelas} aria-hidden />
      <div className={estilos.orbeA} aria-hidden />
      <div className={estilos.orbeB} aria-hidden />
      <div className={estilos.orbeC} aria-hidden />
      {parade ? (
        <div className={estilos.cortejo} aria-hidden>
          {AMEBAS.map((ameba, indice) => (
            <img
              key={ameba.src}
              className={ameba.lado === "esq" ? estilos.amebaEsq : estilos.amebaDir}
              data-ameba=""
              data-papel="borda"
              data-indice={indice}
              src={ameba.src}
              alt=""
              width={192}
              height={192}
              decoding="async"
            />
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
