// node status/recorrencia.test.js
const assert = require("assert");
const R = require("./recorrencia");
let ok = 0;
const t = (n, f) => { f(); ok++; console.log("✓", n); };
const iso = (ms) => new Date(ms).toISOString();

t("única: 22/09 09:00 em SP = 12:00 UTC", () => {
  assert.equal(iso(R.instante("2026-09-22", "09:00")), "2026-09-22T12:00:00.000Z");
  const r = { tipo: "unica", data: "2026-09-22", hora: "09:00" };
  assert.equal(R.proxima(r, Date.parse("2026-09-21T00:00:00Z")), Date.parse("2026-09-22T12:00:00Z"));
  assert.equal(R.proxima(r, Date.parse("2026-09-22T12:00:00Z")), null, "depois de publicada, não volta");
});
t("diária com dois horários", () => {
  const r = { tipo: "diaria", horarios: ["18:00", "08:00"] };
  const l = R.ocorrencias(r, Date.parse("2026-09-21T00:00:00Z"), Date.parse("2026-09-23T00:00:00Z"));
  assert.deepEqual(l.map(iso), [
    "2026-09-21T11:00:00.000Z", "2026-09-21T21:00:00.000Z",
    "2026-09-22T11:00:00.000Z", "2026-09-22T21:00:00.000Z",
  ]);
});
t("semanal só segunda (21/09/2026 é segunda)", () => {
  const r = { tipo: "semanal", dias: [1], horarios: ["09:00"] };
  const p = R.proxima(r, Date.parse("2026-09-21T13:00:00Z"));
  assert.equal(iso(p), "2026-09-28T12:00:00.000Z");
});
t("dias úteis pula fim de semana", () => {
  const r = { tipo: "dias_uteis", horarios: ["08:00"] };
  const p = R.proxima(r, Date.parse("2026-09-25T12:00:00Z")); // sexta depois das 08h
  assert.equal(iso(p), "2026-09-28T11:00:00.000Z"); // segunda
});
t("fim encerra a recorrência", () => {
  const r = { tipo: "diaria", horarios: ["08:00"], fim: "2026-09-22" };
  assert.equal(R.proxima(r, Date.parse("2026-09-22T12:00:00Z")), null);
});
t("validação recusa lixo", () => {
  assert.throws(() => R.validarRegra({ tipo: "semanal", horarios: ["08:00"], dias: [] }));
  assert.throws(() => R.validarRegra({ tipo: "diaria", horarios: ["25:00"] }));
  assert.throws(() => R.validarRegra({ tipo: "mensal" }));
});
t("descrição legível", () => {
  assert.equal(R.descrever({ tipo: "semanal", dias: [1, 5], horarios: ["09:00"] }), "Toda segunda, sexta às 09:00");
  assert.equal(R.descrever({ tipo: "unica", data: "2026-09-22", hora: "09:00" }), "Uma vez, 22/09/2026 às 09:00");
});
console.log(`\n${ok} testes ok`);
