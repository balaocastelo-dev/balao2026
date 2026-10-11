// node --test recarga.test.js
const test = require("node:test");
const assert = require("node:assert");
const { proximaRecargaCompleta, lerHorario, filtroDeJanela } = require("./recarga");

const iso = (ms) => new Date(ms).toISOString();

test("próxima recarga completa é às 03h30 de São Paulo", () => {
  // Terça, 15h em São Paulo -> quarta 03h30 (06h30 UTC).
  assert.strictEqual(iso(proximaRecargaCompleta(Date.parse("2026-10-13T18:00:00Z"))), "2026-10-14T06:30:00.000Z");
  // 03h00 em São Paulo -> meia hora depois, no mesmo dia.
  assert.strictEqual(iso(proximaRecargaCompleta(Date.parse("2026-10-14T06:00:00Z"))), "2026-10-14T06:30:00.000Z");
  // Exatamente 03h30 -> a do dia seguinte (nunca devolve o agora).
  assert.strictEqual(iso(proximaRecargaCompleta(Date.parse("2026-10-14T06:30:00Z"))), "2026-10-15T06:30:00.000Z");
  // 23h59 de sábado em São Paulo (02h59 UTC de domingo) -> domingo 03h30.
  assert.strictEqual(iso(proximaRecargaCompleta(Date.parse("2026-10-18T02:59:00Z"))), "2026-10-18T06:30:00.000Z");
});

test("a conta não supõe fuso fixo (horário de verão)", () => {
  // Nova York sai do horário de verão em 01/11/2026: 03h30 já é EST (UTC-5).
  const r = proximaRecargaCompleta(Date.parse("2026-10-31T12:00:00Z"), { fuso: "America/New_York" });
  assert.strictEqual(iso(r), "2026-11-01T08:30:00.000Z");
});

test("horário configurável", () => {
  assert.deepStrictEqual(lerHorario("04:15"), { hora: 4, minuto: 15 });
  assert.deepStrictEqual(lerHorario("25:00"), { hora: 3, minuto: 30 });
  assert.deepStrictEqual(lerHorario(""), { hora: 3, minuto: 30 });
  const r = proximaRecargaCompleta(Date.parse("2026-10-13T18:00:00Z"), lerHorario("04:15"));
  assert.strictEqual(iso(r), "2026-10-14T07:15:00.000Z");
});

test("janela de tempo no formato que a Evolution 2.3.7 aceita (gte E lte)", () => {
  const agora = Date.parse("2026-10-11T15:00:00Z");
  const f = filtroDeJanela(agora, 3600_000);
  assert.deepStrictEqual(f, {
    messageTimestamp: { gte: "2026-10-11T14:00:00.000Z", lte: "2026-10-11T15:05:00.000Z" },
  });
  // É o que a Evolution faz com isso: Math.floor(new Date(x).getTime() / 1000).
  assert.strictEqual(Math.floor(new Date(f.messageTimestamp.gte).getTime() / 1000), agora / 1000 - 3600);
});
