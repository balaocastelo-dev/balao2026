// node --test crm/texto-seguro.test.js  (não precisa de banco)

const test = require("node:test");
const assert = require("node:assert");
const { textoSeguro, semQuebrados } = require("./texto-seguro");

test("tira a metade de emoji que sobra de um corte", () => {
  const cortado = ("a".repeat(199) + "😀 fim").slice(0, 200);
  assert.strictEqual(textoSeguro(cortado), "a".repeat(199));
  // Do jeito que estava, o JSON levava "\ud83d" e o Postgres recusava a linha.
  assert.match(JSON.stringify({ trecho: cortado }), /\\ud83d/);
  assert.doesNotMatch(JSON.stringify({ trecho: textoSeguro(cortado) }), /\\ud8/);
});

test("tira a metade de baixo sozinha e o caractere nulo", () => {
  assert.strictEqual(textoSeguro("x\uDE00y"), "xy");
  assert.strictEqual(textoSeguro("com nulo\u0000 no meio"), "com nulo no meio");
});

test("emoji inteiro, acento e texto comum ficam iguais", () => {
  const t = "Olá! 😀👍🏽 ação — R$ 1.299,90 🇧🇷";
  assert.strictEqual(textoSeguro(t), t);
});

test("limpa dentro de objetos e listas e não mexe no resto", () => {
  const data = new Date(0);
  const v = semQuebrados({
    corpo: "oi\u0000",
    citada: { id: "M1", trecho: "ok \uD83D", deMim: false },
    lista: ["a\u0000", 1, null],
    timestamp: 123,
    quando: data,
  });
  assert.deepStrictEqual(v, {
    corpo: "oi",
    citada: { id: "M1", trecho: "ok ", deMim: false },
    lista: ["a", 1, null],
    timestamp: 123,
    quando: data,
  });
  assert.strictEqual(v.quando, data, "Date passa como está");
  assert.strictEqual(semQuebrados(null), null);
  assert.strictEqual(semQuebrados(undefined), undefined);
});
