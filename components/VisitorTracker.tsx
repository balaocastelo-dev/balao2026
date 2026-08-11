"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    // Evita chamadas duplicadas em StrictMode ou re-renders rápidos
    // Mas queremos trackear mudanças de rota, então pathname é dependência
    
    const trackVisit = async () => {
      try {
        // Gerar um ID de visitante simples armazenado no localStorage
        let visitorId = localStorage.getItem("visitor_id");
        if (!visitorId) {
          visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem("visitor_id", visitorId);
        }

        // Enviar para API
        // Usamos sendBeacon se possível para não bloquear, ou fetch
        const data = { page: pathname, visitorId };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track-visit', blob);
        } else {
          fetch('/api/track-visit', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            keepalive: true
          });
        }
      } catch (e) {
        // Silently fail
      }
    };

    // Debounce ou check se já trackeou essa pagina recentemente?
    // Para simplificar, trackeamos cada mudança de rota como um pageview
    // Mas para "Visitantes Únicos", o backend ou a query SQL filtra por visitorId
    
    trackVisit();
    
  }, [pathname]);

  return null;
}
