// ============================================================
// De onde veio o lead do WhatsApp (pedido do Thiago em 25/10).
//
// Toda mensagem que o site abre no WhatsApp da loja ganha, no fim, uma
// linha como "(vim pelo site: Vitrine)". A equipe vê na hora de onde o
// cliente veio, e o clique entra no painel com a mesma origem
// (lib/painel-metrics.ts agrupa por `source`).
//
// Onde é aplicado:
//   - todo link <a href="https://wa.me/..."> do site, pelo rastreador global
//     (components/GlobalConversionTracker.tsx), sem mexer em cada página;
//   - os botões que abrem o WhatsApp por código usam comOrigemDaPagina().
// Uma página pode escolher a própria origem com data-whatsapp-origem="...".
// Regras puras, testadas em __tests__/lib/whatsapp-origem.test.ts.
// ============================================================

export const MARCA_DA_ORIGEM = "(vim pelo site:";

const ORIGENS: [RegExp, string][] = [
  [/^\/$/, "Página inicial"],
  [/^\/(vitrine|p)(\/|$)/, "Vitrine"],
  [/^\/queda-de-preco/, "Queda de preço"],
  [/^\/product\//, "Página de produto"],
  [/^\/(categoria|departamentos)(\/|$)/, "Catálogo"],
  [/^\/cart(\/|$)/, "Carrinho"],
  [/^\/(telaiphone|reparoapple|wendell)(\/|$)/, "Assistência Apple"],
  [/^\/recuperacaodados/, "Recuperação de dados"],
  [/^\/(manutencao|urgente|especialidades)(\/|$)/, "Assistência técnica"],
  [/^\/assistenciagames/, "Assistência de games"],
  [/^\/(montagempc|monteseupc|pcgamer3d)(\/|$)/, "Montagem de PC"],
  [/^\/pcgamer(\/|$)/, "PC Gamer"],
  [/^\/notebooks/, "Notebooks"],
  [/^\/(seminovos|consignacao)(\/|$)/, "Seminovos e consignação"],
  [/^\/servicos-e-ofertas/, "Serviços e ofertas"],
  [/^\/promocao/, "Promoções"],
  [/^\/premium/, "Premium"],
  [/^\/ia-local/, "IA local"],
  [/^\/tonner/, "Toners"],
  [/^\/(carregadores|microsoft)(\/|$)/, "Acessórios e licenças"],
  [/^\/(sistemas|sistemasdeia|overclock|software)(\/|$)/, "Sites e sistemas"],
  [/^\/blog/, "Blog"],
  [/^\/(regiao|bairro)(\/|$)/, "Atendimento regional"],
  [/^\/(fale-conosco|sobre-nos|sobre-a-empresa|como-comprar)(\/|$)/, "Institucional"],
];

/** Nome da origem para a página: "/product/x" → "Página de produto". */
export function origemDaPagina(caminho: string | null | undefined): string {
  const c = String(caminho || "/").split(/[?#]/)[0] || "/";
  for (const [re, nome] of ORIGENS) if (re.test(c)) return nome;
  const primeiro = c.split("/").filter(Boolean)[0] || "";
  if (!primeiro) return "Site";
  const legivel = primeiro.replace(/[-_]+/g, " ").trim();
  return legivel.charAt(0).toUpperCase() + legivel.slice(1);
}

export function ehLinkDoWhatsApp(href: string): boolean {
  return /^(https?:\/\/)?(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href) || /^whatsapp:\/\//i.test(href);
}

/**
 * Acrescenta "(vim pelo site: <origem>)" ao texto do link do WhatsApp.
 * Link sem número (compartilhar com amigo) e link que já tem a origem ficam
 * como estão. Mantém o "+" e os acentos codificados do jeito que o WhatsApp lê.
 */
export function comOrigem(href: string, origem: string): string {
  if (!href || !ehLinkDoWhatsApp(href) || !origem) return href;
  let url: URL;
  try {
    url = new URL(href.startsWith("whatsapp://") ? href.replace("whatsapp://", "https://api.whatsapp.com/") : href);
  } catch {
    return href;
  }
  const temNumero = /^\/\d{10,15}\/?$/.test(url.pathname) || /^\d{10,15}$/.test(url.searchParams.get("phone") || "");
  if (!temNumero) return href;

  const texto = url.searchParams.get("text") || "";
  if (texto.includes(MARCA_DA_ORIGEM)) return href;
  const novo = `${texto.trim() ? `${texto.trimEnd()}\n\n` : "Olá! "}${MARCA_DA_ORIGEM} ${origem})`;

  const outros = [...url.searchParams.entries()].filter(([k]) => k !== "text");
  const busca = [...outros, ["text", novo]].map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  const base = href.startsWith("whatsapp://") ? "whatsapp://send" : `${url.origin}${url.pathname}`;
  return `${base}?${busca}`;
}

/** Para os botões que abrem o WhatsApp por código, no navegador. */
export function comOrigemDaPagina(href: string, origem?: string): string {
  const caminho = typeof window !== "undefined" ? window.location.pathname : "/";
  return comOrigem(href, origem || origemDaPagina(caminho));
}

/** Lê a origem de uma mensagem que chegou (para o CRM, se quiser usar). */
export function lerOrigem(texto: string): string | null {
  const m = String(texto || "").match(/\(vim pelo site:\s*([^)]+)\)/i);
  return m ? m[1].trim() : null;
}
