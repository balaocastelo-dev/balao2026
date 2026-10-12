// Testes do lado da VPS do agente JUL.IA: quando ele pode falar, o que
// acontece com o que o PC devolve. Sem WhatsApp e sem PC: tudo trocado por
// funções falsas. Com CRM_TESTE_DB, confere também a gravação no Postgres.
//
//   node --test agente/agente.test.js
//   CRM_TESTE_DB=postgres://... node --test agente/agente.test.js

const test = require("node:test");
const assert = require("node:assert/strict");
const { criarAgente } = require("./agente");
const R = require("./regras");

const TESTE = "5519984515960@c.us"; // número pessoal do Thiago
const CLIENTE = "5519911112222@c.us";

function bancada({ db = null } = {}) {
  let relogio = Date.UTC(2026, 9, 12, 14, 0, 0);
  const conversas = new Map(); // chatId -> [msg]
  const atribuicoes = {};
  const enviados = [];
  const avisos = [];
  const notas = [];
  const eventos = [];
  const telegramas = [];
  const transcricoes = [];
  const digitando = [];
  let seq = 0;
  let falha = false;
  const catalogo = { 101: { id: 101, name: "Notebook Teste i5 16GB", price: "3.499,00", slug: "notebook-teste" } };

  const agente = criarAgente({
    db,
    agora: () => relogio,
    ultimaDaConversa: (chatId) => {
      const l = conversas.get(chatId) || [];
      return l[l.length - 1] || null;
    },
    mensagensDaConversa: async (chatId) => conversas.get(chatId) || [],
    nomeDe: () => "Cliente Teste",
    vendedorDe: (chatId) => atribuicoes[chatId] || null,
    atribuir: (chatId, id) => {
      if (id) atribuicoes[chatId] = id;
      else delete atribuicoes[chatId];
    },
    produtoDoCatalogo: (id) => catalogo[id] || null,
    enviarTexto: async ({ chatId, texto, vendedorId }) => {
      if (falha) throw new Error("A Evolution não confirmou o envio (sem id).");
      const m = { id: `S${++seq}`, chatId, direction: "out", body: texto, timestamp: relogio };
      enviados.push({ ...m, vendedorId });
      return m;
    },
    enviarProduto: async ({ chatId, produto, aoMontar }) => {
      aoMontar?.(`*${produto.name}*`);
      const m = { id: `S${++seq}`, chatId, direction: "out", body: `*${produto.name}*`, timestamp: relogio };
      enviados.push({ ...m, produto: produto.id });
      return m;
    },
    guardarTranscricao: async (id, texto) => transcricoes.push({ id, texto }),
    digitando: async (chatId) => digitando.push(chatId),
    avisar: (d) => avisos.push(d),
    telegram: async (t) => telegramas.push(t),
    nota: async (n) => notas.push(n),
    evento: async (tipo, d) => eventos.push({ tipo, ...d }),
    registrar: () => {},
  });

  async function chega(chatId, body, { atras = 0 } = {}) {
    const m = { id: `E${++seq}`, chatId, direction: "in", body, timestamp: relogio - atras };
    conversas.set(chatId, [...(conversas.get(chatId) || []), m]);
    await agente.aoMensagem(m, { nova: true });
    return m;
  }
  async function saiDoCelular(chatId, body) {
    const m = { id: `C${++seq}`, chatId, direction: "out", body, timestamp: relogio };
    conversas.set(chatId, [...(conversas.get(chatId) || []), m]);
    await agente.aoMensagem(m, { nova: true });
    return m;
  }
  const passar = (ms) => (relogio += ms);

  return { agente, chega, saiDoCelular, passar, falhar: (v) => (falha = v), enviados, avisos, notas, eventos, telegramas, transcricoes, atribuicoes, conversas, digitando };
}

test("desligado não entrega trabalho nenhum", async () => {
  const b = bancada();
  await b.chega(TESTE, "oi");
  b.passar(10_000);
  assert.equal(await b.agente.proximoTrabalho(), null);
});

