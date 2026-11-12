import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (nome: string, valor: string) => {
      jar.set(nome, valor);
    },
    get: (nome: string) => {
      const valor = jar.get(nome);
      return valor ? { value: valor } : undefined;
    },
  }),
}));

const resolverVendedor = vi.fn();
const conferirPinDoVendedor = vi.fn();

vi.mock("@/lib/vendedor-pagina", () => ({
  resolverVendedor: (...args: unknown[]) => resolverVendedor(...args),
}));

vi.mock("@/lib/vendedor-remoto", () => ({
  conferirPinDoVendedor: (...args: unknown[]) => conferirPinDoVendedor(...args),
}));

const PIN = "246810";

function pedido(corpo: unknown) {
  return new Request("http://localhost/api/vendedor/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

describe("login por PIN", () => {
  const anterior = process.env.PAINEL_PASSWORD;

  beforeEach(() => {
    jar.clear();
    resolverVendedor.mockReset();
    conferirPinDoVendedor.mockReset();
    process.env.PAINEL_PASSWORD = "segredo-de-teste";
    resolverVendedor.mockResolvedValue({
      id: "gabriel",
      slug: "gabriel",
      nome: "Gabriel",
      cargo: "Vendas",
      assinatura: "Atenciosamente,\n*Gabriel*",
    });
  });

  afterEach(() => {
    if (anterior === undefined) delete process.env.PAINEL_PASSWORD;
    else process.env.PAINEL_PASSWORD = anterior;
  });

  it("entra quando o PIN é deste vendedor e não devolve o PIN", async () => {
    conferirPinDoVendedor.mockResolvedValue("ok");
    const { POST } = await import("@/app/api/vendedor/login/route");
    const resposta = await POST(pedido({ slug: "gabriel", pin: PIN }));
    const json = await resposta.json();
    const texto = JSON.stringify(json);

    expect(resposta.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.vendedor.nome).toBe("Gabriel");
    expect(json.vendedor).not.toHaveProperty("pin");
    expect(texto).not.toContain(PIN);
    expect(jar.get("balao_vendedor_session")).toBeTruthy();
    expect(jar.get("balao_vendedor_session")).not.toContain(PIN);
    expect(conferirPinDoVendedor).toHaveBeenCalledWith(PIN, "gabriel");
  });

  it("recusa o PIN de outra pessoa com a mesma mensagem de PIN errado", async () => {
    conferirPinDoVendedor.mockResolvedValue("errado");
    const { POST } = await import("@/app/api/vendedor/login/route");
    const resposta = await POST(pedido({ slug: "gabriel", pin: PIN }));
    const json = await resposta.json();
    expect(resposta.status).toBe(401);
    expect(json.error).toBe("PIN incorreto.");
    expect(JSON.stringify(json)).not.toContain(PIN);
    expect(jar.size).toBe(0);
  });

  it("não consulta o servidor quando o slug não é de vendedor", async () => {
    resolverVendedor.mockResolvedValue(null);
    const { POST } = await import("@/app/api/vendedor/login/route");
    const resposta = await POST(pedido({ slug: "iphone", pin: PIN }));
    expect(resposta.status).toBe(401);
    expect(conferirPinDoVendedor).not.toHaveBeenCalled();
  });
});
