// Teste do download da mídia que o cliente manda.
//
// O caso real: cliente mandou foto pelo 19984515960, a mensagem chegou marcada
// como `midia: true | tipo: image` e o painel não mostrava imagem nenhuma. O
// /status confirmava "0 arquivos de mídia no servidor" — ou seja,
// downloadMedia() falhava calado dentro de um console.warn no container.
//
//   node midia.test.js
//
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");

const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");

function extrair(nome) {
  const marcadores = [`async function ${nome}(`, `function ${nome}(`];
  let inicio = -1;
  for (const m of marcadores) {
    inicio = fonte.indexOf(m);
    if (inicio >= 0) break;
  }
  assert.ok(inicio >= 0, `função ${nome} não encontrada`);
  let nivel = 0;
  const i = fonte.indexOf("{", inicio);
  for (let j = i; j < fonte.length; j++) {
    if (fonte[j] === "{") nivel++;
    else if (fonte[j] === "}") {
      nivel--;
      if (nivel === 0) return fonte.slice(inicio, j + 1);
    }
  }
  throw new Error(`não consegui delimitar ${nome}`);
}

// Pasta descartável no lugar do MEDIA_DIR do servidor.
const MEDIA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "balao-midia-"));

function carregar(clienteFalso) {
  const mod = {};
  const codigo = [
    fonte.match(/const estatisticasMidia = [^;]+;/)[0],
    fonte.match(/const indiceMidia = [^;]+;/)[0],
    fonte.match(/const VALIDADE_INDICE_MIDIA = [^;]+;/)[0],
    extrair("baseDoArquivoDeMidia"),
    extrair("atualizarIndiceDeMidia"),
    extrair("midiaJaBaixada"),
    extrair("baixarMidiaDaMensagem"),
    `this.baixar = baixarMidiaDaMensagem;
     this.jaBaixada = midiaJaBaixada;
     this.stats = estatisticasMidia;`,
  ].join("\n");

  // eslint-disable-next-line no-new-func
  new Function("fs", "path", "MEDIA_DIR", "createId", "whatsappClient", "console", codigo).call(
    mod,
    fs,
    path,
    MEDIA_DIR,
    () => "id-inventado",
    clienteFalso,
    { warn() {} }
  );
  return mod;
}

let falhas = 0;
async function teste(nome, fn) {
  try {
    await fn();
    console.log(`  [ok] ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  [FALHOU] ${nome}\n         ${e.message}`);
  }
}

// Um PNG mínimo em base64, só para ter bytes reais.
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const ID = "false_5519984515960@c.us_3EB0FOTO1";

function mensagem(extra = {}) {
  return {
    id: { _serialized: ID },
    type: "image",
    hasMedia: true,
    async downloadMedia() {
      return null;
    },
    ...extra,
  };
}