test("modo teste: só os números do Thiago; espera o cliente terminar de digitar", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico" }, "Thiago");
  assert.equal(b.agente.config.publico, "teste", "o público padrão é o de teste");
  await b.chega(CLIENTE, "quero um notebook");
  await b.chega(TESTE, "quero um notebook");
  b.passar(3_000);
  assert.equal(await b.agente.proximoTrabalho(), null, "3 s depois ainda espera");
  b.passar(6_000);
  const t = await b.agente.proximoTrabalho();
  assert.equal(t.chatId, TESTE);
  assert.equal(t.primeiraVez, true);
  assert.equal(t.mensagens.at(-1).de, "cliente");
  assert.equal(await b.agente.proximoTrabalho(), null, "o cliente de verdade não entra no modo teste");
});

test("público clientes: responde, manda produto do catálogo, atribui à JUL.IA e não repete", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  const pergunta = await b.chega(CLIENTE, "tem notebook i5?");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  assert.equal(t.ultimaId, pergunta.id);
  const r = await b.agente.concluir({
    id: t.id,
    chatId: CLIENTE,
    respostas: [
      { tipo: "texto", texto: "Oi! Aqui é a JUL.IA. Tenho este:" },
      { tipo: "produto", produtoId: "101" },
      { tipo: "produto", produtoId: "999" }, // não está no catálogo: não sai
    ],
  });
  assert.equal(r.aceito, true);
  assert.equal(b.enviados.length, 2);
  assert.equal(b.enviados[0].vendedorId, R.ID_DO_AGENTE);
  assert.equal(b.enviados[1].produto, 101);
  assert.equal(b.atribuicoes[CLIENTE], R.ID_DO_AGENTE);
  b.passar(20_000);
  assert.equal(await b.agente.proximoTrabalho(), null, "a mesma mensagem não é respondida duas vezes");

  // O eco do que o robô mandou volta pelo webhook como "nova": não é gente.
  for (const e of b.enviados) await b.agente.aoMensagem({ ...e, direction: "out" }, { nova: true });
  await b.chega(CLIENTE, "e o preço no cartão?");
  b.passar(9_000);
  const t2 = await b.agente.proximoTrabalho();
  assert.ok(t2, "segue atendendo depois do próprio eco");
  assert.deepEqual(
    t2.mensagens.map((m) => m.de),
    ["cliente", "cliente"],
    "a lista de teste só tem as entradas (os envios falsos não entram no histórico)"
  );
});

test("vendedor responde pelo celular: o robô sai da conversa por 24 h", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  await b.chega(CLIENTE, "oi");
  await b.saiDoCelular(CLIENTE, "Oi, aqui é o Marcos!");
  await b.chega(CLIENTE, "oi Marcos, tem notebook?");
  b.passar(9_000);
  assert.equal(await b.agente.proximoTrabalho(), null);
  const pq = await b.agente.porQue(CLIENTE);
  assert.equal(pq.motivo, "vendedor respondeu");
  b.passar(25 * 3_600_000);
  await b.chega(CLIENTE, "alguém aí?");
  b.passar(9_000);
  assert.ok(await b.agente.proximoTrabalho(), "depois de 24 h sem o vendedor, volta");
});

test("conversa atribuída a um vendedor não é do robô; devolver à JUL.IA responde o que ficou", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  b.atribuicoes[CLIENTE] = "marcos";
  await b.chega(CLIENTE, "oi");
  b.passar(9_000);
  assert.equal(await b.agente.proximoTrabalho(), null);
  b.atribuicoes[CLIENTE] = R.ID_DO_AGENTE;
  await b.agente.aoAtribuir(CLIENTE, R.ID_DO_AGENTE);
  assert.ok(await b.agente.proximoTrabalho());
});

