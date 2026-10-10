import { describe, it, expect } from "vitest";
import { destinoDentroDoPainel } from "@/lib/painel/voltar";

// O parâmetro `voltar` vem do endereço, então pode ser montado por qualquer
// pessoa e mandado num link para quem administra a loja. Ele só pode levar
// para dentro do /painel — de verdade, depois de o navegador resolver o
// endereço, e não só "no texto".

const ORIGEM = "https://www.balao.info";
const voltar = (v: string | null) => destinoDentroDoPainel(v, ORIGEM);

describe("para onde voltar depois da senha", () => {
  it("aceita áreas de dentro do painel", () => {
    expect(voltar("/painel")).toBe("/painel");
    expect(voltar("/painel/produtos")).toBe("/painel/produtos");
    expect(voltar("/painel/crm")).toBe("/painel/crm");
  });

  it("mantém a consulta da área pedida", () => {
    expect(voltar("/painel/clientes?segmento=notebook")).toBe("/painel/clientes?segmento=notebook");
  });

  it("sem valor, não vai a lugar nenhum", () => {
    expect(voltar(null)).toBeNull();
    expect(voltar("")).toBeNull();
  });

  it("recusa endereço de outro site", () => {
    for (const fora of [
      "https://evil.example",
      "//evil.example/painel",
      "/\\evil.example/painel",
      "\\\\evil.example",
      "javascript:alert(1)",
      "painel/produtos",
    ]) {
      expect(voltar(fora), fora).toBeNull();
    }
  });

  it("recusa o que só parece estar dentro do painel", () => {
    for (const disfarce of [
      "/painelx",
      "/painel-falso/produtos",
      "/admin",
      "/api/orders",
      "/",
    ]) {
      expect(voltar(disfarce), disfarce).toBeNull();
    }
  });

  // O caso que importa. Estes endereços COMEÇAM com /painel/, mas o navegador
  // os resolve para fora dele — e /api/admin/seed-categories é uma rota que
  // apaga as categorias da loja, aberta com a sessão recém-criada.
  it("recusa ponto-ponto, inclusive codificado", () => {
    for (const fuga of [
      "/painel/../api/admin/seed-categories",
      "/painel/%2e%2e/api/admin/seed-categories",
      "/painel/%2E%2E/api/seed",
      "/painel/.%2e/api/seed",
      "/painel/%2e./api/seed",
      "/painel/produtos/../../api/seed",
      "/painel/..%2fapi%2fseed",
      "/painel/%2e%2e%2fapi%2fseed",
      "/painel/..\\api\\seed",
    ]) {
      expect(voltar(fuga), fuga).toBeNull();
    }
  });

  it("recusa caracteres de controle e valores enormes", () => {
    expect(voltar("/painel/\n../api/seed")).toBeNull();
    expect(voltar("/pai\tnel/produtos")).toBeNull();
    expect(voltar(`/painel/${"a".repeat(600)}`)).toBeNull();
  });

  it("ponto-ponto que continua dentro do painel é só um endereço esquisito, e resolve", () => {
    expect(voltar("/painel/produtos/../cupons")).toBe("/painel/cupons");
  });
});
