// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

const RAIZ = process.cwd();
const ARQUIVO = "google1b28e73344ff3a8c.html";
const CONTEUDO = "google-site-verification: google1b28e73344ff3a8c.html";
const META =
  '<meta name="google-site-verification" content="TRpT6cALErdwYWtR1HWKQZJlVBmX0RFPlxi5g3ZDuyM" />';

describe("verificação do Google Search Console", () => {
  it("publica o arquivo na raiz com o texto exato", () => {
    const texto = readFileSync(join(RAIZ, "public", ARQUIVO), "utf8").replace(/\n$/, "");
    expect(texto).toBe(CONTEUDO);
  });

  it("declara a meta no layout de todas as páginas do Next", () => {
    const layout = readFileSync(join(RAIZ, "app/layout.tsx"), "utf8");
    expect(layout).toContain('google: "TRpT6cALErdwYWtR1HWKQZJlVBmX0RFPlxi5g3ZDuyM"');
  });

  it("coloca a meta no head das páginas HTML estáticas", () => {
    const pendentes: string[] = [];
    const visitar = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) visitar(caminho);
        else if (nome.endsWith(".html") && nome !== ARQUIVO) {
          const html = readFileSync(caminho, "utf8");
          if (!html.includes(META)) pendentes.push(caminho);
        }
      }
    };
    visitar(join(RAIZ, "public"));
    expect(pendentes).toEqual([]);
  });

  it("deixa o arquivo de verificação fora da tranca do proxy", async () => {
    const { config, proxy } = await import("@/proxy");
    const regra = config.matcher[0] as string;
    const re = new RegExp(`^${regra}$`);
    expect(re.test(`/${ARQUIVO}`)).toBe(false);
    expect(re.test("/sobre-nos")).toBe(true);

    const { NextRequest } = await import("next/server");
    const resposta = await proxy(new NextRequest(new URL(`/${ARQUIVO}`, "https://www.balao.info")));
    expect(resposta.headers.get("x-middleware-next")).toBe("1");
    expect(resposta.headers.get("location")).toBeNull();
  });
});
