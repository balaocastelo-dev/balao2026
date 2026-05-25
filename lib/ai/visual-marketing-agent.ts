import type { Product } from "@/lib/utils";
import { parsePriceToNumber } from "@/lib/utils";

export type PromoPopupProduct = {
  id: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  installments: { count: number; amount: number; label: string };
  specs: string[];
  category: string;
  stock: number | null;
  url: string;
  headline: string;
  urgency: string;
  subline: string;
  layout: "imageTop" | "imageLeft";
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toMoneyBRL(value: number) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function parseStock(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return clamp(Math.trunc(value), 0, 99999);
  if (typeof value !== "string") return null;
  const m = value.match(/(\d{1,5})/);
  if (!m) return null;
  return clamp(Number(m[1]), 0, 99999);
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number) {
  if (arr.length === 0) throw new Error("Empty pick");
  return arr[seed % arr.length];
}

function isGamerCategory(category: string) {
  const c = (category || "").toLowerCase();
  return (
    c.includes("gamer") ||
    c.includes("games") ||
    c.includes("console") ||
    c.includes("pc") ||
    c.includes("placa de vídeo") ||
    c.includes("rtx") ||
    c.includes("monitor") ||
    c.includes("headset") ||
    c.includes("teclado") ||
    c.includes("mouse")
  );
}

function extractSpecs(product: Product, seed: number): string[] {
  const specs: string[] = [];
  const raw = product.specs;
  const push = (label: string) => {
    const v = label.trim();
    if (!v) return;
    if (specs.some((s) => s.toLowerCase() === v.toLowerCase())) return;
    specs.push(v);
  };

  if (raw && typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, unknown>);
    const keyMatchers: Array<{ keys: RegExp; prefix: string }> = [
      { keys: /(processador|cpu)/i, prefix: "" },
      { keys: /(mem[oó]ria|ram)/i, prefix: "" },
      { keys: /(ssd|armazenamento|storage|nvme|m\.2)/i, prefix: "" },
      { keys: /(gpu|placa|v[ií]deo|rtx|gtx|radeon)/i, prefix: "" },
      { keys: /(garantia|warranty)/i, prefix: "" },
      { keys: /(rgb)/i, prefix: "" },
      { keys: /(monitor|tela)/i, prefix: "" },
      { keys: /(acess[oó]rios|perif[eé]ricos)/i, prefix: "" },
    ];

    for (const { keys } of keyMatchers) {
      const found = entries.find(([k]) => keys.test(String(k)));
      if (!found) continue;
      const [, v] = found;
      if (typeof v === "string" && v.trim()) push(v);
      else if (typeof v === "number" && Number.isFinite(v)) push(String(v));
      else if (Array.isArray(v)) push(v.filter((x) => typeof x === "string").join(" • "));
    }

    if (specs.length < 6) {
      for (const [k, v] of entries) {
        if (specs.length >= 6) break;
        const label = String(k || "").trim();
        if (!label) continue;
        if (typeof v === "string" && v.trim()) push(`${label}: ${v}`);
      }
    }
  }

  const category = product.category || "";
  const fallbackGamer = [
    "Setup pronto para jogar",
    "Garantia de 12 meses",
    "RGB premium",
    "Alto desempenho",
    "Componentes selecionados",
    "Entrega rápida",
  ] as const;
  const fallbackGeneral = [
    "Produto original",
    "Garantia de 12 meses",
    "Nota fiscal",
    "Entrega rápida",
    "Suporte especializado",
    "Preço especial",
  ] as const;

  while (specs.length < 6) {
    const base = isGamerCategory(category) ? fallbackGamer : fallbackGeneral;
    push(pick(base, seed + specs.length * 7));
  }

  return specs.slice(0, 6);
}

export function scoreProductForPromo(product: Product) {
  const price = parsePriceToNumber(product.newPrice || product.price);
  if (!Number.isFinite(price) || price <= 0) return 0;

  const stock = parseStock(product.kabum_last_stock);
  const hasStock = stock !== null ? clamp(stock / 30, 0, 1) : 0.35;

  const cost = typeof product.cost === "number" && Number.isFinite(product.cost) ? product.cost : null;
  const margin = cost && cost > 0 ? clamp((price - cost) / price, 0, 0.6) : 0.18;

  const old = parsePriceToNumber(product.originalPrice);
  const hasRealPromo = Number.isFinite(old) && old > price ? clamp((old - price) / old, 0, 0.4) : 0;

  const gamerBoost = isGamerCategory(product.category) ? 0.25 : 0;

  const imageBoost = typeof product.image === "string" && product.image.startsWith("http") ? 0.1 : 0;

  const score = 0.35 + hasStock * 0.35 + margin * 0.45 + hasRealPromo * 0.55 + gamerBoost + imageBoost;
  return clamp(score, 0.05, 3.5);
}

export function buildPromoPopupProduct(product: Product, nowSeed: number): PromoPopupProduct {
  const seed = hashSeed(`${product.id}|${nowSeed}`);

  const promoPrice = parsePriceToNumber(product.newPrice || product.price);
  const price = Number.isFinite(promoPrice) ? promoPrice : parsePriceToNumber(product.price);

  const original = parsePriceToNumber(product.originalPrice);
  const kabumOld =
    typeof product.kabum_last_price === "number" && Number.isFinite(product.kabum_last_price)
      ? product.kabum_last_price
      : Number.NaN;

  const oldPriceRaw =
    Number.isFinite(original) && original > price
      ? original
      : Number.isFinite(kabumOld) && kabumOld > price
        ? kabumOld
        : price * (1.15 + (seed % 10) / 100);

  const oldPrice = Math.max(price, oldPriceRaw);
  const discountPercent = clamp(Math.round(((oldPrice - price) / oldPrice) * 100), 5, 55);

  const installmentsCount = 10;
  const installmentAmount = price / installmentsCount;
  const installments = {
    count: installmentsCount,
    amount: installmentAmount,
    label: `${installmentsCount}x de ${toMoneyBRL(installmentAmount)} sem juros`,
  };

  const headlinePool = [
    "🔥 PROMOÇÃO EXCLUSIVA",
    "⚡ OFERTA RELÂMPAGO",
    "🚀 PREÇO IMPERDÍVEL",
    "🎮 SUPER DESCONTO",
  ] as const;
  const urgencyPool = [
    "ÚLTIMAS UNIDADES",
    "SÓ HOJE",
    "OFERTA POR TEMPO LIMITADO",
    "DESCONTO ATIVO AGORA",
  ] as const;

  const stock = parseStock(product.kabum_last_stock);
  const urgency =
    stock !== null && stock <= 5 ? "ÚLTIMAS UNIDADES" : pick(urgencyPool, seed + 17);

  const layout: "imageTop" | "imageLeft" = seed % 2 === 0 ? "imageTop" : "imageLeft";

  return {
    id: product.id,
    title: product.name,
    image: product.image,
    price,
    oldPrice,
    discountPercent,
    installments,
    specs: extractSpecs(product, seed),
    category: product.category,
    stock,
    url: `/product/${product.slug || product.id}`,
    headline: pick(headlinePool, seed + 3),
    urgency,
    subline: `Desconto de ${discountPercent}% • ${installments.label}`,
    layout,
  };
}
