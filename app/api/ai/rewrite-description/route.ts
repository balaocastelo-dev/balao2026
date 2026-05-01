import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RewriteBody = {
  productName?: string;
  rawText?: string;
  specs?: Record<string, unknown>;
};

const escapeMarkdown = (input: string) =>
  input
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");

const buildFallbackMarkdown = (productName: string, rawText: string, specs?: Record<string, unknown>) => {
  const title = productName?.trim() || "Produto";
  const cleaned = (rawText || "").replace(/\r/g, "").trim();

  const specEntries = specs ? Object.entries(specs).filter(([k, v]) => k && v != null && String(v).trim() !== "") : [];
  const specsMd =
    specEntries.length > 0
      ? specEntries
          .slice(0, 25)
          .map(([k, v]) => `- **${escapeMarkdown(String(k).trim())}**: ${escapeMarkdown(String(v).trim())}`)
          .join("\n")
      : "- **Categoria**: Informática";

  return `# ${escapeMarkdown(title)}\n\n\n## 🔥 Destaques\n- ✅ **Pronto para gamer e corporativo**\n- ⚡ **Desempenho e confiabilidade**\n- 🛡️ **Suporte Balão.info**\n\n\n## 🧩 Especificações\n${specsMd}\n\n\n## 📝 Descrição do produto\n${escapeMarkdown(cleaned)}`;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RewriteBody;
    const productName = String(body.productName || "").trim();
    const rawText = String(body.rawText || "").trim();
    const specs = body.specs && typeof body.specs === "object" ? (body.specs as Record<string, unknown>) : undefined;

    if (!productName && !rawText) {
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
    }

    const token = process.env.NEXT_PUBLIC_AI_TOKEN || process.env.AI_TOKEN || process.env.HF_TOKEN || "";
    const model = "mistralai/Mistral-7B-Instruct-v0.2";

    if (!token) {
      return NextResponse.json({
        markdown: buildFallbackMarkdown(productName || "Produto", rawText, specs),
        source: "heuristic",
      });
    }

    const prompt = `
Você é um especialista em copywriting para e-commerce de informática do site balao.info.

Tarefa:
- Transformar o texto bruto em um anúncio de vendas matador, profissional e empolgante (gamer e corporativo).
- Transformar características em benefícios (ex.: "16GB RAM" vira "16GB RAM: Performance multitarefa sem travamentos").
- Manter TODOS os dados originais (não invente specs).
- Use emojis sempre que fizer sentido (sem exagero).

Regras de saída (OBRIGATÓRIO):
- Retorne SOMENTE Markdown.
- Estrutura:
  # Título (H1)
  (pule 3 linhas)
  ## 🔥 Destaques (bullets)
  (pule 3 linhas)
  ## 🧩 Especificações (bullets, cada item em **chave**: valor + benefício)
  (pule 3 linhas)
  ## 📝 Descrição do produto (parágrafos curtos)
- Use **negrito** para componentes-chave (CPU, GPU, RAM, SSD, fonte, placa-mãe, etc).

Produto: ${productName}

Specs (JSON):
${JSON.stringify(specs || {}, null, 2)}

Texto bruto:
${rawText}
`.trim();

    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 900,
          temperature: 0.6,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    const data = await hfRes.json().catch(() => null);
    if (!hfRes.ok) {
      return NextResponse.json({
        markdown: buildFallbackMarkdown(productName || "Produto", rawText, specs),
        source: "heuristic",
      });
    }

    const generated =
      (Array.isArray(data) && typeof data?.[0]?.generated_text === "string" && data[0].generated_text) ||
      (typeof (data as any)?.generated_text === "string" && (data as any).generated_text) ||
      "";

    const markdown = String(generated || "").trim() || buildFallbackMarkdown(productName || "Produto", rawText, specs);
    return NextResponse.json({ markdown, source: "huggingface" });
  } catch (e: any) {
    return NextResponse.json({ markdown: "", error: e?.message || "Erro ao reescrever" }, { status: 500 });
  }
}

