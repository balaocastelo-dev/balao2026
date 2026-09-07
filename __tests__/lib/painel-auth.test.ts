import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// O módulo lê PAINEL_PASSWORD no topo, então cada cenário precisa de um
// import limpo — daí o resetModules antes de cada carga.
async function carregarCom(senha: string | undefined) {
  vi.resetModules();
  if (senha === undefined) delete process.env.PAINEL_PASSWORD;
  else process.env.PAINEL_PASSWORD = senha;
  return import("@/lib/painel-auth");
}

const original = process.env.PAINEL_PASSWORD;

describe("senha do painel (/crm, /whatsapp, /painel)", () => {
  beforeEach(() => {
    delete process.env.PAINEL_PASSWORD;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.PAINEL_PASSWORD;
    else process.env.PAINEL_PASSWORD = original;
  });

  it("com senha configurada, só ela entra", async () => {
    const auth = await carregarCom("umaSenhaForte123");
    expect(auth.isPainelConfigurado()).toBe(true);
    expect(auth.isPainelPasswordValid("umaSenhaForte123")).toBe(true);
    expect(auth.isPainelPasswordValid("outra")).toBe(false);
    expect(auth.isPainelPasswordValid("umasenhaforte123")).toBe(false);
  });

  // Esta é a regra que importa: o hash de uma senha vazia é um hash válido
  // como outro qualquer. Sem a guarda explícita, esquecer a variável de
  // ambiente (num preview, num ambiente novo) abriria o painel para quem
  // mandasse senha em branco, em vez de trancá-lo.
  it("sem a variável de ambiente, NINGUÉM entra — nem com senha vazia", async () => {
    const auth = await carregarCom(undefined);
    expect(auth.isPainelConfigurado()).toBe(false);
    expect(auth.isPainelPasswordValid("")).toBe(false);
    expect(auth.isPainelPasswordValid("qualquer")).toBe(false);
    expect(await auth.isPainelAuthenticated()).toBe(false);
  });

  it("variável vazia conta como não configurada", async () => {
    const auth = await carregarCom("");
    expect(auth.isPainelConfigurado()).toBe(false);
    expect(auth.isPainelPasswordValid("")).toBe(false);
  });

  it("a senha não aparece no token de sessão", async () => {
    const auth = await carregarCom("SenhaSecretaDoPainel");
    expect(auth.getPainelSessionToken()).not.toContain("SenhaSecretaDoPainel");
  });
});
