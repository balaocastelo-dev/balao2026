const test = require("node:test");
const assert = require("node:assert");
const I = require("./interesses");

test("acha o assunto em frase de cliente de verdade", () => {
  const r = I.ranking(I.analisarTexto("Bom dia, meu notebook não liga, vocês consertam?"));
  const chaves = r.map((x) => x.chave);
  assert.ok(chaves.includes("notebook"), "devia achar notebook");
  assert.ok(chaves.includes("assistencia"), "devia achar assistência");
});

test("não confunde acento nem maiúscula", () => {
  const a = I.analisarTexto("PLACA DE VÍDEO RTX 4060");
  const b = I.analisarTexto("placa de video rtx 4060");
  assert.deepStrictEqual(a, b);
  assert.ok(a.pc_gamer >= 2);
});

test("frase curta ou vazia não vira interesse", () => {
  assert.deepStrictEqual(I.analisarTexto(""), {});
  assert.deepStrictEqual(I.analisarTexto("ok"), {});
  assert.deepStrictEqual(I.analisarTexto(null), {});
});

test("categoria do produto pesa mais que palavra solta", () => {
  const porCategoria = I.analisarCategoria("Notebooks");
  assert.strictEqual(porCategoria.notebook, 3);
});

test("produto enviado soma nome e categoria", () => {
  const p = I.analisarProduto("Notebook Dell Inspiron 15", "Notebooks");
  assert.ok(p.notebook >= 4, `esperava >=4, veio ${p.notebook}`);
});

test("pedido de preço entra como orçamento", () => {
  const r = I.ranking(I.analisarTexto("quanto custa? faz por quanto no pix?"));
  assert.strictEqual(r[0].chave, "orcamento");
});

test("uma menção clara basta: termo forte vale 2 pontos", () => {
  // Era o caso do "meu notebook não liga": com 1 ponto o cliente ficava de
  // fora do segmento Notebook, que é exatamente onde ele deveria estar.
  const r = I.ranking(I.analisarTexto("meu notebook nao liga, voces consertam?"), 2);
  const chaves = r.map((x) => x.chave);
  assert.ok(chaves.includes("notebook"), `veio ${JSON.stringify(chaves)}`);
  assert.ok(chaves.includes("assistencia"));
});

test("conversa sem assunto não entra em segmento nenhum", () => {
  assert.deepStrictEqual(I.ranking(I.analisarTexto("bom dia, tudo bem?"), 2), []);
  assert.deepStrictEqual(I.ranking(I.analisarTexto("obrigado!"), 2), []);
});

test("soma junta as pontuações de várias mensagens", () => {
  const total = I.somar(I.analisarTexto("quero um pc gamer"), I.analisarTexto("com rtx e ryzen"));
  assert.ok(total.pc_gamer >= 3);
});

test("ranking respeita o mínimo e vem ordenado", () => {
  const r = I.ranking({ notebook: 5, celular: 1, rede: 3 }, 2);
  assert.deepStrictEqual(r.map((x) => x.chave), ["notebook", "rede"]);
});

test("assistência reconhece as reclamações mais comuns da loja", () => {
  for (const frase of [
    "meu pc está travando muito",
    "preciso formatar o computador",
    "o note está superaquecendo",
    "quero fazer uma limpeza e trocar a pasta térmica",
  ]) {
    const r = I.ranking(I.analisarTexto(frase));
    assert.ok(
      r.some((x) => x.chave === "assistencia"),
      `não achou assistência em: ${frase}`
    );
  }
});

test("consignado é reconhecido", () => {
  const r = I.ranking(I.analisarTexto("vocês pegam meu pc em consignação?"));
  assert.ok(r.some((x) => x.chave === "consignado"));
});

test("lista de interesses tem nome legível para a tela", () => {
  const lista = I.listarInteresses();
  assert.ok(lista.length >= 8);
  assert.ok(lista.every((i) => i.chave && i.nome));
  assert.strictEqual(I.nomeDoInteresse("pc_gamer"), "PC Gamer");
});
