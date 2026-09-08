// Teste do número real por trás de um id de conversa.
//
// O caso real: a foto do 19984515960 chegou no chat `92148808610042@lid` e a
// repescagem respondeu "Não consegui abrir a conversa dessa mensagem" — o
// `getChatById()` do WhatsApp não abre id `@lid`. Sem descobrir o telefone por
// trás do id, essas conversas nunca carregam histórico nem mídia.
//
//   node lid-chat.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");

function extrair(nome) {
  const inicio = fonte.indexOf(`function ${nome}(`);
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

function carregar(store) {
  const mod = {};
  // eslint-disable-next-line no-new-func
  new Function("store", `${extrair("numeroRealDoChat")}\nthis.numero = numeroRealDoChat;`).call(
    mod,
    store
  );
  return mod;
}

let falhas = 0;
function teste(nome, fn) {
  try {
    fn();
    console.log(`  [ok] ${nome}`);
  } catch (e) {
    falhas++;
    console.log(`  [FALHOU] ${nome}\n         ${e.message}`);
  }
}

const vazio = { chats: [], messages: [] };

console.log("\nnúmero real por trás do id da conversa");

teste("id normal: o número está no próprio id", () => {
  const { numero } = carregar(vazio);
  assert.strictEqual(numero("5519984515960@c.us"), "5519984515960");
});

teste("@lid: o número vem do resumo da conversa", () => {
  // O caso que quebrou. O id `92148808610042` não tem relação nenhuma com o
  // telefone — só o resumo guardado sabe quem é.
  const { numero } = carregar({
    chats: [{ chatId: "92148808610042@lid", realNumber: "5519984515960" }],
    messages: [],
  });
  assert.strictEqual(numero("92148808610042@lid"), "5519984515960");
});

teste("@lid sem resumo: cai nas mensagens guardadas", () => {
  const { numero } = carregar({
    chats: [],
    messages: [
      { chatId: "92148808610042@lid", realNumber: null },
      { chatId: "92148808610042@lid", displayNumber: "19984515960" },
    ],
  });
  assert.strictEqual(numero("92148808610042@lid"), "19984515960");
});

teste("@lid desconhecido devolve null, não o id", () => {
  // Devolver o id daria um `92148808610042@c.us` que não existe — e o erro
  // seguinte seria ainda mais confuso que o original.
  const { numero } = carregar(vazio);
  assert.strictEqual(numero("92148808610042@lid"), null);
});

teste("número formatado no resumo é limpo", () => {
  const { numero } = carregar({
    chats: [{ chatId: "92148808610042@lid", realNumber: "+55 (19) 98451-5960" }],
    messages: [],
  });
  assert.strictEqual(numero("92148808610042@lid"), "5519984515960");
});

teste("id vazio não quebra", () => {
  const { numero } = carregar(vazio);
  assert.strictEqual(numero(""), null);
  assert.strictEqual(numero(null), null);
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
