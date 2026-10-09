import { ImageResponse } from "next/og";
import React from "react";

// Roda no runtime padrão (Node), não no "edge". No edge esta rota respondia
// 500 na Vercel desde agosto ("NEXT_DEPLOYMENT_ID is missing"): nenhuma capa
// gerada aparecia, nem no site nem ao compartilhar o link.
export const runtime = "nodejs";

/**
 * A capa gerada com o título do artigo (1200 × 630).
 *
 * Serve para três coisas: a imagem que aparece quando o link é compartilhado
 * no WhatsApp e nas redes, a capa de artigo que ainda não tem foto e a reserva
 * quando uma capa hospedada fora falha. Só as cores da marca: fundo carbono,
 * branco e o Vermelho Balão.
 */

function cortar(texto: string, max: number) {
  const t = (texto ?? "").toString().replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

/** Um desenho de fundo diferente por artigo, sempre o mesmo para o mesmo endereço. */
function semente(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const titulo = cortar(url.searchParams.get("title") ?? "Blog da Balão da Informática", 110);
  const categoria = cortar(url.searchParams.get("category") ?? "Guias", 40);
  const s = semente(url.searchParams.get("seed") ?? titulo);

  // Uma régua de barras verticais no canto, como um gráfico de teste.
  const barras = Array.from({ length: 9 }, (_v, i) => 90 + ((s >> (i * 3)) & 7) * 46);
  const acesa = s % barras.length;

  const e = React.createElement;
  const tamanhoDoTitulo = titulo.length > 80 ? 54 : titulo.length > 52 ? 64 : 76;

  const elemento = e(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        background: "#090d16",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      },
    },
    e(
      "div",
      {
        style: {
          position: "absolute",
          right: "64px",
          bottom: "0px",
          display: "flex",
          alignItems: "flex-end",
          gap: "14px",
          height: "630px",
        },
      },
      ...barras.map((altura, i) =>
        e("div", {
          key: i,
          style: {
            width: "26px",
            height: `${altura}px`,
            background: i === acesa ? "#E60012" : "#161f32",
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
          },
        }),
      ),
    ),
    e(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          width: "860px",
          height: "630px",
        },
      },
      e(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "16px", fontSize: "26px", fontWeight: 700 } },
        e("div", { style: { width: "18px", height: "18px", background: "#E60012" } }),
        e("div", null, categoria),
      ),
      e(
        "div",
        {
          style: {
            display: "flex",
            fontSize: `${tamanhoDoTitulo}px`,
            fontWeight: 900,
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
          },
        },
        titulo,
      ),
      e(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "18px", fontSize: "24px", color: "#94a3b8", fontWeight: 600 } },
        e("div", { style: { color: "#f8fafc", fontWeight: 800 } }, "Balão da Informática"),
        e("div", { style: { width: "2px", height: "22px", background: "#334155" } }),
        e("div", null, "balao.info/blog"),
      ),
    ),
  );

  return new ImageResponse(elemento, {
    width: 1200,
    height: 630,
    headers: { "cache-control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
