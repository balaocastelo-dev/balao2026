export type LlamaChatJsonResult<T> = {
  ok: boolean;
  data: T | null;
  rawText: string | null;
  error: string | null;
};

export async function llamaChatJson<T>(params: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}): Promise<LlamaChatJsonResult<T>> {
  const url = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = params.model || process.env.LLAMA_MODEL;

  if (!url || !model) {
    return { ok: false, data: null, rawText: null, error: 'LLAMA_API_URL/LLAMA_MODEL ausentes' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(3000, params.timeoutMs ?? 20000));

  try {
    const res = await fetch(url.replace(/\/+$/, '') + '/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model,
        temperature: params.temperature ?? 0.2,
        messages: [
          { role: 'system', content: params.system },
          { role: 'user', content: params.user }
        ]
      })
    });

    if (!res.ok) {
      return { ok: false, data: null, rawText: null, error: `HTTP ${res.status}` };
    }

    const json: any = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    const text = typeof content === 'string' ? content.trim() : '';
    if (!text) return { ok: false, data: null, rawText: null, error: 'Resposta vazia' };

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const raw = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const data = JSON.parse(raw) as T;
    return { ok: true, data, rawText: text, error: null };
  } catch (e: any) {
    return { ok: false, data: null, rawText: null, error: e?.message || 'Erro' };
  } finally {
    clearTimeout(timeout);
  }
}
