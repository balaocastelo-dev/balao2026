import { createClient } from "@supabase/supabase-js";
import { VitrinePageRecord } from "./types";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase admin não configurado para upload de imagens.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function getReplicateToken() {
  return process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN || "";
}

function getReplicateModel() {
  return process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";
}

function getReplicatePromptKey() {
  return process.env.REPLICATE_IMAGE_PROMPT_KEY || "prompt";
}

export function getVitrineImageGenerationDiagnostics() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";
  const replicateToken = getReplicateToken();

  return {
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasSupabaseServiceRoleKey: Boolean(serviceKey),
    hasReplicateToken: Boolean(replicateToken),
    replicateModel: getReplicateModel(),
    replicatePromptKey: getReplicatePromptKey(),
    usesReplicateVersionOverride: Boolean(process.env.REPLICATE_IMAGE_VERSION),
  };
}

let replicateVersionCache: Record<string, string> | null = null;

async function getReplicateLatestVersionId(model: string) {
  if (replicateVersionCache && replicateVersionCache[model]) return replicateVersionCache[model];

  const token = getReplicateToken();
  if (!token) throw new Error("REPLICATE_API_TOKEN não configurado.");

  const [owner, name] = model.split("/");
  if (!owner || !name) throw new Error("REPLICATE_IMAGE_MODEL inválido.");

  const res = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Falha ao acessar modelo de imagem.");
  const data: any = await res.json().catch(() => null);
  const versionId = String(data?.latest_version?.id || data?.latest_version?.version || "").trim();
  if (!versionId) throw new Error("Modelo não retornou latest_version.id.");

  replicateVersionCache = replicateVersionCache || {};
  replicateVersionCache[model] = versionId;
  return versionId;
}

function pickOutputUrl(pred: any) {
  const output = pred?.output;
  if (typeof output === "string" && output.trim()) return output.trim();
  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      const u = String((first as any).url || (first as any).href || "").trim();
      if (u) return u;
    }
  }
  if (output && typeof output === "object") {
    const u = String((output as any).url || (output as any).href || "").trim();
    if (u) return u;
  }
  const u = String(pred?.urls?.get || "").trim();
  if (u) return u;
  return "";
}

async function createPredictionViaModelsEndpoint(model: string, prompt: string) {
  const token = getReplicateToken();
  if (!token) throw new Error("REPLICATE_API_TOKEN não configurado.");

  const [owner, name] = model.split("/");
  if (!owner || !name) throw new Error("REPLICATE_IMAGE_MODEL inválido.");

  const res = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      input: { [getReplicatePromptKey()]: prompt },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Falha ao criar prediction (models endpoint).");
  }
  const pred: any = await res.json().catch(() => null);
  if (!pred) throw new Error("Resposta inválida do Replicate.");
  if (pred?.status && pred.status !== "succeeded" && pred.status !== "successful") {
    const err = String(pred?.error || "").trim();
    throw new Error(err || `Prediction não concluída: ${pred.status}`);
  }
  return pred;
}

async function generateImageUrlFromReplicate(prompt: string) {
  const token = getReplicateToken();
  if (!token) throw new Error("REPLICATE_API_TOKEN não configurado.");

  const model = getReplicateModel();

  try {
    const pred = await createPredictionViaModelsEndpoint(model, prompt);
    const url = pickOutputUrl(pred);
    if (url) return url;
  } catch {}

  const versionId = process.env.REPLICATE_IMAGE_VERSION || (await getReplicateLatestVersionId(model));
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      version: versionId,
      input: { [getReplicatePromptKey()]: prompt },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Falha ao gerar imagem (Replicate).");
  }
  const pred: any = await res.json().catch(() => null);
  if (!pred) throw new Error("Resposta inválida do Replicate.");
  if (pred?.status && pred.status !== "succeeded" && pred.status !== "successful") {
    const err = String(pred?.error || "").trim();
    throw new Error(err || `Prediction não concluída: ${pred.status}`);
  }
  const url = pickOutputUrl(pred);
  if (!url) throw new Error("Replicate não retornou URL de imagem.");
  return url;
}

async function downloadToBuffer(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao baixar imagem gerada.");
  const contentType = res.headers.get("content-type") || "image/png";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType };
}

