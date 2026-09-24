// Testes do serviço do CRM contra um Postgres de verdade.
// Pulam sozinhos quando não há banco (CRM_TESTE_DB não definida).
const test = require("node:test");
const assert = require("node:assert");

const URL_TESTE = process.env.CRM_TESTE_DB;
const pular = !URL_TESTE;

test("serviço do CRM", { skip: pular ? "sem CRM_TESTE_DB" : false }, async (t) => {
  const { abrirBanco } = require("./db");
  const { criarServicoDoCrm } = require("./servico");
  const db = await abrirBanco({ url: URL_TESTE, registrar: () => {} });
  const crm = criarServicoDoCrm({ db, registrar: () => {} });

  // limpa entre execuções
  await db.query(`TRUNCATE crm_mensagem, crm_contato, crm_evento, crm_interesse,
                  crm_contato_etiqueta, crm_etiqueta, crm_nota, crm_consentimento,
                  crm_resposta_rapida RESTART IDENTITY CASCADE`);

  const agora = Date.now();
  const msg = (id, direcao, corpo, minutosAtras = 0, extra = {}) => ({
    id,
    chatId: "5519999990000@c.us",
    direcao,
    corpo,
    numero: "5519999990000",
    contato: "Cliente Teste",
    timestamp: agora - minutosAtras * 60000,
    ...extra,
  });

  await t.test("grava mensagem e cria o contato", async () => {
    await crm.registrarMensagem(msg("A1", "in", "Bom dia, meu notebook não liga", 60));
    const c = await crm.contato("5519999990000@c.us");
    assert.ok(c, "contato devia existir");
    assert.strictEqual(c.entradas, 1);
    assert.strictEqual(c.saidas, 0);
    assert.strictEqual(c.numero, "5519999990000");
  });

  await t.test("classifica o interesse sozinho", async () => {
    const c = await crm.contato("5519999990000@c.us");
    const chaves = c.interesses.map((i) => i.chave);
    assert.ok(chaves.includes("notebook"), `veio ${JSON.stringify(chaves)}`);
    assert.ok(chaves.includes("assistencia"));
  });

  await t.test("não duplica a mesma mensagem", async () => {
    await crm.registrarMensagem(msg("A1", "in", "Bom dia, meu notebook não liga", 60));
    const c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.entradas, 1, "não podia contar duas vezes");
  });

  await t.test("mede o tempo de primeira resposta", async () => {
    await crm.registrarMensagem(msg("A2", "out", "Bom dia! Pode trazer na loja", 50));
    const r = await crm.resumo({ dias: 7 });
    assert.strictEqual(r.primeiraResposta.rodadas, 1);
    assert.strictEqual(r.primeiraResposta.respondidas, 1);
    assert.strictEqual(r.primeiraResposta.medianaSegundos, 600, "10 minutos");
    assert.strictEqual(r.totais.entradas, 1);
    assert.strictEqual(r.totais.saidas, 1);
  });

  await t.test("produto ofertado também vira interesse", async () => {
    await crm.registrarMensagem(
      msg("A3", "out", "Olha esse", 40, {
        produtoId: "123",
        produtoNome: "Notebook Dell Inspiron 15",
        produtoCategoria: "Notebooks",
      })
    );
    const c = await crm.contato("5519999990000@c.us");
    const nb = c.interesses.find((i) => i.chave === "notebook");
    assert.ok(nb.pontos >= 5, `esperava >=5, veio ${nb.pontos}`);
  });

  await t.test("busca dentro das conversas", async () => {
    const r = await crm.buscarMensagens({ texto: "notebook" });
    assert.ok(r.length >= 1);
    assert.ok(r[0].chatId === "5519999990000@c.us");
  });

  await t.test("segmento aparece com a contagem certa", async () => {
    const segs = await crm.segmentos();
    const nb = segs.find((s) => s.chave === "notebook");
    assert.strictEqual(nb.contatos, 1);
  });

  await t.test("filtro de contatos por interesse", async () => {
    const r = await crm.contatos({ interesse: "notebook" });
    assert.strictEqual(r.total, 1);
    const vazio = await crm.contatos({ interesse: "impressora" });
    assert.strictEqual(vazio.total, 0);
  });

  await t.test("etiqueta da loja: cria, aplica, tira e apaga", async () => {
    const id = await crm.salvarEtiqueta({ nome: "VIP", cor: "#ff0000" });
    await crm.marcarEtiqueta("5519999990000@c.us", id, true, "thiago");
    let c = await crm.contato("5519999990000@c.us");
    assert.deepStrictEqual(c.etiquetas, [id]);
    const lista = await crm.listarEtiquetas();
    assert.strictEqual(lista.find((e) => e.id === id).usos, 1);
    await crm.marcarEtiqueta("5519999990000@c.us", id, false);
    c = await crm.contato("5519999990000@c.us");
    assert.deepStrictEqual(c.etiquetas, []);
    await crm.excluirEtiqueta(id);
    assert.strictEqual((await crm.listarEtiquetas()).length, 0);
  });

  await t.test("nota do cliente fica no servidor", async () => {
    const n = await crm.adicionarNota({ chatId: "5519999990000@c.us", texto: "Cliente antigo", autor: "julia" });
    const c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.notas[0].texto, "Cliente antigo");
    await crm.excluirNota(n.id);
    assert.strictEqual((await crm.contato("5519999990000@c.us")).notas.length, 0);
  });

  await t.test("resposta rápida é da equipe, não do navegador", async () => {
    const id = await crm.salvarResposta({ titulo: "Horário", texto: "Abrimos de 9h às 18h", categoria: "Geral" });
    const lista = await crm.listarRespostas();
    assert.strictEqual(lista.length, 1);
    assert.strictEqual(lista[0].texto, "Abrimos de 9h às 18h");
    await crm.salvarResposta({ id, titulo: "Horário", texto: "Abrimos de 9h às 19h" });
    assert.strictEqual((await crm.listarRespostas())[0].texto, "Abrimos de 9h às 19h");
    await crm.excluirResposta(id);
    assert.strictEqual((await crm.listarRespostas()).length, 0);
  });

  await t.test("consentimento fica registrado e some do opt-in ao sair", async () => {
    await crm.registrarConsentimento({
      chatId: "5519999990000@c.us",
      acao: "opt_in",
      canal: "whatsapp",
      texto: "Aceito receber ofertas",
      por: "thiago",
    });
    let c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.optin, true);
    assert.strictEqual(c.consentimento[0].acao, "opt_in");
    await crm.registrarConsentimento({ chatId: "5519999990000@c.us", acao: "opt_out", canal: "whatsapp" });
    c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.optin, false);
    assert.strictEqual(c.optout, true);
  });

  await t.test("fila mostra quem está esperando resposta", async () => {
    await crm.registrarMensagem(msg("A9", "in", "e aí, conseguiu ver?", 5));
    const f = await crm.fila({ limite: 10 });
    assert.ok(f.some((x) => x.chatId === "5519999990000@c.us"));
  });

  await t.test("etapa do funil e vendedor são gravados", async () => {
    await crm.definirEtapa("5519999990000@c.us", "orcamento", "julia");
    await crm.definirVendedor("5519999990000@c.us", "julia");
    const c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.etapa, "orcamento");
    assert.strictEqual(c.vendedorId, "julia");
    const r = await crm.resumo({ dias: 7 });
    assert.ok(r.funil.some((f) => f.etapa === "orcamento" && f.total === 1));
  });

  await t.test("estado do banco responde", async () => {
    const e = await crm.estado();
    assert.ok(e.contatos >= 1 && e.mensagens >= 3);
  });

  await db.pool.end();
});
