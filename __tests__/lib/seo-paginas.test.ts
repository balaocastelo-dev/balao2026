import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PAGINAS } from "@/lib/landing/paginas";
import {
  MENSAGEM_PS5_GTA6,
  PRECO_PS5_GTA6_A_VISTA,
  PRECO_PS5_GTA6_PARCELAS,
  SLUG_PS5_CONSOLES,
  TITULO_PS5_CONSOLES,
  URL_PS5_CONSOLES,
  ajusteDaCategoriaPs5,
  slugsPs5QueNaoRedirecionam,
} from "@/lib/seo/ps5-campinas";

const RAIZ = path.resolve(__dirname, "../..");

describe("PS5 em Campinas", () => {
  it("a categoria de consoles é a canônica e traz a oferta já publicada na home", () => {
    const ajuste = ajusteDaCategoriaPs5(SLUG_PS5_CONSOLES);
    expect(ajuste?.titulo).toBe(TITULO_PS5_CONSOLES);
    expect(ajuste?.h1).toBe("PS5 em Campinas");
    expect(ajuste?.papel).toBe("consoles");
    expect(ajuste?.ancoraCanonica).toBeUndefined();
    const texto = ajuste?.paragrafos.join(" ") ?? "";
    expect(texto).toContain(PRECO_PS5_GTA6_A_VISTA);
    expect(texto).toContain(PRECO_PS5_GTA6_PARCELAS);
    expect(texto).toContain("GTA 6");
    expect(MENSAGEM_PS5_GTA6).toContain(PRECO_PS5_GTA6_A_VISTA);
    expect(MENSAGEM_PS5_GTA6).toContain(PRECO_PS5_GTA6_PARCELAS);

    const home = fs.readFileSync(path.join(RAIZ, "components/HomePs5Gta6Destaque.tsx"), "utf8");
    expect(home).toContain(MENSAGEM_PS5_GTA6);
    expect(home).toContain("R$ 5.999");
    expect(home).toContain("12x de R$ 599");
  });

  it("jogos e controles não são duplicata: título próprio e link para a canônica, sem 301", () => {
    for (const slug of slugsPs5QueNaoRedirecionam()) {
      const ajuste = ajusteDaCategoriaPs5(slug);
      expect(ajuste, slug).toBeTruthy();
      expect(ajuste?.titulo).not.toBe(TITULO_PS5_CONSOLES);
      expect(ajuste?.h1).not.toBe("PS5 em Campinas");
      expect(ajuste?.h1.toLowerCase()).not.toBe("playstation 5");
      expect(ajuste?.ancoraCanonica?.href).toBe(`/categoria/${SLUG_PS5_CONSOLES}`);
      expect(ajuste?.ancoraCanonica?.texto).toBe("PS5 em Campinas");
      expect(ajuste?.paragrafos.join(" ")).not.toContain("R$ 5.999");
    }
    expect(URL_PS5_CONSOLES).toBe(`https://www.balao.info/categoria/${SLUG_PS5_CONSOLES}`);
  });

  it("o redirect de /telaiphone não alcança /sistema", () => {
    const config = fs.readFileSync(path.join(RAIZ, "next.config.ts"), "utf8");
    expect(config).toContain('source: "/telaiphone"');
    expect(config).toContain('destination: "/iphone"');
    expect(config).toContain("statusCode: 301");
    const redirects = config.slice(config.indexOf("async redirects()"));
    expect(redirects).not.toMatch(/source:\s*"\/sistema/);
    const proxy = fs.readFileSync(path.join(RAIZ, "proxy.ts"), "utf8");
    expect(proxy).toContain("'/sistema'");
    expect(proxy).toContain("ehRepassado");
  });
});

describe("títulos pedidos na home, consignação e PC gamer", () => {
  it("a home usa o title absoluto e linka PC Gamer em Campinas", () => {
    const home = fs.readFileSync(path.join(RAIZ, "app/page.tsx"), "utf8");
    expect(home).toContain("Loja de Informática em Campinas (Cambuí) | Balão Anchieta");
    expect(home).toContain('title: { absolute: title }');
    expect(home).toContain('href="/pcgamer"');
    expect(home).toContain(">PC Gamer em Campinas<");
    expect(home).not.toMatch(/Castelo/i);
  });

  it("consignação e PC gamer carregam as frases pedidas", () => {
    expect(PAGINAS.consignacao.seo.titulo).toBe(
      "Venda seu Notebook Usado em Campinas | Avaliação Grátis | Balão Anchieta"
    );
    expect(PAGINAS.consignacao.seo.descricao.toLowerCase()).toContain("vender notebook usado");
    expect(PAGINAS.consignacao.hero.mensagem).toBe("Quero vender meu notebook");
    expect(PAGINAS.consignacao.final.mensagem).toBe("Quero vender meu notebook");
    const miolo = JSON.stringify(PAGINAS.consignacao.secoes);
    expect(miolo).toContain("vender notebook usado em Campinas");
    expect(PAGINAS.pcgamer.seo.titulo).toContain("PC Gamer em Campinas");
    expect(PAGINAS.pcgamer.hero.titulo).toContain("PC Gamer em Campinas");
  });

  it("nenhuma página de captação ainda aponta para /telaiphone", () => {
    for (const pagina of Object.values(PAGINAS)) {
      expect(JSON.stringify(pagina), pagina.slug).not.toContain('"/telaiphone"');
    }
  });
});
