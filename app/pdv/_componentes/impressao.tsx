"use client";

// Impressão sem sair do caixa: o comprovante é montado fora da tela, a página
// troca o tamanho do papel (80 mm ou A4) e chama a impressão do navegador.
// Com a impressora térmica como padrão do Windows, o cupom sai direto.

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { DadosDoComprovante } from "@/lib/pdv/vendas";
import { Comprovante, type Formato } from "./Comprovante";

const PAGINA: Record<Formato, string> = {
  "80mm": "@page { size: 80mm auto; margin: 2mm 4mm; }",
  a4: "@page { size: A4; margin: 12mm; }",
};

export function useImpressao() {
  const [pedido, setPedido] = useState<{ c: DadosDoComprovante; formato: Formato; vez: number } | null>(null);

  const imprimir = useCallback((c: DadosDoComprovante, formato: Formato) => {
    setPedido({ c, formato, vez: Date.now() });
  }, []);

  useEffect(() => {
    if (!pedido) return;
    const html = document.documentElement;
    const estilo = document.createElement("style");
    estilo.id = "pdv-pagina";
    estilo.textContent = PAGINA[pedido.formato];
    document.head.appendChild(estilo);
    html.classList.add("pdv-imprimindo");

    const limpar = () => {
      html.classList.remove("pdv-imprimindo");
      estilo.remove();
      window.removeEventListener("afterprint", limpar);
    };
    window.addEventListener("afterprint", limpar);

    // Espera as fotos e o QR desenharem antes de abrir a impressão.
    const area = document.getElementById("pdv-impressao");
    const fotos = Array.from(area?.querySelectorAll("img") ?? []);
    const prontas = Promise.all(
      fotos.map((img) => (img.complete ? Promise.resolve() : new Promise<void>((r) => ((img.onload = () => r()), (img.onerror = () => r())))))
    );
    let cancelado = false;
    Promise.race([prontas, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (cancelado) return;
      window.print();
      // Alguns navegadores não disparam afterprint: limpa de qualquer jeito.
      setTimeout(limpar, 1000);
    });
    return () => {
      cancelado = true;
      limpar();
    };
  }, [pedido]);

  const area =
    pedido && typeof document !== "undefined"
      ? createPortal(
          <div id="pdv-impressao" key={pedido.vez}>
            <Comprovante c={pedido.c} formato={pedido.formato} />
          </div>,
          document.body
        )
      : null;

  return { imprimir, area };
}
