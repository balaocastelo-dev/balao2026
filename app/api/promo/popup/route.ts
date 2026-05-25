import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Product } from "@/lib/utils";
import { buildPromoPopupProduct, scoreProductForPromo } from "@/lib/ai/visual-marketing-agent";

function pickWeighted<T>(items: Array<{ item: T; weight: number }>, seed: number) {
  const total = items.reduce((acc, v) => acc + v.weight, 0);
  if (total <= 0) return items[seed % items.length]?.item ?? null;
  let r = (seed % 100000) / 100000;
  r *= total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.item;
  }
  return items[items.length - 1]?.item ?? null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const exclude = url.searchParams.get("exclude") || "";
  const nowSeed = Date.now();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      "id,name,price,image,category,slug,cost,specs,description,originalPrice,newPrice,kabum_last_price,kabum_last_stock,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    return NextResponse.json({ error: "failed_fetch_products" }, { status: 500 });
  }

  const rows = ((data as unknown) as Product[]) || [];
  const filtered = rows.filter((p) => {
    if (!p || typeof p.id !== "string") return false;
    if (exclude && p.id === exclude) return false;
    if (typeof p.image !== "string" || !p.image.startsWith("http")) return false;
    if (typeof p.name !== "string" || p.name.trim().length < 3) return false;
    if (typeof p.price !== "string" || p.price.trim().length < 2) return false;
    return true;
  });

  if (filtered.length === 0) {
    return NextResponse.json({ error: "no_products" }, { status: 404 });
  }

  const weighted = filtered
    .map((p) => ({ item: p, weight: scoreProductForPromo(p) }))
    .filter((x) => x.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 140);

  const pickSeed = Math.floor(nowSeed / 1000) + filtered.length;
  const chosen = pickWeighted(weighted, pickSeed) || filtered[pickSeed % filtered.length];
  const payload = buildPromoPopupProduct(chosen, nowSeed);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

