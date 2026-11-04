import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { repetirSemSom } from "@/app/mybots-app/PlayerDoComercial";
import { arquivoPublicoExiste, midiaDoSlot } from "@/lib/mybots-arquivos";
import {
  DESCRICAO,
  H1,
  PERGUNTAS,
  SLOTS_DE_VIDEO,
  TITULO,
  URL_APK,
  URL_INSTALADOR_WINDOWS,
  balancoDoHero,
  deslocamentoDaAmeba,
  jsonLdDaLanding,
} from "@/lib/mybots-landing";
import { ehHostSoubots, hostLimpo, rewritesDoPainel, TUNEL_HUB, URL_PAINEL, URL_SITE } from "@/lib/soubots";

const raiz = process.cwd();

function ler(relativo: string) {
  return readFileSync(path.join(raiz, relativo), "utf8");
}

function semComentario(fonte: string) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function temChave(valor: unknown, chave: string): boolean {
  if (!valor || typeof valor !== "object") return false;
  if (Array.isArray(valor)) return valor.some((item) => temChave(item, chave));
  return Object.entries(valor as Record<string, unknown>).some(([nome, filho]) => nome === chave || temChave(filho, chave));
}

describe("landing /mybots-app", () => {
  it("não toma o lugar do rewrite do Hub em /mybots", () => {
    const config = ler("next.config.ts");
    expect(config).toMatch(/source:\s*"\/mybots"/);
    expect(config).toMatch(/source:\s*"\/mybots\/:caminho\*"/);
    expect(config).toContain("TUNEL_HUB");
    expect(config).toContain("rewritesDoPainel()");
    expect(config).not.toMatch(/source:\s*"\/mybots-app/);
    expect(config).not.toMatch(/source:\s*"\/app\/"/);
    expect(config).toContain('"/mybots-app": ["./public/**/*"]');
    const vercel = ler("vercel.json");
    expect(vercel).toContain('"value": "soubots.com"');
    expect(vercel).toContain("https://www.soubots.com/:path*");
    expect(vercel).toContain('"permanent": true');
    expect(existsSync(path.join(raiz, "app/mybots/page.tsx"))).toBe(false);
    expect(existsSync(path.join(raiz, "public/mybots/index.html"))).toBe(false);
    expect(existsSync(path.join(raiz, "public/mybots/videos/00_hero_loop.mp4"))).toBe(true);
  });

  it("aponta Entrar para o painel e os downloads para as constantes", () => {
    const pagina = ler("app/mybots-app/page.tsx");
    expect(URL_APK).toBe("/downloads/MyBots.apk");
    expect(URL_INSTALADOR_WINDOWS).toBe("/downloads/MyBots-Setup.exe");
    expect(pagina).toContain("href={URL_APK}");
    expect(pagina).toContain("download={NOME_APK}");
    expect(pagina).toContain("href={URL_INSTALADOR_WINDOWS}");
    expect(pagina).toContain("Baixar para Android");
    expect(pagina).toContain("Baixar para Windows");
    expect(pagina).toContain("href={URL_PAINEL}");
    expect(pagina).toContain("Entrar com Google");
    expect(pagina).toMatch(/>\s*Entrar\s*</);
    expect(pagina).toContain("fontes desconhecidas");
    expect(pagina).toContain('from "next/font/local"');
    expect(pagina).not.toMatch(/from ["']next\/font\/google["']/);
  });

  it("usa o title e a description da primeira opção, sem valor no schema", () => {
    expect(TITULO).toBe("MyBots: crie sua equipe de bots de IA que trabalham por você");
    expect(DESCRICAO).toBe(
      "Entre com o Google e ganhe na hora 3 bots de IA: um Programador, um especialista em SEO e AEO e um Director de vídeo. Disponível para Windows e Android.",
    );
    expect(H1).toBe("Sua equipe de bots de IA, pronta no primeiro login");
    const pagina = ler("app/mybots-app/page.tsx");
    expect(pagina).toContain("absolute: TITULO");
    expect(pagina).toContain("description: DESCRICAO");
    expect(pagina).toContain("canonical: URL_PAGINA");
    expect(pagina).toContain("const URL_PAGINA = URL_SITE");

    const schema = jsonLdDaLanding();
    expect(temChave(schema, "offers")).toBe(false);
    expect(temChave(schema, "price")).toBe(false);
    expect(JSON.stringify(schema)).not.toMatch(/aggregateRating|review/);
    const tipos = (schema["@graph"] as { "@type": string }[]).map((item) => item["@type"]);
    expect(tipos).toEqual(["SoftwareApplication", "FAQPage"]);
    const perguntas = PERGUNTAS.map((item) => item.pergunta);
    expect(perguntas).not.toContain("Quanto custa?");
    expect(perguntas).toContain("O que é o MyBots?");
    expect(pagina).toContain("PERGUNTAS.map");
  });

  it("não publica telefone nem WhatsApp na landing", () => {
    const textos = [
      "app/mybots-app/page.tsx",
      "app/mybots-app/VideoLeve.tsx",
      "app/mybots-app/VideoFundoHero.tsx",
      "app/mybots-app/Cenario.tsx",
      "app/mybots-app/estilos.module.css",
      "lib/mybots-landing.ts",
      "lib/mybots-arquivos.ts",
      "docs/mybots-app.md",
    ]
      .map(ler)
      .join("\n");
    expect(textos).not.toMatch(/wa\.me|api\.whatsapp|web\.whatsapp|98751|55199/i);
    expect(textos).not.toMatch(/WhatsApp/);
    expect(textos).not.toMatch(/\(\d{2}\)\s*\d/);
  });

  it("reserva os cinco vídeos nesta ordem, com preload none nos de baixo", () => {
    expect(SLOTS_DE_VIDEO.map((slot) => slot.id)).toEqual([
      "00_hero_loop",
      "01_documentario",
      "02_equipe_de_bolso",
      "03_dia_que_sobrou",
      "04_antes_e_depois",
    ]);
    expect(SLOTS_DE_VIDEO[0].mp4).toBe("/mybots/videos/00_hero_loop.mp4");
    expect(SLOTS_DE_VIDEO[0].poster).toBe("/mybots/videos/00_hero_poster.jpg");
    expect(SLOTS_DE_VIDEO[1].poster).toBe("/mybots/videos/01_documentario_poster.jpg");
    expect(SLOTS_DE_VIDEO[4].mp4).toBe("/mybots/videos/04_antes_e_depois.mp4");
    expect(SLOTS_DE_VIDEO[4].poster).toBe("/mybots/videos/04_antes_e_depois_poster.jpg");
    const pagina = ler("app/mybots-app/page.tsx").slice(ler("app/mybots-app/page.tsx").indexOf("export default function"));
    const hero = pagina.indexOf("VIDEO_HERO");
    const doc = pagina.indexOf("VIDEO_DOCUMENTARIO");
    const equipe = pagina.indexOf("VIDEO_EQUIPE");
    const dia = pagina.indexOf("VIDEO_BENEFICIOS");
    const antes = pagina.indexOf("VIDEO_ANTES_DEPOIS");
    expect(hero).toBeGreaterThan(-1);
    expect(hero).toBeLessThan(doc);
    expect(doc).toBeLessThan(equipe);
    expect(equipe).toBeLessThan(dia);
    expect(dia).toBeLessThan(antes);

    const leve = ler("app/mybots-app/VideoLeve.tsx");
    expect(leve).toContain('preload="none"');
    expect(leve).toContain("playsInline");
    expect(leve).toContain("muted");
    expect(leve).toContain("poster={poster}");
    expect(leve).toContain("IntersectionObserver");
    expect(leve).toContain('type="video/webm"');
    expect(leve).toContain('type="video/mp4"');
    expect(leve).toContain("prefers-reduced-motion");

    const fundo = ler("app/mybots-app/VideoFundoHero.tsx");
    expect(fundo).toContain("muted");
    expect(fundo).toContain("loop");
    expect(fundo).toContain("playsInline");
    expect(fundo).toContain('preload="metadata"');
    expect(fundo).toContain("prefers-reduced-motion");

    for (const slot of SLOTS_DE_VIDEO) {
      const midia = midiaDoSlot(slot);
      expect(midia.disponivel).toBe(true);
      expect(midia.mp4).toBe(slot.mp4);
      expect(midia.poster).toBe(slot.poster);
      expect(arquivoPublicoExiste(slot.webm)).toBe(false);
    }

    const arquivos = semComentario(ler("lib/mybots-arquivos.ts"));
    const fonteDaPagina = semComentario(ler("app/mybots-app/page.tsx"));
    expect(arquivos).not.toMatch(/node:fs|from ["']fs["']|existsSync|readFile|process\.cwd/);
    expect(fonteDaPagina).not.toMatch(/node:fs|from ["']fs["']|existsSync|process\.cwd/);
  });

  it("respeita menos movimento e faz as amebas descerem com a rolagem", () => {
    const cenario = ler("app/mybots-app/Cenario.tsx");
    const css = ler("app/mybots-app/estilos.module.css");
    expect(cenario).toContain('"(prefers-reduced-motion: reduce)"');
    expect(cenario).toContain("deslocamentoDaAmeba");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("--rolagem");
    const alto = 800;
    const noTopo = deslocamentoDaAmeba(0, 0, alto);
    const noFim = deslocamentoDaAmeba(1, 0, alto);
    expect(noFim.y).toBeGreaterThan(noTopo.y);
    expect(deslocamentoDaAmeba(2, 0, alto).y).toBe(deslocamentoDaAmeba(1, 0, alto).y);
    expect(balancoDoHero(0, 0).y).not.toBe(balancoDoHero(0.5, 1).y);
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
    expect(URL_PAINEL).toBe("https://www.soubots.com/app");
    expect(TUNEL_HUB).toContain("trycloudflare.com/mybots");
    const regras = rewritesDoPainel();
    expect(regras.filter((r) => r.source === "/app").map((r) => r.has[0].value).sort()).toEqual([
      "soubots.com",
      "www.soubots.com",
    ]);
    expect(regras.filter((r) => r.source === "/app/:caminho*").map((r) => r.has[0].value).sort()).toEqual([
      "soubots.com",
      "www.soubots.com",
    ]);
    expect(regras.every((r) => r.destination.startsWith(`${TUNEL_HUB}/`))).toBe(true);
    expect(regras.some((r) => r.destination.endsWith(":caminho*"))).toBe(true);
    expect(regras.some((r) => r.has[0].value === "www.balao.info")).toBe(false);
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

    const sitemap = ler("app/sitemap.ts");
    expect(sitemap).toContain("URL_SITE");
    expect(sitemap).not.toContain("'/mybots-app'");
  });

  it("publica o apk do MyBots e ainda não o instalador Windows", () => {
    const apk = path.join(raiz, "public/downloads/MyBots.apk");
    expect(statSync(apk).size).toBeGreaterThan(1_000_000);
    const bytes = readFileSync(apk);
    expect(bytes.subarray(0, 2).toString()).toBe("PK");
    const pacote = Buffer.from("info.balao.mybots", "utf16le");
    expect(bytes.includes(pacote) || bytes.includes(Buffer.from("info.balao.mybots"))).toBe(true);
    expect(arquivoPublicoExiste(URL_APK)).toBe(true);
    expect(arquivoPublicoExiste(URL_INSTALADOR_WINDOWS)).toBe(false);
    expect(existsSync(path.join(raiz, "public/mybots-app/amebas/ameba-092.webp"))).toBe(true);
    expect(existsSync(path.join(raiz, "public/mybots-app/logo.png"))).toBe(true);
  });
});
