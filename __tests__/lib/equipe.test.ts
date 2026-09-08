import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import {
  EQUIPE_COOKIE_NAME,
  montarCookieDaEquipe,
  montarTokenDaEquipe,
  opcoesDoCookieDaEquipe,
} from "@/lib/equipe";
import { VENDEDOR_COOKIE_NAME } from "@/lib/vendedor-auth";
import { montarSlug } from "@/components/crm/CrmDashboard";

// ============================================================
// Vendedores criados pelo dashboard.
//
// O ponto frágil aqui é que a MESMA senha é transformada em token em três
// lugares — no navegador (ao cadastrar), no Next (ao entrar) e comparada no
// whatsapp-server. Se qualquer um divergir, o vendedor é cadastrado com
// sucesso e simplesmente nunca consegue entrar. Estes testes travam o formato.
// ============================================================

describe("token de acesso da equipe", () => {
  it("é o sha256 de slug + senha, no formato combinado", () => {
    const esperado = createHash("sha256")
      .update("ana-paula:segredo123:balao-vendedor")
      .digest("hex");

    expect(montarTokenDaEquipe("ana-paula", "segredo123")).toBe(esperado);
  });

  it("usa exatamente a mesma fórmula da equipe fixa", () => {
    // O whatsapp-server compara contra um token só; se as duas famílias de
    // vendedor gerassem formatos diferentes, uma delas ficaria de fora.
    const senha = "outra-senha";
    const daEquipe = montarTokenDaEquipe("brendon", senha);
    const daFormulaFixa = createHash("sha256")
      .update(`brendon:${senha}:balao-vendedor`)
      .digest("hex");

    expect(daEquipe).toBe(daFormulaFixa);
  });

  it("senha diferente gera token diferente", () => {
    expect(montarTokenDaEquipe("ana", "senha-a")).not.toBe(montarTokenDaEquipe("ana", "senha-b"));
  });

  it("a mesma senha em vendedores diferentes gera tokens diferentes", () => {
    // Sem o slug na fórmula, duas pessoas com a mesma senha teriam o mesmo
    // token — e o cookie de uma abriria a página da outra.
    expect(montarTokenDaEquipe("ana", "igual")).not.toBe(montarTokenDaEquipe("bruno", "igual"));
  });

  it("não devolve a senha em lugar nenhum do token", () => {
    const token = montarTokenDaEquipe("ana", "senha-secreta");
    expect(token).not.toContain("senha-secreta");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("cookie da equipe", () => {
  it("guarda slug e token separados por ponto", () => {
    const token = montarTokenDaEquipe("ana-paula", "segredo123");
    expect(montarCookieDaEquipe("ana-paula", token)).toBe(`ana-paula.${token}`);
  });

  it("não usa o mesmo nome do cookie da equipe fixa", () => {
    // Se colidissem, entrar como vendedor do dashboard derrubaria a sessão de
    // quem entrou pela página fixa no mesmo navegador.
    expect(EQUIPE_COOKIE_NAME).not.toBe(VENDEDOR_COOKIE_NAME);
  });

  it("o cookie é httpOnly e não vaza para o JavaScript da página", () => {
    const opcoes = opcoesDoCookieDaEquipe();
    expect(opcoes.httpOnly).toBe(true);
    expect(opcoes.sameSite).toBe("lax");
    expect(opcoes.path).toBe("/");
  });
});

describe("endereço do vendedor a partir do nome", () => {
  it("tira acento, espaço e maiúscula", () => {
    expect(montarSlug("Ana Paula Sé")).toBe("ana-paula-se");
  });

  it("não deixa traço sobrando nas pontas", () => {
    expect(montarSlug("  João  ")).toBe("joao");
    expect(montarSlug("--Ana--")).toBe("ana");
  });

  it("descarta o que não cabe numa URL", () => {
    // O slug vira endereço de página; sem isso o cadastro geraria uma URL que
    // o navegador precisa escapar e o vendedor nunca acha.
    expect(montarSlug("Ana/Paula?x=1")).toBe("ana-paula-x-1");
    expect(montarSlug("Zé & Cia.")).toBe("ze-cia");
  });

  it("nome sem nenhuma letra utilizável vira string vazia", () => {
    // O servidor recusa nesse caso, em vez de criar um vendedor sem endereço.
    expect(montarSlug("!!!")).toBe("");
    expect(montarSlug("")).toBe("");
  });

  it("é idempotente: aplicar de novo não muda nada", () => {
    // O navegador manda o slug pronto e o servidor aplica a mesma limpeza.
    // Se não fosse idempotente, os dois discordariam e a senha (derivada do
    // slug) não abriria a página.
    const uma = montarSlug("Ana Paula Sé");
    expect(montarSlug(uma)).toBe(uma);
  });
});
