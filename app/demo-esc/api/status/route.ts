import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import exemplo from "@/demo-esc/status.json";
import { normalizarFeed } from "@/demo-esc/feed";
import type { FeedStatus } from "@/demo-esc/tipos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let memoria: FeedStatus | null = null;
let cacheRemoto: { ate: number; feed: FeedStatus } | null = null;

const VAZIO: FeedStatus = {
  updatedAt: "2020-01-01T00:00:00.000Z",
  agents: [],
  events: [],
};

function tokenConfere(recebido: string, esperado: string) {
  const digestoRecebido = createHash("sha256").update(recebido).digest();
  const digestoEsperado = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(digestoRecebido, digestoEsperado);
}

function autorizado(req: NextRequest) {
  const esperado = process.env.DEMO_ESC_TOKEN;
  if (!esperado) return false;
  const cabecalho = req.headers.get("authorization") ?? "";
  const [esquema, token] = cabecalho.split(" ");
  if (esquema?.toLowerCase() !== "bearer" || !token) return false;
  return tokenConfere(token, esperado);
}

function responder(feed: FeedStatus, fonte: string) {
  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "no-store",
      "X-Demo-Esc-Fonte": fonte,
    },
  });
}

async function feedDaUrl() {
  const url = process.env.DEMO_ESC_STATUS_URL;
  if (!url) return null;
  const agora = Date.now();
  if (cacheRemoto && cacheRemoto.ate > agora) return cacheRemoto.feed;
  try {
    const resposta = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!resposta.ok) return null;
    const feed = normalizarFeed(await resposta.json());
    if (!feed) return null;
    cacheRemoto = { ate: agora + 8000, feed };
    return feed;
  } catch {
    return null;
  }
}

function feedDoArquivo() {
  return normalizarFeed(exemplo) ?? VAZIO;
}

export async function GET() {
  if (memoria) return responder(memoria, "memoria");
  const remoto = await feedDaUrl();
  if (remoto) return responder(remoto, "url");
  return responder(feedDoArquivo(), "arquivo");
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  if (corpo && typeof corpo === "object" && (corpo as { limpar?: unknown }).limpar === true) {
    memoria = null;
    cacheRemoto = null;
    return NextResponse.json({ ok: true });
  }
  const carimbo =
    corpo &&
    typeof corpo === "object" &&
    typeof (corpo as { updatedAt?: unknown }).updatedAt === "string"
      ? undefined
      : new Date().toISOString();
  const feed = normalizarFeed(corpo, carimbo);
  if (!feed) {
    return NextResponse.json({ erro: "Formato inválido" }, { status: 400 });
  }
  memoria = feed;
  return NextResponse.json({ ok: true });
}
