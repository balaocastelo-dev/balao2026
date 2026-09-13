// Teste do espelho do catálogo.
//
// O espelho existe para o momento em que o banco da Hostinger recusa conexão
// (cota de 500/hora estourada). O erro que estragaria tudo é ele se
// autodestruir justamente nesse momento: quando a cota estoura, o site
// responde uma lista VAZIA em vez de um erro, e gravar isso por cima apagaria
// a cópia que só existe para essa hora.
//
//   node catalogo.test.js
//
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { criarEspelhoDoCatalogo } = require("./catalogo");

let falhas = 0;
async function teste(nome, fn) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "balao-catalogo-"));
  try {
    await fn(pasta);
    console.log(`  [ok] ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  [FALHOU] ${nome}\n         ${e.message}`);
  } finally {
    fs.rmSync(pasta, { recursive: true, force: true });
  }
}

const PRODUTOS = [
  { id: "1", slug: "ssd-1tb", name: "SSD 1TB", price: "349,90", category: "Armazenamento" },
  { id: "2", slug: "monitor-24", name: 'Monitor 24"', price: "899,00", category: "Monitores" },
];

// O espelho busca um endereço só (`/api/espelho`), que entrega tudo junto.
function respostaDe(produtos, status = 200, extra = {}) {
  const corpo = Array.isArray(produtos)
    ? { produtos, categorias: [], banners: [], blog: [], ...extra }
    : produtos;
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  });
}