test("cliente manda mais mensagem enquanto o PC pensa: nada é enviado e a conversa volta à fila", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  await b.chega(CLIENTE, "quero um pc");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  b.passar(5_000);
  await b.chega(CLIENTE, "pra jogar");
  const r = await b.agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "Para que uso?" }] });
  assert.equal(r.refazer, true);
  assert.equal(b.enviados.length, 0);
  b.passar(9_000);
  const t2 = await b.agente.proximoTrabalho();
  assert.equal(t2.mensagens.at(-1).texto, "pra jogar");
});

test("vendedor assume no meio: a resposta não sai, mas o pedido emitido no Bling é registrado", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  await b.chega(CLIENTE, "pode fechar");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  b.atribuicoes[CLIENTE] = "julia";
  await b.agente.aoAtribuir(CLIENTE, "julia");
  const r = await b.agente.concluir({
    id: t.id,
    chatId: CLIENTE,
    respostas: [{ tipo: "texto", texto: "Pedido feito!" }],
    acoes: [{ tipo: "venda", numero: "24800", total: 3499, itens: [{ nome: "Notebook", quantidade: 1, valor: 3499 }] }],
  });
  assert.equal(r.aceito, false);
  assert.equal(b.enviados.length, 0);
  assert.equal(b.notas.length, 1);
  assert.match(b.notas[0].texto, /Pedido de venda nº 24800/);
  assert.equal(b.telegramas.length, 1, "venda avisa o Thiago no Telegram");
});

test("copiloto: vira sugestão para o vendedor; enviar a sugestão manda e não pausa o robô", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "copiloto", publico: "clientes" });
  await b.chega(CLIENTE, "tem impressora?");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  await b.agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "Tenho sim!" }] });
  assert.equal(b.enviados.length, 0);
  const [sug] = b.agente.sugestoesDe(CLIENTE);
  assert.ok(sug);
  assert.equal(b.avisos.find((a) => a.tipo === "sugestao").sugestao.id, sug.id);
  const r = await b.agente.enviarSugestao(sug.id, { vendedorId: "marcos" });
  assert.equal(r.enviados, 1);
  assert.equal(b.enviados[0].vendedorId, "marcos");
  await assert.rejects(b.agente.enviarSugestao(sug.id), /não existe mais/);
});

test("pedir um vendedor: conversa sai do robô, aviso no painel, atribuição liberada", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  b.atribuicoes[CLIENTE] = R.ID_DO_AGENTE;
  await b.chega(CLIENTE, "quero falar com uma pessoa");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  await b.agente.concluir({
    id: t.id,
    chatId: CLIENTE,
    respostas: [{ tipo: "texto", texto: "Claro! Já chamo um vendedor." }],
    transferir: { motivo: "cliente pediu atendente" },
  });
  assert.equal(b.enviados.length, 1);
  assert.equal(b.atribuicoes[CLIENTE], undefined);
  assert.ok(b.avisos.some((a) => a.tipo === "transferencia" && /pediu um vendedor/.test(a.texto)));
  await b.chega(CLIENTE, "oi?");
  b.passar(9_000);
  assert.equal(await b.agente.proximoTrabalho(), null);
});

test("erros seguidos na mesma conversa (o cliente mandando mais): chama gente", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  for (let i = 0; i < R.ERROS_ATE_CHAMAR_GENTE; i++) {
    await b.chega(CLIENTE, `msg ${i}`);
    b.passar(R.ESPERA_DEPOIS_DE_ERRO_MS + 1_000);
    const t = await b.agente.proximoTrabalho();
    assert.ok(t, `trabalho ${i}`);
    await b.agente.concluir({ id: t.id, chatId: CLIENTE, erro: "Ollama fora do ar" });
  }
  assert.ok(b.avisos.some((a) => a.tipo === "transferencia"));
});

test("trabalho que o PC não devolveu volta para a fila depois do prazo", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  await b.chega(CLIENTE, "oi");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  assert.equal(await b.agente.proximoTrabalho(), null);
  b.passar(R.PRAZO_DO_TRABALHO_MS + 1_000);
  // Passou da janela de 45 min? Não: 4 min. Volta.
  const t2 = await b.agente.proximoTrabalho();
  assert.ok(t2 && t2.id !== t.id);
  const tarde = await b.agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "atrasada" }] });
  assert.equal(tarde.aceito, false, "a resposta do trabalho vencido não sai");
  assert.equal(b.enviados.length, 0);
});

