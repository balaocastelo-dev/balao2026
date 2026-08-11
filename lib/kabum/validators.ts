export const KABUM_ALLOWED_HOSTS = new Set(['www.kabum.com.br', 'kabum.com.br']);

export function isValidKabumUrl(input: string): boolean {
  if (!input) return false;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const host = url.hostname.toLowerCase();
    return KABUM_ALLOWED_HOSTS.has(host);
  } catch {
    return false;
  }
}

