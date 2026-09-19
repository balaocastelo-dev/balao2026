import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const panelServerUrl =
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    "https://srv1963897.hstgr.cloud";
  const port = process.env.WHATSAPP_PANEL_PORT || "4100";

  const endpoints = [
    `${panelServerUrl.replace(/\/$/, "")}/status`,
    `http://127.0.0.1:${port}/status`,
    `http://localhost:${port}/status`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const isConn = Boolean(
          data.connected ||
          data.session ||
          data.estado === "ready" ||
          data.status === "ready" ||
          data.estado === "authenticated" ||
          data.status === "authenticated"
        );
        const isLoading = Boolean(
          !isConn && (data.estado === "loading" || data.status === "loading")
        );

        return NextResponse.json({
          ok: true,
          server: url,
          estado: isConn ? "ready" : (isLoading ? "loading" : (data.estado || data.status || "qr")),
          status: isConn ? "ready" : (isLoading ? "loading" : (data.status || data.estado || "qr")),
          qr: isConn || isLoading ? null : (data.qr || data.qrCode || null),
          qrCode: isConn || isLoading ? null : (data.qrCode || data.qr || null),
          rawQr: isConn || isLoading ? null : (data.rawQr || null),
          connected: isConn,
          session: Boolean(data.session || isConn),
          phoneNumber: data.phoneNumber || data.conta?.numero || null,
          ultimoErro: data.ultimoErro || null,
        });
      }
    } catch {}
  }

  return NextResponse.json({
    ok: false,
    estado: "disconnected",
    status: "disconnected",
    qr: null,
    qrCode: null,
    rawQr: null,
    connected: false,
    session: false,
    phoneNumber: null,
    mensagem: "Servidor do WhatsApp indisponível no momento.",
  });
}
