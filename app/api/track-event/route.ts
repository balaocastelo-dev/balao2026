import { NextResponse } from "next/server";
import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";

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
    if (!hasAdmin) {
      return NextResponse.json(
        { success: false, error: "Supabase admin nao configurado" },
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

    const { error } = await supabaseAdmin.from("site_conversion_events").insert({
      event_name: event,
      event_category: pickText(payload.event_category),
      channel: pickText(payload.channel),
      page_path: pickText(payload.page_path),
      page_query: pickText(payload.page_query),
      source: pickText(payload.source),
      label: pickText(payload.label),
      city: pickText(payload.city),
      service: pickText(payload.service),
      product_name: pickText(payload.product_name),
      destination: pickText(payload.destination),
      visitor_id: pickText(payload.visitor_id),
      metadata,
    });

    if (error) {
      if (error.code === "42P01") {
        console.warn("Tabela site_conversion_events nao encontrada. Rode o SQL do painel.");
      } else {
        console.error("Erro ao registrar evento de conversao:", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track Event Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
