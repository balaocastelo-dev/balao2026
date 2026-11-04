/**
 * O site oficial da landing é o www. O apex também abre a mesma página,
 * até o redirect do apex para o www (vercel.json) valer de verdade.
 * www.balao.info e os outros domínios deste projeto não entram aqui.
 *
 * Para trocar o painel (login Google), mude só URL_PAINEL.
 * O túnel é o mesmo do rewrite /mybots: o Hub não recebe o prefixo /app.
 */

export const URL_SITE = "https://www.soubots.com";
export const URL_PAINEL = "https://www.soubots.com/app";

/** Destino do Hub no túnel Cloudflare. Sem barra no fim: a barra entra na rota. */
export const TUNEL_HUB = "https://put-order-exist-actual.trycloudflare.com/mybots";

export const HOSTS_SOUBOTS = ["soubots.com", "www.soubots.com"] as const;

const HOSTS = new Set<string>(HOSTS_SOUBOTS);

export type RewriteDeHost = {
  source: string;
  has: { type: "host"; value: string }[];
  destination: string;
};

/**
 * /app e /app/:caminho no soubots vão para o mesmo túnel de /mybots.
 * Não há redirect de /app para /app/ — a barra no destino é só a do túnel,
 * o navegador continua em /app. Assim o 308 do Next (/app/ → /app) não volta.
 */
export function rewritesDoPainel(): RewriteDeHost[] {
  return HOSTS_SOUBOTS.flatMap((host) => {
    const has = [{ type: "host" as const, value: host }];
    return [
      { source: "/app", has, destination: `${TUNEL_HUB}/` },
      { source: "/app/:caminho*", has, destination: `${TUNEL_HUB}/:caminho*` },
    ];
  });
}

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
