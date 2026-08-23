import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const endpoints = [
    "http://127.0.0.1:4100/status",
    "http://localhost:4100/status",
    "http://127.0.0.1:8787/api/status",
    "http://localhost:8787/api/status",
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          server: url,
          estado: data.estado || data.status || "qr",
          status: data.status || data.estado || "qr",
          qr: data.qr || data.qrCode || null,
          qrCode: data.qrCode || data.qr || null,
          rawQr: data.rawQr || data.qrTexto || null,
          connected: Boolean(data.connected || data.estado === "ready"),
          phoneNumber: data.phoneNumber || data.conta?.numero || null,
        });
      }
    } catch {}
  }

  return NextResponse.json({
    ok: false,
    estado: "initializing",
    status: "initializing",
    qr: null,
    qrCode: null,
    rawQr: null,
    connected: false,
    phoneNumber: null,
    mensagem: "Aguardando inicialização do servidor WhatsApp...",
  });
}
