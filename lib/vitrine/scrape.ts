function stripHtmlToText(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const withBreaks = withoutScripts
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  return withBreaks
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractJsonLdBlocks(html: string) {
  const blocks: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(html)) !== null) {
    const raw = (m[1] || "").trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {}
  }
  return blocks;
}

function findProductJsonLd(blocks: any[]) {
  const visit = (node: any): any | null => {
    if (!node) return null;
    if (Array.isArray(node)) {
      for (const it of node) {
        const r = visit(it);
        if (r) return r;
      }
      return null;
    }
    if (typeof node === "object") {
      const t = node["@type"];
      if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return node;
      const graph = node["@graph"];
      if (graph) {
        const r = visit(graph);
        if (r) return r;
      }
      for (const v of Object.values(node)) {
        const r = visit(v);
        if (r) return r;
      }
    }
    return null;
  };

  for (const b of blocks) {
    const found = visit(b);
    if (found) return found;
  }
  return null;
}

function extractMeta(html: string, nameOrProp: string, type: "name" | "property") {
  const re = new RegExp(`<meta[^>]+${type}=["']${nameOrProp}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1]?.trim() || "";
}

function extractTableKeyValues(html: string) {
  const out: Record<string, string> = {};
  const rowRe = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const tdRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
  const clean = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

  const rows = html.match(rowRe) || [];
  for (const r of rows) {
    const cells: string[] = [];
    let m: RegExpExecArray | null = null;
    while ((m = tdRe.exec(r)) !== null) {
      cells.push(clean(m[1] || ""));
    }
    if (cells.length >= 2) {
      const key = cells[0];
      const value = cells.slice(1).join(" ").trim();
      if (key && value && key.length <= 80 && value.length <= 800) {
        if (!out[key]) out[key] = value;
      }
    }
  }
  return out;
}

function extractColonKeyValues(text: string) {
  const out: Record<string, string> = {};
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx <= 1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key || !value) continue;
    if (key.length > 80 || value.length > 800) continue;
    if (!out[key]) out[key] = value;
  }
  return out;
}

export async function scrapeUrlForVitrine(url: string) {
  const inputUrl = String(url || "").trim();
  if (!/^https?:\/\//i.test(inputUrl)) {
    return { url: inputUrl, title: "", description: "", text: "", specs: {}, images: [] as string[] };
  }

  const response = await fetch(inputUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      pragma: "no-cache",
      "cache-control": "no-cache",
    },
  });

  if (!response.ok) {
    return { url: inputUrl, title: "", description: "", text: "", specs: {}, images: [] as string[] };
  }

  const html = await response.text();
  const text = stripHtmlToText(html);

  const jsonLdBlocks = extractJsonLdBlocks(html);
  const productJson = findProductJsonLd(jsonLdBlocks);

  let title = extractMeta(html, "og:title", "property") || "";
  if (!title) title = extractMeta(html, "twitter:title", "name") || "";
  if (!title) {
    const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
    title = titleTag.replace(/\s+/g, " ").trim();
  }

  let description = extractMeta(html, "og:description", "property") || "";
  if (!description) description = extractMeta(html, "description", "name") || "";

  const images: string[] = [];
  const ogImage = extractMeta(html, "og:image", "property");
  if (ogImage) images.push(ogImage);
  const twImage = extractMeta(html, "twitter:image", "name");
  if (twImage && !images.includes(twImage)) images.push(twImage);

  if (productJson) {
    if (!title && typeof productJson.name === "string") title = String(productJson.name).trim();
    if (!description && typeof productJson.description === "string") description = String(productJson.description).trim();
    const img = productJson.image;
    const imgs = Array.isArray(img) ? img : img ? [img] : [];
    for (const i of imgs) {
      const u = String(i || "").trim();
      if (u && !images.includes(u)) images.push(u);
    }
  }

  const tableSpecs = extractTableKeyValues(html);
  const colonSpecs = extractColonKeyValues(text);
  const specs = { ...tableSpecs, ...colonSpecs };

  return { url: inputUrl, title, description, text, specs, images };
}

