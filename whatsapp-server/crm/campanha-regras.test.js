// Regras puras do disparo por tema: horário de São Paulo, intervalo e texto.
//   node --test crm/campanha-regras.test.js
// Rode também com outro fuso no container para provar que não depende dele:
//   TZ=Asia/Tokyo node --test crm/campanha-regras.test.js
const test = require("node:test");
const assert = require("node:assert");
const R = require("./campanha-regras");

const ms = (iso) => Date.parse(iso);
const iso = (n) => new Date(n).toISOString();

test("horário comercial é o de São Paulo, não o do container", () => {
  // 12/10/2026 é segunda-feira. São Paulo = UTC-3.
  assert.strictEqual(R.janelaAberta(ms("2026-10-12T11:59:59Z")), false, "08:59 em SP: fechado");
  assert.strictEqual(R.janelaAberta(ms("2026-10-12T12:00:00Z")), true, "09:00 em SP: aberto");
  assert.strictEqual(R.janelaAberta(ms("2026-10-12T20:59:59Z")), true, "17:59 em SP: aberto");
  assert.strictEqual(R.janelaAberta(ms("2026-10-12T21:00:00Z")), false, "18:00 em SP: fechado");
  // Sábado aberto, domingo fechado.
  assert.strictEqual(R.janelaAberta(ms("2026-10-17T15:00:00Z")), true, "sábado 12h");
  assert.strictEqual(R.janelaAberta(ms("2026-10-18T15:00:00Z")), false, "domingo 12h");
  // 02h UTC de terça ainda é segunda 23h em SP: fechado.
  assert.strictEqual(R.janelaAberta(ms("2026-10-13T02:00:00Z")), false);
  assert.strictEqual(R.janelaAberta(ms("2026-10-18T15:00:00Z"), { ...R.JANELA_PADRAO, sempreAberta: true }), true);
});

test("próxima abertura", () => {
  // Domingo 20h44 em SP -> segunda 9h.
  assert.strictEqual(iso(R.proximaAbertura(ms("2026-10-11T23:44:00Z"))), "2026-10-12T12:00:00.000Z");
  // Sábado 18h30 -> segunda 9h (domingo não abre).
  assert.strictEqual(iso(R.proximaAbertura(ms("2026-10-17T21:30:00Z"))), "2026-10-19T12:00:00.000Z");
  // Segunda 7h -> segunda 9h.
  assert.strictEqual(iso(R.proximaAbertura(ms("2026-10-12T10:00:00Z"))), "2026-10-12T12:00:00.000Z");
  // Terça 18h -> quarta 9h.
  assert.strictEqual(iso(R.proximaAbertura(ms("2026-10-13T21:00:00Z"))), "2026-10-14T12:00:00.000Z");
  // Já aberto: ele mesmo.
  assert.strictEqual(R.proximaAbertura(ms("2026-10-13T15:00:00Z")), ms("2026-10-13T15:00:00Z"));
});

test("começo do dia em São Paulo (para o teto diário)", () => {
  // 01h UTC de terça = segunda 22h em SP: o dia é segunda.
  assert.strictEqual(iso(R.inicioDoDia(ms("2026-10-13T01:00:00Z"))), "2026-10-12T03:00:00.000Z");
  assert.strictEqual(iso(R.inicioDoProximoDia(ms("2026-10-13T01:00:00Z"))), "2026-10-13T03:00:00.000Z");
  // Virada de mês.
  assert.strictEqual(iso(R.inicioDoProximoDia(ms("2026-10-31T20:00:00Z"))), "2026-11-01T03:00:00.000Z");
  assert.strictEqual(R.deslocamentoMin(ms("2026-10-12T12:00:00Z")), -180);
});

test("intervalo entre envios fica entre 40 e 120 s", () => {
  assert.strictEqual(R.sortearIntervalo(R.INTERVALO_PADRAO, () => 0), 40_000);
  assert.strictEqual(R.sortearIntervalo(R.INTERVALO_PADRAO, () => 0.999999), 120_000);
  for (let i = 0; i < 500; i++) {
    const v = R.sortearIntervalo();
    assert.ok(v >= 40_000 && v <= 120_000, `fora da faixa: ${v}`);
  }
});

test("primeiro nome, com maiúscula", () => {
  assert.strictEqual(R.primeiroNome("JOÃO PEDRO"), "João");
  assert.strictEqual(R.primeiroNome("maria da silva"), "Maria");
  assert.strictEqual(R.primeiroNome("🎈 Ana Clara"), "Ana");
  assert.strictEqual(R.primeiroNome("ana-clara souza"), "Ana-Clara");
  for (const nada of ["", null, "5519999990000", "+55 (19) 99999-0000", "123456789012345@lid", "Contato", "Cliente PC", "X"]) {
    assert.strictEqual(R.primeiroNome(nada), "", `"${nada}" não é nome`);
  }
});

test("{nome} e {whatsapp} trocados, e a linha do SAIR no fim", () => {
  const t = R.montarTexto("Olá, {nome}! Chegou novidade.\nFale comigo: {whatsapp}", { nome: "JOSÉ CARLOS" });
  assert.strictEqual(
    t,
    "Olá, José! Chegou novidade.\nFale comigo: https://wa.me/5519987510267\n\nPara não receber mais, responda SAIR."
  );
  assert.ok(!/\{|\}/.test(t));
});

test("sem nome, a frase continua natural", () => {
  const sem = (modelo) => R.montarTexto(modelo, { nome: "5519999990000" }).split("\n\n")[0];
  assert.strictEqual(sem("Olá, {nome}!"), "Olá!");
  assert.strictEqual(sem("Olá {nome}! Tudo bem?"), "Olá! Tudo bem?");
  assert.strictEqual(sem("Oi {nome}, tudo bem?"), "Oi, tudo bem?");
  assert.strictEqual(sem("Oi, {nome}, tudo bem?"), "Oi, tudo bem?");
  assert.strictEqual(sem("{nome}, temos novidade"), "Temos novidade");
  assert.strictEqual(sem("Tudo bem, {nome}?"), "Tudo bem?");
  assert.strictEqual(sem("Bom dia {nome}."), "Bom dia.");
});

test("linha do SAIR não é repetida", () => {
  const t = R.montarTexto("Promoção!\n\nPara não receber mais, responda SAIR.");
  assert.strictEqual(t.match(/SAIR/g).length, 1);
  assert.strictEqual(R.montarTexto("Promoção! Responda *SAIR* para não receber.").match(/SAIR/g).length, 1);
});

test("texto vazio ou com variável que não existe é recusado", () => {
  assert.throws(() => R.conferirModelo("   "), /Escreva o texto/);
  assert.throws(() => R.conferirModelo("Oi {nome}, {promocao}"), (e) => e.status === 400 && /\{promocao\}/.test(e.message));
  assert.throws(() => R.conferirModelo("x".repeat(2001)), /longo demais/);
  assert.strictEqual(R.conferirModelo("  Oi {Nome} {WHATSAPP} "), "Oi {Nome} {WHATSAPP}");
});

test("os números de teste são só os dois do Thiago", () => {
  assert.deepStrictEqual([...R.NUMEROS_DE_TESTE], ["5519987510267", "5519984515960"]);
  assert.ok(Object.isFrozen(R.NUMEROS_DE_TESTE));
});
