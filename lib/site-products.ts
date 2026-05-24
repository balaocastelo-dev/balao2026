import crypto from "crypto";

export type SiteProduct = {
  id: string;
  url: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  priceText: string | null;
};

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;
  if (u.startsWith("http://")) return `https://${u.slice("http://".length)}`;
  return u;
}

function uniqStrings(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const v = s.trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function extractProductPaths(html: string): string[] {
  const matches = Array.from(html.matchAll(/\/product\/[a-zA-Z0-9-_%]+/g)).map((m) => m[0]);
  return uniqStrings(matches);
}

function pickDeterministicSubset<T>(items: T[], take: number, seed: string): T[] {
  const withKey = items.map((item, idx) => {
    const h = sha256(`${seed}:${idx}:${JSON.stringify(item)}`);
    return { item, h };
  });
  withKey.sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0));
  return withKey.slice(0, take).map((x) => x.item);
}

function extractMeta(html: string, propOrName: string, isProperty: boolean): string | null {
  const attr = isProperty ? "property" : "name";
  const re = new RegExp(`<meta\\s+[^>]*${attr}="${propOrName}"[^>]*content="([^"]+)"[^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] ? m[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const og = extractMeta(html, "og:title", true);
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? m[1].replace(/\s+/g, " ").trim() : null;
}

function extractPrice(html: string): string | null {
  const m = html.match(/R\$\s*[\d.]+,\d{2}/i) || html.match(/R\$\s*[\d.,]+/i);
  return m?.[0] ? m[0].replace(/\s+/g, " ").trim() : null;
}

export async function scrapeSiteProducts(input?: { take?: number }): Promise<SiteProduct[]> {
  const take = Math.max(1, Math.min(30, input?.take ?? 12));
  const site = "https://www.balao.info";
  const pages = ["/", "/promocao", "/notebooks", "/pcgamer"];

  const htmls = await Promise.all(
    pages.map(async (p) => {
      try {
        const res = await fetch(`${site}${p}`, { cache: "no-store" });
        if (!res.ok) return "";
        return await res.text();
      } catch {
        return "";
      }
    }),
  );

  const allPaths = uniqStrings(htmls.flatMap(extractProductPaths));
  if (allPaths.length === 0) return [];

  const daySeed = new Date().toISOString().slice(0, 10);
  const chosenPaths = pickDeterministicSubset(allPaths, take, `balao-products:${daySeed}`);

  const products = await Promise.all(
    chosenPaths.map(async (path) => {
      const fullUrl = normalizeUrl(path.startsWith("http") ? path : `${site}${path}`);
      try {
        const res = await fetch(fullUrl, { cache: "no-store" });
        if (!res.ok) return null;
        const html = await res.text();
        const name = extractTitle(html) || "Produto";
        const imageUrl = extractMeta(html, "og:image", true);
        const description = extractMeta(html, "description", false) || extractMeta(html, "og:description", true);
        const priceText = extractPrice(html);

        return {
          id: sha256(`site-product:${fullUrl}`),
          url: fullUrl,
          name,
          imageUrl: imageUrl ? normalizeUrl(imageUrl) : null,
          description: description ? description.trim() : null,
          priceText,
        } satisfies SiteProduct;
      } catch {
        return null;
      }
    }),
  );

  return products.filter(Boolean) as SiteProduct[];
}

