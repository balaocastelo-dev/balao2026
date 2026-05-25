import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import type { Product } from "@/lib/utils";
import { buildPromoPopupProduct } from "@/lib/ai/visual-marketing-agent";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const exclude = url.searchParams.get("exclude") || "";
  const nowSeed = Date.now();

  const selectColumns = "id,name,price,image,category,slug,cost,specs,kabum_last_price,kabum_last_stock,created_at";

  const primary = await supabase
    .from("products")
    .select(selectColumns)
    .order("created_at", { ascending: false })
    .limit(200);

  const fallback = primary.error && hasAdmin
    ? await supabaseAdmin
        .from("products")
        .select(selectColumns)
        .order("created_at", { ascending: false })
        .limit(200)
    : null;

  const data = (fallback?.data ?? primary.data) as unknown;
  const error = fallback?.error ?? primary.error;

  if (error) {
    return NextResponse.json({ error: "failed_fetch_products" }, { status: 500 });
  }

  const rows = ((data as unknown) as Product[]) || [];
  const eligible = rows.filter((p) => {
    if (!p || typeof p.id !== "string") return false;
    if (typeof p.image !== "string" || !p.image.startsWith("http")) return false;
    if (typeof p.name !== "string" || p.name.trim().length < 3) return false;
    if (typeof p.price !== "string" || p.price.trim().length < 2) return false;
    return true;
  });

  if (eligible.length === 0) {
    return NextResponse.json({ error: "no_products" }, { status: 404 });
  }

  const filtered = exclude ? eligible.filter((p) => p.id !== exclude) : eligible;
  const pool = filtered.length > 0 ? filtered : eligible;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const payload = buildPromoPopupProduct(chosen, nowSeed);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
