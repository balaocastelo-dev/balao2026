// node --test medicao.test.js
const test = require("node:test");
const assert = require("node:assert");
const { criarMedicao, percentil } = require("./medicao");

test("percentil pelo vizinho mais próximo", () => {
  const cem = Array.from({ length: 100 }, (_, i) => i + 1);
  assert.strictEqual(percentil(cem, 50), 50);
  assert.strictEqual(percentil(cem, 95), 95);
  assert.strictEqual(percentil([7], 95), 7);
  assert.strictEqual(percentil([], 50), null);
});

test("mede os três trechos e separa por caminho", () => {
  const m = criarMedicao();
  // Webhook: WhatsApp às 10:00:00, servidor soube 300 ms depois, emitiu 20 ms depois.
  m.chegou("A", { caminho: "webhook", noWhatsapp: 1_000_000, chegada: 1_000_300 });
  m.emitiu("A", 1_000_320);
  // Varredura: chegou 18 s depois.
  m.chegou("B", { caminho: "varredura", noWhatsapp: 2_000_000, chegada: 2_018_000 });
  m.emitiu("B", 2_018_005);
  const r = m.resumo();
  assert.deepStrictEqual(r.webhook.ateChegar, { medianaMs: 300, p95Ms: 300 });
  assert.deepStrictEqual(r.webhook.ateEmitir, { medianaMs: 20, p95Ms: 20 });
  assert.deepStrictEqual(r.webhook.total, { medianaMs: 320, p95Ms: 320 });
  assert.strictEqual(r.varredura.total.medianaMs, 18_005);
  assert.strictEqual(r.historico.amostras, 0);
  assert.strictEqual(r.historico.total.medianaMs, null);
});

test("só a primeira chegada conta, e mensagem já emitida não conta de novo", () => {
  const m = criarMedicao();
  m.chegou("A", { caminho: "webhook", noWhatsapp: 1000, chegada: 1100 });
  m.chegou("A", { caminho: "varredura", noWhatsapp: 1000, chegada: 9000 }); // a varredura achou a mesma depois
  m.emitiu("A", 1150);
  m.emitiu("A", 9999); // reemissão: não é amostra nova
  const r = m.resumo();
  assert.strictEqual(r.webhook.amostras, 1);
  assert.strictEqual(r.varredura.amostras, 0);
  assert.strictEqual(r.webhook.total.medianaMs, 150);
});

test("guarda só as últimas 500 por caminho", () => {
  const m = criarMedicao();
  for (let i = 0; i < 600; i++) {
    m.chegou(`M${i}`, { caminho: "webhook", noWhatsapp: 0 + i * 10, chegada: i * 10 + (i < 100 ? 99_999 : 100) });
    m.emitiu(`M${i}`, i * 10 + (i < 100 ? 99_999 : 100));
  }
  const r = m.resumo();
  assert.strictEqual(r.webhook.amostras, 500);
  assert.strictEqual(r.webhook.desdeOBoot, 600);
  // As 100 primeiras (lentas) saíram do anel.
  assert.strictEqual(r.webhook.ateChegar.p95Ms, 100);
});

test("pendentes não crescem sem limite", () => {
  const m = criarMedicao({ limitePendentes: 3 });
  for (const id of ["a", "b", "c", "d"]) m.chegou(id, { caminho: "historico", noWhatsapp: 1, chegada: 2 });
  assert.strictEqual(m.resumo().aguardandoEmissao, 3);
  m.emitiu("a", 5); // "a" foi a que saiu
  assert.strictEqual(m.resumo().historico.amostras, 0);
});

test("o resumo não tem texto nem número de cliente", () => {
  const m = criarMedicao();
  m.chegou("3EB0ABC", { caminho: "webhook", noWhatsapp: 1, chegada: 2 });
  m.emitiu("3EB0ABC", 3);
  assert.ok(!JSON.stringify(m.resumo()).includes("3EB0ABC"));
});
