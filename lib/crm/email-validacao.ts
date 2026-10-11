// Partes do e-mail de produtos que rodam também no navegador (sem crypto do
// Node): conferir endereço, achar e-mail digitado na conversa e aceitar só
// link do próprio site. O resto mora em lib/crm/email-produtos.ts.

export const SITE = "https://www.balao.info";

export function validarEmail(email: unknown): string | null {
  const e = String(email ?? "").trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return null;
  // Simples de propósito: um endereço, sem espaço, com domínio que tem ponto.
  if (!/^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(e)) return null;
  return e;
}

/** E-mails que o cliente digitou na conversa (o CRM sugere no campo "Para"). */
export function emailsNoTexto(textos: Array<string | null | undefined>): string[] {
  const achados = new Set<string>();
  for (const t of textos) {
    for (const m of String(t || "").matchAll(/[a-z0-9._%+'-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi)) {
      const e = validarEmail(m[0]);
      if (e) achados.add(e);
    }
  }
  return [...achados];
}

/** Link extra só do próprio site (nada de link de fora saindo em nome da loja). */
export function validarLinkDoSite(url: unknown): string | null {
  const bruto = String(url ?? "").trim();
  if (!bruto) return null;
  try {
    const u = new URL(bruto.startsWith("/") ? `${SITE}${bruto}` : bruto);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!/^(www\.)?balao\.info$/i.test(u.hostname)) return null;
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}
