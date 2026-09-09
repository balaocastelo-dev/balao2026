// Teste das etiquetas do WhatsApp Business.
//
// O caso real: o painel mostrava uma lista inventada ("Cliente Quente",
// "Interessado") guardada no navegador, sem relação com as etiquetas que a
// loja usa no celular. Etiquetar no sistema não aparecia no aparelho.
//
//   node etiquetas.test.js
//
const assert = require("assert");
const { montarEtiquetas, corEmHex, COR_PADRAO } = require("./etiquetas");

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

console.log("\netiquetas do WhatsApp");

teste("etiqueta com conversas vira lista e mapa", () => {
  const { etiquetas, porConversa } = montarEtiquetas([
    { id: "1", nome: "Pago", cor: "#0f9d58", chatIds: ["a@c.us", "b@c.us"] },
  ]);

  assert.deepStrictEqual(etiquetas, [{ id: "1", nome: "Pago", cor: "#0f9d58" }]);
  assert.deepStrictEqual(porConversa, { "a@c.us": ["Pago"], "b@c.us": ["Pago"] });
});

teste("a mesma conversa acumula várias etiquetas", () => {
  const { porConversa } = montarEtiquetas([
    { id: "1", nome: "Pago", chatIds: ["a@c.us"] },
    { id: "2", nome: "Entregue", chatIds: ["a@c.us"] },
  ]);
  assert.deepStrictEqual(porConversa["a@c.us"], ["Entregue", "Pago"]);
});

teste("cor em número vira hexadecimal", () => {
  // O WhatsApp guarda a cor como inteiro ARGB. Sem converter, a etiqueta
  // vermelha do celular chegaria como "4294198070" e viraria cinza no painel.
  assert.strictEqual(corEmHex(4294198070), "#f44336"); // 0xFFF44336, o vermelho
  assert.strictEqual(corEmHex(4279213400), "#0f9d58"); // 0xFF0F9D58, o verde
});

teste("cor em texto com alfa perde o alfa e mantém a cor", () => {
  assert.strictEqual(corEmHex("#FF0F9D58"), "#0f9d58");
  assert.strictEqual(corEmHex("#0F9D58"), "#0f9d58");
});

teste("sem cor, usa o cinza neutro em vez de inventar", () => {
  const { etiquetas } = montarEtiquetas([{ id: "1", nome: "Sem cor", chatIds: [] }]);
  assert.strictEqual(etiquetas[0].cor, COR_PADRAO);
});

teste("etiqueta sem nome é descartada", () => {
  const { etiquetas } = montarEtiquetas([
    { id: "1", nome: "   ", chatIds: ["a@c.us"] },
    { id: "2", nome: "Boa", chatIds: [] },
  ]);
  assert.strictEqual(etiquetas.length, 1);
  assert.strictEqual(etiquetas[0].nome, "Boa");
});

teste("aceita o formato da biblioteca (name / hexColor)", () => {
  // `client.getLabels()` devolve `name` e `hexColor`; a leitura pela página
  // devolve `nome` e `cor`. Os dois precisam funcionar.
  const { etiquetas } = montarEtiquetas([{ id: "9", name: "Orçamento", hexColor: "#1a73e8" }]);
  assert.strictEqual(etiquetas[0].nome, "Orçamento");
  assert.strictEqual(etiquetas[0].cor, "#1a73e8");
});

teste("ordem é a mesma em qualquer computador", () => {
  // Sem ordenar, cada vendedor veria a lista numa ordem diferente e a mesma
  // etiqueta mudaria de lugar a cada sincronização.
  const { etiquetas } = montarEtiquetas([
    { id: "1", nome: "Zap", chatIds: [] },
    { id: "2", nome: "Ávido", chatIds: [] },
    { id: "3", nome: "Boleto", chatIds: [] },
  ]);
  assert.deepStrictEqual(etiquetas.map((e) => e.nome), ["Ávido", "Boleto", "Zap"]);
});

teste("lista vazia ou inválida não quebra", () => {
  assert.deepStrictEqual(montarEtiquetas([]), { etiquetas: [], porConversa: {} });
  assert.deepStrictEqual(montarEtiquetas(null), { etiquetas: [], porConversa: {} });
  assert.deepStrictEqual(montarEtiquetas(undefined).etiquetas, []);
});

teste("conversa repetida na mesma etiqueta não duplica", () => {
  const { porConversa } = montarEtiquetas([
    { id: "1", nome: "Pago", chatIds: ["a@c.us", "a@c.us"] },
  ]);
  assert.deepStrictEqual(porConversa["a@c.us"], ["Pago"]);
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
