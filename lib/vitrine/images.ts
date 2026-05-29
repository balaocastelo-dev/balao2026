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

async function generateImageUrlFromReplicate(prompt: string) {
  const token = getReplicateToken();
  if (!token) throw new Error("REPLICATE_API_TOKEN não configurado.");

  const model = getReplicateModel();
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
      input: { prompt },
    }),
  });

  if (!res.ok) throw new Error("Falha ao gerar imagem (Replicate).");
  const pred: any = await res.json().catch(() => null);
  const output = pred?.output;
  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
        ? String(output[0] || "")
        : output?.url
          ? String(output.url)
          : "";
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

  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucket)) {
    await admin.storage.createBucket(bucket, { public: true });
  }

  const { error: uploadError } = await admin.storage.from(bucket).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  const publicUrl = data?.publicUrl || "";
  if (!publicUrl) throw new Error("Falha ao obter URL pública.");
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

export async function generateAndUploadVitrineImages(input: {
  page: VitrinePageRecord;
  keys?: string[];
}) {
  const prompts = buildVitrineImagePrompts(input.page);
  const keys = (input.keys && input.keys.length > 0 ? input.keys : Object.keys(prompts)).filter((k) => prompts[k]);

  const images: Record<string, string> = {};
  const usedPrompts: Record<string, string> = {};

  for (const key of keys) {
    const prompt = prompts[key];
    usedPrompts[key] = prompt;

    const generatedUrl = await generateImageUrlFromReplicate(prompt);
    const { buf, contentType } = await downloadToBuffer(generatedUrl);
    const filePath = `vitrine/${input.page.id}/${key}.png`;
    const publicUrl = await uploadToSupabaseStorage(filePath, buf, contentType);
    images[key] = publicUrl;
  }

  return { images, image_prompts: usedPrompts };
}

