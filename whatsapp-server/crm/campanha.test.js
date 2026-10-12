// Disparo por tema contra um Postgres de verdade, com relógio falso e um
// "enviar" de mentira (nenhuma mensagem sai daqui).
//
//   CAMPANHA_TESTE_DB=postgres://postgres:teste@localhost:5432/disparo_teste node --test crm/campanha.test.js
//
// As tabelas crm_* do banco indicado são ESVAZIADAS. Pula sozinho sem a variável.
const test = require("node:test");
const assert = require("node:assert");

const URL_TESTE = process.env.CAMPANHA_TESTE_DB;
const DIA = 24 * 60 * 60 * 1000;
const ms = (iso) => Date.parse(iso);

test("disparo por tema", { skip: URL_TESTE ? false : "sem CAMPANHA_TESTE_DB" }, async (t) => {
  const { abrirBanco } = require("./db");
  const { criarServicoDoCrm } = require("./servico");
  const { criarCampanhas, opcoesDoAmbiente } = require("./campanha");
  const R = require("./campanha-regras");

  const db = await abrirBanco({ url: URL_TESTE, registrar: () => {} });
  const crm = criarServicoDoCrm({ db, registrar: () => {} });
  await db.query(`TRUNCATE crm_campanha_envio, crm_campanha, crm_mensagem, crm_contato, crm_evento, crm_interesse,
                  crm_contato_etiqueta, crm_etiqueta, crm_nota, crm_consentimento, crm_config RESTART IDENTITY CASCADE`);

  // Segunda-feira, 12/10/2026, 10h em São Paulo.
  const BASE = ms("2026-10-12T13:00:00Z");
  let relogio = BASE;
  let seq = 0;
  const conversa = (chatId, nome, corpo, diasAtras, direcao = "in") =>
    crm.registrarMensagem({
      id: `M${++seq}`,
      chatId,
      direcao,
      corpo,
      numero: chatId.replace(/@.*/, ""),
      contato: nome,
      timestamp: BASE - diasAtras * DIA,
    });

  // Números inventados (5500000000xxx): nenhum é de cliente.
  const A = "5500000000101@c.us"; // notebook, 1 dia
  const B = "5500000000102@c.us"; // pc gamer, 2 dias
  const C = "5500000000103@c.us"; // notebook com 1 ponto só
  const GRUPO = "120363000000000001@g.us";
  const E = "5500000000105@c.us"; // notebook, pediu SAIR (crm_contato.optout)
  const F = "5500000000106@c.us"; // notebook, opt_out só em crm_consentimento
  const G = "5500000000107@c.us"; // notebook, SAIR guardado só na memória do servidor
  const H = "5500000000108@c.us"; // notebook, mas o cliente nunca escreveu
  const I = "5500000000109@c.us"; // notebook, última conversa há 400 dias
  const J = "5500000000110@c.us"; // notebook + etiqueta VIP (do Centro de Comando)
  const K = "5500000000111@c.us"; // pc gamer + etiqueta vip (posta na tela de atendimento)
  const L = "5500000000112@c.us"; // notebook, recebeu campanha há 3 dias
  const LID = "123456789012345@lid"; // a mesma pessoa que A, pelo código interno

  await conversa(A, "MARIA SOUZA", "Bom dia, meu notebook não liga", 1);
  await conversa(B, "carlos", "quero montar um pc gamer com rtx", 2);
  await conversa(C, "Cleo", "tenho um vaio antigo", 1); // notebook: 1 ponto
  await conversa(GRUPO, "Grupo", "alguém tem notebook?", 1);
  await conversa(E, "Edu", "preciso de um notebook", 1);
  await crm.registrarConsentimento({ chatId: E, acao: "opt_out", canal: "whatsapp", texto: "SAIR", por: "cliente" });
  await conversa(F, "Fabi", "preciso de um notebook", 1);
  await db.query(`INSERT INTO crm_consentimento (chat_id, acao, canal, em) VALUES ($1, 'opt_out', 'whatsapp', $2)`, [F, new Date(BASE - DIA)]);
  await conversa(G, "Gui", "preciso de um notebook", 1);
  await conversa(H, "Hugo", "Olha esse notebook que separei", 1, "out");
  await conversa(I, "Iara", "preciso de um notebook", 400);
  await conversa(J, "joana d'arc", "notebook para a faculdade", 3);
  await conversa(K, "Kaio", "pc gamer barato?", 4);
  await conversa(L, "Lia", "preciso de um notebook", 1);
  await conversa(LID, "Maria", "notebook ainda tem?", 5);
  await crm.salvarEtiqueta({ id: "etq-vip", nome: "VIP", cor: "#000" });
  await crm.marcarEtiqueta(J, "etq-vip", true);
  const antiga = await db.query(
    `INSERT INTO crm_campanha (nome, texto, estado, criada_em, total) VALUES ('antiga', 'oi', 'concluida', $1, 1) RETURNING id`,
    [new Date(BASE - 3 * DIA)]
  );
  await db.query(
    `INSERT INTO crm_campanha_envio (campanha_id, chat_id, estado, enviado_em, tentativa_em) VALUES ($1, $2, 'enviado', $3, $3)`,
    [antiga.rows[0].id, L, new Date(BASE - 3 * DIA)]
  );

  const foraNaMemoria = new Map([[G, "pediu para sair"]]);
  const enviadas = [];
  let enviarImpl = async ({ chatId, texto }) => {
    enviadas.push({ chatId, texto, em: relogio });
    return { id: `ENV${enviadas.length}` };
  };
  let conectado = true;
  const avisos = [];
  const opcoes = {
    db,
    enviar: (x) => enviarImpl(x),
    motivoDeFora: (id) => foraNaMemoria.get(id) || null,
    barrados: () => [...foraNaMemoria.keys()],
    pessoaDe: (id) => (id === LID ? A : id),
    etiquetasDoPainel: (nomes) => (nomes.includes("vip") ? [K] : []),
    conectado: () => conectado,
    avisar: (d) => avisos.push(d),
    registrar: () => {},
    agora: () => relogio,
    aleatorio: () => 0.5,
  };
  let campanhas = criarCampanhas(opcoes);
  const ids = (p) => p.amostra.map((x) => x.chatId);

  await t.test("seleciona no banco: tema com 2 pontos, só conversa individual de quem escreveu, sem SAIR", async () => {
    const p = await campanhas.previa({ temas: ["notebook"] });
    assert.deepStrictEqual(ids(p), [A, J], `veio ${JSON.stringify(ids(p))}`);
    assert.strictEqual(p.total, 2);
    assert.strictEqual(p.amostra[0].nome, "MARIA SOUZA");
    assert.strictEqual(p.amostra[0].primeiroNome, "Maria");
    assert.ok(p.amostra[0].temas.includes("Notebook"));
    assert.strictEqual(p.teto, 100);
    assert.strictEqual(p.diasDeEnvio, 1);
  });

  await t.test("temas valem com OU; etiquetas (do banco e da tela) com OU; os dois grupos com E", async () => {
    assert.deepStrictEqual(ids(await campanhas.previa({ temas: ["notebook", "pc_gamer"] })), [A, B, J, K]);
    assert.deepStrictEqual(ids(await campanhas.previa({ etiquetas: ["VIP"] })), [J, K]);
    assert.deepStrictEqual(ids(await campanhas.previa({ temas: ["notebook"], etiquetas: ["vip"] })), [J]);
    await assert.rejects(campanhas.previa({ temas: ["nao_existe"] }), (e) => e.status === 400);
  });

  await t.test("'conversou nos últimos N dias' e 'não receber se recebeu campanha'", async () => {
    assert.deepStrictEqual(ids(await campanhas.previa({ temas: ["notebook"], conversouNosUltimosDias: 500 })), [A, J, I]);
    assert.deepStrictEqual(
      ids(await campanhas.previa({ temas: ["notebook"], naoReceberSeRecebeuCampanhaNosUltimosDias: 2 })),
      [A, L, J]
    );
  });

  await t.test("prévia mostra como fica o texto", async () => {
    const p = await campanhas.previa({ temas: ["notebook"] }, { texto: "Olá, {nome}! {whatsapp}" });
    assert.strictEqual(p.exemplo, `Olá, Maria! ${R.LINK_WHATSAPP}\n\n${R.LINHA_SAIR}`);
  });

  await t.test("criar exige tema ou etiqueta e recusa variável desconhecida", async () => {
    await assert.rejects(campanhas.criar({ texto: "Oi", filtro: {} }), (e) => e.status === 400 && /tema ou uma etiqueta/.test(e.message));
    await assert.rejects(campanhas.criar({ texto: "Oi {promocao}", filtro: { temas: ["notebook"] } }), (e) => e.status === 400);
    await assert.rejects(campanhas.criar({ texto: "Oi", filtro: { temas: ["rede"] } }), (e) => e.status === 400 && /Nenhum contato/.test(e.message));
  });

  let c1;
  await t.test("cria a campanha com a lista tirada do banco, na ordem de quem falou por último", async () => {
    c1 = await campanhas.criar({
      texto: "Olá, {nome}! Chegou novidade em notebook e PC gamer. Fale comigo: {whatsapp}",
      filtro: { temas: ["notebook", "pc_gamer"] },
      por: "Thiago",
    });
    assert.strictEqual(c1.estado, "enviando");
    assert.strictEqual(c1.total, 4);
    assert.strictEqual(c1.pendentes, 4);
    assert.strictEqual(c1.criadaPor, "Thiago");
    assert.match(c1.nome, /Notebook \+ PC Gamer — 12\/10/);
    const fila = await db.query(`SELECT chat_id FROM crm_campanha_envio WHERE campanha_id = $1 ORDER BY ordem`, [c1.id]);
    assert.deepStrictEqual(fila.rows.map((x) => x.chat_id), [A, B, J, K]);
    assert.ok(avisos.some((a) => a.tipo === "criada"));
  });

  await t.test("fora do horário não manda (horário de São Paulo)", async () => {
    relogio = ms("2026-10-12T10:00:00Z"); // segunda 7h em SP
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "fora do horário");
    assert.strictEqual(new Date(r.retomaEm).toISOString(), "2026-10-12T12:00:00.000Z");
    relogio = ms("2026-10-11T23:44:00Z"); // domingo à noite
    assert.strictEqual((await campanhas.passo()).motivo, "fora do horário");
    assert.strictEqual(enviadas.length, 0);
  });

  await t.test("manda um, com {nome} trocado e a linha do SAIR, e registra tudo", async () => {
    relogio = BASE;
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "enviado");
    assert.strictEqual(enviadas.length, 1);
    assert.strictEqual(enviadas[0].chatId, A);
    assert.strictEqual(
      enviadas[0].texto,
      `Olá, Maria! Chegou novidade em notebook e PC gamer. Fale comigo: ${R.LINK_WHATSAPP}\n\n${R.LINHA_SAIR}`
    );
    assert.strictEqual(r.esperarMs, 80_000, "40 a 120 s (aleatório = 0.5)");
    const envio = await db.query(`SELECT * FROM crm_campanha_envio WHERE campanha_id = $1 AND chat_id = $2`, [c1.id, A]);
    assert.strictEqual(envio.rows[0].estado, "enviado");
    assert.strictEqual(envio.rows[0].mensagem_id, "ENV1");
    const ev = await db.query(`SELECT * FROM crm_evento WHERE tipo = 'campanha_envio' AND chat_id = $1`, [A]);
    assert.strictEqual(ev.rowCount, 1);
    assert.strictEqual(ev.rows[0].detalhes.estado, "enviado");
    assert.strictEqual((await campanhas.obter(c1.id)).enviados, 1);
    assert.ok(avisos.some((a) => a.tipo === "progresso" && a.campanha.enviados === 1));
  });

  await t.test("um envio por vez: respeita o intervalo mínimo", async () => {
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "intervalo");
    assert.strictEqual(r.esperarMs, 40_000);
    assert.strictEqual(enviadas.length, 1);
  });

  await t.test("SAIR que chega no meio da campanha é respeitado na hora do envio", async () => {
    // B responde SAIR depois da campanha criada (o servidor grava no CRM).
    await crm.registrarConsentimento({ chatId: B, acao: "opt_out", canal: "whatsapp", texto: "SAIR", por: "cliente" });
    relogio += 41_000;
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "pulado");
    assert.strictEqual(r.chatId, B);
    assert.strictEqual(enviadas.length, 1, "não pode ter mandado para B");
    const envio = await db.query(`SELECT estado, motivo FROM crm_campanha_envio WHERE campanha_id = $1 AND chat_id = $2`, [c1.id, B]);
    assert.deepStrictEqual(envio.rows[0], { estado: "pulado", motivo: "pediu para sair" });
    // Pular não espera: o próximo já pode sair.
    assert.strictEqual((await campanhas.passo()).chatId, J);
    assert.strictEqual(enviadas.at(-1).chatId, J);
    assert.match(enviadas.at(-1).texto, /^Olá, Joana!/);
  });

  await t.test("SAIR guardado só na memória do servidor também barra, e a campanha termina", async () => {
    foraNaMemoria.set(K, "pediu para sair");
    relogio += 120_000;
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "pulado");
    const c = await campanhas.obter(c1.id);
    assert.strictEqual(c.estado, "concluida");
    assert.deepStrictEqual([c.enviados, c.pulados, c.falhas, c.pendentes], [2, 2, 0, 0]);
    const fim = avisos.find((a) => a.tipo === "fim");
    assert.ok(fim, "o painel precisa saber que acabou");
    assert.match(fim.texto, /concluída: 2 enviada\(s\) · 2 pulada\(s\)/);
    foraNaMemoria.delete(K);
    assert.strictEqual((await campanhas.passo()).motivo, "sem campanha");
  });

  // ---- teto diário, somando todas as campanhas ----
  const novos = [];
  for (let n = 1; n <= 4; n++) {
    const id = `55000000002${String(n).padStart(2, "0")}@c.us`;
    novos.push(id);
    await conversa(id, `Cliente ${n}`, "minha impressora não imprime", n);
  }
  await db.query(`INSERT INTO crm_config (chave, valor) VALUES ('disparo', '{"tetoDiario": 2}')`);
  let c2;

  await t.test("teto do dia (crm_config 'disparo') soma todas as campanhas", async () => {
    c2 = await campanhas.criar({ texto: "Oi {nome}, tinta com desconto.", filtro: { temas: ["impressora"] } });
    assert.strictEqual(c2.total, 4);
    relogio += 61_000; // o teto fica guardado por 1 minuto
    assert.strictEqual(await campanhas.tetoDiario(), 2);
    // Hoje já saíram 2 (da campanha anterior).
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "teto do dia");
    assert.strictEqual(new Date(r.retomaEm).toISOString(), "2026-10-13T12:00:00.000Z", "terça 9h");
    const p = await campanhas.previa({ temas: ["impressora"] });
    assert.strictEqual(p.diasDeEnvio, 2, "4 contatos a 2 por dia");
  });

  await t.test("no dia seguinte volta a mandar, até o teto", async () => {
    const antes = enviadas.length;
    relogio = ms("2026-10-13T12:00:00Z");
    assert.strictEqual((await campanhas.passo()).motivo, "enviado");
    relogio += 40_000;
    assert.strictEqual((await campanhas.passo()).motivo, "enviado");
    relogio += 40_000;
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "teto do dia");
    assert.strictEqual(new Date(r.retomaEm).toISOString(), "2026-10-14T12:00:00.000Z");
    assert.strictEqual(enviadas.length - antes, 2);
    assert.match(enviadas.at(-1).texto, /^Oi Cliente, tinta|^Oi, tinta/);
  });

  await t.test("retoma depois de reinício e não repete o envio que ficou no meio", async () => {
    // Quarta 9h. O processo pega o 3º contato e "cai" no meio do envio.
    relogio = ms("2026-10-14T12:00:00Z");
    let pegou = false;
    enviarImpl = () => {
      pegou = true;
      return new Promise(() => {}); // nunca responde: o container caiu aqui
    };
    campanhas.passo(); // sem await, de propósito
    for (let i = 0; i < 100 && !pegou; i++) await new Promise((r) => setTimeout(r, 20));
    assert.ok(pegou);
    const preso = await db.query(
      `SELECT chat_id FROM crm_campanha_envio WHERE campanha_id = $1 AND estado = 'pendente' AND tentativa_em IS NOT NULL`,
      [c2.id]
    );
    assert.deepStrictEqual(preso.rows.map((x) => x.chat_id), [novos[2]]);

    // "Reinício": outro objeto, mesmo banco, envio normal.
    enviarImpl = async ({ chatId, texto }) => {
      enviadas.push({ chatId, texto, em: relogio });
      return { id: `ENV${enviadas.length}` };
    };
    campanhas = criarCampanhas(opcoes);
    relogio += 60_000;
    const r = await campanhas.passo();
    assert.strictEqual(r.motivo, "enviado");
    assert.strictEqual(r.chatId, novos[3], "segue para o próximo, não repete o 3º");
    assert.ok(!enviadas.some((e) => e.chatId === novos[2]));
    assert.strictEqual((await campanhas.obter(c2.id)).estado, "enviando", "o 3º ainda está em aberto");

    // Passados 5 minutos sem resposta, o envio interrompido vira falha (sem repetir).
    relogio += 6 * 60_000;
    assert.strictEqual((await campanhas.passo()).motivo, "sem campanha");
    const c = await campanhas.obter(c2.id);
    assert.strictEqual(c.estado, "concluida");
    assert.deepStrictEqual([c.enviados, c.falhas], [3, 1]);
    const motivo = await db.query(`SELECT motivo FROM crm_campanha_envio WHERE campanha_id = $1 AND chat_id = $2`, [c2.id, novos[2]]);
    assert.match(motivo.rows[0].motivo, /interrompido/);
    assert.ok(!enviadas.some((e) => e.chatId === novos[2]));
  });

  // ---- pausar, retomar, cancelar, falha e conexão caída ----
  const R1 = "5500000000301@c.us";
  const R2 = "5500000000302@c.us";
  const R3 = "5500000000303@c.us";
  await conversa(R1, "Rui", "meu roteador wifi caiu", 1);
  await conversa(R2, "Rita", "repetidor wifi", 2);
  await conversa(R3, "Ruth", "roteador mesh", 3);

  await t.test("pausar, retomar e cancelar", async () => {
    relogio = ms("2026-10-15T13:00:00Z"); // quinta 10h
    const c = await campanhas.criar({ texto: "Oi {nome}", filtro: { temas: ["rede"] } });
    assert.strictEqual((await campanhas.pausar(c.id, "Thiago")).estado, "pausada");
    assert.strictEqual((await campanhas.passo()).motivo, "sem campanha", "pausada não manda");
    await assert.rejects(campanhas.pausar(c.id), (e) => e.status === 409);
    assert.strictEqual((await campanhas.retomar(c.id)).estado, "enviando");
    assert.strictEqual((await campanhas.passo()).chatId, R1);
    const cancelada = await campanhas.cancelar(c.id);
    assert.strictEqual(cancelada.estado, "cancelada");
    assert.ok(cancelada.fim);
    relogio += 60_000;
    assert.strictEqual((await campanhas.passo()).motivo, "sem campanha", "cancelada não manda");
    await assert.rejects(campanhas.retomar(c.id), (e) => e.status === 409);
    await assert.rejects(campanhas.cancelar(99999), (e) => e.status === 404);
    await assert.rejects(campanhas.mudarEstado(c.id, "apagar"), (e) => e.status === 400);
  });

  await t.test("erro da Evolution vira falha; conexão caída devolve para a fila", async () => {
    await db.query(`UPDATE crm_config SET valor = '{"tetoDiario": 100}' WHERE chave = 'disparo'`);
    relogio = ms("2026-10-16T12:30:00Z"); // sexta 9h30: R1 recebeu há menos de 1 dia
    const c = await campanhas.criar({
      texto: "Oi {nome}",
      filtro: { temas: ["rede"], naoReceberSeRecebeuCampanhaNosUltimosDias: 1 },
    });
    assert.deepStrictEqual(
      (await db.query(`SELECT chat_id FROM crm_campanha_envio WHERE campanha_id = $1 ORDER BY ordem`, [c.id])).rows.map((x) => x.chat_id),
      [R2, R3],
      "R1 recebeu ontem"
    );
    enviarImpl = async () => {
      conectado = false;
      throw new Error("O WhatsApp da loja não está conectado.");
    };
    const r1 = await campanhas.passo();
    assert.strictEqual(r1.motivo, "whatsapp desconectado");
    const devolvido = await db.query(`SELECT estado, tentativa_em FROM crm_campanha_envio WHERE campanha_id = $1 AND chat_id = $2`, [c.id, R2]);
    assert.deepStrictEqual(devolvido.rows[0], { estado: "pendente", tentativa_em: null });
    assert.strictEqual((await campanhas.passo()).motivo, "whatsapp desconectado", "desconectado nem tenta");

    conectado = true;
    enviarImpl = async () => {
      throw new Error("número não existe no WhatsApp");
    };
    relogio += 61_000;
    const r2 = await campanhas.passo();
    assert.strictEqual(r2.motivo, "falhou");
    const falha = await db.query(`SELECT estado, motivo FROM crm_campanha_envio WHERE campanha_id = $1 AND chat_id = $2`, [c.id, R2]);
    assert.deepStrictEqual(falha.rows[0], { estado: "falhou", motivo: "número não existe no WhatsApp" });
    assert.strictEqual((await campanhas.obter(c.id)).falhas, 1);
    await campanhas.cancelar(c.id);
  });

  await t.test("teste vai só para os dois números do Thiago", async () => {
    enviarImpl = async ({ chatId, texto }) => {
      enviadas.push({ chatId, texto, em: relogio });
      return { id: `ENV${enviadas.length}` };
    };
    const antes = enviadas.length;
    const r = await campanhas.enviarTeste({ texto: "Olá, {nome}! {whatsapp}", por: "Thiago" });
    assert.strictEqual(r.enviados, 2);
    const novas = enviadas.slice(antes);
    assert.deepStrictEqual(novas.map((e) => e.chatId), ["5519987510267@c.us", "5519984515960@c.us"]);
    assert.strictEqual(novas[0].texto, `Olá, Thiago! ${R.LINK_WHATSAPP}\n\n${R.LINHA_SAIR}`);
    await assert.rejects(campanhas.enviarTeste({ texto: "oi", numeros: ["5500000000101"] }), (e) => e.status === 400);
    await assert.rejects(
      campanhas.enviarTeste({ texto: "oi", numeros: ["5519987510267", "5500000000101"] }),
      (e) => e.status === 400
    );
    assert.strictEqual(enviadas.length - antes, 2, "nenhum outro número recebeu");
    conectado = false;
    await assert.rejects(campanhas.enviarTeste({ texto: "oi" }), (e) => e.status === 503);
    conectado = true;
    const ev = await db.query(`SELECT count(*)::int AS n FROM crm_evento WHERE tipo = 'campanha_teste'`);
    assert.strictEqual(ev.rows[0].n, 1);
  });

  await t.test("o laço de verdade manda tudo, um por vez, e para", async () => {
    const T = ["5500000000401@c.us", "5500000000402@c.us", "5500000000403@c.us"];
    for (const [n, id] of T.entries()) await conversa(id, `Tel ${n}`, "meu celular iphone quebrou a tela", n + 1);
    // Relógio que anda junto com o de verdade, a partir de sábado 10h.
    const inicioReal = Date.now();
    const inicioFalso = ms("2026-10-17T13:00:00Z");
    const laco = criarCampanhas({
      ...opcoes,
      agora: () => inicioFalso + (Date.now() - inicioReal),
      intervalo: { minMs: 30, maxMs: 60 },
      aleatorio: Math.random,
    });
    const antes = enviadas.length;
    const c = await laco.criar({ texto: "Oi {nome}", filtro: { temas: ["celular"] } });
    laco.iniciar();
    try {
      let estado = c.estado;
      for (let i = 0; i < 200 && estado !== "concluida"; i++) {
        await new Promise((r) => setTimeout(r, 25));
        estado = (await laco.obter(c.id)).estado;
      }
      assert.strictEqual(estado, "concluida");
      const desta = enviadas.slice(antes);
      assert.deepStrictEqual(desta.map((e) => e.chatId), T);
      const s = await laco.situacao();
      assert.strictEqual(s.ligado, true);
      assert.strictEqual(s.janelaAberta, true);
    } finally {
      laco.parar();
    }
  });

  await t.test("opções da bancada só pelo ambiente", () => {
    const avisosAmb = [];
    assert.deepStrictEqual(opcoesDoAmbiente({}, (m) => avisosAmb.push(m)), {});
    const o = opcoesDoAmbiente({ DISPARO_INTERVALO_MS: "200-400", DISPARO_JANELA_SEMPRE_ABERTA: "1" }, (m) => avisosAmb.push(m));
    assert.deepStrictEqual(o.intervalo, { minMs: 200, maxMs: 400 });
    assert.strictEqual(o.janela.sempreAberta, true);
    assert.strictEqual(avisosAmb.length, 2, "avisa no log que é configuração de teste");
  });

  await db.pool.end();
});
