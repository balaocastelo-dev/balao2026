// Teste dos números do dashboard.
//
// Dashboard que mostra número errado é pior que dashboard nenhum: ninguém
// desconfia de um gráfico bonito. Cada caso aqui trava um número que aparece
// na tela do /crm.
//
//   node metricas.test.js
//
const assert = require("assert");
const { calcularMetricas } = require("./metricas");

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

// Meio-dia em Campinas (UTC-3) — longe da virada do dia nos dois fusos.
const AGORA = Date.parse("2026-09-08T15:00:00.000Z");
const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

function montar(extra = {}) {
  return {
    chats: [],
    messages: [],
    vendedores: [],
    vendas: [],
    chatAssignments: {},
    kanbanPorVendedor: {},
    preferenciasPorVendedor: {},
    ...extra,
  };
}

const opcoes = { agora: AGORA, dias: 14 };

console.log("\nmétricas do dashboard");

teste("store vazio não quebra e devolve tudo zerado", () => {
  const m = calcularMetricas(montar(), opcoes);
  assert.strictEqual(m.clientes.total, 0);
  assert.strictEqual(m.mensagens.total, 0);
  assert.strictEqual(m.vendas.faturamento, 0);
  assert.strictEqual(m.serie.length, 14);
  assert.strictEqual(m.porHora.length, 24);
});