async function uploadToSupabaseStorage(path: string, buf: Buffer, contentType: string) {
  const admin = getSupabaseAdminClient();
  const bucket = "vitrine";

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = Boolean(buckets?.some((b: any) => b.name === bucket));
    if (!exists) {
      await admin.storage.createBucket(bucket, { public: true });
    }

    await admin.storage.updateBucket(bucket, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });
  } catch {}

  const { error: uploadError } = await admin.storage.from(bucket).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || "";
  if (!publicUrl) throw new Error("Falha ao obter URL pública.");

  try {
    const head = await fetch(publicUrl, { method: "HEAD", cache: "no-store" });
    if (!head.ok) throw new Error("not-public");
  } catch {
    await admin.storage.updateBucket(bucket, { public: true }).catch(() => null);
  }

  return publicUrl;
}

function baseStylePrompt() {
  return [
    "foto de produto premium",
    "estúdio, fundo clean claro",
    "iluminação suave realista",
    "alta definição",
    "sem texto",
    "sem logo",
    "sem marcas registradas visíveis",
    "sem watermark",
  ].join(", ");
}

export function buildVitrineImagePrompts(page: VitrinePageRecord) {
  const extras = page.extras || {};
  const category = page.categoria || "PC Gamer";
  const prompts: Record<string, string> = {};

  prompts.hero = `Computador ${category} premium, gabinete moderno, render fotorrealista, ${baseStylePrompt()}`;

  const cpu = page.processador || "";
  prompts.cpu = cpu
    ? `Processador de computador (${cpu}), close-up fotorrealista, ${baseStylePrompt()}`
    : `Processador de computador moderno, close-up fotorrealista, ${baseStylePrompt()}`;

  const gpu = page.placa_video || "";
  prompts.gpu = gpu
    ? `Placa de vídeo de computador (${gpu}), fotorrealista, ${baseStylePrompt()}`
    : `Placa de vídeo de computador premium, fotorrealista, ${baseStylePrompt()}`;

  const ram = page.memoria_ram || "";
  prompts.ram = ram
    ? `Memória RAM de computador (${ram}), fotorrealista, ${baseStylePrompt()}`
    : `Memória RAM de computador, fotorrealista, ${baseStylePrompt()}`;

  const storage = page.armazenamento || "";
  prompts.storage = storage
    ? `SSD NVMe de computador (${storage}), fotorrealista, ${baseStylePrompt()}`
    : `SSD NVMe de computador, fotorrealista, ${baseStylePrompt()}`;

  const cooling = page.resfriamento || "";
  prompts.cooling = cooling
    ? `Sistema de resfriamento para PC (${cooling}), fotorrealista, ${baseStylePrompt()}`
    : `Sistema de resfriamento para PC, fotorrealista, ${baseStylePrompt()}`;

  if (extras.gabinete) {
    prompts.case = `Gabinete de PC (${extras.gabinete}), fotorrealista, ${baseStylePrompt()}`;
  }
  if (extras.placa_mae) {
    prompts.motherboard = `Placa-mãe de computador (${extras.placa_mae}), fotorrealista, ${baseStylePrompt()}`;
  }
  if (extras.fonte) {
    prompts.psu = `Fonte ATX de computador (${extras.fonte}), fotorrealista, ${baseStylePrompt()}`;
  }

  return prompts;
}

function parseRetryAfterSeconds(message: string) {
  const m = String(message || "").match(/"retry_after"\s*:\s*(\d+)/i);
  const n = m?.[1] ? Number(m[1]) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function sleepMs(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function generateAndUploadVitrineImages(input: {
  page: VitrinePageRecord;
  keys?: string[];
}) {
  const prompts = buildVitrineImagePrompts(input.page);
  const keys = (input.keys && input.keys.length > 0 ? input.keys : Object.keys(prompts)).filter((k) => prompts[k]);

  const images: Record<string, string> = {};
  const usedPrompts: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const key of keys) {
    const prompt = prompts[key];
    usedPrompts[key] = prompt;
    try {
      let generatedUrl = "";
      let lastErr = "";
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          generatedUrl = await generateImageUrlFromReplicate(prompt);
          break;
        } catch (e: any) {
          lastErr = String(e?.message || "Falha ao gerar imagem");
          const retryAfter = parseRetryAfterSeconds(lastErr);
          if (retryAfter > 0 && attempt < 3) {
            await sleepMs((retryAfter + 1) * 1000);
            continue;
          }
          throw e;
        }
      }
      if (!generatedUrl) throw new Error(lastErr || "Falha ao gerar imagem");
      const { buf, contentType } = await downloadToBuffer(generatedUrl);
      const filePath = `vitrine/${input.page.id}/${key}.png`;
      const publicUrl = await uploadToSupabaseStorage(filePath, buf, contentType);
      images[key] = publicUrl;
    } catch (e: any) {
      errors[key] = String(e?.message || "Falha ao gerar/upload");
    }
  }

  return { images, image_prompts: usedPrompts, errors };
}
