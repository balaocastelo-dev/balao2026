import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

function clamp(input: string, max: number) {
  const t = (input ?? "").toString().replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickPalette(seed: string) {
  const h = hashString(seed);
  const palettes = [
    ["#0b1020", "#111827", "#e41e26"],
    ["#0a0a0a", "#171717", "#f97316"],
    ["#0b1020", "#1f2937", "#22c55e"],
    ["#0b1020", "#111827", "#3b82f6"],
    ["#0a0a0a", "#1f2937", "#a855f7"],
  ];
  return palettes[h % palettes.length]!;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = clamp(url.searchParams.get("title") ?? "Post", 110);
  const category = clamp(url.searchParams.get("category") ?? "Tecnologia", 24);
  const source = clamp(url.searchParams.get("source") ?? "", 36);
  const seed = url.searchParams.get("seed") ?? `${category}-${title}`;
  const [bg1, bg2, accent] = pickPalette(seed);

  const rootStyle: React.CSSProperties = {
    width: "1200px",
    height: "630px",
    display: "flex",
    flexDirection: "column",
    padding: "56px",
    background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 60%, ${bg1} 100%)`,
    color: "white",
    justifyContent: "space-between",
  };

  const headerRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  };

  const dotStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    background: accent,
    boxShadow: "0 0 0 8px rgba(255,255,255,0.06)",
  };

  const brandStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  };

  const chipStyle: React.CSSProperties = {
    marginLeft: "12px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.10)",
    fontSize: "14px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const midStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "58px",
    fontWeight: 900,
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
  };

  const sourceStyle: React.CSSProperties = {
    fontSize: "18px",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 700,
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    color: "rgba(255,255,255,0.65)",
    fontWeight: 700,
  };

  const element = React.createElement(
    "div",
    { style: rootStyle },
    React.createElement(
      "div",
      { style: headerRowStyle },
      React.createElement("div", { style: dotStyle }),
      React.createElement("div", { style: brandStyle }, "BalãoNews"),
      React.createElement("div", { style: chipStyle }, category),
    ),
    React.createElement(
      "div",
      { style: midStyle },
      React.createElement("div", { style: titleStyle }, title),
      source ? React.createElement("div", { style: sourceStyle }, `Fonte: ${source}`) : null,
    ),
    React.createElement(
      "div",
      { style: footerStyle },
      React.createElement("div", null, "Notícias • Hardware • Games • IA"),
      React.createElement("div", { style: { color: accent } }, "balao.info/blog"),
    ),
  );

  return new ImageResponse(element, { width: 1200, height: 630 });
}

