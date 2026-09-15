/**
 * O que se testa aqui é só o que o worker decide sozinho: ele não classifica
 * e não redige (isso é do site). O que ele pode errar é ligar sem credencial,
 * vazar a senha no painel e montar o cabeçalho de resposta errado.
 */
const assert = require("assert");

process.env.LIVIA_ATIVO = "";
process.env.LIVIA_EMAIL = "loja@exemplo.com";
process.env.LIVIA_SENHA_APP = "segredo-que-nao-pode-vazar";
process.env.BETO_TOKEN = "";

const worker = require("./livia-worker");

const testes = [];
function teste(nome, fn) { testes.push([nome, fn]); }

teste("nasce desligada", () => {
  assert.strictEqual(worker.resumo().ativo, false);
});

teste("aponta o que falta, e só o que falta", () => {
  const r = worker.resumo();
  assert.deepStrictEqual(r.pendencias, ["BETO_TOKEN"]);
  assert.strictEqual(r.caixa, "loja@exemplo.com");
});

teste("a senha de app não sai no resumo do painel", () => {
  // Essa senha abre a caixa de entrada da loja inteira, leitura e envio.
  // O painel do /crm é servido pela VPS; qualquer campo aqui é um campo
  // que chega ao navegador.
  const texto = JSON.stringify(worker.resumo());
  assert.ok(!texto.includes("segredo-que-nao-pode-vazar"));
});

teste("sem credencial, rodar recusa em vez de tentar conectar", async () => {
  const r = await worker.rodar();
  assert.strictEqual(r.ok, false);
  assert.ok(r.motivo.includes("faltando"));
});

teste("ligar e desligar muda o estado", () => {
  assert.strictEqual(worker.ligar().ativo, true);
  assert.strictEqual(worker.desligar().ativo, false);
});

(async () => {
  console.log("\nLIV.IA — caixa de entrada\n");
  let falhou = 0;
  for (const [nome, fn] of testes) {
    try { await fn(); console.log("  [ok]", nome); }
    catch (erro) { falhou++; console.log("  [FALHOU]", nome, "\n   ", erro.message); }
  }
  if (falhou) { console.log("\n" + falhou + " falha(s)"); process.exit(1); }
  console.log("\ntudo certo");
})();
