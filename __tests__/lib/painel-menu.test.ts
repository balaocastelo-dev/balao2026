import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import {
  INICIO_DO_PAINEL,
  MENU_DO_PAINEL,
  grupoDoItem,
  itemDoCaminho,
  todosOsItens,
} from "@/lib/painel/menu";
import { ENDERECOS_ANTIGOS } from "@/lib/painel/enderecos-antigos";

// O painel é a única entrada da administração. O que estes testes guardam:
// nada no menu aponta para o vazio, nenhuma área fica escondida fora do menu,
// e nenhum endereço antigo leva a uma página que não existe.

const RAIZ = process.cwd();
const COM_MENU = join(RAIZ, "app", "painel", "(shell)");
const TELA_CHEIA = join(RAIZ, "app", "painel", "(telacheia)");

/** Arquivo da página de um endereço de dentro do painel, em cada moldura. */
function paginaDoPainel(href: string, pasta: string) {
  const resto = href.replace(/^\/painel\/?/, "");
  return join(pasta, resto, "page.tsx");
}

/** As pastas com page.tsx, viradas em endereço (/painel/<pasta>). */
function enderecosDe(pasta: string): string[] {
  if (!existsSync(pasta)) return [];
  const achados: string[] = [];
  if (existsSync(join(pasta, "page.tsx"))) achados.push("/painel");
  for (const nome of readdirSync(pasta)) {
    // [...resto] é a página de "área não encontrada", não uma área.
    if (nome.startsWith("[")) continue;
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory() && existsSync(join(caminho, "page.tsx"))) {
      achados.push(`/painel/${nome}`);
    }
  }
  return achados;
}

describe("mapa do painel", () => {
  const itens = todosOsItens();
  const deDentro = itens.filter((i) => !i.fora);
  const deFora = itens.filter((i) => i.fora);

  it("não repete endereço", () => {
    const hrefs = itens.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("todo item de dentro mora em /painel e tem página na moldura certa", () => {
    for (const item of deDentro) {
      expect(item.href === "/painel" || item.href.startsWith("/painel/"), item.href).toBe(true);
      const pasta = item.moldura === "cheia" ? TELA_CHEIA : COM_MENU;
      expect(existsSync(paginaDoPainel(item.href, pasta)), `${item.href} sem página`).toBe(true);
    }
  });

  it("toda tela de balcão fica fora do /painel e existe", () => {
    expect(deFora.length).toBeGreaterThan(0);
    for (const item of deFora) {
      expect(item.href.startsWith("/painel"), item.href).toBe(false);
      expect(existsSync(join(RAIZ, "app", item.href, "page.tsx")), `${item.href} sem página`).toBe(true);
    }
  });

  it("nenhuma área do painel fica fora do menu", () => {
    const noMenu = new Set(deDentro.map((i) => i.href));
    for (const endereco of [...enderecosDe(COM_MENU), ...enderecosDe(TELA_CHEIA)]) {
      expect(noMenu.has(endereco), `${endereco} existe mas não está no menu`).toBe(true);
    }
  });

  it("tem as áreas que a administração precisa", () => {
    const hrefs = new Set(itens.map((i) => i.href));
    for (const obrigatorio of [
      "/painel/pedidos", // vendas
      "/painel/indicadores",
      "/painel/produtos",
      "/painel/usuarios",
      "/painel/crm",
      "/painel/vendedores",
      "/painel/arena",
    ]) {
      expect(hrefs.has(obrigatorio), obrigatorio).toBe(true);
    }
  });

  it("todo item tem rótulo e descrição", () => {
    for (const item of itens) {
      expect(item.rotulo.trim().length, item.href).toBeGreaterThan(2);
      expect(item.descricao.trim().length, item.href).toBeGreaterThan(10);
    }
  });

  it("acha o item pelo endereço, do mais específico para o mais geral", () => {
    expect(itemDoCaminho("/painel")?.href).toBe(INICIO_DO_PAINEL.href);
    expect(itemDoCaminho("/painel/")?.href).toBe(INICIO_DO_PAINEL.href);
    expect(itemDoCaminho("/painel/produtos")?.href).toBe("/painel/produtos");
    expect(itemDoCaminho("/painel/produtos/123")?.href).toBe("/painel/produtos");
    // "/painel/controle" não pode engolir um endereço que só começa parecido.
    expect(itemDoCaminho("/painel/controlexyz")).toBeNull();
    expect(itemDoCaminho("/painel/nao-existe")).toBeNull();
  });

  it("sabe o grupo de cada item (o Início não tem)", () => {
    expect(grupoDoItem(INICIO_DO_PAINEL)).toBeNull();
    expect(grupoDoItem(itemDoCaminho("/painel/arena"))?.chave).toBe("equipe");
    for (const grupo of MENU_DO_PAINEL) {
      expect(grupo.itens.length, grupo.chave).toBeGreaterThan(0);
    }
  });
});

describe("endereços antigos da administração", () => {
  it("todos levam para dentro do /painel", () => {
    for (const { de, para } of ENDERECOS_ANTIGOS) {
      expect(de.startsWith("/painel"), de).toBe(false);
      expect(para === "/painel" || para.startsWith("/painel/"), para).toBe(true);
    }
  });

  it("nenhum leva a uma página que não existe", () => {
    for (const { para } of ENDERECOS_ANTIGOS) {
      if (para.includes(":")) continue; // o curinga é conferido no teste de baixo
      const existe =
        existsSync(paginaDoPainel(para, COM_MENU)) || existsSync(paginaDoPainel(para, TELA_CHEIA));
      expect(existe, `${para} sem página`).toBe(true);
    }
  });

  // /admin/<tela> vira /painel/<tela>: cada tela do admin antigo precisa
  // existir no painel com o MESMO nome, senão o favorito de alguém quebra.
  it("cada tela do /admin antigo existe no painel com o mesmo nome", () => {
    const telasDoAdminAntigo = [
      "ai-settings",
      "barra",
      "carrossel",
      "categorias",
      "cupons",
      "home-blocks",
      "importacao",
      "paginas",
      "pedidos",
      "precos",
      "produtos",
      "test-migration",
    ];
    for (const tela of telasDoAdminAntigo) {
      expect(existsSync(join(COM_MENU, tela, "page.tsx")), `/painel/${tela}`).toBe(true);
    }
  });

  it("os endereços antigos não têm mais página própria (senão o redirecionamento não age)", () => {
    for (const { de } of ENDERECOS_ANTIGOS) {
      if (de.includes(":")) continue;
      expect(existsSync(join(RAIZ, "app", de, "page.tsx")), `${de} ainda tem página`).toBe(false);
    }
  });

  it("as telas de balcão continuam no endereço de sempre", () => {
    const antigos = new Set(ENDERECOS_ANTIGOS.map((e) => e.de));
    for (const balcao of ["/fechamento", "/controle", "/controle/admin", "/controle/senha", "/pdv"]) {
      expect(antigos.has(balcao), balcao).toBe(false);
      expect(existsSync(join(RAIZ, "app", balcao, "page.tsx")), `${balcao} sem página`).toBe(true);
    }
  });
});
