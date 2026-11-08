"use client";

import { useEffect, useState } from "react";
import { MARCA_APP } from "./app-balao";

// Cliente: a pessoa está dentro do app do Balão?
//
// Começa `false` para o HTML do servidor e do navegador baterem (sem erro de
// hidratação) e vira `true` depois que a página monta, se o User-Agent tiver a
// marca do app. Assim a vitrine troca para o preço com -15% só no app.
export function useEhApp(): boolean {
  const [ehApp, setEhApp] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent.includes(MARCA_APP)) {
      setEhApp(true);
    }
  }, []);
  return ehApp;
}
