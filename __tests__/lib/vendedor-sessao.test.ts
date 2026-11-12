import { afterEach, describe, expect, it } from "vitest";
import { criarSessaoVendedor, lerSessaoVendedor } from "@/lib/vendedor-sessao";

const SENHA = "segredo-de-teste-que-nao-e-pin";
const PIN = "654321";

describe("sessão do vendedor", () => {
  const anterior = process.env.PAINEL_PASSWORD;

  afterEach(() => {
    if (anterior === undefined) delete process.env.PAINEL_PASSWORD;
    else process.env.PAINEL_PASSWORD = anterior;
  });

  it("sem segredo no ambiente, não cria sessão", () => {
    delete process.env.PAINEL_PASSWORD;
    delete process.env.WHATSAPP_TICKET_SECRET;
    expect(criarSessaoVendedor("gabriel", "gabriel")).toBeNull();
  });

  it("o cookie abre a mesma pessoa e não carrega o PIN", () => {
    process.env.PAINEL_PASSWORD = SENHA;
    const cookie = criarSessaoVendedor("gabriel", "gabriel");
    expect(cookie).toBeTruthy();
    expect(cookie).not.toContain(PIN);
    expect(cookie).not.toContain(SENHA);
    expect(lerSessaoVendedor(cookie)).toEqual(
      expect.objectContaining({ id: "gabriel", slug: "gabriel" })
    );
  });

  it("rejeita cookie adulterado, vencido ou de outro formato", () => {
    process.env.PAINEL_PASSWORD = SENHA;
    const cookie = criarSessaoVendedor("gabriel", "gabriel") as string;
    expect(lerSessaoVendedor(`${cookie}x`)).toBeNull();
    expect(lerSessaoVendedor("gabriel.token-antigo")).toBeNull();
    const vencido = criarSessaoVendedor("gabriel", "gabriel", Date.now() - 40 * 24 * 60 * 60 * 1000);
    expect(lerSessaoVendedor(vencido)).toBeNull();
  });

  it("a sessão de um vendedor não vale como a de outro", () => {
    process.env.PAINEL_PASSWORD = SENHA;
    const cookie = criarSessaoVendedor("gabriel", "gabriel");
    const sessao = lerSessaoVendedor(cookie);
    expect(sessao?.id).not.toBe("thiago");
    expect(sessao?.slug).not.toBe("thiago");
  });
});
