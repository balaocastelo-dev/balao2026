// Teste da limpeza da lista de conversas.
//
// Roda sem subir o servidor: extrai as funcoes do server.js e exercita os
// casos que apareceram de verdade no painel da loja.
//
//   node dedup.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

// Puxa só os trechos que interessam, sem executar o servidor inteiro.
const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");

function extrair(nome) {
  const inicio = fonte.indexOf(`function ${nome}(`);
  assert.ok(inicio >= 0, `função ${nome} não encontrada em server.js`);
  let i = fonte.indexOf("{", inicio);
  let nivel = 0;
  for (let j = i; j < fonte.length; j++) {
    if (fonte[j] === "{") nivel++;
    else if (fonte[j] === "}") {
      nivel--;
      if (nivel === 0) return fonte.slice(inicio, j + 1);
    }
  }
  throw new Error(`não consegui delimitar ${nome}`);
}

const codigo = [
  extrair("getDigits"),
  extrair("pareceTelefone"),
  extrair("deduplicarConversas"),
].join("\n\n");

const { pareceTelefone, deduplicarConversas } = (function () {
  const modulo = {};
  // eslint-disable-next-line no-new-func
  new Function(
    `${codigo}; this.pareceTelefone = pareceTelefone; this.deduplicarConversas = deduplicarConversas;`
  ).call(modulo);
  return modulo;
})();

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

const NUMERO_DA_LOJA = "5519987510267";

console.log("\npareceTelefone");
teste("aceita telefone com DDI (13 digitos)", () => {
  assert.strictEqual(pareceTelefone("5519987510267"), true);
});
teste("aceita telefone sem DDI (11 digitos)", () => {
  assert.strictEqual(pareceTelefone("19987510267"), true);
});
teste("recusa LID de 15 digitos", () => {
  assert.strictEqual(pareceTelefone("230188805845202"), false);
});
teste("recusa 13 digitos que nao comecam com 55", () => {
  assert.strictEqual(pareceTelefone("2796493504750"), false);
});
teste("recusa vazio", () => {
  assert.strictEqual(pareceTelefone(""), false);
});

console.log("\ndeduplicarConversas");

teste("o proprio numero da loja nao vira conversa", () => {
  const saida = deduplicarConversas(
    [
      { chatId: "5519987510267@c.us", realNumber: "5519987510267", contactName: "Balão", lastMessageTimestamp: 2 },
      { chatId: "5519999990000@c.us", realNumber: "5519999990000", contactName: "Cliente", lastMessageTimestamp: 1 },
    ],
    NUMERO_DA_LOJA
  );
  assert.strictEqual(saida.length, 1, "deveria sobrar só o cliente");
  assert.strictEqual(saida[0].contactName, "Cliente");
});

teste("mesmo contato em @lid e @c.us vira UMA conversa", () => {
  const saida = deduplicarConversas(
    [
      { chatId: "230188805845202@lid", realNumber: "5519991112222", contactName: "Maria", lastMessageTimestamp: 20, unreadCount: 2 },
      { chatId: "5519991112222@c.us", realNumber: "5519991112222", contactName: "Maria", lastMessageTimestamp: 10, unreadCount: 0 },
    ],
    NUMERO_DA_LOJA
  );
  assert.strictEqual(saida.length, 1, "deveria juntar em uma só");
  assert.strictEqual(saida[0].chatId, "5519991112222@c.us", "deve ficar com o id que é telefone");
  assert.strictEqual(saida[0].unreadCount, 2, "não pode perder as não lidas");
  assert.strictEqual(saida[0].lastMessageTimestamp, 20, "fica com a mensagem mais recente");
});

teste("LID sem telefone nao entra como se fosse numero", () => {
  const saida = deduplicarConversas(
    [{ chatId: "230188805845202@lid", realNumber: "230188805845202", contactName: "230188805845202", lastMessageTimestamp: 5 }],
    NUMERO_DA_LOJA
  );
  // Entra (é a única conversa daquele contato), mas nunca classificado como telefone.
  assert.strictEqual(saida.length, 1);
  assert.strictEqual(pareceTelefone(saida[0].realNumber), false);
});

teste("LID orfao some quando o mesmo NOME ja esta na lista com telefone", () => {
  const saida = deduplicarConversas(
    [
      { chatId: "5519991112222@c.us", realNumber: "5519991112222", contactName: "Maria Silva", lastMessageTimestamp: 10 },
      { chatId: "230188805845202@lid", realNumber: "230188805845202", contactName: "Maria Silva", lastMessageTimestamp: 9 },
    ],
    NUMERO_DA_LOJA
  );
  assert.strictEqual(saida.length, 1, "Maria não pode aparecer duas vezes");
  assert.strictEqual(saida[0].chatId, "5519991112222@c.us");
});

teste("conversas diferentes continuam separadas", () => {
  const saida = deduplicarConversas(
    [
      { chatId: "5519991112222@c.us", realNumber: "5519991112222", contactName: "Maria", lastMessageTimestamp: 3 },
      { chatId: "5519993334444@c.us", realNumber: "5519993334444", contactName: "João", lastMessageTimestamp: 2 },
      { chatId: "5511988887777@c.us", realNumber: "5511988887777", contactName: "Ana", lastMessageTimestamp: 1 },
    ],
    NUMERO_DA_LOJA
  );
  assert.strictEqual(saida.length, 3, "ninguém pode ser descartado por engano");
});

teste("nome de verdade ganha do nome que e so numero", () => {
  const saida = deduplicarConversas(
    [
      { chatId: "5519991112222@c.us", realNumber: "5519991112222", contactName: "5519991112222", lastMessageTimestamp: 30 },
      { chatId: "230188805845202@lid", realNumber: "5519991112222", contactName: "Maria", lastMessageTimestamp: 20 },
    ],
    NUMERO_DA_LOJA
  );
  assert.strictEqual(saida.length, 1);
  assert.strictEqual(saida[0].contactName, "Maria", "deve preferir o nome legível");
});

teste("lista vazia nao quebra", () => {
  assert.deepStrictEqual(deduplicarConversas([], NUMERO_DA_LOJA), []);
});

teste("sem numero proprio informado, nada e descartado por engano", () => {
  const saida = deduplicarConversas(
    [{ chatId: "5519987510267@c.us", realNumber: "5519987510267", contactName: "Alguém", lastMessageTimestamp: 1 }],
    null
  );
  assert.strictEqual(saida.length, 1);
});

console.log(
  falhas === 0 ? "\nTODOS OS TESTES PASSARAM\n" : `\n${falhas} FALHA(S)\n`
);
process.exit(falhas === 0 ? 0 : 1);
