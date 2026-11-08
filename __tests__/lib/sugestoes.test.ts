import { describe, expect, it } from "vitest";
import {
  compativel,
  ehAcessorio,
  escolherSugestoes,
  montarBase,
  planoDeSugestoes,
  caminhosDoPlano,
  soquete,
} from "@/lib/catalogo/sugestoes";
import type { Product } from "@/lib/utils";

let n = 0;
const p = (name: string, price: string, category: string, extra: Partial<Product> = {}): Product => ({
  id: String(++n),
  name,
  price,
  category,
  image: `https://www.balao.info/fotos-produtos/${n}.webp`,
  slug: `p-${n}`,
  ...extra,
});

describe("planoDeSugestoes", () => {
  it("procura parecidos na categoria de cima, mas nunca na raiz", () => {
    expect(planoDeSugestoes("Computadores/PC/Computador Desktop").escopo).toBe("Computadores/PC");
    expect(planoDeSugestoes("Hardware/Gabinetes").escopo).toBe("Hardware/Gabinetes");
  });

  it("usa a regra mais específica (PC Gamer antes de PC)", () => {
    const gamer = planoDeSugestoes("Computadores/PC/PC Gamer/PC Gamer Completo");
    expect(gamer.combina[0].caminhos).toContain("Computadores/Monitores/Monitor Gamer");
    const desktop = planoDeSugestoes("Computadores/PC/Computador Desktop");
    expect(desktop.combina[0].caminhos).toContain("Computadores/Monitores/Monitor Office");
    expect(caminhosDoPlano(desktop)).toContain("Computadores/PC");
  });

  it("categoria sem regra não tem 'combina'", () => {
    expect(planoDeSugestoes("Impressão/Toners").combina).toHaveLength(0);
  });
});

describe("escolherSugestoes", () => {
  const produto = p("Computador TOB Intel Core i3 4ª Geração SSD 120GB Memória 4GB", "1.229,98", "Computadores/PC/Computador Desktop");
  const catalogo = [
    produto,
    p("Computador TOB Intel Core i5 4ª Geração SSD 120GB Memória 4GB", "1.439,98", "Computadores/PC/Computador Desktop"),
    p("Computador TOB Intel Core i3 4ª Geração SSD 120GB Memória 4GB", "1.229,98", "Computadores/PC/Computador Desktop"), // mesmo nome
    p("Computador Slim Intel Core i3 4ª Geração SSD 120GB", "1.373,98", "Computadores/PC/Computador Mini PC", { availability: "Pronta entrega" }),
    p("PC Gamer Ryzen 7 RTX 4070 32GB", "9.999,00", "Computadores/PC/PC Gamer"), // longe no preço
    p("Computador sem foto i3", "1.200,00", "Computadores/PC/Computador Desktop", { image: "/produto-sem-foto.svg" }),
    p("Computador esgotado i3", "1.200,00", "Computadores/PC/Computador Desktop", { availability: "Indisponível" }),
    p("Monitor Led 19 Enterprise", "389,98", "Computadores/Monitores/Monitor Office"),
    p("Monitor Gamer 49 OLED", "9.000,00", "Computadores/Monitores/Monitor Gamer"),
    p("Kit Teclado e Mouse Office", "95,98", "Periféricos/Kit Teclado e Mouse"),
    p("Nobreak 600VA", "359,09", "Energia/Protetor Eletrônico/Nobreak"),
  ];
  const plano = planoDeSugestoes(produto.category);
  const s = escolherSugestoes(produto, montarBase(catalogo, plano), plano);

  it("parecidos: perto no preço, sem o próprio, sem repetido, sem foto ou esgotado", () => {
    const nomes = s.parecidos.map((x) => x.name);
    expect(nomes).toContain("Computador TOB Intel Core i5 4ª Geração SSD 120GB Memória 4GB");
    expect(nomes).toContain("Computador Slim Intel Core i3 4ª Geração SSD 120GB");
    expect(nomes.some((x) => x.includes("RTX 4070"))).toBe(false);
    expect(nomes.some((x) => /sem foto|esgotado/.test(x))).toBe(false);
    expect(s.parecidos.every((x) => x.id !== produto.id)).toBe(true);
    expect(nomes.filter((x) => x === produto.name)).toHaveLength(0);
  });

  it("combina: um de cada grupo, o monitor de preço compatível com o PC", () => {
    const nomes = s.combina.map((x) => x.name);
    expect(nomes[0]).toBe("Monitor Led 19 Enterprise");
    expect(nomes).toContain("Kit Teclado e Mouse Office");
    expect(nomes).toContain("Nobreak 600VA");
  });

  it("guarda no cache só os campos do card", () => {
    const base = montarBase(catalogo, plano);
    expect(Object.keys(base.parecidos[0])).not.toContain("description");
  });
});

