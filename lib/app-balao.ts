// ============================================================
// App do Balão (shell Capacitor) — desconto extra no Pix pelo app.
//
// O aplicativo é só uma casca Capacitor que abre https://www.balao.info.
// Ele se identifica injetando "BalaoApp" no User-Agent
// (capacitor.config.ts -> appendUserAgent). Com isso a loja sabe, tanto no
// navegador quanto no servidor, que a pessoa está dentro do app, e dá um
// desconto EXTRA de 15% no preço Pix de qualquer produto.
//
// Regra de segurança da loja: o servidor NUNCA confia no preço vindo do
// cliente. Por isso o desconto de verdade é aplicado no servidor
// (app/api/checkout/route.ts), a partir do catálogo, lendo o header
// User-Agent da requisição. O que o navegador mostra é só vitrine.
// ============================================================

/** Marca que o app injeta no User-Agent. Tem que bater com o capacitor.config.ts. */
export const MARCA_APP = "BalaoApp";

/** Desconto extra no Pix para quem compra pelo app. 0.15 = 15%. */
export const DESCONTO_APP_PIX = 0.15;

/** Texto curto reaproveitado nos selos da vitrine. */
export const ROTULO_APP_PIX = "-15% no app";

/**
 * Servidor: o pedido veio do app? Lê o User-Agent da requisição.
 * (Mesma técnica que a loja já usa para reconhecer o cron da Vercel.)
 */
export function pedidoVeioDoApp(req: Request): boolean {
  try {
    const ua = req?.headers?.get?.("user-agent") || "";
    return ua.includes(MARCA_APP);
  } catch {
    return false;
  }
}

/** Arredonda para centavos (evita 0,1 + 0,2 = 0,30000004). */
export function emCentavos(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Aplica o desconto do app sobre um valor, quando for do app. */
export function comDescontoApp(valor: number, ehApp: boolean): number {
  if (!ehApp || !(valor > 0)) return valor;
  return emCentavos(valor * (1 - DESCONTO_APP_PIX));
}

/** Lê um preço em reais vindo como texto ("R$ 1.234,56") ou número. */
export function lerReais(valor: unknown): number {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") return 0;
  return (
    parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0
  );
}

/** Formata um número como moeda brasileira. */
export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
