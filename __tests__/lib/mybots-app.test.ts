import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const raiz = process.cwd();

function ler(relativo: string) {
  return readFileSync(path.join(raiz, relativo), "utf8");
}

describe("landing /mybots-app", () => {
  it("não toma o lugar do rewrite do Hub em /mybots", () => {
    const config = ler("next.config.ts");
    expect(config).toMatch(/source:\s*"\/mybots"/);
    expect(config).toMatch(/source:\s*"\/mybots\/:caminho\*"/);
    expect(config).toContain("trycloudflare.com/mybots/");
    expect(config).toContain("trycloudflare.com/mybots/:caminho*");
    expect(config).not.toMatch(/source:\s*"\/mybots-app/);
    expect(existsSync(path.join(raiz, "app/mybots/page.tsx"))).toBe(false);
    expect(existsSync(path.join(raiz, "public/mybots"))).toBe(false);
  });

  it("oferece o APK no botão e o comercial no player", () => {
    const pagina = ler("app/mybots-app/page.tsx");
    expect(pagina).toContain('href={APK}');
    expect(pagina).toContain('download="MyBots.apk"');
    expect(pagina).toContain('const APK = "/downloads/MyBots.apk"');
    expect(pagina).toContain('const VIDEO = "/mybots-app/comercial.mp4"');
    expect(pagina).toContain("playsInline");
    expect(pagina).toContain("controls");
    expect(pagina).toContain("Seus bots");
    expect(pagina).toContain("100% grátis");
    expect(pagina).toContain("Baixar APK para Android");
    expect(pagina).toContain("fontes desconhecidas");
    expect(pagina).toContain("Balão da Informática Anchieta");
    expect(pagina).toContain("Grátis para sempre");
  });

  it("publica o apk e o vídeo de verdade", () => {
    const apk = path.join(raiz, "public/downloads/MyBots.apk");
    const video = path.join(raiz, "public/mybots-app/comercial.mp4");
    expect(statSync(apk).size).toBeGreaterThan(1_000_000);
    expect(statSync(video).size).toBeGreaterThan(1_000_000);
    const cabeca = readFileSync(apk).subarray(0, 2).toString();
    expect(cabeca).toBe("PK");
  });
});
