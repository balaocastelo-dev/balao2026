import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  PASTAS_DE_VENDEDOR,
  SLUGS_RESERVADOS,
  acharPorSlug,
  atribuirSlugs,
  slugDoNome,
  slugReservado,
} from "@/lib/vendedor-slug";

const equipe = [
  { id: "thiago", nome: "Thiago", cargo: "Vendas", pin: "1111" },
  { id: "thiago-herrera", nome: "Thiago Herrera", cargo: "Vendas", pin: "2222" },
  { id: "herrera", nome: "herrera", cargo: "Vendas", pin: "3333" },
  { id: "outro-thiago", nome: "Thiago", cargo: "Vendas", pin: "4444" },
  { id: "gabriel", nome: "Gabriel", pin: "5555" },
  { id: "julia", nome: "Julia" },
  { id: "julia-ia", nome: "JUL.IA" },
  { id: "wendell", nome: "Wendell" },
  { id: "iphone-pessoa", nome: "iPhone" },
  { id: "acentuado", nome: "José Álvaro" },
];

describe("slug do nome", () => {
  it("fica minúsculo, sem acento e sem espaço", () => {
    expect(slugDoNome("Thiago Herrera")).toBe("thiagoherrera");
    expect(slugDoNome("José Álvaro")).toBe("josealvaro");
    expect(slugDoNome("  JUL.IA ")).toBe("julia");
    expect(slugDoNome("herrera")).toBe("herrera");
  });

  it("separa homônimos e não deixa o segundo tomar o slug de quem já tinha o id", () => {
    const slugs = Object.fromEntries(atribuirSlugs(equipe).map((v) => [v.id, v.slug]));
    expect(slugs.thiago).toBe("thiago");
    expect(slugs["outro-thiago"]).toBe("thiago2");
    expect(slugs["thiago-herrera"]).toBe("thiagoherrera");
    expect(slugs.herrera).toBe("herrera");
    expect(slugs.gabriel).toBe("gabriel");
    expect(slugs.julia).toBe("julia");
    expect(slugs["julia-ia"]).toBe("julia2");
    expect(slugs.wendell).toBe("wendell");
    expect(slugs.acentuado).toBe("josealvaro");
  });

  it("não entrega um endereço que já é página do site", () => {
    const slugs = atribuirSlugs(equipe);
    expect(slugs.find((v) => v.id === "iphone-pessoa")?.slug).toBe("iphone2");
    for (const v of slugs) {
      expect(slugReservado(v.slug)).toBe(false);
    }
  });

  it("não devolve o PIN junto com o slug", () => {
    const json = JSON.stringify(atribuirSlugs(equipe));
    expect(json).not.toContain("1111");
    expect(json).not.toContain("5555");
    expect(atribuirSlugs(equipe)[0]).not.toHaveProperty("pin");
  });

  it("acha pelo slug e recusa endereço reservado ou inexistente", () => {
    expect(acharPorSlug(equipe, "Thiago")?.id).toBe("thiago");
    expect(acharPorSlug(equipe, "iphone")).toBeNull();
    expect(acharPorSlug(equipe, "ninguem")).toBeNull();
    expect(acharPorSlug(equipe, "../painel")).toBeNull();
  });
});

describe("nomes reservados", () => {
  it("guarda os endereços que o site não pode perder", () => {
    for (const nome of [
      "iphone",
      "android",
      "macbook",
      "imac",
      "microsoft",
      "painel",
      "sistema",
      "app",
      "downloads",
      "mybots",
      "whatsapp",
      "api",
    ]) {
      expect(slugReservado(nome)).toBe(true);
    }
  });

  it("não reserva a página que já é do vendedor", () => {
    for (const slug of PASTAS_DE_VENDEDOR) {
      expect(slugReservado(slug)).toBe(false);
    }
  });

  it("cobre cada pasta de app/ e de public/, fora as páginas de vendedor", () => {
    const excecoes = new Set<string>(PASTAS_DE_VENDEDOR);
    const conferir = (raiz: string) => {
      for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
        if (!entrada.isDirectory()) continue;
        if (excecoes.has(entrada.name)) continue;
        expect(
          slugReservado(entrada.name),
          `${entrada.name} é rota do site e precisa entrar em SLUGS_RESERVADOS`
        ).toBe(true);
      }
    };
    conferir(path.join(process.cwd(), "app"));
    conferir(path.join(process.cwd(), "public"));
  });

  it("não repete nome na lista", () => {
    expect(new Set(SLUGS_RESERVADOS).size).toBe(SLUGS_RESERVADOS.length);
  });
});
