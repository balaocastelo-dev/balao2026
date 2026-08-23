import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";

const ALLOWED_EVENTS = new Set([
  "whatsapp_click",
  "phone_click",
  "email_click",
  "lead_form_attempt",
  "lead_form_success",
  "lead_form_error",
  "lead_section_view",
]);

function pickText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { success: false, error: "Banco de dados nao configurado" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      event?: unknown;
      payload?: Record<string, unknown>;
    };

    const event = typeof body.event === "string" ? body.event : "";
    const payload = body.payload && typeof body.payload === "object" ? body.payload : {};

    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ success: false, error: "Evento invalido" }, { status: 400 });
    }

    const metadata = Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) =>
          ![
            "event_category",
            "channel",
            "page_path",
            "page_query",
            "source",
            "label",
            "city",
            "service",
            "product_name",
            "destination",
            "visitor_id",
            "value",
          ].includes(key)
      )
    );

    try {
      await turso.execute({
        sql: `INSERT INTO site_conversion_events
          (id, event_name, event_category, channel, page_path, page_query, source, label, city, service, product_name, destination, visitor_id, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          event,
          pickText(payload.event_category),
          pickText(payload.channel),
          pickText(payload.page_path),
          pickText(payload.page_query),
          pickText(payload.source),
          pickText(payload.label),
          pickText(payload.city),
          pickText(payload.service),
          pickText(payload.product_name),
          pickText(payload.destination),
          pickText(payload.visitor_id),
          JSON.stringify(metadata),
        ],
      });
    } catch (e) {
      console.error("Erro ao registrar evento de conversao:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track Event Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
