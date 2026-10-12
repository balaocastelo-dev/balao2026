// Agente JUL.IA — o lado da VPS.
//
// Quem pensa é o computador do Thiago (scripts/agente-local): ele PUXA daqui
// as conversas que precisam de resposta, entende texto, áudio, foto e vídeo
// com modelos locais, consulta o catálogo do site, emite orçamento e pedido no
// Bling e devolve o que falar. A VPS não abre porta no PC e o PC não abre
// porta na internet: a conexão sai sempre do PC, como a da transcrição.
//
// Aqui fica só o que precisa estar perto do WhatsApp:
//   - a chave liga/desliga (crm_config "agente"), mudada no Centro de Comando;
//   - quais conversas o robô pode responder (regras.js: sem vendedor, recente,
//     cliente falou por último, ninguém da loja respondeu por cima);
//   - o "aluguel" de cada conversa para o PC (uma de cada vez, com prazo);
//   - o envio do que voltou, ou a sugestão para o vendedor no modo copiloto;
//   - os avisos de orçamento e venda (painel, ficha do cliente, Telegram).

const crypto = require("crypto");
const R = require("./regras");

function criarAgente({
  db = null,
  agora = () => Date.now(),
  ultimaDaConversa = () => null,
  mensagensDaConversa = async () => [],
  numeroDe = (chatId) => R.digitos(String(chatId).split("@")[0]),
  nomeDe = () => null,
  vendedorDe = () => null,
  atribuir = () => {},
  barrado = () => null,
  produtoDoCatalogo = () => null,
  enviarTexto = async () => {
    throw new Error("envio não configurado");
  },
  enviarProduto = async () => {
    throw new Error("envio não configurado");
  },
  guardarTranscricao = async () => {},
  avisar = () => {},
  telegram = async () => {},
  nota = async () => {},
  evento = async () => {},
  registrar = console.log,
} = {}) {
  let config = R.normalizarConfig(R.PADRAO);
  const candidatas = new Map(); // chatId -> timestamp da última mensagem do cliente
  const situacoes = new Map(); // chatId -> { situacao, ate, motivo, dados, memoria, respondidoAte }
  const arrendados = new Map(); // chatId -> { id, ate, ultimaId, ultimaTs }
  const automaticas = new Map(); // chatId -> [{ chave, em }] (o que robô/campanha mandou)
  const sugestoes = new Map(); // id -> { id, chatId, nome, respostas, criadaEm }
  const recentes = []; // últimas ações, para o painel
  let trabalhador = null; // { em, info }
  const contagem = { respostas: 0, sugestoes: 0, orcamentos: 0, vendas: 0, transferencias: 0, erros: 0, refeitos: 0 };

  // ---------------------------------------------------------------- banco
  async function lerConfig() {
    if (!db) return;
    const r = await db.query("SELECT valor FROM crm_config WHERE chave = 'agente'");
    if (r.rowCount) config = R.normalizarConfig(r.rows[0].valor);
  }

  async function gravarConfig(por) {
    if (!db) return;
    await db.query(
      `INSERT INTO crm_config (chave, valor, atualizado_em, atualizado_por) VALUES ('agente', $1, now(), $2)
       ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now(), atualizado_por = EXCLUDED.atualizado_por`,
      [JSON.stringify(config), por || null]
    );
  }

  async function situacaoDe(chatId) {
    if (situacoes.has(chatId)) return situacoes.get(chatId);
    let s = { situacao: "ativo", ate: 0, motivo: null, dados: {}, memoria: {}, respondidoAte: 0 };
    if (db) {
      const r = await db.query(
        `SELECT situacao, ate, motivo, dados, memoria, respondido_ate FROM crm_agente_conversa WHERE chat_id = $1`,
        [chatId]
      );
      if (r.rowCount) {
        const l = r.rows[0];
        s = {
          situacao: l.situacao,
          ate: l.ate ? new Date(l.ate).getTime() : 0,
          motivo: l.motivo,
          dados: l.dados || {},
          memoria: l.memoria || {},
          respondidoAte: Number(l.respondido_ate) || 0,
          respondidoId: (l.memoria || {}).respondidoId || null,
        };
      }
    }
    situacoes.set(chatId, s);
    if (situacoes.size > 5000) situacoes.delete(situacoes.keys().next().value);
    return s;
  }

  async function gravarSituacao(chatId, s) {
    situacoes.set(chatId, s);
    if (!db) return;
    await db.query(
      `INSERT INTO crm_agente_conversa (chat_id, situacao, ate, motivo, dados, memoria, respondido_ate, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (chat_id) DO UPDATE SET situacao = EXCLUDED.situacao, ate = EXCLUDED.ate, motivo = EXCLUDED.motivo,
         dados = EXCLUDED.dados, memoria = EXCLUDED.memoria, respondido_ate = EXCLUDED.respondido_ate, atualizado_em = now()`,
      [
        chatId,
        s.situacao,
        s.ate ? new Date(s.ate) : null,
        s.motivo,
        JSON.stringify(s.dados || {}),
        JSON.stringify({ ...(s.memoria || {}), respondidoId: s.respondidoId || null }),
        s.respondidoAte || 0,
      ]
    );
  }

  function lembrar(tipo, dados) {
    recentes.unshift({ tipo, em: agora(), ...dados });
    if (recentes.length > 60) recentes.length = 60;
  }

  // ---------------------------------------------------------------- configuração
  async function configurar(patch = {}, por = null) {
    const antes = config;
    const novo = R.normalizarConfig({ ...config, ...patch });
    if (novo.modo !== "desligado" && antes.modo === "desligado") novo.ligadoEm = agora();
    if (novo.modo === "desligado") {
      novo.ligadoEm = null;
      arrendados.clear();
    }
    config = novo;
    await gravarConfig(por);
    lembrar("config", { texto: `${por || "alguém"} mudou: modo ${config.modo}, público ${config.publico}, venda ${config.vendaAutomatica ? "automática" : "com vendedor"}` });
    avisar({ tipo: "config", config });
    return config;
  }

  // ---------------------------------------------------------------- o que acontece na conversa
  function lembrarAutomatica(chatId, texto) {
    const lista = (automaticas.get(chatId) || []).filter((x) => agora() - x.em < 5 * 60_000);
    lista.push({ chave: R.chaveDeTexto(texto), em: agora() });
    automaticas.set(chatId, lista.slice(-20));
  }

  function foiAutomatica(chatId, texto) {
    const chave = R.chaveDeTexto(texto);
    if (!chave) return false;
    return (automaticas.get(chatId) || []).some((x) => agora() - x.em < 5 * 60_000 && (x.chave === chave || chave.startsWith(x.chave) || x.chave.startsWith(chave)));
  }

  async function humanoAssumiu(chatId, motivo) {
    const s = await situacaoDe(chatId);
    arrendados.delete(chatId);
    for (const [id, sug] of sugestoes) if (sug.chatId === chatId) sugestoes.delete(id);
    const ate = agora() + R.PAUSA_HUMANO_MS;
    if (s.situacao === "humano" && s.ate >= ate - 60_000) return; // nada novo
    await gravarSituacao(chatId, { ...s, situacao: "humano", ate, motivo });
  }

  /** Toda mensagem que entra ou sai pelo webhook (inclusive digitada no celular da loja). */
  async function aoMensagem(msg, { nova = true } = {}) {
    if (!msg?.chatId || !R.ehConversaIndividual(msg.chatId)) return;
    if (msg.direction === "in") {
      const anterior = candidatas.get(msg.chatId) || 0;
      if (msg.timestamp > anterior) candidatas.set(msg.chatId, msg.timestamp);
      return;
    }
    // Saiu da loja e o servidor ainda não conhecia: foi digitada no celular
    // (ou no WhatsApp Web). Se não é eco do que o robô ou a campanha mandou,
    // é gente — o robô sai da conversa.
    if (nova && !foiAutomatica(msg.chatId, msg.body)) {
      const s = situacoes.get(msg.chatId);
      const conhecida = candidatas.has(msg.chatId) || (s && s.situacao === "ativo" && s.respondidoAte);
      if (conhecida) await humanoAssumiu(msg.chatId, "vendedor respondeu pelo celular").catch(() => {});
    }
  }

  /** Mensagem mandada pelo painel (vendedor), pela campanha ou pelo próprio agente. */
  async function aoEnviarPelaLoja(msg, { vendedorId = null, automatico = null } = {}) {
    if (!msg?.chatId || !R.ehConversaIndividual(msg.chatId)) return;
    if (automatico) return lembrarAutomatica(msg.chatId, msg.body);
    if (vendedorId === R.ID_DO_AGENTE) return;
    const s = situacoes.get(msg.chatId);
    if (candidatas.has(msg.chatId) || (s && s.respondidoAte)) {
      await humanoAssumiu(msg.chatId, "vendedor respondeu pelo painel").catch(() => {});
    }
  }

  /** Atribuição de conversa mudou no painel. */
  async function aoAtribuir(chatId, vendedorId) {
    if (!chatId) return;
    if (vendedorId === R.ID_DO_AGENTE) return retomar(chatId, "devolvida à JUL.IA");
    if (vendedorId) {
      arrendados.delete(chatId);
      for (const [id, sug] of sugestoes) if (sug.chatId === chatId) sugestoes.delete(id);
    }
  }

  async function pausar(chatId, por) {
    const s = await situacaoDe(chatId);
    arrendados.delete(chatId);
    await gravarSituacao(chatId, { ...s, situacao: "humano", ate: agora() + R.PAUSA_HUMANO_MS, motivo: `pausada por ${por || "vendedor"}` });
    lembrar("pausa", { chatId, nome: nomeDe(chatId), texto: `pausada por ${por || "vendedor"}` });
  }

  async function retomar(chatId, por) {
    const s = await situacaoDe(chatId);
    // Retomar não responde mensagem velha: só o que o cliente mandar depois.
    const ultima = ultimaDaConversa(chatId);
    const respondidoAte = Math.max(s.respondidoAte || 0, ultima && ultima.direction === "in" ? 0 : ultima?.timestamp || 0);
    await gravarSituacao(chatId, { ...s, situacao: "ativo", ate: 0, motivo: null, respondidoAte });
    // Cliente esperando resposta (dentro da janela): o agente responde.
    if (ultima && ultima.direction === "in") candidatas.set(chatId, ultima.timestamp);
    lembrar("retomada", { chatId, nome: nomeDe(chatId), texto: por || "retomada" });
  }

  // ---------------------------------------------------------------- fila do PC
  function limparArrendados() {
    for (const [chatId, a] of arrendados) if (a.ate < agora()) arrendados.delete(chatId);
  }

  async function avaliar(chatId) {
    const s = await situacaoDe(chatId);
    const ultima = ultimaDaConversa(chatId);
    return {
      s,
      ultima,
      parecer: R.podeResponder({
        config,
        chatId,
        numero: numeroDe(chatId),
        vendedorId: vendedorDe(chatId),
        barrado: barrado(chatId),
        situacao: s,
        ultima,
        respondidoAte: s.respondidoAte,
        respondidoId: s.respondidoId || null,
        agora: agora(),
        arrendado: arrendados.has(chatId),
      }),
    };
  }

  function paraOPc(m, enviadosPeloAgente) {
    const de = m.direction === "in" ? "cliente" : enviadosPeloAgente.has(m.id) ? "julia" : "loja";
    return {
      id: m.id,
      de,
      tipo: m.mediaType || "texto",
      texto: m.hasMedia && /^(📷|🎥|🎵|🎤|📄|Figurinha)/.test(String(m.body || "")) ? "" : String(m.body || ""),
      transcricao: m.transcricao || null,
      midia: m.hasMedia ? { id: m.id, mimetype: m.mimetype || null, nome: m.mediaName || null, segundos: m.segundos || null } : null,
      em: m.timestamp,
    };
  }

  /** Próxima conversa para o PC responder, ou null. */
  async function proximoTrabalho() {
    if (config.modo === "desligado") return null;
    limparArrendados();
    const ordem = [...candidatas.entries()].sort((a, b) => a[1] - b[1]);
    for (const [chatId, ts] of ordem) {
      if (agora() - ts > R.JANELA_MS + 60_000) {
        candidatas.delete(chatId);
        continue;
      }
      const { s, ultima, parecer } = await avaliar(chatId);
      if (!parecer.pode) {
        if (!parecer.espera && parecer.motivo !== "agente desligado") candidatas.delete(chatId);
        continue;
      }
      const historico = await mensagensDaConversa(chatId, 30);
      const enviadosPeloAgente = new Set(Array.isArray(s.memoria?.enviados) ? s.memoria.enviados : []);
      const id = crypto.randomBytes(9).toString("base64url");
      arrendados.set(chatId, { id, ate: agora() + R.PRAZO_DO_TRABALHO_MS, ultimaId: ultima.id, ultimaTs: ultima.timestamp });
      return {
        id,
        chatId,
        nome: nomeDe(chatId),
        numero: numeroDe(chatId),
        primeiraVez: !s.memoria?.apresentou,
        ultimaId: ultima.id,
        mensagens: historico.map((m) => paraOPc(m, enviadosPeloAgente)),
        dados: s.dados || {},
        memoria: { ...(s.memoria || {}), enviados: undefined },
        config: { modo: config.modo, vendaAutomatica: config.vendaAutomatica, publico: config.publico },
      };
    }
    return null;
  }

  async function enviarRespostas(chatId, respostas, { vendedorId = R.ID_DO_AGENTE } = {}) {
    const ids = [];
    for (const r of respostas) {
      if (r.tipo === "texto") {
        lembrarAutomatica(chatId, r.texto);
        const m = await enviarTexto({ chatId, texto: r.texto, vendedorId });
        if (m?.id) ids.push(m.id);
      } else if (r.tipo === "produto") {
        const produto = produtoDoCatalogo(r.produtoId);
        if (!produto) {
          registrar(`[agente] produto ${r.produtoId} não está no catálogo do site: não mandei`);
          continue;
        }
        const m = await enviarProduto({ chatId, produto, vendedorId, aoMontar: (legenda) => lembrarAutomatica(chatId, legenda) });
        if (m?.id) ids.push(m.id);
      }
    }
    return ids;
  }

  async function registrarAcoes(chatId, acoes) {
    const nome = nomeDe(chatId) || numeroDe(chatId);
    for (const a of acoes) {
      const texto = R.notaDaAcao(a);
      await nota({ chatId, texto }).catch(() => {});
      await evento(a.tipo === "venda" ? "agente_venda" : "agente_orcamento", { chatId, detalhes: a }).catch(() => {});
      if (a.erro) {
        contagem.erros++;
        avisar({ tipo: "acao", texto: `⚠️ JUL.IA não conseguiu emitir ${a.tipo === "venda" ? "o pedido" : "o orçamento"} de ${nome} no Bling: ${a.erro}` });
        lembrar("erro", { chatId, nome, texto: a.erro });
        continue;
      }
      if (a.tipo === "venda") {
        contagem.vendas++;
        const aviso = `🛒 JUL.IA fechou venda com ${nome}: pedido nº ${a.numero} em aberto no Bling, ${R.reais(a.total)}. Confira pagamento e entrega.`;
        avisar({ tipo: "acao", texto: aviso });
        await telegram(aviso).catch(() => {});
        lembrar("venda", { chatId, nome, texto: `pedido nº ${a.numero} · ${R.reais(a.total)}` });
      } else {
        contagem.orcamentos++;
        avisar({ tipo: "acao", texto: `🧾 JUL.IA mandou orçamento nº ${a.numero} para ${nome} (${R.reais(a.total)}).` });
        lembrar("orcamento", { chatId, nome, texto: `orçamento nº ${a.numero} · ${R.reais(a.total)}` });
      }
    }
  }

  /** O que o PC devolveu. */
  async function concluir(corpo) {
    const r = R.validarResultado(corpo);
    if (!r.ok) throw Object.assign(new Error(`resultado inválido: ${r.erros.join(", ")}`), { status: 400 });
    const a = arrendados.get(r.chatId);
    if (!a || a.id !== r.id) {
      // Prazo vencido ou conversa que um vendedor assumiu no meio. As ações
      // no Bling, se houve, já aconteceram: registra mesmo assim.
      if (r.acoes.length) await registrarAcoes(r.chatId, r.acoes);
      for (const t of r.transcricoes) await guardarTranscricao(t.id, t.texto).catch(() => {});
      return { aceito: false, motivo: "trabalho vencido ou cancelado" };
    }
    arrendados.delete(r.chatId);

    for (const t of r.transcricoes) await guardarTranscricao(t.id, t.texto).catch(() => {});
    const s = await situacaoDe(r.chatId);
    const memoria = { ...(s.memoria || {}), ...(r.memoria || {}) };
    memoria.enviados = Array.isArray(s.memoria?.enviados) ? s.memoria.enviados.slice(-60) : [];
    const dados = { ...(s.dados || {}), ...(r.dados || {}) };
    if (r.acoes.length) await registrarAcoes(r.chatId, r.acoes);

    if (r.erro) {
      contagem.erros++;
      lembrar("erro", { chatId: r.chatId, nome: nomeDe(r.chatId), texto: r.erro });
      memoria.errosSeguidos = (Number(s.memoria?.errosSeguidos) || 0) + 1;
      // Três erros seguidos na mesma conversa: chama gente em vez de insistir.
      if (memoria.errosSeguidos >= 3) r.transferir = r.transferir || { motivo: `o agente falhou 3 vezes (${r.erro})` };
    } else {
      memoria.errosSeguidos = 0;
    }

    // Chegou mensagem nova do cliente enquanto o PC pensava: não manda a
    // resposta velha; a conversa volta para a fila com tudo.
    const ultima = ultimaDaConversa(r.chatId);
    if (ultima && ultima.direction === "in" && ultima.timestamp > a.ultimaTs && !r.transferir) {
      contagem.refeitos++;
      await gravarSituacao(r.chatId, { ...s, dados, memoria });
      return { aceito: false, refazer: true, motivo: "o cliente mandou mais mensagem" };
    }

    // Um vendedor pode ter assumido (ou o agente ter sido desligado) enquanto o PC pensava.
    const depois = await avaliar(r.chatId);
    const aindaPode =
      config.modo !== "desligado" &&
      !(vendedorDe(r.chatId) && vendedorDe(r.chatId) !== R.ID_DO_AGENTE) &&
      !(depois.s.situacao !== "ativo" && depois.s.ate > agora());

    const novo = { ...s, dados, memoria, respondidoAte: Math.max(s.respondidoAte || 0, a.ultimaTs), respondidoId: a.ultimaId };
    let enviados = 0;
    if (aindaPode && r.respostas.length) {
      if (config.modo === "automatico") {
        try {
          const ids = await enviarRespostas(r.chatId, r.respostas);
          enviados = ids.length;
          memoria.falhasDeEnvio = 0;
          memoria.enviados = [...memoria.enviados, ...ids].slice(-60);
          memoria.apresentou = true;
          contagem.respostas++;
          if (!vendedorDe(r.chatId)) atribuir(r.chatId, R.ID_DO_AGENTE);
          await evento("agente_resposta", { chatId: r.chatId, detalhes: { mensagens: ids.length, duracaoMs: r.duracaoMs, modelo: r.modelo } }).catch(() => {});
          lembrar("resposta", { chatId: r.chatId, nome: nomeDe(r.chatId), texto: r.respostas.map((x) => (x.tipo === "texto" ? x.texto : `[produto ${x.produtoId}]`)).join(" · ").slice(0, 200) });
        } catch (erro) {
          // Não saiu: a mensagem do cliente continua sem resposta. Tenta de novo
          // em 1 minuto; na terceira falha seguida, chama gente.
          contagem.erros++;
          lembrar("erro", { chatId: r.chatId, nome: nomeDe(r.chatId), texto: `envio falhou: ${erro.message}` });
          registrar("[agente] envio falhou:", erro.message);
          novo.respondidoAte = s.respondidoAte || 0;
          novo.respondidoId = s.respondidoId || null;
          novo.esperarAte = agora() + 60_000;
          memoria.falhasDeEnvio = (Number(s.memoria?.falhasDeEnvio) || 0) + 1;
          if (memoria.falhasDeEnvio >= 3) r.transferir = r.transferir || { motivo: `o WhatsApp recusou o envio 3 vezes (${erro.message})` };
        }
      } else if (config.modo === "copiloto") {
        const id = crypto.randomBytes(6).toString("base64url");
        for (const [sid, sug] of sugestoes) if (sug.chatId === r.chatId) sugestoes.delete(sid);
        // O nome do produto vai junto para o vendedor saber o que vai sair.
        const respostas = r.respostas.map((x) =>
          x.tipo === "produto" ? { ...x, nome: produtoDoCatalogo(x.produtoId)?.name || null } : x
        );
        const sug = { id, chatId: r.chatId, nome: nomeDe(r.chatId), respostas, criadaEm: agora() };
        sugestoes.set(id, sug);
        contagem.sugestoes++;
        avisar({ tipo: "sugestao", sugestao: sug });
        lembrar("sugestao", { chatId: r.chatId, nome: sug.nome, texto: r.respostas.map((x) => (x.tipo === "texto" ? x.texto : `[produto ${x.produtoId}]`)).join(" · ").slice(0, 200) });
      }
    }

    if (r.transferir) {
      contagem.transferencias++;
      novo.situacao = "transferida";
      novo.ate = agora() + R.PAUSA_TRANSFERENCIA_MS;
      novo.motivo = r.transferir.motivo;
      if (vendedorDe(r.chatId) === R.ID_DO_AGENTE) atribuir(r.chatId, null);
      const nome = nomeDe(r.chatId) || numeroDe(r.chatId);
      avisar({ tipo: "transferencia", chatId: r.chatId, texto: `🙋 JUL.IA pediu um vendedor para ${nome}: ${r.transferir.motivo}` });
      await evento("agente_transferencia", { chatId: r.chatId, detalhes: { motivo: r.transferir.motivo } }).catch(() => {});
      lembrar("transferencia", { chatId: r.chatId, nome, texto: r.transferir.motivo });
    }
    await gravarSituacao(r.chatId, { ...novo, memoria });
    return { aceito: true, enviados, modo: config.modo };
  }

  /** Vendedor aprovou a sugestão do copiloto. */
  async function enviarSugestao(id, { vendedorId = null, respostas = null } = {}) {
    const sug = sugestoes.get(id);
    if (!sug) throw Object.assign(new Error("Sugestão não existe mais (a conversa andou ou já foi enviada)."), { status: 404 });
    sugestoes.delete(id);
    const lista = Array.isArray(respostas) && respostas.length ? R.validarResultado({ id: "x", chatId: sug.chatId, respostas }).respostas : sug.respostas;
    const ids = await enviarRespostas(sug.chatId, lista, { vendedorId: vendedorId || R.ID_DO_AGENTE });
    const s = await situacaoDe(sug.chatId);
    const memoria = { ...(s.memoria || {}), apresentou: true, enviados: [...(s.memoria?.enviados || []), ...ids].slice(-60) };
    await gravarSituacao(sug.chatId, { ...s, memoria });
    lembrar("resposta", { chatId: sug.chatId, nome: sug.nome, texto: "sugestão aprovada pelo vendedor" });
    return { enviados: ids.length };
  }

  function descartarSugestao(id) {
    return { descartada: sugestoes.delete(id) };
  }

  // ---------------------------------------------------------------- painel
  function batida(info = {}) {
    trabalhador = { em: agora(), info: info && typeof info === "object" ? info : {} };
    return { config };
  }

  function estadoDoTrabalhador() {
    if (!trabalhador) return { online: false, ultimaBatida: null, info: null };
    return { online: agora() - trabalhador.em < R.BATIDA_VALE_MS, ultimaBatida: trabalhador.em, info: trabalhador.info };
  }

  async function conversasEmAndamento() {
    const lista = [];
    for (const [chatId, s] of situacoes) {
      if (s.situacao === "ativo" && !s.respondidoAte) continue;
      if (s.situacao !== "ativo" && s.ate < agora()) continue;
      lista.push({ chatId, nome: nomeDe(chatId), numero: numeroDe(chatId), situacao: s.situacao, ate: s.ate || null, motivo: s.motivo });
    }
    return lista.slice(-40).reverse();
  }

  async function estado() {
    let hoje = null;
    if (db) {
      const r = await db
        .query(
          `SELECT tipo, count(*)::int AS n FROM crm_evento
            WHERE tipo LIKE 'agente_%' AND em >= date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
            GROUP BY tipo`
        )
        .catch(() => null);
      if (r) hoje = Object.fromEntries(r.rows.map((l) => [l.tipo.replace(/^agente_/, ""), l.n]));
    }
    return {
      config,
      numerosDeTeste: R.NUMEROS_DE_TESTE,
      trabalhador: estadoDoTrabalhador(),
      hoje,
      desdeQueLigou: contagem,
      fila: [...candidatas.keys()].length,
      pensando: [...arrendados.keys()].map((chatId) => ({ chatId, nome: nomeDe(chatId) })),
      sugestoes: [...sugestoes.values()],
      conversas: await conversasEmAndamento(),
      recentes: recentes.slice(0, 30),
    };
  }

  async function porQue(chatId) {
    const { parecer, s } = await avaliar(chatId);
    return {
      modo: config.modo,
      pode: parecer.pode,
      motivo: parecer.motivo || null,
      situacao: s.situacao !== "ativo" && (s.ate || 0) < agora() ? "ativo" : s.situacao,
      ate: s.ate || null,
      // Já falou nesta conversa (para o selo "JUL.IA atendendo").
      respondida: Boolean(s.respondidoAte),
      dados: s.dados || {},
    };
  }

  async function iniciar() {
    await lerConfig().catch((e) => registrar("[agente] não li a configuração:", e.message));
    registrar(`[agente] JUL.IA ${config.modo} (público: ${config.publico}).`);
  }

  return {
    iniciar,
    configurar,
    get config() {
      return config;
    },
    aoMensagem,
    aoEnviarPelaLoja,
    aoAtribuir,
    lembrarAutomatica,
    pausar,
    retomar,
    proximoTrabalho,
    concluir,
    enviarSugestao,
    descartarSugestao,
    batida,
    estadoDoPc: estadoDoTrabalhador,
    estado,
    porQue,
    sugestoesDe: (chatId) => [...sugestoes.values()].filter((s) => s.chatId === chatId),
  };
}

module.exports = { criarAgente };
