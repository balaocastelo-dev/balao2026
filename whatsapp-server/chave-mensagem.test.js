// Teste da identidade da mensagem dentro do id do WhatsApp.
//
// O caso real: a repescagem de foto respondia "mensagem fora da memoria do
// WhatsApp Web" mesmo com a conversa aberta e carregada. O id de conversa
// `@lid` termina com o TELEFONE DO AUTOR, não com a mensagem — então pegar
// "o último pedaço" comparava telefone com hash e nunca casava.
//
//   node chave-mensagem.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");
const inicio = fonte.indexOf("function chaveDaMensagem(");
assert.ok(inicio >= 0, "chaveDaMensagem não encontrada em server.js");
const corpo = fonte.slice(inicio, fonte.indexOf("\n}", inicio) + 2);

// eslint-disable-next-line no-new-func
const chave = new Function(`${corpo}; return chaveDaMensagem;`)();

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

console.log("\nidentidade da mensagem dentro do id");

teste("conversa comum: a chave é o hash da mensagem", () => {
  assert.strictEqual(chave("false_5519984515960@c.us_3EB0ABC123DEF"), "3EB0ABC123DEF");
});

teste("conversa @lid: ignora o telefone do autor no fim", () => {
  // Era exatamente isto. `.pop()` devolvia "5519984515960@c.us" — o autor,
  // não a mensagem.
  assert.strictEqual(
    chave("false_92148808610042@lid_3EB0ABC123DEF_5519984515960@c.us"),
    "3EB0ABC123DEF"
  );
});

teste("a MESMA mensagem nos dois formatos tem a mesma chave", () => {
  // É este casamento que faz a foto ser encontrada: o id guardado veio do
  // evento ao vivo, e o da página pode ter o autor grudado no fim.
  const doEvento = "false_92148808610042@lid_3EB0FOTO1";
  const daPagina = "false_5519984515960@c.us_3EB0FOTO1_5519984515960@c.us";
  assert.strictEqual(chave(doEvento), chave(daPagina));
});

teste("mensagens diferentes têm chaves diferentes", () => {
  assert.notStrictEqual(
    chave("false_5519984515960@c.us_3EB0AAA"),
    chave("false_5519984515960@c.us_3EB0BBB")
  );
});

teste("o true/false do começo nunca vira a chave", () => {
  // Sem descartá-lo, uma mensagem sem hash casaria com QUALQUER outra que
  // também não tivesse — e a foto errada apareceria na conversa.
  assert.strictEqual(chave("false_5519984515960@c.us"), "");
  assert.strictEqual(chave("true_5519984515960@c.us"), "");
});

teste("id vazio ou estranho não quebra", () => {
  assert.strictEqual(chave(""), "");
  assert.strictEqual(chave(null), "");
  assert.strictEqual(chave(undefined), "");
});

teste("id sem underline nenhum", () => {
  assert.strictEqual(chave("3EB0SEMNADA"), "3EB0SEMNADA");
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
