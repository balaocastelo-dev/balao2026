import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const panelServerUrl =
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    "https://srv1963897.hstgr.cloud";
  const port = process.env.WHATSAPP_PANEL_PORT || "4100";

  const endpoints = [
    `${panelServerUrl.replace(/\/$/, "")}/api/reset-session`,
    `${panelServerUrl.replace(/\/$/, "")}/api/crm/reset-session`,
    `http://127.0.0.1:${port}/api/reset-session`,
    `http://localhost:${port}/api/reset-session`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({ ok: true }));
        return NextResponse.json({
          ok: true,
          server: url,
          mensagem: data.mensagem || "Sessão reiniciada com sucesso. Gerando novo QR Code...",
        });
      }
    } catch {}
  }

  return NextResponse.json(
    {
      ok: false,
      mensagem: "Não foi possível contactar o servidor do WhatsApp para reiniciar a sessão.",
    },
    { status: 502 }
  );
}

export async function GET() {
  return POST();
}
