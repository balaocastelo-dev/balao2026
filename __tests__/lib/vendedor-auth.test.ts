import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildCookieValue,
  getVendedorSessionToken,
  isSenhaVendedorValida,
} from "@/lib/vendedor-auth";
import {
  VENDEDORES,
  getSenhaVendedor,
  getVendedorPorSlug,
  temSenhaConfigurada,
  vendedorPublico,
  type VendedorRegistro,
} from "@/lib/vendedores";

const brendon = getVendedorPorSlug("brendon") as VendedorRegistro;

// Vendedor de mentira, para provar que a sessão de um não abre a página do
// outro sem depender de quem está cadastrado de verdade na loja.
const outroVendedor: VendedorRegistro = {
  slug: "outro",
  id: "outro",
  nome: "Outro",
  cargo: "Consultor de Vendas",
  assinatura: "Atenciosamente,\n*Outro*",
  envSenha: "VENDEDOR_OUTRO_SENHA",
};

describe("registro de vendedores", () => {
  it("encontra o Brendon pelo slug, com maiúsculas e espaços", () => {
    expect(getVendedorPorSlug("brendon")?.nome).toBe("Brendon");
    expect(getVendedorPorSlug("  BRENDON ")?.nome).toBe("Brendon");
  });

  it("devolve null para quem não está cadastrado", () => {
    expect(getVendedorPorSlug("fulano")).toBeNull();
    expect(getVendedorPorSlug("")).toBeNull();
  });

  it("não deixa a senha vazar para o navegador", () => {
    const publico = vendedorPublico(brendon) as Record<string, unknown>;
    expect(publico.envSenha).toBeUndefined();
  });

  // Este repositório é público. Uma senha em código versionado vira senha
  // pública e não some do histórico do git.
  it("nenhum vendedor carrega senha escrita no código", () => {
    for (const vendedor of VENDEDORES) {
      expect(Object.keys(vendedor)).not.toContain("senhaPadrao");
      expect(Object.keys(vendedor)).not.toContain("senha");
      expect(vendedor.envSenha).toMatch(/^VENDEDOR_[A-Z0-9_]+_SENHA$/);
    }
  });

  it("usa ids únicos e estáveis (a chave do kanban pessoal)", () => {
    const ids = VENDEDORES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = VENDEDORES.map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("senha do vendedor", () => {
  const original = process.env[brendon.envSenha];

  beforeEach(() => {
    delete process.env[brendon.envSenha];
  });

  afterEach(() => {
    if (original === undefined) delete process.env[brendon.envSenha];
    else process.env[brendon.envSenha] = original;
  });

  it("sem variável de ambiente, o acesso fica fechado", () => {
    expect(temSenhaConfigurada(brendon)).toBe(false);
    expect(getSenhaVendedor(brendon)).toBe("");
    // Nenhum palpite entra — nem a string vazia, que é o valor "esperado".
    expect(isSenhaVendedorValida(brendon, "")).toBe(false);
    expect(isSenhaVendedorValida(brendon, "qualquer-palpite")).toBe(false);
  });

  it("a variável de ambiente define a senha que vale", () => {
    process.env[brendon.envSenha] = "NovaSenhaForte!42";
    expect(temSenhaConfigurada(brendon)).toBe(true);
    expect(isSenhaVendedorValida(brendon, "NovaSenhaForte!42")).toBe(true);
    expect(isSenhaVendedorValida(brendon, "outra")).toBe(false);
  });

  it("distingue maiúsculas e recusa senha parcial", () => {
    process.env[brendon.envSenha] = "SenhaDoBrendon";
    expect(isSenhaVendedorValida(brendon, "senhadobrendon")).toBe(false);
    expect(isSenhaVendedorValida(brendon, "SenhaDoBrendo")).toBe(false);
  });

  it("variável em branco conta como não configurada", () => {
    process.env[brendon.envSenha] = "   ";
    expect(temSenhaConfigurada(brendon)).toBe(false);
    expect(isSenhaVendedorValida(brendon, "   ")).toBe(false);
  });
});

describe("token de sessão", () => {
  it("amarra a sessão a uma pessoa só", () => {
    expect(getVendedorSessionToken(brendon)).not.toBe(
      getVendedorSessionToken(outroVendedor)
    );
  });

  it("o cookie carrega o slug na frente do token", () => {
    const cookie = buildCookieValue(brendon);
    expect(cookie.startsWith("brendon.")).toBe(true);
    expect(cookie.slice("brendon.".length)).toBe(getVendedorSessionToken(brendon));
  });

  it("o cookie não contém a senha em lugar nenhum", () => {
    const original = process.env[brendon.envSenha];
    process.env[brendon.envSenha] = "SenhaSecretaDeTeste";
    const cookie = buildCookieValue(brendon);
    if (original === undefined) delete process.env[brendon.envSenha];
    else process.env[brendon.envSenha] = original;

    expect(cookie).not.toContain("SenhaSecretaDeTeste");
  });

  it("trocar a senha invalida a sessão antiga", () => {
    const original = process.env[brendon.envSenha];
    const antes = getVendedorSessionToken(brendon);
    process.env[brendon.envSenha] = "SenhaTrocada!";
    const depois = getVendedorSessionToken(brendon);
    if (original === undefined) delete process.env[brendon.envSenha];
    else process.env[brendon.envSenha] = original;

    expect(depois).not.toBe(antes);
  });
});
