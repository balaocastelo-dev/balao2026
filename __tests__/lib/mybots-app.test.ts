import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { repetirSemSom } from "@/app/mybots-app/PlayerDoComercial";
import { ehHostSoubots, hostLimpo, URL_PAINEL, URL_SITE } from "@/lib/soubots";

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
    const player = ler("app/mybots-app/PlayerDoComercial.tsx");
    expect(pagina).toContain('href={APK}');
    expect(pagina).toContain('download="MyBots.apk"');
    expect(pagina).toContain('const APK = "/downloads/MyBots.apk"');
    expect(pagina).toContain('const VIDEO = "/mybots-app/comercial.mp4"');
    expect(pagina).toContain("<PlayerDoComercial");
    expect(player).toContain("playsInline");
    expect(player).toContain('setAttribute("playsinline", "")');
    expect(player).toContain("controls");
    expect(player).toContain("onEnded");
    expect(player).not.toContain("muted={true}");
    expect(player).not.toContain("loop={true}");
    expect(pagina).toContain("Seus bots");
    expect(pagina).toContain("100% grátis");
    expect(pagina).toContain("Baixar APK para Android");
    expect(pagina).toContain("fontes desconhecidas");
    expect(pagina).toContain("Balão da Informática Anchieta");
    expect(pagina).toContain("Grátis para sempre");
    expect(pagina).toContain("5519987510267");
    expect(pagina).toContain("(19) 98751-0267");
    expect(pagina).toContain('const LOGO = "/mybots-app/logo.png"');
    expect(pagina).toContain("/mybots-app/telas/lista.jpg");
    expect(pagina).toContain("/mybots-app/telas/pc.jpg");
    expect(pagina).toContain("/mybots-app/telas/celular.jpg");
    expect(pagina).toContain("/mybots-app/telas/trabalho.jpg");
    expect(pagina).toContain("/mybots-app/telas/arquivos.jpg");
    expect(existsSync(path.join(raiz, "public/mybots-app/logo.png"))).toBe(true);
    expect(existsSync(path.join(raiz, "app/mybots-app/icon.png"))).toBe(true);
  });

  it("depois da primeira passagem, repete do começo, mudo e em loop", async () => {
    const video = {
      muted: false,
      defaultMuted: false,
      loop: false,
      currentTime: 20.5,
      play: vi.fn(async () => {}),
    };
    await repetirSemSom(video);
    expect(video.muted).toBe(true);
    expect(video.defaultMuted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.currentTime).toBe(0);
    expect(video.play).toHaveBeenCalledOnce();
  });

  it("só o soubots.com abre a landing na raiz", () => {
    expect(ehHostSoubots("soubots.com")).toBe(true);
    expect(ehHostSoubots("www.soubots.com")).toBe(true);
    expect(URL_SITE).toBe("https://www.soubots.com");
    expect(URL_PAINEL).toBe("https://app.soubots.com");
    expect(ehHostSoubots("Soubots.com:443")).toBe(true);
    expect(ehHostSoubots("www.soubots.com, outro")).toBe(true);
    expect(ehHostSoubots("www.balao.info")).toBe(false);
    expect(ehHostSoubots("balao.info")).toBe(false);
    expect(ehHostSoubots("soubots.com.evil.com")).toBe(false);
    expect(ehHostSoubots("nao-soubots.com")).toBe(false);
    expect(ehHostSoubots("localhost")).toBe(false);
    expect(ehHostSoubots("")).toBe(false);
    expect(hostLimpo("WWW.SOUBOTS.COM:3456")).toBe("www.soubots.com");

    const proxy = ler("proxy.ts");
    expect(proxy).toContain("ehHostSoubots");
    expect(proxy).toContain("destino.pathname = '/mybots-app'");
    expect(proxy).toContain("pathname === '/'");
    expect(ler("app/layout.tsx")).toContain("soubots-raiz");
    expect(ler("app/globals.css")).toContain("html.soubots-raiz [data-loja]");
    expect(ler("components/LayoutWrapper.tsx")).toContain("data-loja");

    const pagina = ler("app/mybots-app/page.tsx");
    expect(pagina).toContain('const VIDEO = "/mybots-app/comercial.mp4"');
    expect(pagina).toContain('const POSTER = "/mybots-app/poster.jpg"');
    expect(pagina).toContain('const APK = "/downloads/MyBots.apk"');
    expect(pagina).toContain('href={APK}');
    expect(pagina).toContain("<PlayerDoComercial");
    expect(pagina).toContain("canonical: URL_PAGINA");
    expect(pagina).toContain("url: URL_PAGINA");
    expect(pagina).toContain("const URL_PAGINA = URL_SITE");
    expect(pagina).toContain("href={URL_PAINEL}");
    expect(pagina).toContain("Já tenho conta — Entrar");
    expect(pagina).toMatch(/>\s*Entrar\s*</);
    const sitemap = ler("app/sitemap.ts");
    expect(sitemap).toContain("URL_SITE");
    expect(sitemap).not.toContain("'/mybots-app'");
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
