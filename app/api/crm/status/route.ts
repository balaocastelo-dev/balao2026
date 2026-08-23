import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const port = process.env.WHATSAPP_PANEL_PORT || "4100";
  const endpoints = [
    `http://127.0.0.1:${port}/status`,
    `http://localhost:${port}/status`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
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
          rawQr: data.rawQr || null,
          connected: Boolean(data.connected || data.estado === "ready" || data.status === "ready"),
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