describe("PC que já vem com monitor e periféricos", () => {
  it("não sugere o que já vem no kit", () => {
    const pc = p(
      "PC Computador Gamer Completo Intel i5 8GB SSD 120GB Monitor Teclado Mouse Headset Mouse Pad Wi-Fi",
      "2.500,00",
      "Computadores/PC/PC Gamer/PC Gamer Completo"
    );
    const catalogo = [
      pc,
      p("Monitor Gamer LG 22", "585,19", "Computadores/Monitores/Monitor Gamer"),
      p("Teclado Gamer Redragon", "120,00", "Periféricos/Teclados"),
      p("Mouse Gamer Redragon", "80,00", "Periféricos/Mouses"),
      p("Headset Gamer Husky", "110,00", "Áudio/Headset"),
      p("Mouse Pad Gamer Grande", "40,00", "Periféricos/Mousepads"),
      p("Cadeira Gamer Husky Storm", "560,00", "Espaço Gamer/Cadeiras Gamer/Husky Gaming"),
      p("Nobreak 600VA", "359,09", "Energia/Protetor Eletrônico/Nobreak"),
    ];
    const plano = planoDeSugestoes(pc.category);
    const nomes = escolherSugestoes(pc, montarBase(catalogo, plano), plano).combina.map((x) => x.name);
    expect(nomes).toEqual(["Cadeira Gamer Husky Storm", "Nobreak 600VA"]);
  });

  it("PC só com o gabinete continua recebendo monitor, teclado e mouse", () => {
    const pc = p("PC Gamer Ryzen 5 5600 RTX 4060 16GB SSD 1TB", "4.800,00", "Computadores/PC/PC Gamer");
    const catalogo = [
      pc,
      p("Monitor Gamer LG 24", "900,00", "Computadores/Monitores/Monitor Gamer"),
      p("Mouse Gamer Redragon", "80,00", "Periféricos/Mouses"),
    ];
    const plano = planoDeSugestoes(pc.category);
    const nomes = escolherSugestoes(pc, montarBase(catalogo, plano), plano).combina.map((x) => x.name);
    expect(nomes).toContain("Monitor Gamer LG 24");
    expect(nomes).toContain("Mouse Gamer Redragon");
  });
});

describe("compativel", () => {
  const proc = (nome: string) => ({ name: nome, category: "Hardware/Processadores/Processador AMD" });
  const placa = (nome: string, cat = "Hardware/Placas-mãe/Placa-Mãe AMD") => ({ name: nome, category: cat });
  const mem = (nome: string) => ({ name: nome, category: "Hardware/Memória RAM/DDR 4" });

  it("deduz o soquete do nome, do modelo e do chipset", () => {
    expect(soquete("Processador AMD Ryzen 5 5500, 3.6GHz")).toBe("am4");
    expect(soquete("Processador AMD Ryzen 5 8400F")).toBe("am5");
    expect(soquete("Processador Intel Core i5-12400F")).toBe("1700");
    expect(soquete("Processador Intel Core i7 4790 OEM")).toBe("1150");
    expect(soquete("Placa-Mãe Husky Nexus B550, M.2 NVMe, DDR4")).toBe("am4");
    expect(soquete("Placa Mãe Tob H61 1155 DDR3")).toBe("1155");
    expect(soquete("Placa Mãe MSI PRO H610M-S DDR4")).toBe("1700");
  });

  it("placa-mãe só do mesmo soquete do processador", () => {
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), placa("Placa-Mãe ASUS A520M-E, AM4"))).toBe(true);
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), placa("Placa-Mãe ASUS B650, AM5"))).toBe(false);
    expect(compativel(proc("Processador AMD A6-7480 FM2+"), placa("Placa Mãe Tob H61 1155", "Hardware/Placas-mãe/Placa-Mãe Intel"))).toBe(false);
    // soquete do produto conhecido e o da placa não: fica de fora
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), placa("Placa-Mãe genérica ATX"))).toBe(false);
  });

  it("memória: geração do soquete, e nunca de notebook", () => {
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), mem("Memória DDR4 8GB 3200"))).toBe(true);
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), mem("Memória DDR3 8GB 1600"))).toBe(false);
    expect(compativel(proc("Processador AMD Ryzen 5 5500"), mem("Memória Notebook DDR4 8GB"))).toBe(false);
    expect(compativel({ name: "Processador Intel Core i5-12400F", category: "Hardware/Processadores/Processador Intel" }, mem("Memoria DDR3 8GB"))).toBe(false);
  });

  it("acessório de iPhone de outro modelo não entra", () => {
    const iphone = { name: "iPhone 17 Pro Apple 256GB", category: "Celular & Smartphone/Smartphones/iPhone/IPhone 17" };
    expect(compativel(iphone, { name: "Carregador para iPhone 16", category: "Celular & Smartphone/Carregadores e Power Banks" })).toBe(false);
    expect(compativel(iphone, { name: "Carregador USB-C 20W Apple", category: "Celular & Smartphone/Carregadores e Power Banks" })).toBe(true);
  });

  it("reconhece categoria de acessório", () => {
    expect(ehAcessorio("Hardware/Placa de vídeo (VGA)/Acessórios")).toBe(true);
    expect(ehAcessorio("Espaço Gamer/Cadeiras Gamer/Acessórios")).toBe(true);
    expect(ehAcessorio("Celular & Smartphone/Acessórios para Smartphones")).toBe(false);
    expect(ehAcessorio("Hardware/Gabinetes")).toBe(false);
  });
});
