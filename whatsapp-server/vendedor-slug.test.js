// Teste do endereço da página do vendedor.
//
// O mesmo texto vira slug em DOIS lugares: no painel (montarSlug, em
// components/crm/CrmDashboard.tsx) e aqui. A senha do vendedor é derivada do
// slug — então qualquer diferença entre os dois cadastra a pessoa com sucesso
// e faz o login dela nunca abrir. Os casos aqui são os mesmos de
// __tests__/lib/equipe.test.ts, de propósito.
//
//   node vendedor-slug.test.js
//
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const fonte = fs.readFileSync(path.join(__dirname, "server.js"), "utf8");
const inicio = fonte.indexOf("function montarSlugDoVendedor(");
assert.ok(inicio >= 0, "montarSlugDoVendedor não encontrada em server.js");
const corpo = fonte.slice(inicio, fonte.indexOf("\n}", inicio) + 2);

// eslint-disable-next-line no-new-func
const montarSlug = new Function(`${corpo}; return montarSlugDoVendedor;`)();

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

console.log("\nendereço da página do vendedor");

teste("tira acento, espaço e maiúscula", () => {
  assert.strictEqual(montarSlug("Ana Paula Sé"), "ana-paula-se");
});

teste("não deixa traço sobrando nas pontas", () => {
  assert.strictEqual(montarSlug("  João  "), "joao");
  assert.strictEqual(montarSlug("--Ana--"), "ana");
});

teste("descarta o que não cabe numa URL", () => {
  assert.strictEqual(montarSlug("Ana/Paula?x=1"), "ana-paula-x-1");
  assert.strictEqual(montarSlug("Zé & Cia."), "ze-cia");
});

teste("nome sem letra utilizável vira vazio (e o cadastro recusa)", () => {
  assert.strictEqual(montarSlug("!!!"), "");
  assert.strictEqual(montarSlug(""), "");
  assert.strictEqual(montarSlug(null), "");
});

teste("é idempotente: o painel manda pronto e aqui roda de novo", () => {
  const uma = montarSlug("Ana Paula Sé");
  assert.strictEqual(montarSlug(uma), uma);
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
