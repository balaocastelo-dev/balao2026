import { describe, it, expect } from "vitest";
import { candidatos, cpuCurta, diaDeHoje, escolherDoDia, placaBoa, placaDedicada, processadorAtual, setupDoProduto } from "@/lib/vitrine/rotativa";
import { paginasDaVitrine } from "@/lib/vitrine/assinadas";
import { fotoDaPeca } from "@/lib/vitrine/fotos-pecas";
import type { Product } from "@/lib/utils";

let n = 0;
const pc = (name: string, price: string, extra: Partial<Product> = {}): Product => ({
  id: `pc${++n}`,
  name,
  price,
  image: `https://exemplo/${n}.jpg`,
  category: "Computadores/PC/PC Gamer/PC Gamer Completo",
  slug: `pc-${n}`,
  ...extra,
});

// Catálogo de mentira: 3 por faixa de preço, todos válidos, CPUs diferentes.
const cpus = ["Ryzen 5 5500", "Ryzen 5 5600GT", "Intel Core i5 12400F", "Ryzen 7 5700X", "Intel Core i5 10400F"];
const placas = ["RX 6600 8GB", "RTX 3050", "RTX 3060 12gb"];
const catalogo: Product[] = [];
for (let f = 0; f < 5; f++)
  for (let j = 0; j < 3; j++)
    catalogo.push(pc(`PC Gamer Completo ${cpus[f]}, ${placas[j]}, 16gb Ddr4, SSD 512gb, Monitor 24" 180hz`, `${5 + f}.${200 + j * 300},00`));

describe("vitrine rotativa", () => {
  it("só aceita placa dedicada, com monitor e dentro da faixa", () => {
    const fora = [
      pc("PC Gamer Ryzen 5 5600G Radeon Vega 7, Monitor 23\"", "6.000,00"),
      pc("PC Gamer Ryzen 5 5500, RTX 3050, SSD 512gb", "7.000,00"),
      pc("PC Gamer Ryzen 5 5500, RTX 3050, Monitor 24\"", "10.500,00"),
      pc("PC Gamer Ryzen 5 5500, RTX 3050, Monitor 24\"", "4.900,00"),
    ];
    expect(candidatos(fora)).toHaveLength(0);
    expect(placaDedicada("PC com Radeon Rx 6600 8GB")).toBe("RX 6600");
    expect(placaDedicada("Geforce RTX 3060 Ti")).toBe("RTX 3060 TI");
  });

  it("deixa de fora PC fraco para a faixa de preço", () => {
    expect(placaBoa("RX 6500 XT")).toBe(false);
    expect(placaBoa("GTX 1650")).toBe(false);
    expect(placaBoa("RTX 2060")).toBe(true);
    expect(placaBoa("RX 6600")).toBe(true);
    expect(processadorAtual("PC Gamer Intel Core i7 6700, RTX 2060")).toBe(false);
    expect(processadorAtual("Computador PC Gamer I5 4ª 16gb Ram Rx 6600")).toBe(false);
    expect(processadorAtual("Pc Gamer Ryzen 5 2400g Rx 6600")).toBe(false);
    expect(processadorAtual("PC Gamer i5 12400f RTX 3060")).toBe(true);
    expect(processadorAtual("Computador Gamer Intel i9 11ª 16gb Ram, RTX 2060")).toBe(true);
    expect(processadorAtual("PC Gamer Ryzen 7 5700g, RX 6600")).toBe(true);
  });

  it("escreve o processador do jeito certo", () => {
    expect(cpuCurta("PC Gamer Completo Intel Core i5 12400f, RTX 3060")).toBe("Core i5 12400F");
    expect(cpuCurta("New G Ryzen 7 5700g, 16gb")).toBe("Ryzen 7 5700G");
    expect(cpuCurta("Computador Gamer Intel i9 11ª 16gb Ram")).toBe("Core i9 11ª geração");
  });

  it("escolhe cinco, um por faixa, do mais barato ao mais caro", () => {
    const hoje = escolherDoDia(catalogo, "2026-10-25");
    expect(hoje).toHaveLength(5);
    const precos = hoje.map((p) => Number(p.price.replace(/\./g, "").replace(",", ".")));
    expect(precos).toEqual([...precos].sort((a, b) => a - b));
    expect(new Set(precos.map((v) => Math.floor(v / 1000))).size).toBe(5);
  });

  it("o mesmo dia dá a mesma vitrine e o dia seguinte muda", () => {
    const ids = (dia: string) => escolherDoDia(catalogo, dia).map((p) => p.id).join(",");
    expect(ids("2026-10-25")).toBe(ids("2026-10-25"));
    const dias = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"];
    expect(dias.some((d) => ids(d) !== ids("2026-10-25"))).toBe(true);
  });

  it("prefere pronta entrega dentro da faixa", () => {
    const comPronta = [...catalogo, pc("PC Gamer Ryzen 5 4500, RTX 2060, Monitor 23\"", "5.900,00", { availability: "Pronta entrega" })];
    for (const dia of ["2026-10-25", "2026-11-03", "2026-12-01"]) {
      expect(escolherDoDia(comPronta, dia)[0].availability).toBe("Pronta entrega");
    }
  });

  it("o dia vira no horário de Brasília", () => {
    expect(diaDeHoje(new Date("2026-10-26T02:30:00Z"))).toBe("2026-10-25");
    expect(diaDeHoje(new Date("2026-10-26T03:30:00Z"))).toBe("2026-10-26");
  });

  it("título e frase só com o que está no nome", () => {
    const s = setupDoProduto(pc("PC Gamer Completo Skill Intel Core i5 12400f, 16gb, RTX 3060 12gb, SSD 1TB, Monitor 27\" Ips 100hz", "9.900,00"), "2026-10-25");
    expect(s.titulo).toContain("RTX 3060");
    expect(s.titulo).toContain('27"');
    expect(s.chamada).toContain("12 GB");
    expect(s.chamada).toContain("27 polegadas");
    expect(s.slug).toMatch(/^setup-pc\d+$/);
  });

  it("monta as cinco páginas do dia", async () => {
    const paginas = await paginasDaVitrine(async () => catalogo, async () => null, new Date("2026-10-25T15:00:00Z"));
    expect(paginas).toHaveLength(5);
    expect(paginas.every((p) => p.status === "publicada" && p.slug.startsWith("setup-"))).toBe(true);
  });
});

describe("foto ilustrativa das peças", () => {
  const vgas = [
    pc("Placa de Vídeo Asus Radeon RX 6600 XT 8GB", "2.000,00", { image: "https://f/6600xt.jpg" }),
    pc("Placa de Vídeo Gigabyte Radeon RX 6600 Eagle 8GB", "1.600,00", { image: "https://f/6600.jpg" }),
  ];
  it("acha a placa certa e marca como ilustrativa", () => {
    expect(fotoDaPeca("gpu", "Radeon RX 6600 8GB", vgas)).toBe("https://f/6600.jpg#ilustrativa");
  });
  it("acha o processador pelo modelo", () => {
    const cpusCat = [pc("Processador AMD Ryzen 5 5600", "800,00", { image: "https://f/5600.jpg" }), pc("Processador AMD Ryzen 5 5500, AM4", "600,00", { image: "https://f/5500.jpg" })];
    expect(fotoDaPeca("cpu", "AMD Ryzen 5 5500", cpusCat)).toBe("https://f/5500.jpg#ilustrativa");
  });
  it("sem catálogo, devolve vazio (a página usa outra foto)", () => {
    expect(fotoDaPeca("gpu", "RTX 3050", [])).toBe("");
  });
});