teste("a série tem um ponto por dia, inclusive nos dias parados", () => {
  // Sem isto o gráfico pularia o domingo sem movimento e a linha mentiria
  // sobre o ritmo da semana.
  const m = calcularMetricas(
    montar({
      messages: [
        { chatId: "a@c.us", direction: "in", timestamp: AGORA },
        { chatId: "a@c.us", direction: "in", timestamp: AGORA - 3 * DIA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.serie.length, 14);
  assert.strictEqual(m.serie[m.serie.length - 1].recebidas, 1);
  assert.strictEqual(m.serie[m.serie.length - 4].recebidas, 1);
  assert.strictEqual(m.serie[m.serie.length - 2].recebidas, 0);
});

teste("mensagem da noite conta no dia certo (fuso de Campinas)", () => {
  // 23h de Campinas = 02h do dia seguinte em UTC. Em UTC isso apareceria como
  // movimento num dia em que a loja estava fechada.
  const ontemTarde = Date.parse("2026-09-08T02:30:00.000Z"); // 07/09 23:30 em Campinas
  const m = calcularMetricas(
    montar({ messages: [{ chatId: "a@c.us", direction: "in", timestamp: ontemTarde }] }),
    opcoes
  );
  const dia7 = m.serie.find((s) => s.dia === "2026-09-07");
  assert.ok(dia7, "dia 07 não está na série");
  assert.strictEqual(dia7.recebidas, 1);
  assert.strictEqual(m.mensagens.recebidasHoje, 0);
});

teste("cliente esperando resposta é contado", () => {
  // O número que mais importa: cada unidade aqui é uma pessoa parada.
  const m = calcularMetricas(
    montar({
      chats: [{ chatId: "a@c.us" }, { chatId: "b@c.us" }],
      messages: [
        { chatId: "a@c.us", direction: "in", timestamp: AGORA - HORA },
        { chatId: "b@c.us", direction: "in", timestamp: AGORA - 2 * HORA },
        { chatId: "b@c.us", direction: "out", timestamp: AGORA - HORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.clientes.semResposta, 1);
});

teste("comissão usa o percentual congelado na venda", () => {
  // Mudar o percentual do vendedor hoje não pode reescrever o que ele já
  // ganhou no mês passado.
  const m = calcularMetricas(
    montar({
      vendedores: [{ id: "julia", nome: "Julia", comissaoPercentual: 10 }],
      vendas: [
        { id: "1", vendedorId: "julia", valor: 1000, data: AGORA, comissaoPercentual: 3 },
        { id: "2", vendedorId: "julia", valor: 500, data: AGORA },
      ],
    }),
    opcoes
  );
  // 1000 * 3% = 30 (congelado) + 500 * 10% = 50 (percentual atual) = 80
  assert.strictEqual(m.vendas.comissaoTotal, 80);
  assert.strictEqual(m.vendedores[0].comissao, 80);
  assert.strictEqual(m.vendedores[0].faturamento, 1500);
});

teste("centavos não viram dízima", () => {
  // 0.1 + 0.2 dá 0.30000000000000004 em ponto flutuante — e isso apareceria
  // na tela do dashboard.
  const m = calcularMetricas(
    montar({
      vendedores: [{ id: "a", nome: "A", comissaoPercentual: 5 }],
      vendas: [
        { id: "1", vendedorId: "a", valor: 0.1, data: AGORA },
        { id: "2", vendedorId: "a", valor: 0.2, data: AGORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.vendas.faturamento, 0.3);
});

teste("ticket médio é faturamento dividido por venda, não por cliente", () => {
  const m = calcularMetricas(
    montar({
      vendedores: [{ id: "a", nome: "A", comissaoPercentual: 0 }],
      vendas: [
        { id: "1", vendedorId: "a", valor: 300, data: AGORA },
        { id: "2", vendedorId: "a", valor: 100, data: AGORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.vendas.ticketMedio, 200);
  assert.strictEqual(m.vendedores[0].ticketMedio, 200);
});

teste("sem meta, o progresso é null — não 0% nem 100%", () => {
  // "Não medido" e "não atingido" são coisas diferentes; mostrar 0% acusaria
  // o vendedor de não bater uma meta que ninguém definiu.
  const m = calcularMetricas(
    montar({
      vendedores: [
        { id: "a", nome: "Sem meta", comissaoPercentual: 5 },
        { id: "b", nome: "Com meta", comissaoPercentual: 5, meta: 1000 },
      ],
      vendas: [{ id: "1", vendedorId: "b", valor: 250, data: AGORA }],
    }),
    opcoes
  );
  const semMeta = m.vendedores.find((v) => v.id === "a");
  const comMeta = m.vendedores.find((v) => v.id === "b");
  assert.strictEqual(semMeta.progressoMeta, null);
  assert.strictEqual(comMeta.progressoMeta, 25);
});

teste("mensagem enviada conta para o dono da conversa", () => {
  const m = calcularMetricas(
    montar({
      vendedores: [{ id: "marcos", nome: "Marcos", comissaoPercentual: 0 }],
      chatAssignments: { "a@c.us": "marcos" },
      messages: [
        { chatId: "a@c.us", direction: "out", timestamp: AGORA },
        { chatId: "a@c.us", direction: "in", timestamp: AGORA - HORA },
        // Conversa sem dono não pode ser creditada a ninguém.
        { chatId: "z@c.us", direction: "out", timestamp: AGORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.vendedores[0].mensagensEnviadas, 1);
  assert.strictEqual(m.vendedores[0].mensagensHoje, 1);
  assert.strictEqual(m.vendedores[0].conversas, 1);
});

teste("o vendedorId gravado na mensagem tem preferência sobre a atribuição", () => {
  // Quem realmente digitou é quem mandou, mesmo que a conversa esteja
  // atribuída a outra pessoa.
  const m = calcularMetricas(
    montar({
      vendedores: [
        { id: "marcos", nome: "Marcos", comissaoPercentual: 0 },
        { id: "julia", nome: "Julia", comissaoPercentual: 0 },
      ],
      chatAssignments: { "a@c.us": "marcos" },
      messages: [{ chatId: "a@c.us", direction: "out", timestamp: AGORA, vendedorId: "julia" }],
    }),
    opcoes
  );
  assert.strictEqual(m.vendedores.find((v) => v.id === "julia").mensagensEnviadas, 1);
  assert.strictEqual(m.vendedores.find((v) => v.id === "marcos").mensagensEnviadas, 0);
});

teste("o funil usa o nome que o vendedor deu à coluna", () => {
  const m = calcularMetricas(
    montar({
      kanbanPorVendedor: { julia: { "a@c.us": "negociacao", "b@c.us": "minha_coluna" } },
      preferenciasPorVendedor: {
        julia: { kanbanColunas: [{ id: "minha_coluna", nome: "Aguardando peça", cor: "#123456" }] },
      },
    }),
    opcoes
  );
  const minha = m.funil.find((f) => f.id === "minha_coluna");
  assert.strictEqual(minha.nome, "Aguardando peça");
  assert.strictEqual(minha.cor, "#123456");
  assert.strictEqual(m.funil.find((f) => f.id === "negociacao").nome, "Em Negociação");
});

teste("coluna guardada sob outro vendedor ainda mostra o nome", () => {
  // Cartão e coluna podem estar sob pessoas diferentes. Sem procurar nas
  // preferências de todo mundo, a tela mostrava `col-1787528992522` — um id
  // interno, que para quem olha o painel parece defeito.
  const m = calcularMetricas(
    montar({
      kanbanPorVendedor: { marcos: { "a@c.us": "col-1787528992522" } },
      preferenciasPorVendedor: {
        julia: {
          kanbanColunas: [{ id: "col-1787528992522", nome: "Aguardando peça", cor: "#abcdef" }],
        },
      },
    }),
    opcoes
  );
  assert.strictEqual(m.funil[0].nome, "Aguardando peça");
  assert.strictEqual(m.funil[0].cor, "#abcdef");
});

teste("coluna que ninguém nomeou não mostra o id cru", () => {
  const m = calcularMetricas(
    montar({ kanbanPorVendedor: { marcos: { "a@c.us": "col-999" } } }),
    opcoes
  );
  assert.strictEqual(m.funil[0].nome, "Coluna sem nome");
});

teste("cartão fora do funil não entra na contagem", () => {
  const m = calcularMetricas(
    montar({ kanbanPorVendedor: { julia: { "a@c.us": "fora", "b@c.us": "novos" } } }),
    opcoes
  );
  assert.strictEqual(m.funil.length, 1);
  assert.strictEqual(m.funil[0].id, "novos");
});

teste("valor de venda sujo não vira NaN na tela", () => {
  const m = calcularMetricas(
    montar({
      vendedores: [{ id: "a", nome: "A", comissaoPercentual: 5 }],
      vendas: [
        { id: "1", vendedorId: "a", valor: "abc", data: AGORA },
        { id: "2", vendedorId: "a", valor: 100, data: AGORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.vendas.faturamento, 100);
  assert.ok(!Number.isNaN(m.vendas.comissaoTotal));
});

teste("clientes ativos nas últimas 24h", () => {
  const m = calcularMetricas(
    montar({
      chats: [{ chatId: "a@c.us" }, { chatId: "b@c.us" }, { chatId: "c@c.us" }],
      messages: [
        { chatId: "a@c.us", direction: "in", timestamp: AGORA - 2 * HORA },
        { chatId: "b@c.us", direction: "in", timestamp: AGORA - 3 * DIA },
        { chatId: "c@c.us", direction: "in", timestamp: AGORA - 30 * DIA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.clientes.ativos24h, 1);
  assert.strictEqual(m.clientes.ativos7d, 2);
});

teste("o ranking põe quem mais faturou na frente", () => {
  const m = calcularMetricas(
    montar({
      vendedores: [
        { id: "a", nome: "A", comissaoPercentual: 5 },
        { id: "b", nome: "B", comissaoPercentual: 5 },
      ],
      vendas: [
        { id: "1", vendedorId: "b", valor: 900, data: AGORA },
        { id: "2", vendedorId: "a", valor: 100, data: AGORA },
      ],
    }),
    opcoes
  );
  assert.strictEqual(m.vendedores[0].id, "b");
});

console.log(falhas ? `\n${falhas} falha(s)\n` : "\ntudo certo\n");
process.exit(falhas ? 1 : 0);
