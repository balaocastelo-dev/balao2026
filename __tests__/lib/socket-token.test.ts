import { describe, it, expect, beforeEach, vi } from "vitest";

// O bilhete é a única coisa entre a internet e a caixa de conversas da loja.
// O que importa testar: assinatura falsa não passa, bilhete vencido não passa,
// e sem segredo configurado NADA passa.

describe("bilhete do socket", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.PANEL_SOCKET_SECRET = "segredo-de-teste";
  });

  it("sem segredo configurado, ninguém entra", async () => {
    process.env.PANEL_SOCKET_SECRET = "";
    const m = await import("../../lib/socket-token");
    expect(m.socketTokenConfigurado()).toBe(false);
    expect(m.emitirSocketToken()).toBeNull();
    // A tentação seria liberar quando falta configuração, "para não quebrar
    // nada". É assim que um conserto de segurança vira porta aberta.
    expect(m.conferirSocketToken("qualquer.coisa")).toBe(false);
  });

  it("aceita o bilhete que ele mesmo emitiu", async () => {
    const m = await import("../../lib/socket-token");
    const b = m.emitirSocketToken();
    expect(b).not.toBeNull();
    expect(m.conferirSocketToken(b!.token)).toBe(true);
  });

  it("recusa assinatura trocada", async () => {
    const m = await import("../../lib/socket-token");
    const b = m.emitirSocketToken()!;
    const [expira] = b.token.split(".");
    expect(m.conferirSocketToken(`${expira}.${"0".repeat(64)}`)).toBe(false);
  });

  it("recusa validade esticada na mão", async () => {
    const m = await import("../../lib/socket-token");
    const b = m.emitirSocketToken()!;
    const [, assinatura] = b.token.split(".");
    // Empurrar a data para frente invalida a assinatura, que é feita SOBRE a
    // data — senão bastaria editar o número para ter um bilhete eterno.
    const longe = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;
    expect(m.conferirSocketToken(`${longe}.${assinatura}`)).toBe(false);
  });

  it("recusa bilhete vencido", async () => {
    const m = await import("../../lib/socket-token");
    const b = m.emitirSocketToken()!;
    expect(m.conferirSocketToken(b.token)).toBe(true);
    vi.setSystemTime(new Date(Date.now() + 9 * 60 * 60 * 1000));
    expect(m.conferirSocketToken(b.token)).toBe(false);
    vi.useRealTimers();
  });

  it("recusa lixo", async () => {
    const m = await import("../../lib/socket-token");
    for (const ruim of ["", "abc", "1.2.3", "...", "9999999999999."]) {
      expect(m.conferirSocketToken(ruim)).toBe(false);
    }
  });

  it("um segredo não valida bilhete do outro", async () => {
    const m1 = await import("../../lib/socket-token");
    const b = m1.emitirSocketToken()!;
    vi.resetModules();
    process.env.PANEL_SOCKET_SECRET = "outro-segredo";
    const m2 = await import("../../lib/socket-token");
    expect(m2.conferirSocketToken(b.token)).toBe(false);
  });
});