test("mensagem velha (antes de ligar ou além de 45 min) não é respondida; SAIR também não", async () => {
  const b = bancada();
  await b.chega(CLIENTE, "oi de ontem", { atras: 50 * 60_000 });
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  assert.equal(await b.agente.proximoTrabalho(), null);
  const outro = "5519933334444@c.us";
  await b.chega(outro, "SAIR");
  b.passar(9_000);
  assert.equal(await b.agente.proximoTrabalho(), null);
});

test("transcrição que o PC fez é guardada mesmo quando a resposta não sai", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  const audio = await b.chega(CLIENTE, "🎤 Mensagem de voz");
  b.passar(9_000);
  const t = await b.agente.proximoTrabalho();
  await b.agente.configurar({ modo: "desligado" });
  await b.agente.concluir({ id: t.id, chatId: CLIENTE, transcricoes: [{ id: audio.id, texto: "queria um mouse" }], respostas: [{ tipo: "texto", texto: "x" }] });
  assert.deepEqual(b.transcricoes, [{ id: audio.id, texto: "queria um mouse" }]);
  assert.equal(b.enviados.length, 0);
});

test("envio que falha: a mensagem continua sem resposta, tenta de novo em 1 min e na terceira chama gente", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico", publico: "clientes" });
  // A Evolution recusa tudo.
  const agente = b.agente;
  await b.chega(CLIENTE, "oi");
  b.passar(9_000);
  let t = await agente.proximoTrabalho();
  // Troca o envio por um que falha (bancada simples: sobrescreve via configurar de dependência não exposta).
  b.falhar(true);
  await agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "Oi!" }] });
  assert.equal(await agente.proximoTrabalho(), null, "espera 1 minuto");
  b.passar(61_000);
  t = await agente.proximoTrabalho();
  assert.ok(t, "tenta de novo a mesma mensagem");
  await agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "Oi!" }] });
  b.passar(61_000);
  t = await agente.proximoTrabalho();
  await agente.concluir({ id: t.id, chatId: CLIENTE, respostas: [{ tipo: "texto", texto: "Oi!" }] });
  assert.ok(b.avisos.some((a) => a.tipo === "transferencia" && /recusou o envio 3 vezes/.test(a.texto)));
});

test("validarResultado corta o que passa do limite e ignora lixo", () => {
  const r = R.validarResultado({
    id: "a",
    chatId: "b",
    respostas: [
      { tipo: "texto", texto: "x".repeat(5000) },
      { tipo: "html", texto: "<b>" },
      { tipo: "produto" },
      ...Array.from({ length: 10 }, () => ({ tipo: "texto", texto: "y" })),
    ],
    acoes: [{ tipo: "apagar_tudo" }, { tipo: "orcamento", numero: 1, total: "10", itens: [{ nome: "A", quantidade: "2", valor: "5" }] }],
  });
  assert.equal(r.ok, true);
  assert.equal(r.respostas.length, 6);
  assert.equal(r.respostas[0].texto.length, 1500);
  assert.equal(r.acoes.length, 1);
  assert.equal(r.acoes[0].itens[0].quantidade, 2);
  assert.equal(R.validarResultado({}).ok, false);
});

