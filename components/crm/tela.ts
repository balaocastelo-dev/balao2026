"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Em que tamanho de tela o CRM está aberto.
 *
 * - "celular": até 767px. O CRM vira um WhatsApp: a lista de conversas ocupa a
 *   tela, tocar numa conversa abre o chat em tela cheia e o resto (catálogo,
 *   kanban, ajustes) fica escondido atrás de menus.
 * - "tablet": de 768px a 1279px. Lista + conversa lado a lado; o painel de
 *   ferramentas abre por cima quando chamado e o kanban começa recolhido.
 * - "desktop": 1280px para cima, o layout de três colunas de sempre.
 */
export type TamanhoTela = "celular" | "tablet" | "desktop";

export const CONSULTA_CELULAR = "(max-width: 767px)";
export const CONSULTA_TABLET = "(min-width: 768px) and (max-width: 1279px)";

function medir(): TamanhoTela {
  if (typeof window === "undefined" || !window.matchMedia) return "desktop";
  if (window.matchMedia(CONSULTA_CELULAR).matches) return "celular";
  if (window.matchMedia(CONSULTA_TABLET).matches) return "tablet";
  return "desktop";
}

export function useTamanhoTela(): TamanhoTela {
  // Começa em "desktop" para o HTML do servidor bater com o primeiro desenho;
  // logo depois de montar mede a tela de verdade.
  const [tamanho, setTamanho] = useState<TamanhoTela>("desktop");

  useEffect(() => {
    const atualizar = () => setTamanho(medir());
    atualizar();
    const consultas = [CONSULTA_CELULAR, CONSULTA_TABLET].map((q) => window.matchMedia(q));
    consultas.forEach((c) => c.addEventListener("change", atualizar));
    return () => consultas.forEach((c) => c.removeEventListener("change", atualizar));
  }, []);

  return tamanho;
}

/**
 * Toque longo, para abrir o menu de opções no celular (no iPhone o navegador
 * não dispara o "contextmenu" ao segurar o dedo). Mexer o dedo cancela, para
 * não atrapalhar a rolagem.
 */
export function useToqueLongo(ms = 500) {
  // Um dedo de cada vez: um cronômetro só serve para a tela inteira, então
  // dá para usar dentro de listas (.map) sem um hook por item.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  // Se o toque longo disparou, o "click" que o navegador manda ao soltar o
  // dedo fecharia o menu recém-aberto; o fim do toque o cancela.
  const disparou = useRef(false);

  const cancelar = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    inicio.current = null;
  }, []);

  useEffect(() => cancelar, [cancelar]);

  return (aoSegurar: (x: number, y: number) => void) => ({
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      inicio.current = { x: t.clientX, y: t.clientY };
      disparou.current = false;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const p = inicio.current;
        timer.current = null;
        if (p) {
          disparou.current = true;
          if (navigator.vibrate) navigator.vibrate(15);
          aoSegurar(p.x, p.y);
        }
      }, ms);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      const p = inicio.current;
      if (!t || !p) return;
      if (Math.abs(t.clientX - p.x) > 10 || Math.abs(t.clientY - p.y) > 10) cancelar();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (disparou.current && e.cancelable) e.preventDefault();
      disparou.current = false;
      cancelar();
    },
    onTouchCancel: cancelar,
  });
}
