import { describe, expect, it } from "vitest";
import { conflitoDeDetalhe, quantidadeDoNome, plataformasDoNome } from "@/lib/precos/conflitos-de-foto";
import { semelhanca, semelhancaIlustrativa, NOTA_MINIMA } from "@/lib/precos/fotos";
import { estaRecusada, normalizarFoto, semFotosRecusadas } from "@/lib/precos/fotos-recusadas";

// Casos reais da auditoria de fotos de 12/10/2026.
describe("conflitos de detalhe entre o nome e o anúncio da foto", () => {
  it("air cooler nunca pega foto de water cooler (o caso que abriu a auditoria)", () => {
    expect(conflitoDeDetalhe("Cooler para Processador Redragon Effect CC2000", "Water Cooler Redragon Effect Ccw-3017 360mm ARGB Preto")).not.toBeNull();
    expect(semelhanca("Cooler para Processador Redragon Effect CC2000", "Water Cooler Redragon Effect Ccw-3017 360mm ARGB Preto")).toBe(0);
    expect(semelhancaIlustrativa("Cooler para Processador Redragon Effect CC2000", "Water Cooler Redragon Effect Ccw-3017 360mm ARGB Preto")).toBe(0);
  });

  it("outro tipo de produto", () => {
    expect(conflitoDeDetalhe("Capa para Controle Xbox 360 Camuflada", "Controle Com Fio Compativel Com Video Game XBOX 360")).toBe("outro tipo de produto");
    expect(conflitoDeDetalhe("Adesivo para PS5", "Pasta Térmica Snowdog Husky 3g Adesivo Processador")).toBe("outro tipo de produto");
  });

  it("outra marca ou marca não confirmada", () => {
    expect(conflitoDeDetalhe("Cabo de Rede Cat5 Exbom 2 Metros", "Cabo De Rede Furukawa Sohoplus Cat5 Branco 24awg 2 Metros")).not.toBeNull();
    expect(conflitoDeDetalhe("Bateria Flex CR2032 3V", "Bateria Cr2032 Litio 3v")).not.toBeNull();
    expect(conflitoDeDetalhe("Carregador Veicular Kaidi Turbo com Cabo Lightning KD 302A", "Carregador Veicular Hrebos Cabo Lightning Iphone Turbo")).not.toBeNull();
  });

  it("outro modelo da mesma linha", () => {
    expect(conflitoDeDetalhe("Cabo V8 Kaidi KD 305 1 Metro", "Cabo De Dados Kaidi KD 330M USB X Micro USB V8 1 Metro")).toMatch(/outro modelo/);
    expect(conflitoDeDetalhe("Suporte Celular Tomate MTG 098", "Suporte Veicular Para Celular 2 Em 1 Tomate Mtg 099")).toMatch(/outro modelo/);
  });

  it("medida, capacidade e versão", () => {
    expect(conflitoDeDetalhe("Cabo Tipo C Kaidi KD 330C 2 metros", "Cabo De Dados Kaidi KD 330C USB Tipo C 3 Metros")).toMatch(/medida/);
    expect(conflitoDeDetalhe("Pen Drive Chaveiro Hmaston 32GB HM-UF32", "Pen Drive Chaveiro Hmaston 128GB HM-UF128")).not.toBeNull();
    expect(conflitoDeDetalhe("SSD Externo Sandisk 1TB USB-C", "SSD Externo Sandisk 500GB USB-C")).toMatch(/capacidade/);
    expect(conflitoDeDetalhe("Robô Aspirador Xiaomi S40 Branco", "Robô Aspirador Xiaomi S40 Pro Branco")).toMatch(/versão/);
  });

  it("quantidade", () => {
    expect(quantidadeDoNome("Pilha AA Philips Alcalina com 2 Unidades")).toBe(2);
    expect(quantidadeDoNome("Pilha Alcalina Philips Aa C/ 4 Unidades")).toBe(4);
    expect(quantidadeDoNome("4 Suporte De Pilhas Controle XBOX 360")).toBe(4);
    expect(quantidadeDoNome("Webcam C270 Hd 720p Logitech")).toBe(1);
    expect(conflitoDeDetalhe("Pilha AA Philips Alcalina com 2 Unidades", "Pilha Alcalina Philips AA C/ 4 Unidades")).toBe("quantidade diferente");
  });

  it("plataforma", () => {
    expect([...plataformasDoNome("Película de Vidro Switch")]).toEqual(["sw"]);
    expect([...plataformasDoNome("Película De Vidro Para Nintendo Switch 2")]).toEqual(["sw2"]);
    expect(conflitoDeDetalhe("Película de Vidro Switch", "Película De Vidro Antirreflexo Para Nintendo Switch 2")).toBe("outra plataforma");
  });

  it("conectores trocados", () => {
    expect(conflitoDeDetalhe("Adaptador P10 Fêmea para P2 Macho", "Adaptador P10 Macho Para P2 Fêmea")).toBe("conectores trocados");
    expect(conflitoDeDetalhe("Adaptador P2 Fêmea para P10 Macho", "Adaptador P10 Macho Para P2 Fêmea")).toBeNull();
  });

  it("a foto do mesmo produto continua passando", () => {
    expect(semelhanca("Cabo Lightning Kaidi KD 306 1 metro", "Cabo Kaidi Usb X Lightning Iphone Carga Rápida 1m Kd 306")).toBeGreaterThanOrEqual(NOTA_MINIMA);
    expect(semelhanca("Cartucho Hp 934 Preto", "Cartucho De Tinta Hp 934 C2p19ab Preto")).toBeGreaterThanOrEqual(NOTA_MINIMA);
  });
});

describe("fotos recusadas", () => {
  const recusadas = new Map([["ts-1", new Set(["https://x/foto-errada.jpg"])]]);

  it("compara sem o #ilustrativa", () => {
    expect(normalizarFoto("https://x/foto-errada.jpg#ilustrativa")).toBe("https://x/foto-errada.jpg");
    expect(estaRecusada(recusadas, "ts-1", "https://x/foto-errada.jpg#ilustrativa")).toBe(true);
    expect(estaRecusada(recusadas, "ts-2", "https://x/foto-errada.jpg")).toBe(false);
  });

  it("item da fonte com a foto recusada entra sem foto (sem promover a galeria)", () => {
    const item = { codigo: "ts-1", foto: "https://x/foto-errada.jpg", fotos: ["https://x/foto-errada.jpg", "https://x/outra.jpg"] };
    expect(semFotosRecusadas(item, recusadas)).toMatchObject({ foto: "", fotos: [] });
    const outro = { codigo: "ts-1", foto: "https://x/certa.jpg", fotos: ["https://x/certa.jpg", "https://x/foto-errada.jpg"] };
    expect(semFotosRecusadas(outro, recusadas).fotos).toEqual(["https://x/certa.jpg"]);
  });
});
