import { describe, it, expect } from "vitest";
import { lerArmazenamento, lerPlaca, lerRam, MEMORIAS_DE_VIDEO } from "@/lib/vitrine/pecas-do-nome";
import { extractParts } from "@/lib/vitrine/core";

// Nomes reais do catálogo (25/10).
const casos: { nome: string; placa: string; ram: string; ssd: string }[] = [
  {
    // O caso que o Thiago viu na vitrine: virava "RTX 3050 16GB".
    nome: 'PC Gamer Completo Apex Series, Amd Ryzne 5 5600gt, Geforce RTX 3050, 16gb Ddr4, SSD 512gb M.2, Monitor LED 24" 180hz, Preto Sas013',
    placa: "NVIDIA GeForce RTX 3050",
    ram: "16GB DDR4",
    ssd: "SSD 512GB NVMe",
  },
  {
    nome: 'PC Gamer Completo Skill Apex Series, Amd Ryzen 5 5500, Geforce RTX 3050, 16gb Ddr4, SSD 256gb M.2, Monitor LED 24" 180hz, Branco Sas022',
    placa: "NVIDIA GeForce RTX 3050",
    ram: "16GB DDR4",
    ssd: "SSD 256GB NVMe",
  },
  {
    nome: 'PC Gamer Completo Skill Intel Core i5 12400f, 16gb, RTX 3060 12gb, SSD 512gb M.2, + Monitor 27" Ips 100hz - Sk27016',
    placa: "NVIDIA GeForce RTX 3060 12GB",
    ram: "16GB",
    ssd: "SSD 512GB NVMe",
  },
  {
    nome: 'PC Gamer Completo New G Ryzen 5 5600gt, 16gb, Radeon Rx 6600 8GB, SSD M2 1TB, Monitor 24" 180hz - Skr12',
    placa: "AMD Radeon RX 6600 8GB",
    ram: "16GB",
    ssd: "SSD 1TB NVMe",
  },
  {
    // Placa com memória que não existe no anúncio do fornecedor: descarta.
    nome: 'PC Gamer Intel Core i7 6700, RTX 2060 4gb, 16gb, SSD 1TB, Monitor LED 21,5", WINDOWS 10 Pro Preto 3ggw24',
    placa: "NVIDIA GeForce RTX 2060",
    ram: "16GB",
    ssd: "SSD 1TB",
  },
  {
    // Placa que só existe em uma versão: completa com a memória certa.
    nome: "PC Gamer Completo Bluepc Frag, Amd Ryzen 5 7500f Am5, Radeon Rx 6600, B650, 16gb Ddr5, SSD 512gb Nvme, Monitor 23\" 75hz",
    placa: "AMD Radeon RX 6600 8GB",
    ram: "16GB DDR5",
    ssd: "SSD 512GB NVMe",
  },
  {
    nome: "PC Gamer Ryzen 5 5500, Rtx 3060 12GB, 16GB, DDR4, SSD 480GB, 600w 80 Plus",
    placa: "NVIDIA GeForce RTX 3060 12GB",
    ram: "16GB DDR4",
    ssd: "SSD 480GB",
  },
  {
    nome: "PC Gamer Intel i5-12400f | Gtx 550ti 4gb Ddr5 | 16gb Ram | SSD 512gb M.2 + Hd 1TB",
    placa: "NVIDIA GeForce GTX 550 TI",
    // O "Ddr5" desse anúncio é da placa: a RAM fica sem tipo, não inventa.
    ram: "16GB",
    ssd: "SSD 512GB NVMe",
  },
  {
    nome: "PC Gamer Completo Ryzen 5 5600 Gpu Gt730 SSD 256gb 8GB Ram Win11",
    placa: "NVIDIA GeForce GT 730",
    ram: "8GB",
    ssd: "SSD 256GB",
  },
];

describe("ler as peças do nome do produto", () => {
  for (const c of casos) {
    it(c.nome.slice(0, 70), () => {
      expect(lerPlaca(c.nome)?.nome).toBe(c.placa);
      expect(lerRam(c.nome)).toBe(c.ram);
      expect(lerArmazenamento(c.nome)).toBe(c.ssd);
    });
  }

  it("nunca mostra memória de placa que não existe", () => {
    for (const c of casos) {
      const p = lerPlaca(c.nome);
      if (p?.memoria && MEMORIAS_DE_VIDEO[p.chave]) {
        expect(MEMORIAS_DE_VIDEO[p.chave]).toContain(p.memoria);
      }
    }
    expect(lerPlaca("RTX 3050 16GB")?.memoria).toBeNull();
    expect(lerPlaca("RTX 3050 8GB")?.memoria).toBe(8);
    expect(lerPlaca("RTX 3050 6gb")?.memoria).toBe(6);
    expect(lerPlaca("RX 7600 XT 16GB")?.nome).toBe("AMD Radeon RX 7600 XT 16GB");
    expect(lerPlaca("RTX 4070 Ti Super")?.memoria).toBe(16);
  });

  it("a página do setup recebe as peças certas", () => {
    const p = extractParts(casos[0].nome);
    expect(p.placa_video).toBe("NVIDIA GeForce RTX 3050");
    expect(p.memoria_ram).toBe("16GB DDR4");
    expect(p.armazenamento).toBe("SSD 512GB NVMe");
    expect(p.processador).toBe("Ryzen 5 5600gt");
  });
});
