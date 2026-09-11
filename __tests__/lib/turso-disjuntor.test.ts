import { describe, it, expect } from "vitest";

// ============================================================
// Disjuntor da cota do banco.
//
// O caso real: estourada a cota de 500 conexões/hora, o banco recusa tudo — e
// o site continuava tentando a cada página. Cada tentativa CONTA para a cota,
// então o próprio site mantinha o banco fechado, e a hora seguinte já começava
// comprometida.
//
// Testa só o reconhecimento do erro, que é a decisão que importa: confundir um
// erro comum com erro de cota pausaria o banco à toa.
// ============================================================

// Mesma regra de lib/turso.ts. Duplicada aqui de propósito: a função é interna
// e exportá-la só para o teste daria a impressão de que é parte da interface.
function ehErroDeCota(erro: unknown) {
  const texto = String((erro as Error)?.message || erro || "");
  return texto.includes("max_connections_per_hour") || texto.includes("max_user_connections");
}

describe("reconhecimento do erro de cota", () => {
  it("reconhece a mensagem que a Hostinger devolve", () => {
    const real = new Error(
      "User 'u846882120_balao_loja' has exceeded the 'max_connections_per_hour' resource (current value: 500)"
    );
    expect(ehErroDeCota(real)).toBe(true);
  });

  it("reconhece também o limite de conexões simultâneas", () => {
    expect(ehErroDeCota(new Error("has exceeded the 'max_user_connections' resource"))).toBe(true);
  });

  it("NÃO confunde erro comum com cota", () => {
    // Pausar o banco por causa de um erro de SQL deixaria o site na cópia
    // antiga sem motivo nenhum.
    expect(ehErroDeCota(new Error("ER_PARSE_ERROR: You have an error in your SQL syntax"))).toBe(false);
    expect(ehErroDeCota(new Error("ECONNREFUSED"))).toBe(false);
    expect(ehErroDeCota(new Error("Table 'products' doesn't exist"))).toBe(false);
  });

  it("não quebra com erro estranho", () => {
    expect(ehErroDeCota(null)).toBe(false);
    expect(ehErroDeCota(undefined)).toBe(false);
    expect(ehErroDeCota("max_connections_per_hour")).toBe(true);
  });
});