const URL_TESTE = process.env.CRM_TESTE_DB;
test("Postgres: configuração e situação da conversa sobrevivem a reinício", { skip: URL_TESTE ? false : "sem CRM_TESTE_DB" }, async () => {
  const { abrirBanco } = require("../crm/db");
  const db = await abrirBanco({ url: URL_TESTE, registrar: () => {} });
  try {
    await db.query("DELETE FROM crm_agente_conversa");
    await db.query("DELETE FROM crm_config WHERE chave = 'agente'");
    const b = bancada({ db });
    await b.agente.configurar({ modo: "automatico", publico: "clientes", vendaAutomatica: false }, "Thiago");
    await b.chega(CLIENTE, "oi");
    await b.saiDoCelular(CLIENTE, "Oi, é o Marcos");

    const b2 = bancada({ db });
    await b2.agente.iniciar();
    assert.equal(b2.agente.config.modo, "automatico");
    assert.equal(b2.agente.config.vendaAutomatica, false);
    const pq = await b2.agente.porQue(CLIENTE);
    assert.equal(pq.situacao, "humano");
    const l = await db.query("SELECT atualizado_por FROM crm_config WHERE chave = 'agente'");
    assert.equal(l.rows[0].atualizado_por, "Thiago");
  } finally {
    await db.pool.end();
  }
});

test("o cliente vê \"digitando…\" do pegar da conversa até a resposta (só no automático)", async (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  const b = bancada();
  await b.agente.configurar({ modo: "automatico" });
  await b.chega(TESTE, "tem monitor 27?");
  b.passar(R.ESPERA_MS + 1_000);
  const tr = await b.agente.proximoTrabalho();
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(b.digitando, [TESTE], "na hora em que o PC pega");
  t.mock.timers.tick(R.DIGITANDO_A_CADA_MS);
  await new Promise((r) => setImmediate(r));
  assert.equal(b.digitando.length, 2, "renovado enquanto pensa");
  await b.agente.concluir({ id: tr.id, chatId: TESTE, respostas: [{ tipo: "texto", texto: "Tenho sim!" }] });
  t.mock.timers.tick(R.DIGITANDO_A_CADA_MS * 3);
  await new Promise((r) => setImmediate(r));
  assert.equal(b.digitando.length, 2, "depois da resposta, para");

  const c = bancada();
  await c.agente.configurar({ modo: "copiloto" });
  await c.chega(TESTE, "tem monitor 27?");
  c.passar(R.ESPERA_MS + 1_000);
  assert.ok(await c.agente.proximoTrabalho());
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(c.digitando, [], "no copiloto quem responde é o vendedor: nada de digitando");
});

test("duas conversas ao mesmo tempo: dois pedidos juntos não pegam a mesma", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico" });
  await b.chega(TESTE, "oi, tem notebook?");
  b.passar(R.ESPERA_MS + 1_000);
  const [t1, t2] = await Promise.all([b.agente.proximoTrabalho(), b.agente.proximoTrabalho()]);
  assert.equal([t1, t2].filter(Boolean).length, 1, "uma conversa, um trabalho");
  await b.chega("5519987510267@c.us", "e cadeira gamer?");
  b.passar(R.ESPERA_MS + 1_000);
  const t3 = await b.agente.proximoTrabalho();
  assert.equal(t3.chatId, "5519987510267@c.us", "a outra conversa vai para o segundo trabalhador");
});

test("dois erros seguidos do PC: a conversa passa para um vendedor", async () => {
  const b = bancada();
  await b.agente.configurar({ modo: "automatico" });
  await b.chega(TESTE, "tem notebook?");
  for (let i = 0; i < R.ERROS_ATE_CHAMAR_GENTE; i++) {
    b.passar(Math.max(R.ESPERA_MS, R.ESPERA_DEPOIS_DE_ERRO_MS) + 1_000);
    const t = await b.agente.proximoTrabalho();
    assert.ok(t, `trabalho ${i + 1}: o erro não deixa a mensagem sem resposta`);
    await b.agente.concluir({ id: t.id, chatId: TESTE, erro: "timed out" });
  }
  b.passar(R.ESPERA_DEPOIS_DE_ERRO_MS + 1_000);
  assert.equal(await b.agente.proximoTrabalho(), null, "depois do segundo erro, com gente");
  assert.ok(b.avisos.some((a) => a.tipo === "transferencia"));
  assert.equal(b.enviados.at(-1).body, R.TEXTO_CHAMEI_VENDEDOR, "e o cliente fica sabendo");
});
