import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = path.resolve(__dirname, "../..");

const ler = (relativo: string) => fs.readFileSync(path.join(RAIZ, relativo), "utf8");

describe("destaque do Predator Helios 300 na home", () => {
  it("entra acima do PlayStation 5 e só na vitrine, sem busca", () => {
    const pagina = ler("app/page.tsx");
    const predator = pagina.indexOf("<HomePredatorHeliosDestaque />");
    const ps5 = pagina.indexOf("<HomePs5Gta6Destaque />");
    expect(predator).toBeGreaterThan(-1);
    expect(ps5).toBeGreaterThan(predator);
    expect(pagina).toContain(
      "1.09 Destaque: Acer Predator Helios 300 seminovo (R$ 4.499 à vista ou 12x de R$ 449)"
    );
    const miolo = pagina.slice(predator - 80, predator);
    expect(miolo).toContain("!navegando");
  });

  it("anuncia o seminovo no WhatsApp, com preço, garantia e condição usada", () => {
    const bloco = ler("components/HomePredatorHeliosDestaque.tsx");
    expect(bloco).toContain("SITE_CONFIG.whatsapp.number");
    expect(bloco).toContain(
      "Olá! Quero o Notebook Acer Predator Helios 300 seminovo (i7-11800H, 16GB, SSD 512GB, RTX 3060 6GB), por R$ 4.499 à vista ou 12x de R$ 449."
    );
    expect(bloco).toContain("R$ 4.499");
    expect(bloco).toContain("ou 12x de R$ 449");
    expect(bloco).toContain("6 meses de garantia da loja");
    expect(bloco).toContain("Windows 11 trial");
    expect(bloco).toContain("Office 2019 trial");
    expect(bloco).toContain("https://schema.org/UsedCondition");
    expect(bloco).not.toContain("NewCondition");
    expect(bloco).toContain('"4499.00"');
    expect(bloco).toContain("Balão da Informática Anchieta");
    expect(bloco).not.toMatch(/Castelo/i);
    expect(bloco).not.toMatch(/\/product\//);
    expect(bloco).toContain("/images/destaque-predator/helios-300-ph315-54.webp");
    expect(bloco).toContain("/images/destaque-predator/fundo-helios-300.webp");
    expect(bloco).toContain('aria-labelledby="destaque-predator-helios"');
    expect(fs.existsSync(path.join(RAIZ, "public/images/destaque-predator/helios-300-ph315-54.webp"))).toBe(
      true
    );
    expect(fs.existsSync(path.join(RAIZ, "public/images/destaque-predator/fundo-helios-300.webp"))).toBe(true);
  });
});
