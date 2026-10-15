import { ImageResponse } from "next/og";

// Runtime padrão (Node): no "edge" as capas geradas davam 500 na Vercel
// (ver app/blog/api/og/route.ts).
export const runtime = "nodejs";

export const alt = "Overclock: o sistema que acelera sua loja de informática";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A capa que aparece ao compartilhar www.balao.info/overclock. */
export default function CapaOverclock() {
  const grafite = "#1c1f25";
  const painel = "#252930";
  const linha = "#424854";
  const texto = "#f3f1ec";
  const suave = "#c2c6ce";
  const laranja = "#ff7a1f";
  const verde = "#4fe08f";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: grafite,
          color: texto,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              border: `6px solid ${laranja}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 6, height: 24, background: laranja, borderRadius: 3, transform: "rotate(40deg)" }} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>Overclock</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, maxWidth: 980 }}>
            O sistema que acelera sua loja de informática.
          </div>
          <div style={{ marginTop: 22, fontSize: 32, color: suave }}>
            Loja virtual, WhatsApp, assistência e marketing num sistema só.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: painel,
            border: `2px solid ${linha}`,
            borderRadius: 18,
            padding: "22px 28px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, color: suave }}>Anúncio no Google, loja Balão da Informática</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
              <div style={{ fontSize: 34, color: suave, textDecoration: "line-through" }}>R$ 169 por dia</div>
              <div style={{ fontSize: 52, fontWeight: 800, color: verde }}>R$ 0</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              background: verde,
              color: grafite,
              fontSize: 34,
              fontWeight: 800,
              padding: "8px 22px",
              borderRadius: 10,
            }}
          >
            OK
          </div>
        </div>
      </div>
    ),
    size,
  );
}
