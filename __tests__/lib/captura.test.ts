import { describe, it, expect } from "vitest";
import { normalizarWhatsApp } from "@/lib/captura";

// ============================================================
// O número que a pessoa digita para receber o material.
//
// Número inválido gravado é lead morto: o vendedor tenta falar, ninguém
// atende, e ele conclui que a captura não funciona. Melhor recusar na hora,
// enquanto a pessoa ainda está na tela e pode corrigir.
// ============================================================

describe("normalização do WhatsApp", () => {
  it("celular com DDD ganha o DDI", () => {
    expect(normalizarWhatsApp("19987510267")).toBe("5519987510267");
  });

  it("fixo com DDD também passa", () => {
    expect(normalizarWhatsApp("1932360000")).toBe("551932360000");
  });

  it("aceita como as pessoas realmente digitam", () => {
    // Ninguém digita só dígitos: vem com parênteses, traço, espaço e +55.
    expect(normalizarWhatsApp("(19) 98751-0267")).toBe("5519987510267");
    expect(normalizarWhatsApp("+55 19 98751-0267")).toBe("5519987510267");
    expect(normalizarWhatsApp(" 19 9 8751 0267 ")).toBe("5519987510267");
  });

  it("número já completo não ganha 55 de novo", () => {
    // Sem esta checagem viraria "555519987510267" e nunca receberia nada.
    expect(normalizarWhatsApp("5519987510267")).toBe("5519987510267");
  });

  it("recusa número curto demais", () => {
    expect(normalizarWhatsApp("987510267")).toBeNull();
    expect(normalizarWhatsApp("1998")).toBeNull();
  });

  it("recusa número longo demais", () => {
    expect(normalizarWhatsApp("551998751026789")).toBeNull();
  });

  it("recusa 12-13 dígitos que não começam com 55", () => {
    // Um id qualquer com o tamanho certo não vira telefone por coincidência.
    expect(normalizarWhatsApp("249610647953")).toBeNull();
  });

  it("vazio e lixo devolvem null em vez de quebrar", () => {
    expect(normalizarWhatsApp("")).toBeNull();
    expect(normalizarWhatsApp("abc")).toBeNull();
    expect(normalizarWhatsApp(null as unknown as string)).toBeNull();
  });
});
