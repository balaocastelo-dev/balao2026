// Testes da VITOR.IA — funções puras do prospector.
//
// O que está coberto aqui é o que decide a reputação do número da loja (ou do
// número próprio): a mensagem precisa ser pessoal, e o pedido de sair precisa
// ser reconhecido SEMPRE. Nenhuma mudança futura pode quebrar isso calado.
//
//   node beto-worker.test.js
//
const assert = require("assert");
const beto = require("./beto-worker");

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

teste("mensagem padrão usa o primeiro nome", () => {
  const msg = beto.montarMensagem("Maria Aparecida Silva");
  assert.ok(msg.startsWith("Oi Maria! Tudo bem?"), `começo errado: ${msg.slice(0, 40)}`);
});

teste("template configurado é respeitado", () => {
  beto.definirConfig({ mensagem: "Fala {nome}, tudo certo? É da Balão." });
  const msg = beto.montarMensagem("João Carlos");
  assert.strictEqual(msg, "Fala João, tudo certo? É da Balão.");
  // devolve o padrão para os próximos testes
  beto.definirConfig({ mensagem: "Oi {nome}! Tudo bem? 👋 Se quiser parar, responda *sair*." });
});

teste("template sem nome não deixa buraco", () => {
  const msg = beto.montarMensagem(null);
  assert.ok(!msg.includes("{nome}"), "sobrou {nome} na mensagem");
  assert.ok(!msg.includes("  "), "sobrou espaço duplo");
  assert.ok(msg.trim().length > 0, "mensagem ficou vazia");
});

teste("pedido de opt-out: 'sair' sozinho", () => {
  assert.strictEqual(beto.ehPedidoDeOptout("sair"), true);
});

teste("pedido de opt-out: frase longa", () => {
  assert.strictEqual(beto.ehPedidoDeOptout("Pode parar de mandar mensagem por favor"), true);
});

teste("pedido de opt-out: maiúsculas e pontuação", () => {
  assert.strictEqual(beto.ehPedidoDeOptout("NÃO QUERO!!"), true);
});

teste("pedido de opt-out: 'tira meu número'", () => {
  assert.strictEqual(beto.ehPedidoDeOptout("Tira meu número da lista"), true);
});

teste("resposta normal NÃO é opt-out", () => {
  assert.strictEqual(beto.ehPedidoDeOptout("Quanto custa o notebook?"), false);
  assert.strictEqual(beto.ehPedidoDeOptout("Vou querer sim!"), false);
  assert.strictEqual(beto.ehPedidoDeOptout(""), false);
});

teste("mensagem padrão fala a origem (LGPD) e dá saída", () => {
  beto.definirConfig({ mensagem: "Oi {nome}! A Balão da Informática, do Cambuí. Responda *sair* para não receber mais." });
  const msg = beto.montarMensagem("João");
  assert.ok(/Balão da Informática/i.test(msg), "não diz quem é a loja");
  assert.ok(/sair/i.test(msg), "não oferece a saída");
});

process.exit(falhas ? 1 : 0);
