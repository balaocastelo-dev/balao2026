import { NextResponse } from "next/server";
import { createVitrinePage, listVitrinePagesAdmin } from "@/lib/vitrine/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pages = await listVitrinePagesAdmin();
    return NextResponse.json({ success: true, pages });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao listar páginas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const page = await createVitrinePage(body);
    return NextResponse.json({ success: true, page });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao criar página" }, { status: 500 });
  }
}

