// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "crypto";
import { NextRequest } from "next/server";

// A tranca do administrativo (proxy.ts). O que precisa continuar verdade:
// sem a senha do painel ninguém abre uma área de dentro dele nem lê pedido de
// cliente — e a loja continua aberta para quem compra.

const SENHA = "senha-de-teste-do-painel";
const COOKIE = "balao_painel_session";

function tokenDe(senha: string) {
  return createHash("sha256").update(`${senha}:balao-painel`).digest("hex");
}

async function passar(
  caminho: string,
  opcoes: { metodo?: string; cookie?: string; cookieBalcao?: string } = {}
) {
  const { proxy } = await import("@/proxy");
  const headers = new Headers();
  const cookies: string[] = [];
  if (opcoes.cookie) cookies.push(`${COOKIE}=${opcoes.cookie}`);
  if (opcoes.cookieBalcao) cookies.push(`controle_admin_auth=${opcoes.cookieBalcao}`);
  if (cookies.length) headers.set("cookie", cookies.join("; "));
  const request = new NextRequest(new URL(caminho, "https://www.balao.info"), {
    method: opcoes.metodo || "GET",
    headers,
  });
  return proxy(request);
}

/** O proxy "deixa passar" devolvendo uma resposta marcada para seguir adiante. */
function seguiu(resposta: Response) {
  return resposta.headers.get("x-middleware-next") === "1";
}

const original = process.env.PAINEL_PASSWORD;

describe("tranca do painel", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.PAINEL_PASSWORD = SENHA;
    delete process.env.ADMIN_API_TOKEN;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.PAINEL_PASSWORD;
    else process.env.PAINEL_PASSWORD = original;
  });

  it("a entrada (/painel) abre para todos — é ela que mostra a tela de senha", async () => {
    expect(seguiu(await passar("/painel"))).toBe(true);
  });

  it("área de dentro, sem senha, vai para a entrada lembrando para onde voltar", async () => {
    for (const area of ["/painel/produtos", "/painel/crm", "/painel/arena", "/painel/usuarios"]) {
      const r = await passar(area);
      expect(r.status, area).toBe(307);
      const destino = new URL(r.headers.get("location") || "");
      expect(destino.pathname).toBe("/painel");
      expect(destino.searchParams.get("voltar")).toBe(area);
    }
  });

  it("área de dentro, com a senha, abre", async () => {
    expect(seguiu(await passar("/painel/produtos", { cookie: tokenDe(SENHA) }))).toBe(true);
    expect(seguiu(await passar("/painel/crm", { cookie: tokenDe(SENHA) }))).toBe(true);
  });

  it("cookie de outra senha não abre", async () => {
    const r = await passar("/painel/produtos", { cookie: tokenDe("outra-senha") });
    expect(r.status).toBe(307);
  });

  it("sem senha configurada na hospedagem, nem o cookie certo abre", async () => {
    delete process.env.PAINEL_PASSWORD;
    const r = await passar("/painel/produtos", { cookie: tokenDe("") });
    expect(r.status).toBe(307);
  });

  it("a senha do dia do balcão não abre o painel", async () => {
    const r = await passar("/painel/pedidos", { cookieBalcao: "5667600910102026" });
    expect(r.status).toBe(307);
  });

  it("a lista de pedidos (dados de cliente) só sai com a senha", async () => {
    expect((await passar("/api/orders")).status).toBe(401);
    expect((await passar("/api/orders/")).status).toBe(401);
    expect(seguiu(await passar("/api/orders", { cookie: tokenDe(SENHA) }))).toBe(true);
  });

  it("mudar ou apagar pedido só com a senha", async () => {
    expect((await passar("/api/orders/abc123", { metodo: "PATCH" })).status).toBe(401);
    expect((await passar("/api/orders/abc123", { metodo: "DELETE" })).status).toBe(401);
    expect(
      seguiu(await passar("/api/orders/abc123", { metodo: "PATCH", cookie: tokenDe(SENHA) }))
    ).toBe(true);
  });

  it("a página de obrigado continua consultando o pedido sem senha", async () => {
    expect(seguiu(await passar("/api/orders/status?orderId=abc123"))).toBe(true);
  });

  it("os números de faturamento só saem com a senha", async () => {
    expect((await passar("/api/dashboard/metrics")).status).toBe(401);
    expect(seguiu(await passar("/api/dashboard/metrics", { cookie: tokenDe(SENHA) }))).toBe(true);
  });

  it("a loja continua aberta: catálogo, busca, carrinho e compra não pedem senha", async () => {
    for (const caminho of ["/", "/api/products", "/api/categories", "/api/search?q=ssd", "/cart", "/arena"]) {
      expect(seguiu(await passar(caminho)), caminho).toBe(true);
    }
    expect(seguiu(await passar("/api/checkout", { metodo: "POST" }))).toBe(true);
    expect(seguiu(await passar("/api/coupons/validate", { metodo: "POST" }))).toBe(true);
  });

  it("alterar o catálogo continua pedindo a senha", async () => {
    expect((await passar("/api/products", { metodo: "POST" })).status).toBe(401);
    expect(seguiu(await passar("/api/products", { metodo: "POST", cookie: tokenDe(SENHA) }))).toBe(true);
  });
});
