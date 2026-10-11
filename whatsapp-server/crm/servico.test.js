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

  await t.test("reprocessar interesses relê o passado com as regras atuais", async () => {
    await db.query(`DELETE FROM crm_interesse`);
    let c = await crm.contato("5519999990000@c.us");
    assert.strictEqual(c.interesses.length, 0, "limpou");
    const r = await crm.reprocessarInteresses({ desdeDias: 30 });
    assert.ok(r.contatos >= 1);
    c = await crm.contato("5519999990000@c.us");
    const chaves = c.interesses.map((i) => i.chave);
    assert.ok(chaves.includes("notebook"), `veio ${JSON.stringify(chaves)}`);
    assert.ok(chaves.includes("assistencia"));
  });

  await t.test("estado do banco responde", async () => {
    const e = await crm.estado();
    assert.ok(e.contatos >= 1 && e.mensagens >= 3);
  });

  // ---- Fase 1: o banco da loja passa a guardar a mensagem inteira ----

  await t.test("migração 003: colunas novas e seq com índice único", async () => {
    const r = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'crm_mensagem'`
    );
    const colunas = r.rows.map((x) => x.column_name);
    for (const c of ["chave", "de_mim", "midia", "citada", "reacoes", "editada_em", "apagada", "lid", "seq"]) {
      assert.ok(colunas.includes(c), `faltou a coluna ${c}`);
    }
    const idx = await db.query(`SELECT indexdef FROM pg_indexes WHERE indexname = 'crm_mensagem_seq'`);
    assert.match(idx.rows[0].indexdef, /UNIQUE INDEX crm_mensagem_seq .*\(seq\)/);
  });

  await t.test("registrar devolve o seq; repetir a mesma mensagem não gasta seq", async () => {
    const a = await crm.registrarMensagem(
      msg("S1", "in", "tem fonte de 600W?", 3, {
        chave: { id: "S1", remoteJid: "5519999990000@s.whatsapp.net", fromMe: false },
        citada: { id: "A2", trecho: "Bom dia! Pode trazer na loja", deMim: true },
        midia: { segundos: 4 },
      })
    );
    assert.strictEqual(a.nova, true);
    assert.ok(a.seq > 0);
    const b = await crm.registrarMensagem(msg("S1", "in", "tem fonte de 600W?", 3));
    assert.deepStrictEqual(b, { nova: false, seq: a.seq });
    const linha = await crm.mensagem("S1");
    assert.deepStrictEqual(linha.chave, { id: "S1", remoteJid: "5519999990000@s.whatsapp.net", fromMe: false });
    assert.deepStrictEqual(linha.citada, { id: "A2", trecho: "Bom dia! Pode trazer na loja", deMim: true });
    assert.strictEqual(linha.de_mim, false);
  });

  await t.test("mudança ganha seq novo; o que não muda, não", async () => {
    const antes = Number((await crm.mensagem("S1")).seq);
    const r = await crm.atualizarMensagem("S1", { situacao: "read" });
    assert.ok(r.seq > antes);
    assert.strictEqual(r.chatId, "5519999990000@c.us");
    assert.strictEqual(await crm.atualizarMensagem("S1", { situacao: "read" }), null, "mesma situação não é mudança");
    assert.strictEqual(await crm.atualizarMensagem("NAO-EXISTE", { situacao: "read" }), null);
  });

  await t.test("reação: uma por pessoa, e emoji vazio retira", async () => {
    await crm.atualizarMensagem("A2", { reacao: { de: "cliente", emoji: "👍", em: 1 } });
    await crm.atualizarMensagem("A2", { reacao: { de: "loja", emoji: "❤️", em: 2 } });
    let r = await crm.atualizarMensagem("A2", { reacao: { de: "cliente", emoji: "😂", em: 3 } });
    assert.deepStrictEqual(r.reacoes.map((x) => [x.de, x.emoji]).sort(), [["cliente", "😂"], ["loja", "❤️"]]);
    r = await crm.atualizarMensagem("A2", { reacao: { de: "cliente", emoji: "", em: 4 } });
    assert.deepStrictEqual(r.reacoes.map((x) => x.de), ["loja"]);
  });

  await t.test("apagada para todos NÃO apaga o texto guardado; editada troca o texto", async () => {
    await crm.atualizarMensagem("A9", { apagada: true });
    const a9 = await crm.mensagem("A9");
    assert.strictEqual(a9.apagada, true);
    assert.strictEqual(a9.corpo, "e aí, conseguiu ver?");
    await crm.atualizarMensagem("S1", { corpo: "tem fonte de 650W?", editadaEm: Date.now() });
    const s1 = await crm.mensagem("S1");
    assert.strictEqual(s1.corpo, "tem fonte de 650W?");
    assert.ok(s1.editada_em);
  });

  await t.test("histórico pelo banco: por data, e junta o @lid da conversa", async () => {
    await crm.registrarMensagem({ ...msg("L1", "in", "mensagem antes do número aparecer", 600), chatId: "777@lid" });
    const tudo = await crm.historico({ chatIds: ["5519999990000@c.us", "777@lid"], limite: 50 });
    assert.ok(tudo.some((x) => x.id === "L1"), "a mensagem do @lid entra");
    // Do mais novo para o mais velho.
    for (let i = 1; i < tudo.length; i++) assert.ok(tudo[i - 1].em >= tudo[i].em);
    const pagina = await crm.historico({ chatIds: ["5519999990000@c.us", "777@lid"], limite: 2 });
    const antes = await crm.historico({ chatIds: ["5519999990000@c.us", "777@lid"], antesDe: pagina[1].em.getTime(), limite: 50 });
    assert.ok(antes.every((x) => x.em < pagina[1].em), "maisAntigas pagina para trás pela data");
    assert.strictEqual(antes.length, tudo.length - 2);
  });

  await t.test("desde: o que veio depois do seq, em ordem", async () => {
    const atual = await crm.seqAtual();
    await crm.registrarMensagem(msg("D1", "out", "chegou sim", 0));
    await crm.atualizarMensagem("A2", { situacao: "delivered" });
    const depois = await crm.desde({ seq: atual });
    assert.deepStrictEqual(depois.map((x) => x.id), ["D1", "A2"]);
    assert.ok(Number(depois[1].seq) > Number(depois[0].seq));
    assert.strictEqual(await crm.seqAtual(), Number(depois[1].seq));
    assert.deepStrictEqual((await crm.desde({ seq: atual, limite: 1 })).map((x) => x.id), ["D1"]);
  });

  await t.test("ida e volta: o que o banco devolve tem a mesma cara do webhook", async () => {
    const N = require("../evo/normalizar");
    const { paraOBanco, paraOPainel } = require("./formato");
    const doWebhook = N.normalizarMensagem(
      {
        key: { id: "IDA1", remoteJid: "5519999990000@s.whatsapp.net", fromMe: false },
        pushName: "Cliente Teste",
        messageType: "audioMessage",
        message: { audioMessage: { ptt: true, mimetype: "audio/ogg; codecs=opus", seconds: 9 } },
        contextInfo: { stanzaId: "A2", participant: "5519987510267@s.whatsapp.net", quotedMessage: { conversation: "Bom dia!" } },
        messageTimestamp: Math.floor(agora / 1000),
      },
      { numeroDaLoja: "5519987510267" }
    );
    await crm.registrarMensagem(paraOBanco(doWebhook), { origem: "webhook" });
    const doBanco = paraOPainel(await crm.mensagem("IDA1"), {
      numeroDaLoja: "5519987510267",
      nomeDe: () => "Cliente Teste",
    });
    for (const campo of [
      "id", "chatId", "from", "to", "body", "direction", "timestamp", "contactName", "realNumber",
      "hasMedia", "mediaType", "mimetype", "segundos", "mediaUrl", "status", "chave", "citada",
    ]) {
      assert.deepStrictEqual(doBanco[campo], doWebhook[campo], campo);
    }
    assert.ok(doBanco.seq > 0);
  });

  await t.test("e-mail: guarda na ficha, registra o envio e acha o clique", async () => {
    const chat = "5519999990000@c.us";
    // Conversa sem ficha também ganha o e-mail (cria a linha).
    await crm.definirEmail("5519900001111@c.us", "Novo@Exemplo.com");
    assert.strictEqual((await crm.contato("5519900001111@c.us")).email, "novo@exemplo.com");

    const nota = await crm.registrarEmailEnviado({
      chatId: chat,
      para: "cliente@exemplo.com",
      assunto: "Orçamento com 2 produtos — Balão da Informática",
      envioId: "ENVIO123",
      provedor: "resend",
      vendedor: "Thiago",
      itens: [
        { id: "P1", nome: "Fonte 650W", preco: 399.9, quantidade: 2 },
        { id: "P2", nome: "SSD 1 TB", preco: 349.9, quantidade: 1 },
      ],
    });
    assert.match(nota.texto, /E-mail enviado para cliente@exemplo\.com/);
    assert.match(nota.texto, /2 × Fonte 650W — R\$ 399,90/);
    const ficha = await crm.contato(chat);
    assert.strictEqual(ficha.email, "cliente@exemplo.com");
    assert.ok(ficha.notas.some((n) => n.texto.includes("Fonte 650W")));

    // Envio desconhecido: nada a avisar.
    assert.strictEqual(await crm.registrarCliqueNoEmail({ envioId: "NAOEXISTE", destino: "/x" }), null);

    const c1 = await crm.registrarCliqueNoEmail({ envioId: "ENVIO123", produtoId: "P1", destino: "/product/fonte" });
    assert.strictEqual(c1.chatId, chat);
    assert.strictEqual(c1.produto, "Fonte 650W");
    assert.strictEqual(c1.primeiroClique, true);
    assert.ok(c1.segundosDepois < 60);
    // O mesmo link de novo não é "primeiro clique" (o vendedor não é chamado duas vezes).
    const c2 = await crm.registrarCliqueNoEmail({ envioId: "ENVIO123", produtoId: "P1", destino: "/product/fonte" });
    assert.strictEqual(c2.primeiroClique, false);
    const wa = await crm.registrarCliqueNoEmail({ envioId: "ENVIO123", destino: "wa" });
    assert.strictEqual(wa.whatsapp, true);
    assert.strictEqual(wa.primeiroClique, true);
  });

  await db.pool.end();
});