(async () => {
  console.log("\nespelho do catálogo");

  await teste("baixa o catálogo e grava no disco", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });

    const r = await espelho.atualizar();
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.total, 2);
    assert.strictEqual(espelho.ler().total, 2);
    assert.ok(fs.existsSync(espelho.arquivo), "arquivo não foi gravado");
  });

  await teste("catálogo VAZIO não apaga a cópia boa", async (pasta) => {
    // O caso que justifica o espelho inteiro: com a cota estourada, o site
    // responde `[]`. Se isso sobrescrevesse, o espelho ficaria vazio
    // exatamente na hora em que é a única fonte de dado.
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    await espelho.atualizar();

    const comCotaEstourada = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe([]),
      registrar() {},
    });
    const r = await comCotaEstourada.atualizar();

    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.mantido, 2, "a cópia boa foi apagada");
    assert.strictEqual(comCotaEstourada.ler().total, 2);
  });

  await teste("página de erro em vez de JSON não apaga nada", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    await espelho.atualizar();

    const comErro = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe({ error: "boom" }, 500),
      registrar() {},
    });
    const r = await comErro.atualizar();

    assert.strictEqual(r.ok, false);
    assert.ok(String(r.erro).includes("500"), `motivo inesperado: ${r.erro}`);
    assert.strictEqual(comErro.ler().total, 2);
  });

  await teste("site fora do ar mantém a cópia e registra o motivo", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    await espelho.atualizar();

    const semRede = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: async () => {
        throw new Error("getaddrinfo ENOTFOUND");
      },
      registrar() {},
    });
    const r = await semRede.atualizar();

    assert.strictEqual(r.ok, false);
    assert.strictEqual(semRede.ler().total, 2);
    assert.ok(String(semRede.estado.ultimoErro).includes("ENOTFOUND"));
  });

  await teste("lista com lixo (sem nome) não conta como catálogo", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe([{ foo: 1 }, { bar: 2 }]),
      registrar() {},
    });
    const r = await espelho.atualizar();
    assert.strictEqual(r.ok, false);
    assert.strictEqual(espelho.ler().total, 0);
  });

  await teste("o espelho sobrevive ao reinício do servidor", async (pasta) => {
    // O ponto de guardar em disco: reiniciar o container não pode zerar o
    // catálogo, senão o espelho não serve para nada num deploy.
    const primeiro = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    await primeiro.atualizar();

    const depoisDoReinicio = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe([]),
      registrar() {},
    });
    assert.strictEqual(depoisDoReinicio.ler().total, 2);
    assert.strictEqual(depoisDoReinicio.ler().produtos[0].name, "SSD 1TB");
  });

  await teste("catálogo maior substitui o antigo", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    await espelho.atualizar();

    const novo = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe([...PRODUTOS, { id: "3", name: "Teclado", price: "99,00" }]),
      registrar() {},
    });
    const r = await novo.atualizar();

    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.total, 3);
    assert.strictEqual(r.anterior, 2);
  });

  await teste("busca pelo caminho que lê o banco direto, não a cópia", async (pasta) => {
    // Sem `origem=banco`, o site responderia com a PRÓPRIA cópia num dia de
    // cota estourada — e o espelho gravaria dado velho carimbado com data
    // nova, escondendo que o catálogo parou de atualizar.
    const pedidos = [];
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info/",
      buscar: async (url) => {
        pedidos.push(url);
        return {
          ok: true,
          status: 200,
          json: async () => ({ produtos: PRODUTOS, categorias: [], banners: [], blog: [] }),
        };
      },
      registrar() {},
    });

    await espelho.atualizar();
    // O catálogo vem de /api/espelho; logo depois o espelho guarda a
    // assinatura, para a próxima volta agendada poder pular a baixada.
    assert.deepStrictEqual(pedidos, [
      "https://www.balao.info/api/espelho",
      "https://www.balao.info/api/espelho/versao",
    ]);
  });

  await teste("volta agendada não rebaixa o catálogo quando nada mudou", async (pasta) => {
    // Baixar 11 MB a cada volta, sem nada ter mudado, custava ~15 GB por mês
    // num projeto Supabase de 5 GB. A assinatura custa dezenas de bytes.
    const pedidos = [];
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: async (url) => {
        pedidos.push(url);
        if (url.endsWith("/versao")) {
          return { ok: true, status: 200, json: async () => ({ ok: true, total: 2, maisRecente: "2026-09-13T00:00:00Z" }) };
        }
        return { ok: true, status: 200, json: async () => ({ produtos: PRODUTOS, categorias: [], banners: [], blog: [] }) };
      },
      registrar() {},
    });

    await espelho.atualizar({ motivo: "boot" });
    const aposPrimeira = pedidos.length;

    const r = await espelho.atualizar({ motivo: "agendado" });
    assert.strictEqual(r.semMudanca, true, "deveria ter pulado a baixada");
    assert.strictEqual(pedidos.length, aposPrimeira + 1, "só a assinatura deveria ter sido pedida");
    assert.ok(pedidos[pedidos.length - 1].endsWith("/api/espelho/versao"));
    assert.strictEqual(espelho.ler().total, 2, "o catálogo guardado continua servível");
  });

  await teste("volta agendada baixa de novo quando o catálogo mudou", async (pasta) => {
    const pedidos = [];
    let total = 2;
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: async (url) => {
        pedidos.push(url);
        if (url.endsWith("/versao")) {
          return { ok: true, status: 200, json: async () => ({ ok: true, total, maisRecente: `2026-09-${10 + total}T00:00:00Z` }) };
        }
        return { ok: true, status: 200, json: async () => ({ produtos: PRODUTOS, categorias: [], banners: [], blog: [] }) };
      },
      registrar() {},
    });

    await espelho.atualizar({ motivo: "boot" });
    total = 3; // alguém cadastrou um produto no site
    const r = await espelho.atualizar({ motivo: "agendado" });
    assert.ok(!r.semMudanca, "assinatura diferente tem que forçar a baixada");
    assert.ok(pedidos.includes("https://www.balao.info/api/espelho"));
  });

  await teste("parte vazia não apaga a que já estava guardada", async (pasta) => {
    // O menu e as páginas /categoria/* vivem disso. Perder as categorias num
    // dia de cota estourada deixaria a home e a navegação vazias mesmo com os
    // produtos a salvo.
    const CATEGORIAS = [{ id: "1", name: "Notebooks", slug: "notebooks" }];
    const BANNERS = [{ id: "b1", image_url: "/uploads/banner.jpg" }];

    const primeiro = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS, 200, { categorias: CATEGORIAS, banners: BANNERS }),
      registrar() {},
    });
    await primeiro.atualizar();
    assert.strictEqual(primeiro.ler().categorias.length, 1);
    assert.strictEqual(primeiro.ler().banners.length, 1);

    // Agora o site responde com produtos, mas categorias e banners vazios.
    const parcial = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS, 200, { categorias: [], banners: [] }),
      registrar() {},
    });
    await parcial.atualizar();
    assert.strictEqual(parcial.ler().categorias.length, 1, "as categorias sumiram");
    assert.strictEqual(parcial.ler().banners.length, 1, "os banners sumiram");
  });

  await teste("sem arquivo nenhum, ler() devolve vazio em vez de quebrar", async (pasta) => {
    const espelho = criarEspelhoDoCatalogo({
      pasta,
      urlDoSite: "https://www.balao.info",
      buscar: respostaDe(PRODUTOS),
      registrar() {},
    });
    const conteudo = espelho.ler();
    assert.deepStrictEqual(conteudo.produtos, []);
    assert.strictEqual(conteudo.total, 0);
  });

  console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
  process.exit(falhas ? 1 : 0);
})();
