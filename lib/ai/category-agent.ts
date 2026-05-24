import { normalizeText } from '@/lib/searchUtils';

export type CategoryMatchResult = {
  category: string | null;
  confidence: number;
  reason: string;
};

export type CategoryAgentContext = {
  kabumBreadcrumbs?: string[];
  extraText?: string;
};

function safeJsonParse(input: string): any | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
}

function scoreCategory(nameTokens: Set<string>, categoryName: string): number {
  const catTokens = new Set(tokenize(categoryName));
  if (catTokens.size === 0) return 0;
  let hit = 0;
  for (const t of nameTokens) if (catTokens.has(t)) hit++;
  return hit / catTokens.size;
}

function buildCombinedText(productName: string, ctx?: CategoryAgentContext): string {
  const parts = [productName];
  if (ctx?.kabumBreadcrumbs && ctx.kabumBreadcrumbs.length > 0) {
    parts.push(ctx.kabumBreadcrumbs.join(' '));
  }
  if (ctx?.extraText) parts.push(ctx.extraText);
  return parts.filter(Boolean).join(' ');
}

function pickByKeywords(productName: string, categories: string[], ctx?: CategoryAgentContext): CategoryMatchResult {
  const combined = buildCombinedText(productName, ctx);
  const name = normalizeText(combined);
  const nameTokens = new Set(tokenize(combined));

  const keywordGroups: Array<{ patterns: RegExp[]; hints: string[] }> = [
    { patterns: [/\bfonte\b/, /\bpsu\b/], hints: ['fonte', 'energia'] },
    { patterns: [/\bgabinete\b/, /\bcase\b/], hints: ['gabinete'] },
    { patterns: [/\bssd\b/, /\bnvme\b/], hints: ['ssd', 'armazenamento'] },
    { patterns: [/\bhd\b/, /\bhdd\b/], hints: ['hd', 'armazenamento'] },
    { patterns: [/\bplaca\s+de\s+video\b/, /\brtx\b/, /\bgtx\b/, /\bradeon\b/], hints: ['placa de video', 'gpu'] },
    { patterns: [/\bmemoria\b/, /\bram\b/, /\bddr\d\b/], hints: ['memoria', 'ram'] },
    { patterns: [/\bprocessador\b/, /\bintel\b/, /\bamd\b/, /\bryzen\b/, /\bcore\s+i[3579]\b/], hints: ['processador', 'cpu'] },
    { patterns: [/\bplaca\s+mae\b/, /\bmotherboard\b/], hints: ['placa mae'] },
    { patterns: [/\bmonitor\b/], hints: ['monitor'] },
    { patterns: [/\bnotebook\b/, /\blaptop\b/], hints: ['notebook'] },
    { patterns: [/\bmouse\b/, /\bteclado\b/, /\bheadset\b/], hints: ['perifericos', 'acessorios'] }
  ];

  const normalizedCategories = categories.map(c => ({ raw: c, norm: normalizeText(c) }));

  for (const group of keywordGroups) {
    if (!group.patterns.some(p => p.test(name))) continue;

    const direct = normalizedCategories.find(c => group.hints.some(h => c.norm.includes(normalizeText(h))));
    if (direct) return { category: direct.raw, confidence: 0.8, reason: 'Fallback por palavra-chave' };
  }

  let best: { cat: string; score: number } | null = null;
  for (const c of categories) {
    const s = scoreCategory(nameTokens, c);
    if (!best || s > best.score) best = { cat: c, score: s };
  }

  if (best && best.score >= 0.2) {
    return { category: best.cat, confidence: Math.min(0.7, Math.max(0.2, best.score)), reason: 'Fallback por similaridade' };
  }

  const fallback = normalizedCategories.find(c => c.norm.includes('hardware'));
  if (fallback) return { category: fallback.raw, confidence: 0.2, reason: 'Fallback padrão' };

  return { category: categories[0] || null, confidence: 0.1, reason: 'Fallback padrão' };
}

function pickCandidateCategories(productName: string, categories: string[], ctx?: CategoryAgentContext): string[] {
  const combined = buildCombinedText(productName, ctx);
  const tokens = new Set(tokenize(combined));

  const scored = categories
    .map(c => ({ c, score: scoreCategory(tokens, c) }))
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 30).map(s => s.c);

  const normalized = categories.map(c => ({ raw: c, norm: normalizeText(c) }));
  const ensure = (needle: string) => {
    const found = normalized.find(n => n.norm.includes(normalizeText(needle)));
    if (found && !top.includes(found.raw)) top.push(found.raw);
  };
  ensure('hardware');

  return Array.from(new Set(top));
}

async function callOpenAICompatibleChat(params: {
  url: string;
  apiKey?: string;
  model: string;
  prompt: string;
}): Promise<CategoryMatchResult | null> {
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
              'Você é um classificador. Responda APENAS com JSON puro no formato {"category":"...","confidence":0.0,"reason":"..."} e category deve ser exatamente uma das opções fornecidas.'
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
    const parsed = safeJsonParse(raw);
    if (!parsed) return null;

    const category = typeof parsed.category === 'string' ? parsed.category : null;
    const confidence = Number(parsed.confidence);
    const reason = typeof parsed.reason === 'string' ? parsed.reason : 'Sem motivo';
    if (!category || !Number.isFinite(confidence)) return null;
    return { category, confidence: Math.max(0, Math.min(1, confidence)), reason };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function categorizeProductName(
  productName: string,
  categories: string[],
  ctx?: CategoryAgentContext
): Promise<CategoryMatchResult> {
  const cleanCategories = (categories || []).map(c => String(c || '').trim()).filter(Boolean);
  if (!productName || cleanCategories.length === 0) {
    return { category: null, confidence: 0, reason: 'Sem dados' };
  }

  const url = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = process.env.LLAMA_MODEL;

  if (url && model) {
    const candidateCategories = pickCandidateCategories(productName, cleanCategories, ctx);
    const prompt = [
      'Escolha a melhor categoria para o produto, usando apenas uma das opções abaixo.',
      '',
      `Produto: ${productName}`,
      ctx?.kabumBreadcrumbs && ctx.kabumBreadcrumbs.length > 0
        ? `Breadcrumbs Kabum: ${ctx.kabumBreadcrumbs.join(' > ')}`
        : '',
      '',
      'Categorias:',
      ...candidateCategories.map(c => `- ${c}`)
    ].join('\n');

    const result = await callOpenAICompatibleChat({ url, apiKey: apiKey || undefined, model, prompt });
    if (result?.category && cleanCategories.includes(result.category)) return result;
  }

  return pickByKeywords(productName, cleanCategories, ctx);
}
