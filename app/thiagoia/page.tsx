"use client";

import { useEffect, useState, type CSSProperties } from "react";

export default function ThiagoIaPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "offline">("carregando");

  useEffect(() => {
    let vivo = true;
    async function carrega() {
      try {
        const r = await fetch("/api/thiagoia", { cache: "no-store" });
        const d = (await r.json()) as { url?: string };
        if (!vivo) return;
        if (d.url) {
          setUrl(d.url);
          setEstado("ok");
        } else {
          setEstado("offline");
        }
      } catch {
        if (vivo) setEstado("offline");
      }
    }
    carrega();
    return () => {
      vivo = false;
    };
  }, []);

  const fundo: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    background: "#0a0f17",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cfe9ff",
    fontFamily: "system-ui, sans-serif",
  };

  if (estado === "ok" && url) {
    return (
      <div style={fundo}>
        <iframe
          src={url}
          title="HERRERA"
          allow="microphone; camera; autoplay; clipboard-write; fullscreen"
          style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    );
  }

  return (
    <div style={fundo}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>HERRERA</div>
        <div style={{ marginTop: 10, opacity: 0.8 }}>
          {estado === "carregando"
            ? "Conectando ao seu PC..."
            : "HERRERA esta offline no momento."}
        </div>
      </div>
    </div>
  );
}
