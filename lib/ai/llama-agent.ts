import { normalizeText } from '@/lib/searchUtils';

export type LlamaMatchResult = {
  confidence: number;
  sameProduct: boolean;
  reason: string;
};

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function extractNumbers(text: string): Set<string> {
  const m = normalizeText(text).match(/\b\d{2,}\b/g);
  return new Set(m || []);
}

export function fallbackCompareProducts(balaoName: string, kabumTitle: string): LlamaMatchResult {
  const balaoTokens = new Set(tokenize(balaoName));
  const kabumTokens = new Set(tokenize(kabumTitle));

  const base = jaccard(balaoTokens, kabumTokens);

  const balaoNums = extractNumbers(balaoName);
  const kabumNums = extractNumbers(kabumTitle);
  const numsScore = jaccard(balaoNums, kabumNums);

  const confidence = Math.max(0, Math.min(1, base * 0.7 + numsScore * 0.3));
  const sameProduct = confidence >= 0.75;

  const reason = sameProduct
    ? `Fallback textual: similaridade ${(confidence * 100).toFixed(0)}%`
    : `Fallback textual: baixa similaridade (${(confidence * 100).toFixed(0)}%)`;

  return { confidence, sameProduct, reason };
}

async function callOpenAICompatibleChat(params: {
  url: string;
  apiKey?: string;
  model: string;
  prompt: string;
}): Promise<LlamaMatchResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(params.url.replace(/\/+$/, '') + '/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(params.apiKey ? { authorization: `Bearer ${params.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: params.model,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'Você é um validador. Responda APENAS com JSON puro no formato {"confidence":0.0,"sameProduct":false,"reason":"..."}'
          },
          { role: 'user', content: params.prompt }
        ]
      })
    });

    if (!res.ok) return null;

    const json: any = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return null;

    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    const raw = content.slice(start, end + 1);

    const parsed = JSON.parse(raw);
    const confidence = Number(parsed?.confidence);
    const sameProduct = Boolean(parsed?.sameProduct);
    const reason = typeof parsed?.reason === 'string' ? parsed.reason : 'Sem motivo';

    if (!Number.isFinite(confidence)) return null;
    return {
      confidence: Math.max(0, Math.min(1, confidence)),
      sameProduct,
      reason
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateKabumMatch(balaoName: string, kabumTitle: string): Promise<LlamaMatchResult> {
  const url = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = process.env.LLAMA_MODEL;

  if (url && model) {
    const prompt = [
      'Compare os dois textos e diga se parece ser o mesmo produto.',
      'Critérios:',
      '- Considere modelo, marca, capacidade, números (ex: 4060, 1TB), e sufixos',
      '- Se faltar informação, reduza confidence',
      '',
      `Produto Balão: ${balaoName}`,
      `Título Kabum: ${kabumTitle}`
    ].join('\n');

    const result = await callOpenAICompatibleChat({ url, apiKey: apiKey || undefined, model, prompt });
    if (result) return result;
  }

  return fallbackCompareProducts(balaoName, kabumTitle);
}