(async () => {
  console.log("\ndownload de mídia");

  await teste("foto do cliente é gravada e vira URL servível", async () => {
    const m = carregar(null);
    const url = await m.baixar(
      mensagem({
        async downloadMedia() {
          return { data: PNG, mimetype: "image/png" };
        },
      })
    );
    assert.ok(url && url.startsWith("/api/crm/media/"), `URL inesperada: ${url}`);
    assert.ok(url.endsWith(".png"), `extensão perdida: ${url}`);
    const arquivo = path.join(MEDIA_DIR, url.replace("/api/crm/media/", ""));
    assert.ok(fs.existsSync(arquivo), "arquivo não foi gravado");
    assert.ok(fs.statSync(arquivo).size > 0, "arquivo gravado vazio");
    assert.strictEqual(m.stats.salvas, 1);
  });

  await teste("nome do arquivo não carrega caracteres de caminho", async () => {
    // O id do WhatsApp tem "@", "_" e pontos. Se qualquer "/" ou ".." passasse
    // para o nome, a rota /api/crm/media recusaria o arquivo depois.
    const m = carregar(null);
    const url = await m.baixar(
      mensagem({
        id: { _serialized: "false_../../etc/passwd@c.us_X" },
        async downloadMedia() {
          return { data: PNG, mimetype: "image/png" };
        },
      })
    );
    const nome = url.replace("/api/crm/media/", "");
    assert.ok(!nome.includes("/"), `nome com barra: ${nome}`);
    assert.ok(!nome.includes(".."), `nome com ..: ${nome}`);
    assert.strictEqual(path.basename(nome), nome);
  });

  await teste("mesma foto não é baixada duas vezes", async () => {
    const m = carregar(null);
    let downloads = 0;
    const msg = mensagem({
      id: { _serialized: "false_5519984515960@c.us_3EB0REPETE" },
      async downloadMedia() {
        downloads++;
        return { data: PNG, mimetype: "image/png" };
      },
    });

    const primeira = await m.baixar(msg);
    const segunda = await m.baixar(msg);

    assert.strictEqual(primeira, segunda, "a segunda vez devolveu outra URL");
    assert.strictEqual(downloads, 1, `baixou ${downloads} vezes`);
    assert.strictEqual(m.stats.reaproveitadas, 1);
  });

  await teste("quando downloadMedia falha, cai na leitura direta do WhatsApp Web", async () => {
    // Era exatamente este o buraco: downloadMedia() estourava, o erro morria
    // num console.warn e a mensagem seguia sem mediaUrl para sempre.
    const cliente = {
      pupPage: {
        async evaluate() {
          return { data: PNG, mimetype: "image/jpeg" };
        },
      },
    };
    const m = carregar(cliente);
    const url = await m.baixar(
      mensagem({
        id: { _serialized: "false_5519984515960@c.us_3EB0FALLBACK" },
        async downloadMedia() {
          throw new Error("Evaluation failed: r");
        },
      })
    );
    assert.ok(url && url.endsWith(".jpeg"), `URL inesperada: ${url}`);
    assert.ok(fs.existsSync(path.join(MEDIA_DIR, url.replace("/api/crm/media/", ""))));
  });

  await teste("falhando os dois caminhos, devolve null e conta a falha", async () => {
    const cliente = { pupPage: { async evaluate() { return null; } } };
    const m = carregar(cliente);
    const url = await m.baixar(
      mensagem({
        id: { _serialized: "false_5519984515960@c.us_3EB0PERDIDA" },
        async downloadMedia() {
          throw new Error("sem sessão");
        },
      })
    );
    assert.strictEqual(url, null);
    assert.strictEqual(m.stats.falhas, 1);
    assert.ok(
      String(m.stats.ultimaFalha).includes("sem sessão"),
      `motivo não registrado: ${m.stats.ultimaFalha}`
    );
  });

  await teste("erro da página vira motivo legível no /status", async () => {
    // O erro cru do WhatsApp Web é a letra "r". Se o motivo não chegar ao
    // /status, cada tentativa de conserto vira adivinhação.
    const cliente = {
      pupPage: {
        async evaluate() {
          return { erro: "descriptografar (estagio PENDING)" };
        },
      },
    };
    const m = carregar(cliente);
    const url = await m.baixar(
      mensagem({
        id: { _serialized: "false_5519984515960@c.us_3EB0MOTIVO" },
        async downloadMedia() {
          throw new Error("r");
        },
      })
    );
    assert.strictEqual(url, null);
    assert.strictEqual(m.stats.ultimaFalha, "pagina: descriptografar (estagio PENDING)");
  });

  await teste("mensagem sem id ainda grava a foto", async () => {
    const m = carregar(null);
    const url = await m.baixar({
      type: "image",
      hasMedia: true,
      async downloadMedia() {
        return { data: PNG, mimetype: "image/png" };
      },
    });
    assert.ok(url && url.startsWith("/api/crm/media/"), `URL inesperada: ${url}`);
  });

  fs.rmSync(MEDIA_DIR, { recursive: true, force: true });

  console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
  process.exit(falhas ? 1 : 0);
})();
