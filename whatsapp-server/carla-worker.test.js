// Testes da CLAUD.IA — funções puras da cobradora.
//
// O que importa aqui: a mensagem de cobrança precisa do VALOR do pedido, o
// nome precisa ser pessoal, e o pedido de sair precisa ser reconhecido sempre
// — cobrança errada ou insistência em quem pediu sair é o caminho mais curto
// para reclamação.
//
//   node carla-worker.test.js
//
const assert = require("assert");
const carla = require("./carla-worker");

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

teste("cobrança usa primeiro nome e valor", () => {
  const msg = carla.montar(
    "Oi {nome}! Seu pedido ({valor}) está pendente.",
    "Maria Aparecida Silva",
    { valor: "R$ 1.234,56" }
  );
  assert.strictEqual(msg, "Oi Maria! Seu pedido (R$ 1.234,56) está pendente.");
});

teste("sem nome não deixa buraco na cobrança", () => {
  const msg = carla.montar("Oi {nome}! Seu pedido ({valor}) está pendente.", null, { valor: "R$ 50,00" });
  assert.ok(!msg.includes("{nome}"), "sobrou {nome}");
  assert.ok(msg.includes("R$ 50,00"), "valor sumiu");
});

teste("valor em centavos aparece com vírgula", () => {
  const msg = carla.montar("Total: {valor}", "João", { valor: "R$ 100,00" });
  assert.ok(msg.includes("100,00"));
});

teste("pedido de opt-out: 'sair'", () => {
  assert.strictEqual(carla.ehPedidoDeOptout("sair"), true);
});

teste("pedido de opt-out: frase de cobrança irritada", () => {
  assert.strictEqual(carla.ehPedidoDeOptout("NÃO ME MANDE MAIS NADA"), true);
});

teste("resposta normal NÃO é opt-out", () => {
  assert.strictEqual(carla.ehPedidoDeOptout("Vou pagar amanhã, pode deixar"), false);
  assert.strictEqual(carla.ehPedidoDeOptout("Quanto ficou no pix?"), false);
  assert.strictEqual(carla.ehPedidoDeOptout(""), false);
});

teste("mensagem de reativação usa nome e oferece saída", () => {
  const msg = carla.montar("Oi {nome}! Ofertas novas aqui. Responda *sair* para parar.", "José");
  assert.ok(msg.startsWith("Oi José!"), `começo errado: ${msg.slice(0, 30)}`);
  assert.ok(/sair/i.test(msg), "não oferece saída");
});

process.exit(falhas ? 1 : 0);
