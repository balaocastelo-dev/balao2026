// Serviço do CRM: grava o que acontece e responde as perguntas do painel.
//
// Regra de ouro deste arquivo: **gravar nunca pode atrapalhar o atendimento**.
// Toda escrita é tolerante a falha e registrada no log — se o banco cair, a
// loja continua conversando com o cliente normalmente e a gente perde só
// estatística. Por isso quase tudo aqui devolve promessa que não rejeita.

const I = require("./interesses");

const JANELA_RODADA_HORAS = 6; // silêncio maior que isto começa um atendimento novo
const JANELA_RESPOSTA_HORAS = 48; // depois disso não conta como "resposta"

function criarServicoDoCrm({ db, registrar = console.log }) {
  const log = (...a) => registrar("[crm]", ...a);
  const falhou = (onde) => (e) => log(`falha em ${onde}:`, e.message);

  // ------------------------------------------------------------------
  // Escrita
  // ------------------------------------------------------------------

  /**
   * Guarda uma mensagem e mantém o contato em dia. Idempotente: a mesma
   * mensagem pode chegar pelo webhook e pela varredura sem duplicar.
   */
  async function registrarMensagem(msg, { origem = "webhook", vendedorId = null } = {}) {
    if (!msg?.id || !msg?.chatId || !msg?.direcao) return;
    const em = new Date(msg.timestamp || Date.now());
    const corpo = String(msg.corpo || "").slice(0, 8000);

    await db.transacao(async (c) => {
      const inserida = await c.query(
        `INSERT INTO crm_mensagem
           (id, chat_id, direcao, corpo, tipo_midia, mime, nome_midia, transcricao,
            produto_id, produto_nome, vendedor_id, origem, situacao, em)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE
           SET situacao = COALESCE(EXCLUDED.situacao, crm_mensagem.situacao),
               transcricao = COALESCE(EXCLUDED.transcricao, crm_mensagem.transcricao)
         RETURNING (xmax = 0) AS nova`,
        [
          String(msg.id),
          String(msg.chatId),
          msg.direcao === "out" ? "out" : "in",
          corpo,
          msg.tipoMidia || null,
          msg.mime || null,
          msg.nomeMidia || null,
          msg.transcricao || null,
          msg.produtoId ? String(msg.produtoId) : null,
          msg.produtoNome || null,
          vendedorId,
          origem,
          msg.situacao || null,
          em,
        ]
      );
      const nova = inserida.rows[0]?.nova === true;
      if (!nova) return;

      const entrada = msg.direcao === "in" ? 1 : 0;
      await c.query(
        `INSERT INTO crm_contato
           (chat_id, numero, nome_whatsapp, primeira_em, ultima_em, ultima_direcao, ultima_previa,
            total_entrada, total_saida)
         VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8)
         ON CONFLICT (chat_id) DO UPDATE SET
           numero        = COALESCE(crm_contato.numero, EXCLUDED.numero),
           nome_whatsapp = COALESCE(EXCLUDED.nome_whatsapp, crm_contato.nome_whatsapp),
           primeira_em   = LEAST(crm_contato.primeira_em, EXCLUDED.primeira_em),
           ultima_em     = GREATEST(crm_contato.ultima_em, EXCLUDED.ultima_em),
           ultima_direcao = CASE WHEN EXCLUDED.ultima_em >= crm_contato.ultima_em
                                 THEN EXCLUDED.ultima_direcao ELSE crm_contato.ultima_direcao END,
           ultima_previa  = CASE WHEN EXCLUDED.ultima_em >= crm_contato.ultima_em
                                 THEN EXCLUDED.ultima_previa ELSE crm_contato.ultima_previa END,
           total_entrada = crm_contato.total_entrada + EXCLUDED.total_entrada,
           total_saida   = crm_contato.total_saida + EXCLUDED.total_saida,
           atualizado_em = now()`,
        [
          String(msg.chatId),
          msg.numero || null,
          msg.contato || null,
          em,
          msg.direcao === "out" ? "out" : "in",
          previa(msg),
          entrada,
          entrada ? 0 : 1,
        ]
      );

      await c.query(
        `INSERT INTO crm_evento (em, tipo, chat_id, vendedor_id, detalhes)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          em,
          msg.direcao === "in" ? "mensagem_entrada" : "mensagem_saida",
          String(msg.chatId),
          vendedorId,
          JSON.stringify({ origem, tipo: msg.tipoMidia || "texto" }),
        ]
      );

      // Interesse: palavras da mensagem + produto ofertado.
      const pontos = I.somar(
        I.analisarTexto(corpo),
        msg.produtoNome ? I.analisarProduto(msg.produtoNome, msg.produtoCategoria) : {}
      );
      for (const [interesse, n] of Object.entries(pontos)) {
        await c.query(
          `INSERT INTO crm_interesse (chat_id, interesse, pontos, ultima_em)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (chat_id, interesse) DO UPDATE
             SET pontos = crm_interesse.pontos + EXCLUDED.pontos,
                 ultima_em = GREATEST(crm_interesse.ultima_em, EXCLUDED.ultima_em)`,
          [String(msg.chatId), interesse, n, em]
        );
      }
    });
  }

  /** Versão que nunca estoura: usada no caminho quente do atendimento. */
  function registrarMensagemSemQuebrar(msg, opcoes) {
    return registrarMensagem(msg, opcoes).catch(falhou("registrarMensagem"));
  }

  /** Dados que vêm da lista de conversas (nome, foto, número). */
  async function registrarContato(c) {
    if (!c?.chatId) return;
    await db.query(
      `INSERT INTO crm_contato (chat_id, numero, nome, nome_whatsapp, foto_url, ultima_em, ultima_previa)
       VALUES ($1,$2,$3,$3,$4,$5,$6)
       ON CONFLICT (chat_id) DO UPDATE SET
         numero        = COALESCE(EXCLUDED.numero, crm_contato.numero),
         nome          = COALESCE(EXCLUDED.nome, crm_contato.nome),
         nome_whatsapp = COALESCE(EXCLUDED.nome_whatsapp, crm_contato.nome_whatsapp),
         foto_url      = COALESCE(EXCLUDED.foto_url, crm_contato.foto_url),
         ultima_em     = GREATEST(crm_contato.ultima_em, EXCLUDED.ultima_em),
         atualizado_em = now()`,
      [String(c.chatId), c.numero || null, c.nome || null, c.foto || null, c.ultimaEm ? new Date(c.ultimaEm) : null, c.previa || null]
    );
  }

  function registrarContatoSemQuebrar(c) {
    return registrarContato(c).catch(falhou("registrarContato"));
  }

  async function registrarEvento(tipo, { chatId = null, vendedorId = null, detalhes = {} } = {}) {
    await db
      .query(`INSERT INTO crm_evento (tipo, chat_id, vendedor_id, detalhes) VALUES ($1,$2,$3,$4)`, [
        tipo,
        chatId,
        vendedorId,
        JSON.stringify(detalhes || {}),
      ])
      .catch(falhou("registrarEvento"));
  }

  async function definirVendedor(chatId, vendedorId) {
    await db.query(`UPDATE crm_contato SET vendedor_id = $2, atualizado_em = now() WHERE chat_id = $1`, [
      String(chatId),
      vendedorId || null,
    ]);
    await registrarEvento("vendedor_mudou", { chatId, vendedorId });
  }

  async function definirEtapa(chatId, etapa, vendedorId = null) {
    await db.query(`UPDATE crm_contato SET etapa = $2, atualizado_em = now() WHERE chat_id = $1`, [
      String(chatId),
      etapa || null,
    ]);
    await registrarEvento("etapa_mudou", { chatId, vendedorId, detalhes: { etapa } });
  }

  async function registrarConsentimento({ chatId, acao, canal = "whatsapp", texto = null, finalidade = null, por = null }) {
    if (!chatId || !["opt_in", "opt_out"].includes(acao)) return;
    await db.transacao(async (c) => {
      await c.query(
        `INSERT INTO crm_consentimento (chat_id, acao, canal, texto, finalidade, por)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [String(chatId), acao, canal, texto, finalidade, por]
      );
      await c.query(
        `UPDATE crm_contato SET optin = $2, optout = $3, atualizado_em = now() WHERE chat_id = $1`,
        [String(chatId), acao === "opt_in", acao === "opt_out"]
      );
    });
  }

  // ------------------------------------------------------------------
  // Leitura — o painel da operação
  // ------------------------------------------------------------------

  async function resumo({ dias = 7 } = {}) {
    const desde = `${Math.max(1, Math.min(365, Number(dias) || 7))} days`;

    const [totais, porDia, porHora, porVendedor, resposta, funil, topInteresses, semResposta] = await Promise.all([
      db.query(
        `SELECT
           count(*) FILTER (WHERE direcao = 'in')  AS entradas,
           count(*) FILTER (WHERE direcao = 'out') AS saidas,
           count(DISTINCT chat_id)                 AS conversas
         FROM crm_mensagem WHERE em >= now() - $1::interval`,
        [desde]
      ),
      db.query(
        `SELECT date_trunc('day', em) AS dia,
                count(*) FILTER (WHERE direcao = 'in')  AS entradas,
                count(*) FILTER (WHERE direcao = 'out') AS saidas,
                count(DISTINCT chat_id) AS conversas
         FROM crm_mensagem WHERE em >= now() - $1::interval
         GROUP BY 1 ORDER BY 1`,
        [desde]
      ),
      db.query(
        `SELECT EXTRACT(HOUR FROM em AT TIME ZONE 'America/Sao_Paulo')::int AS hora,
                count(*) AS total
         FROM crm_mensagem WHERE em >= now() - $1::interval AND direcao = 'in'
         GROUP BY 1 ORDER BY 1`,
        [desde]
      ),
      db.query(
        `SELECT vendedor_id,
                count(*) FILTER (WHERE direcao = 'out') AS enviadas,
                count(DISTINCT chat_id) AS conversas
         FROM crm_mensagem
         WHERE em >= now() - $1::interval AND vendedor_id IS NOT NULL
         GROUP BY 1 ORDER BY 2 DESC`,
        [desde]
      ),
      db.query(
        `WITH m AS (
           SELECT chat_id, direcao, em,
                  LAG(em) OVER (PARTITION BY chat_id ORDER BY em) AS anterior
           FROM crm_mensagem WHERE em >= now() - $1::interval
         ),
         inicios AS (
           SELECT chat_id, em FROM m
           WHERE direcao = 'in' AND (anterior IS NULL OR em - anterior > interval '${JANELA_RODADA_HORAS} hours')
         ),
         pares AS (
           SELECT i.chat_id, i.em AS pergunta,
                  (SELECT MIN(o.em) FROM crm_mensagem o
                    WHERE o.chat_id = i.chat_id AND o.direcao = 'out'
                      AND o.em > i.em AND o.em < i.em + interval '${JANELA_RESPOSTA_HORAS} hours') AS resposta
           FROM inicios i
         )
         SELECT count(*)::int AS rodadas,
                count(resposta)::int AS respondidas,
                COALESCE(percentile_cont(0.5) WITHIN GROUP (
                  ORDER BY EXTRACT(EPOCH FROM (resposta - pergunta))), 0) AS mediana_seg,
                COALESCE(avg(EXTRACT(EPOCH FROM (resposta - pergunta))), 0) AS media_seg
         FROM pares`,
        [desde]
      ),
      db.query(
        `SELECT COALESCE(etapa, 'novos') AS etapa, count(*)::int AS total
         FROM crm_contato WHERE oculto = false GROUP BY 1 ORDER BY 2 DESC`
      ),
      db.query(
        `SELECT interesse, count(*)::int AS contatos
         FROM crm_interesse WHERE pontos >= 2 GROUP BY 1 ORDER BY 2 DESC LIMIT 12`
      ),
      db.query(
        `SELECT count(*)::int AS total FROM crm_contato
         WHERE oculto = false AND ultima_direcao = 'in'
           AND ultima_em >= now() - interval '7 days'`
      ),
    ]);

    const r = resposta.rows[0] || {};
    return {
      periodoDias: Number(dias) || 7,
      totais: {
        entradas: Number(totais.rows[0]?.entradas || 0),
        saidas: Number(totais.rows[0]?.saidas || 0),
        conversas: Number(totais.rows[0]?.conversas || 0),
      },
      porDia: porDia.rows.map((x) => ({
        dia: x.dia,
        entradas: Number(x.entradas),
        saidas: Number(x.saidas),
        conversas: Number(x.conversas),
      })),
      porHora: porHora.rows.map((x) => ({ hora: Number(x.hora), total: Number(x.total) })),
      porVendedor: porVendedor.rows.map((x) => ({
        vendedorId: x.vendedor_id,
        enviadas: Number(x.enviadas),
        conversas: Number(x.conversas),
      })),
      primeiraResposta: {
        rodadas: Number(r.rodadas || 0),
        respondidas: Number(r.respondidas || 0),
        semResposta: Number(r.rodadas || 0) - Number(r.respondidas || 0),
        medianaSegundos: Math.round(Number(r.mediana_seg || 0)),
        mediaSegundos: Math.round(Number(r.media_seg || 0)),
      },
      funil: funil.rows.map((x) => ({ etapa: x.etapa, total: x.total })),
      interesses: topInteresses.rows.map((x) => ({
        chave: x.interesse,
        nome: I.nomeDoInteresse(x.interesse),
        contatos: x.contatos,
      })),
      aguardando: Number(semResposta.rows[0]?.total || 0),
    };
  }

  /** Quem está esperando resposta agora (a fila de verdade). */
  async function fila({ limite = 50 } = {}) {
    const r = await db.query(
      `SELECT chat_id, nome, nome_whatsapp, numero, vendedor_id, etapa, ultima_em, ultima_previa
       FROM crm_contato
       WHERE oculto = false AND ultima_direcao = 'in'
       ORDER BY ultima_em ASC NULLS LAST
       LIMIT $1`,
      [Math.min(200, Math.max(1, Number(limite) || 50))]
    );
    return r.rows.map(linhaContato);
  }

  /** Busca e filtros da tela de Clientes. */
  async function contatos({
    texto = "",
    interesse = "",
    etiqueta = "",
    etapa = "",
    vendedorId = "",
    semCompraDias = 0,
    optin = null,
    limite = 100,
    pagina = 1,
  } = {}) {
    const onde = ["c.oculto = false"];
    const args = [];
    // `$?` vira o número do parâmetro — todas as ocorrências do mesmo trecho
    // apontam para o MESMO valor, que é o que a busca por texto precisa.
    const add = (sql, valor) => {
      args.push(valor);
      onde.push(sql.split("$?").join(`$${args.length}`));
    };

    if (texto) {
      add(
        `(c.nome ILIKE $? OR c.nome_whatsapp ILIKE $? OR c.numero ILIKE $? OR c.chat_id ILIKE $?)`,
        `%${texto}%`
      );
    }
    if (interesse) add(`EXISTS (SELECT 1 FROM crm_interesse i WHERE i.chat_id = c.chat_id AND i.interesse = $? AND i.pontos >= 2)`, interesse);
    if (etiqueta) add(`EXISTS (SELECT 1 FROM crm_contato_etiqueta e WHERE e.chat_id = c.chat_id AND e.etiqueta_id = $?)`, etiqueta);
    if (etapa) add(`COALESCE(c.etapa,'novos') = $?`, etapa);
    if (vendedorId) add(`c.vendedor_id = $?`, vendedorId);
    if (Number(semCompraDias) > 0) add(`c.ultima_em < now() - ($? || ' days')::interval`, String(Number(semCompraDias)));
    if (optin === true) onde.push("c.optin = true");
    if (optin === false) onde.push("c.optout = false");

    const lim = Math.min(500, Math.max(1, Number(limite) || 100));
    const off = (Math.max(1, Number(pagina) || 1) - 1) * lim;
    args.push(lim, off);

    const sql = `
      SELECT c.*,
             (SELECT array_agg(i.interesse ORDER BY i.pontos DESC)
                FROM crm_interesse i WHERE i.chat_id = c.chat_id AND i.pontos >= 2) AS interesses,
             (SELECT array_agg(e.etiqueta_id)
                FROM crm_contato_etiqueta e WHERE e.chat_id = c.chat_id) AS etiquetas,
             count(*) OVER () AS total_geral
      FROM crm_contato c
      WHERE ${onde.join(" AND ")}
      ORDER BY c.ultima_em DESC NULLS LAST
      LIMIT $${args.length - 1} OFFSET $${args.length}`;

    const r = await db.query(sql, args);
    return {
      total: Number(r.rows[0]?.total_geral || 0),
      pagina: Math.max(1, Number(pagina) || 1),
      limite: lim,
      itens: r.rows.map(linhaContato),
    };
  }

  async function contato(chatId) {
    const [c, notas, interesses, etiquetas, consent] = await Promise.all([
      db.query(`SELECT * FROM crm_contato WHERE chat_id = $1`, [String(chatId)]),
      db.query(`SELECT id, texto, autor, em FROM crm_nota WHERE chat_id = $1 ORDER BY em DESC LIMIT 50`, [String(chatId)]),
      db.query(`SELECT interesse, pontos, ultima_em FROM crm_interesse WHERE chat_id = $1 ORDER BY pontos DESC`, [String(chatId)]),
      db.query(`SELECT etiqueta_id FROM crm_contato_etiqueta WHERE chat_id = $1`, [String(chatId)]),
      db.query(`SELECT acao, canal, texto, em, por FROM crm_consentimento WHERE chat_id = $1 ORDER BY em DESC LIMIT 20`, [String(chatId)]),
    ]);
    if (!c.rowCount) return null;
    return {
      ...linhaContato(c.rows[0]),
      notas: notas.rows,
      interesses: interesses.rows.map((x) => ({
        chave: x.interesse,
        nome: I.nomeDoInteresse(x.interesse),
        pontos: x.pontos,
        ultimaEm: x.ultima_em,
      })),
      etiquetas: etiquetas.rows.map((x) => x.etiqueta_id),
      consentimento: consent.rows,
    };
  }

  /** Busca dentro do conteúdo das conversas. */
  async function buscarMensagens({ texto, limite = 50 }) {
    if (!texto || String(texto).trim().length < 2) return [];
    const r = await db.query(
      `SELECT m.id, m.chat_id, m.direcao, m.corpo, m.em, c.nome, c.nome_whatsapp, c.numero
       FROM crm_mensagem m
       LEFT JOIN crm_contato c ON c.chat_id = m.chat_id
       WHERE to_tsvector('portuguese', m.corpo) @@ plainto_tsquery('portuguese', $1)
       ORDER BY m.em DESC LIMIT $2`,
      [String(texto), Math.min(200, Math.max(1, Number(limite) || 50))]
    );
    return r.rows.map((x) => ({
      id: x.id,
      chatId: x.chat_id,
      direcao: x.direcao,
      corpo: x.corpo,
      em: x.em,
      nome: x.nome || x.nome_whatsapp || x.numero || x.chat_id,
    }));
  }

  async function segmentos() {
    const r = await db.query(
      `SELECT interesse, count(*)::int AS contatos,
              count(*) FILTER (WHERE ultima_em >= now() - interval '90 days')::int AS recentes
       FROM crm_interesse WHERE pontos >= 2 GROUP BY 1 ORDER BY 2 DESC`
    );
    const conhecidos = new Map(r.rows.map((x) => [x.interesse, x]));
    return I.listarInteresses().map((i) => ({
      chave: i.chave,
      nome: i.nome,
      contatos: conhecidos.get(i.chave)?.contatos || 0,
      recentes: conhecidos.get(i.chave)?.recentes || 0,
    }));
  }

  // ------------------------------------------------------------------
  // Etiquetas, notas e respostas rápidas (o que hoje vive no navegador)
  // ------------------------------------------------------------------

  async function listarEtiquetas() {
    const r = await db.query(
      `SELECT e.*, (SELECT count(*) FROM crm_contato_etiqueta x WHERE x.etiqueta_id = e.id)::int AS usos
       FROM crm_etiqueta e ORDER BY e.nome`
    );
    return r.rows;
  }
  async function salvarEtiqueta({ id, nome, cor }) {
    const chave = String(id || `etq-${Date.now()}`);
    await db.query(
      `INSERT INTO crm_etiqueta (id, nome, cor) VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, cor = EXCLUDED.cor`,
      [chave, String(nome || "Etiqueta").slice(0, 40), String(cor || "#0f9d58")]
    );
    return chave;
  }
  async function excluirEtiqueta(id) {
    await db.query(`DELETE FROM crm_etiqueta WHERE id = $1`, [String(id)]);
  }
  async function marcarEtiqueta(chatId, etiquetaId, ligada, por = null) {
    if (ligada) {
      await db.query(
        `INSERT INTO crm_contato_etiqueta (chat_id, etiqueta_id, por) VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [String(chatId), String(etiquetaId), por]
      );
    } else {
      await db.query(`DELETE FROM crm_contato_etiqueta WHERE chat_id = $1 AND etiqueta_id = $2`, [
        String(chatId),
        String(etiquetaId),
      ]);
    }
  }

  async function adicionarNota({ chatId, texto, autor }) {
    const r = await db.query(
      `INSERT INTO crm_nota (chat_id, texto, autor) VALUES ($1,$2,$3) RETURNING id, texto, autor, em`,
      [String(chatId), String(texto || "").slice(0, 4000), autor || null]
    );
    return r.rows[0];
  }
  async function excluirNota(id) {
    await db.query(`DELETE FROM crm_nota WHERE id = $1`, [Number(id)]);
  }

  async function listarRespostas() {
    const r = await db.query(`SELECT * FROM crm_resposta_rapida ORDER BY categoria NULLS FIRST, titulo`);
    return r.rows;
  }
  async function salvarResposta({ id, atalho, titulo, texto, categoria, criadoPor }) {
    const chave = String(id || `rr-${Date.now()}`);
    await db.query(
      `INSERT INTO crm_resposta_rapida (id, atalho, titulo, texto, categoria, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         atalho = EXCLUDED.atalho, titulo = EXCLUDED.titulo, texto = EXCLUDED.texto,
         categoria = EXCLUDED.categoria, atualizado_em = now()`,
      [
        chave,
        atalho ? String(atalho).slice(0, 20) : null,
        String(titulo || "Resposta").slice(0, 80),
        String(texto || "").slice(0, 4000),
        categoria ? String(categoria).slice(0, 40) : null,
        criadoPor || null,
      ]
    );
    return chave;
  }
  async function excluirResposta(id) {
    await db.query(`DELETE FROM crm_resposta_rapida WHERE id = $1`, [String(id)]);
  }
  async function contarUsoDaResposta(id) {
    await db.query(`UPDATE crm_resposta_rapida SET usos = usos + 1 WHERE id = $1`, [String(id)]).catch(() => {});
  }

  // ------------------------------------------------------------------
  // Importação do que já existe
  // ------------------------------------------------------------------

  /**
   * Traz para o banco o histórico que hoje só existe na Evolution/memória.
   * Pode rodar quantas vezes quiser: mensagem repetida é ignorada.
   */
  async function importar(mensagens, { origem = "importacao" } = {}) {
    let gravadas = 0;
    for (const m of mensagens || []) {
      try {
        await registrarMensagem(m, { origem });
        gravadas++;
      } catch (e) {
        log("falha ao importar mensagem:", e.message);
      }
    }
    return gravadas;
  }

  async function estado() {
    const r = await db.query(
      `SELECT
         (SELECT count(*) FROM crm_contato)::int   AS contatos,
         (SELECT count(*) FROM crm_mensagem)::int  AS mensagens,
         (SELECT max(em) FROM crm_mensagem)        AS ultima_mensagem,
         (SELECT count(*) FROM crm_interesse)::int AS interesses,
         (SELECT count(*) FROM crm_etiqueta)::int  AS etiquetas`
    );
    return r.rows[0];
  }

  return {
    registrarMensagem,
    registrarMensagemSemQuebrar,
    registrarContato,
    registrarContatoSemQuebrar,
    registrarEvento,
    definirVendedor,
    definirEtapa,
    registrarConsentimento,
    resumo,
    fila,
    contatos,
    contato,
    buscarMensagens,
    segmentos,
    listarEtiquetas,
    salvarEtiqueta,
    excluirEtiqueta,
    marcarEtiqueta,
    adicionarNota,
    excluirNota,
    listarRespostas,
    salvarResposta,
    excluirResposta,
    contarUsoDaResposta,
    importar,
    estado,
  };
}

function previa(msg) {
  if (msg.corpo) return String(msg.corpo).slice(0, 120);
  const rotulos = {
    image: "📷 Foto",
    video: "🎥 Vídeo",
    audio: "🎵 Áudio",
    ptt: "🎤 Mensagem de voz",
    document: "📄 Documento",
    sticker: "Figurinha",
  };
  return rotulos[msg.tipoMidia] || "";
}

function linhaContato(x) {
  return {
    chatId: x.chat_id,
    numero: x.numero,
    nome: x.nome || x.nome_whatsapp || null,
    nomeWhatsapp: x.nome_whatsapp,
    foto: x.foto_url,
    vendedorId: x.vendedor_id,
    etapa: x.etapa || "novos",
    primeiraEm: x.primeira_em,
    ultimaEm: x.ultima_em,
    ultimaDirecao: x.ultima_direcao,
    previa: x.ultima_previa,
    entradas: x.total_entrada,
    saidas: x.total_saida,
    optin: x.optin,
    optout: x.optout,
    interesses: (x.interesses || []).map((c) => ({ chave: c, nome: I.nomeDoInteresse(c) })),
    etiquetas: x.etiquetas || [],
  };
}

module.exports = { criarServicoDoCrm };
