// Teste do telefone por trás de um contato @lid.
//
// O caso real: o cliente estava salvo na agenda e aparecia no painel com o
// "número" 249610647953418. Isso é o `@lid` — o identificador interno do
// WhatsApp, que não tem relação nenhuma com telefone. O vendedor via aquilo
// como se fosse o número do cliente.
//
//   node telefone-lid.test.js
//
const fs = require("fs");
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

function carregar(numeroDaLoja = "5519987510267") {
  const mod = {};
  const codigo = [
    "function getDigits(v) { return String(v || '').replace(/\D/g, ''); }",
    extrair("extractRealNumber"),
    extrair("telefoneRealDoLid"),
    "this.telefone = telefoneRealDoLid; this.extrair = extractRealNumber;",
  ].join("\n");

  // eslint-disable-next-line no-new-func
  new Function("whatsappState", "whatsappClient", codigo).call(
    mod,
    { phoneNumber: numeroDaLoja },
    null // sem página: força usar só as mensagens guardadas
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

const LID = "249610647953418@lid";

(async () => {
  console.log("\ntelefone por trás do @lid");

  await teste("o id @lid nunca é aceito como telefone", async () => {
    // Era exatamente isto na tela: 249610647953418 apresentado como número.
    const m = carregar();
    assert.strictEqual(m.extrair("249610647953418"), null);
    assert.strictEqual(await m.telefone(LID, []), null);
  });

  await teste("acha o telefone no fim do id da mensagem", async () => {
    // Em conversa @lid o id serializado termina com o JID real do autor.
    const m = carregar();
    const achado = await m.telefone(LID, [
      { id: "false_249610647953418@lid_3EB0ABC_5519984515960@c.us" },
    ]);
    assert.strictEqual(achado, "5519984515960");
  });

  await teste("acha o telefone no autor da mensagem", async () => {
    const m = carregar();
    const achado = await m.telefone(LID, [{ id: "false_249610647953418@lid_3EB0ABC", author: "5519984515960@c.us" }]);
    assert.strictEqual(achado, "5519984515960");
  });

  await teste("o número da loja não vira telefone do cliente", async () => {
    // A loja é participante de tudo que sai. Sem descartá-la, todo contato
    // @lid apareceria com o número da própria loja.
    const m = carregar("5519987510267");
    const achado = await m.telefone(LID, [
      { id: "true_249610647953418@lid_3EB0SAIU_5519987510267@c.us" },
    ]);
    assert.strictEqual(achado, null);
  });

  await teste("entre a loja e o cliente, escolhe o cliente", async () => {
    const m = carregar("5519987510267");
    const achado = await m.telefone(LID, [
      { id: "true_249610647953418@lid_3EB0SAIU_5519987510267@c.us" },
      { id: "false_249610647953418@lid_3EB0VEIO_5519984515960@c.us" },
    ]);
    assert.strictEqual(achado, "5519984515960");
  });

  await teste("conversa comum não passa por aqui", async () => {
    // Só @lid precisa deste resgate; em @c.us o número está no próprio id.
    const m = carregar();
    assert.strictEqual(await m.telefone("5519984515960@c.us", []), null);
  });

  await teste("sem nenhuma pista, devolve null em vez de inventar", async () => {
    // Número inventado é pior que número ausente: o vendedor tenta ligar.
    const m = carregar();
    assert.strictEqual(await m.telefone(LID, [{ id: "false_249610647953418@lid_3EB0SOZINHA" }]), null);
  });

  console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
  process.exit(falhas ? 1 : 0);
})();
