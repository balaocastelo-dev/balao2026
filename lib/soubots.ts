/**
 * O site oficial da landing é o www. O apex também abre a mesma página.
 * www.balao.info e os outros domínios deste projeto não entram aqui.
 *
 * Para trocar o painel (login Google), mude só URL_PAINEL.
 */

export const URL_SITE = "https://www.soubots.com";
export const URL_PAINEL = "https://app.soubots.com";

const HOSTS = new Set(["soubots.com", "www.soubots.com"]);

/** Tira porta e a lista de proxies. Não aceita um host que só contenha o nome. */
export function hostLimpo(valor: string | null | undefined) {
  const bruto = String(valor ?? "").split(",")[0].trim().toLowerCase();
  if (!bruto) return "";
  if (bruto.startsWith("[")) {
    const fim = bruto.indexOf("]");
    return fim >= 0 ? bruto.slice(1, fim) : bruto;
  }
  return bruto.replace(/:\d+$/, "");
}

export function ehHostSoubots(host: string | null | undefined) {
  return HOSTS.has(hostLimpo(host));
}
