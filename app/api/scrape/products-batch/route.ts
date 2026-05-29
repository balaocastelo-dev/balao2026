import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isKabumUrl(url: string) {
  return typeof url === "string" && url.includes("kabum.com.br");
}

function extractKabumProductId(url: string) {
  const m = url.match(/\/produto\/(\d+)\//);
  return m?.[1] || null;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

type ScrapeResult = {
  url: string;
  success: boolean;
  productId?: string;
  images: string[];
  error?: string;
};

function buildCandidateList(html: string, productId: string) {
  const rawMatches =
    html.match(new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+`, "g")) || [];

  const normalized = Array.from(
    new Set(
      rawMatches
        .map((u) => u.replace(/&amp;/g, "&").trim())
        .map((u) => u.split("#")[0])
        .map((u) => u.split("?")[0])
        .filter((u) => u.toLowerCase().endsWith(".jpg") || u.toLowerCase().endsWith("/original.jpg"))
    )
  );

  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (u: string) => {
    if (!u) return;
    if (seen.has(u)) return;
    seen.add(u);
    candidates.push(u);
  };

  for (const u of normalized) {
    const lower = u.toLowerCase();
    if (lower.endsWith("/original.jpg")) {
      push(u);
      continue;
    }

    const lastSlash = u.lastIndexOf("/");
    if (lastSlash === -1) continue;

    const dir = u.slice(0, lastSlash);
    const file = u.slice(lastSlash + 1);
    const fileNoExt = file.replace(/\.jpg$/i, "");
    const baseName = fileNoExt.replace(/_(m|p|peq|g)$/i, "");
    const candidateOriginal = `${dir}/${baseName}/original.jpg`;
    const fallbackHigh = u.replace(/_(m|p|peq)\.jpg$/i, "_g.jpg");

    push(candidateOriginal);
    push(u);
    push(fallbackHigh);
  }

  return candidates;
}

function createLimiter(concurrency: number) {
  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    activeCount -= 1;
    const fn = queue.shift();
    if (fn) fn();
  };

  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    if (activeCount >= concurrency) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    activeCount += 1;
    try {
      return await fn();
    } finally {
      next();
    }
  };

  return run;
}

async function pickExisting(
  candidates: string[],
  options: {
    limit: number;
    exists: (url: string) => Promise<boolean>;
    concurrency: number;
  }
) {
  const { limit, exists, concurrency } = options;
  const uniqueCandidates = candidates.filter((u, idx) => candidates.indexOf(u) === idx);
  const found: string[] = [];

  let idx = 0;
  const inFlight = new Set<Promise<void>>();

  const schedule = () => {
    while (inFlight.size < concurrency && idx < uniqueCandidates.length && found.length < limit) {
      const candidate = uniqueCandidates[idx];
      idx += 1;

      let task: Promise<void>;
      task = (async () => {
        if (found.length >= limit) return;
        const ok = await exists(candidate);
        if (ok) found.push(candidate);
      })().finally(() => {
        inFlight.delete(task);
      });

      inFlight.add(task);
    }
  };

  schedule();

  while (inFlight.size > 0) {
    await Promise.race(inFlight);
    schedule();
  }

  return found.slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const urls = Array.isArray(body.urls) ? (body.urls as string[]) : [];

    if (urls.length === 0) {
      return NextResponse.json({ success: false, error: "Informe urls[]" }, { status: 400 });
    }

    const concurrency = Number.isFinite(body.concurrency) ? Number(body.concurrency) : 10;
    const headConcurrency = Number.isFinite(body.headConcurrency) ? Number(body.headConcurrency) : 20;
    const imageLimit = Number.isFinite(body.imageLimit) ? Number(body.imageLimit) : 6;

    const safeConcurrency = Math.max(1, Math.min(30, concurrency));
    const safeHeadConcurrency = Math.max(1, Math.min(60, headConcurrency));
    const safeImageLimit = Math.max(1, Math.min(12, imageLimit));

    const existsCache = new Map<string, Promise<boolean>>();

    const exists = async (candidateUrl: string): Promise<boolean> => {
      if (!candidateUrl) return false;
      const cached = existsCache.get(candidateUrl);
      if (cached) return cached;

      const p = (async () => {
        try {
          const head = await fetchWithTimeout(candidateUrl, { method: "HEAD" }, 6000);
          if (head.ok) return true;

          if (head.status === 405 || head.status === 403) {
            const partialGet = await fetchWithTimeout(
              candidateUrl,
              { method: "GET", headers: { Range: "bytes=0-0" } },
              7000
            );
            return partialGet.ok;
          }

          return false;
        } catch {
          return false;
        }
      })();

      existsCache.set(candidateUrl, p);
      return p;
    };

    const run = createLimiter(safeConcurrency);
    const runHead = createLimiter(safeHeadConcurrency);

    const results = await Promise.all(
      urls.map((url) =>
        run(async (): Promise<ScrapeResult> => {
          if (!isKabumUrl(url)) {
            return { url, success: false, images: [], error: "URL inválida ou não suportada (Kabum)" };
          }

          const productId = extractKabumProductId(url);
          if (!productId) {
            return { url, success: true, images: [], productId };
          }

          try {
            const response = await fetchWithTimeout(
              url,
              {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
              },
              10000
            );

            if (!response.ok) {
              return { url, success: false, images: [], productId, error: `HTTP ${response.status}` };
            }

            const html = await response.text();
            const candidates = buildCandidateList(html, productId);

            const images = await pickExisting(candidates, {
              limit: safeImageLimit,
              concurrency: Math.min(12, safeHeadConcurrency),
              exists: (candidate) => runHead(() => exists(candidate)),
            });

            return { url, success: true, images, productId };
          } catch (e: any) {
            return { url, success: false, images: [], productId, error: e?.message || "Erro ao extrair imagens" };
          }
        })
      )
    );

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Erro interno" }, { status: 500 });
  }
}
