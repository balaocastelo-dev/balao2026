import { describe, it, expect } from "vitest";
import { comOrigem, lerOrigem, origemDaPagina } from "@/lib/whatsapp/origem";

const decodificar = (href: string) => decodeURIComponent(new URL(href).searchParams.get("text") || "");

describe("origem do lead no WhatsApp", () => {
  it("dá nome às páginas", () => {
    expect(origemDaPagina("/")).toBe("Página inicial");
    expect(origemDaPagina("/vitrine")).toBe("Vitrine");
    expect(origemDaPagina("/p/setup-912196")).toBe("Vitrine");
    expect(origemDaPagina("/product/rtx-3060")).toBe("Página de produto");
    expect(origemDaPagina("/categoria/hardware?page=2")).toBe("Catálogo");
    expect(origemDaPagina("/telaiphone")).toBe("Assistência Apple");
    expect(origemDaPagina("/manutencao")).toBe("Assistência técnica");
    expect(origemDaPagina("/regiao/valinhos/conserto")).toBe("Atendimento regional");
    expect(origemDaPagina("/algo-novo")).toBe("Algo novo");
  });

  it("acrescenta a origem no fim da mensagem", () => {
    const href = comOrigem("https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20o%20PC", "Vitrine");
    expect(decodificar(href)).toBe("Olá! Quero o PC\n\n(vim pelo site: Vitrine)");
    expect(lerOrigem(decodificar(href))).toBe("Vitrine");
  });

  it("link sem texto ganha um 'Olá!'", () => {
    expect(decodificar(comOrigem("https://wa.me/5519987510267", "Blog"))).toBe("Olá! (vim pelo site: Blog)");
  });

  it("não repete a origem em dois cliques", () => {
    const uma = comOrigem("https://wa.me/5519987510267?text=Oi", "Vitrine");
    expect(comOrigem(uma, "Vitrine")).toBe(uma);
  });

  it("aceita api.whatsapp.com com o número no phone", () => {
    const href = comOrigem("https://api.whatsapp.com/send?phone=5519987510267&text=Oi", "Catálogo");
    expect(href).toContain("phone=5519987510267");
    expect(decodificar(href)).toBe("Oi\n\n(vim pelo site: Catálogo)");
  });

  it("não mexe em compartilhar com amigo (sem número) nem em outro link", () => {
    expect(comOrigem("https://wa.me/?text=Olha%20este%20PC", "Montagem de PC")).toBe("https://wa.me/?text=Olha%20este%20PC");
    expect(comOrigem("https://www.balao.info/vitrine", "Vitrine")).toBe("https://www.balao.info/vitrine");
  });

  it("espaço vira %20 (não '+', que o WhatsApp mostraria)", () => {
    const href = comOrigem("https://wa.me/5519987510267?text=Oi", "Página de produto");
    expect(href).not.toContain("+");
    expect(href).toContain("%20");
  });
});
