// Disparo por tema de conversa.
//
// O vendedor escolhe os assuntos (os 10 temas de crm/interesses.js) e,
// se quiser, etiquetas; o SERVIDOR tira a lista do banco — não da lista de
// conversas que por acaso estava carregada no navegador — e manda devagar:
//
//   - só de segunda a sábado, das 9h às 18h, no horário de São Paulo;
//   - no máximo 100 por dia, somando todas as campanhas (crm_config "disparo");
//   - uma mensagem por vez, com 40 a 120 segundos entre uma e outra;
//   - só para conversa individual de quem já falou com a loja;
//   - nunca para quem pediu SAIR ou está bloqueado — conferido na seleção E de
//     novo antes de cada envio, porque o pedido pode chegar no meio da campanha;
//   - quem recebeu campanha nos últimos 7 dias fica de fora.
//
// O estado mora no banco (crm_campanha / crm_campanha_envio, migração
// crm_005_campanha): reiniciou o container, o laço continua de onde parou.
//
// Tudo que fala com o resto do servidor entra por parâmetro (enviar, quem
// pediu para sair, relógio...), para dar para testar sem WhatsApp nenhum.

const I = require("./interesses");
const R = require("./campanha-regras");

const TRAVA_ENVIO = 4210923; // 4210921: Status; 4210922: migração do CRM
const INTERROMPIDO_MS = 5 * 60_000; // tentativa sem resposta há mais que isto = processo caiu no meio
const ESPERA_OCIOSA_MS = 60_000;
const ESPERA_MAXIMA_MS = 15 * 60_000;
const CACHE_TETO_MS = 60_000;

const ESTADOS = ["enviando", "pausada", "concluida", "cancelada"];
const TRANSICOES = {
  pausar: { de: ["enviando"], para: "pausada" },
  retomar: { de: ["pausada"], para: "enviando" },
  cancelar: { de: ["enviando", "pausada"], para: "cancelada" },
};

function erro(status, mensagem) {
  return Object.assign(new Error(mensagem), { status });
}

const lista = (v) =>
  (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);

function diasEntre(v, padrao, min, max) {
  const n = Number(v);
  if (v == null || v === "" || !Number.isFinite(n) || n <= 0) return padrao;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Filtro como o servidor entende (o que vier a mais é ignorado). */
function lerFiltro(f = {}) {
  const conhecidos = new Set(I.listarInteresses().map((i) => i.chave));
  const temas = [...new Set(lista(f.temas))];
  const desconhecido = temas.find((t) => !conhecidos.has(t));
  if (desconhecido) throw erro(400, `Tema desconhecido: ${desconhecido}.`);
  const filtro = {
    temas,
    etiquetas: [...new Set(lista(f.etiquetas).map((e) => e.slice(0, 60)))].slice(0, 30),
    conversouNosUltimosDias: diasEntre(f.conversouNosUltimosDias, 365, 1, 3650),
    // Mínimo de 1 dia: ninguém recebe duas campanhas no mesmo dia.
    naoReceberSeRecebeuCampanhaNosUltimosDias: diasEntre(f.naoReceberSeRecebeuCampanhaNosUltimosDias, 7, 1, 365),
  };
  const chatIds = [...new Set(lista(f.chatIds))].slice(0, 5000);
  if (chatIds.length) filtro.chatIds = chatIds;
  return filtro;
}

function nomeDoContato(linha) {
  return linha?.nome || linha?.nome_whatsapp || null;
}

function linhaCampanha(x) {
  const filtro = x.filtro || {};
  const total = Number(x.total) || 0;
  const enviados = Number(x.enviados) || 0;
  const falhas = Number(x.falhas) || 0;
  const pulados = Number(x.pulados) || 0;
  return {
    id: Number(x.id),
    nome: x.nome,
    texto: x.texto,
    estado: x.estado,
    filtro: {
      temas: filtro.temas || [],
      temasNomes: (filtro.temas || []).map((t) => I.nomeDoInteresse(t)),
      etiquetas: filtro.etiquetas || [],
      conversouNosUltimosDias: filtro.conversouNosUltimosDias || null,
      naoReceberSeRecebeuCampanhaNosUltimosDias: filtro.naoReceberSeRecebeuCampanhaNosUltimosDias || null,
      contatosEscolhidos: Array.isArray(filtro.chatIds) ? filtro.chatIds.length : null,
    },
    criadaPor: x.criada_por,
    criadaEm: x.criada_em,
    inicio: x.inicio,
    fim: x.fim,
    total,
    enviados,
    falhas,
    pulados,
    pendentes: Math.max(0, total - enviados - falhas - pulados),
  };
}

/**
 * Opções que a bancada de testes pode mudar pelo ambiente. NUNCA ligue isto
 * na loja: encurta o intervalo e ignora o horário comercial.
 *   DISPARO_INTERVALO_MS="300-600"      (padrão: 40 a 120 segundos)
 *   DISPARO_JANELA_SEMPRE_ABERTA=1      (padrão: seg a sáb, 9h às 18h)
 */
function opcoesDoAmbiente(env = process.env, registrar = console.warn) {
  const opcoes = {};
  const m = String(env.DISPARO_INTERVALO_MS || "").match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (m) {
    opcoes.intervalo = { minMs: Number(m[1]), maxMs: Math.max(Number(m[1]), Number(m[2])) };
    registrar(`[campanha] ATENÇÃO: intervalo de teste ${m[1]}-${m[2]} ms (DISPARO_INTERVALO_MS). Não use na loja.`);
  }
  if (env.DISPARO_JANELA_SEMPRE_ABERTA === "1") {
    opcoes.janela = { ...R.JANELA_PADRAO, sempreAberta: true };
    registrar("[campanha] ATENÇÃO: horário comercial desligado (DISPARO_JANELA_SEMPRE_ABERTA). Não use na loja.");
  }
  return opcoes;
}

function criarCampanhas({
  db,
  // ({ chatId, texto }) => Promise<{ id }>; lança quando a Evolution recusa.
  enviar,
  // Pedido de SAIR e bloqueio guardados fora do banco (store do servidor).
  motivoDeFora = () => null, // (chatId) => "pediu para sair" | "bloqueado" | null
  barrados = () => [], // () => chatIds, para tirar já na seleção
  // Mesma pessoa com duas conversas (@lid e número): manda uma vez só.
  pessoaDe = (chatId) => chatId,
  // Etiqueta posta pela tela de atendimento (store.chatLabels, por nome).
  etiquetasDoPainel = () => [], // (nomesEmMinusculas) => chatIds
  conectado = () => true,
  avisar = () => {}, // ({ tipo, campanha, texto? })
  registrar = console.log,
  agora = () => Date.now(),
  aleatorio = Math.random,
  intervalo = R.INTERVALO_PADRAO,
  janela = R.JANELA_PADRAO,
} = {}) {
  if (!db) throw new Error("criarCampanhas: falta o banco");
  if (typeof enviar !== "function") throw new Error("criarCampanhas: falta a função de enviar");
  const log = (...a) => registrar("[campanha]", ...a);

  // ------------------------------------------------------------------
  // Configuração
  // ------------------------------------------------------------------
  let tetoGuardado = { valor: R.TETO_PADRAO, em: -Infinity };
  async function tetoDiario() {
    const t = agora();
    if (t - tetoGuardado.em < CACHE_TETO_MS) return tetoGuardado.valor;
    let valor = R.TETO_PADRAO;
    try {
      const r = await db.query(`SELECT valor FROM crm_config WHERE chave = 'disparo'`);
      const n = Number(r.rows[0]?.valor?.tetoDiario);
      if (r.rows[0]?.valor?.tetoDiario != null && Number.isFinite(n)) {
        valor = Math.min(R.TETO_MAXIMO, Math.max(1, Math.floor(n)));
      }
    } catch (e) {
      log("não li o teto em crm_config:", e.message);
    }
    tetoGuardado = { valor, em: t };
    return valor;
  }

  async function enviadosHoje(t) {
    const r = await db.query(
      `SELECT count(*)::int AS n FROM crm_campanha_envio
        WHERE estado = 'enviado' AND enviado_em >= $1 AND enviado_em < $2`,
      [new Date(R.inicioDoDia(t)), new Date(R.inicioDoProximoDia(t))]
    );
    return r.rows[0].n;
  }

  // ------------------------------------------------------------------
  // Seleção (no banco, nunca a lista da tela)
  // ------------------------------------------------------------------
  function montarSelecao(filtro, t) {
    const args = [];
    const p = (v) => {
      args.push(v);
      return `$${args.length}`;
    };
    const fora = [...new Set(lista(barrados()))];
    const onde = [
      // Só conversa individual: grupo, lista de transmissão e canal, nunca.
      `(c.chat_id LIKE '%@c.us' OR c.chat_id LIKE '%@s.whatsapp.net' OR c.chat_id LIKE '%@lid')`,
      `c.chat_id NOT LIKE '%@g.us'`,
      `c.chat_id NOT LIKE '%broadcast%'`,
      `c.optout = false`,
      `c.bloqueado = false`,
      // Vale o último registro de consentimento (opt_out depois de opt_in = fora).
      `COALESCE((SELECT k.acao FROM crm_consentimento k WHERE k.chat_id = c.chat_id
                 ORDER BY k.em DESC, k.id DESC LIMIT 1), '') <> 'opt_out'`,
      // "Quem já conversou com a loja": o CLIENTE escreveu dentro do período.
      // Mensagem que a loja mandou (inclusive campanha) não conta.
      `EXISTS (SELECT 1 FROM crm_mensagem m WHERE m.chat_id = c.chat_id AND m.direcao = 'in'
                 AND m.em >= ${p(new Date(t - filtro.conversouNosUltimosDias * R.DIA_MS))})`,
      `NOT EXISTS (SELECT 1 FROM crm_campanha_envio x WHERE x.chat_id = c.chat_id AND x.estado = 'enviado'
                 AND x.enviado_em >= ${p(new Date(t - filtro.naoReceberSeRecebeuCampanhaNosUltimosDias * R.DIA_MS))})`,
    ];
    if (fora.length) onde.push(`NOT (c.chat_id = ANY(${p(fora)}::text[]))`);
    if (filtro.temas.length) {
      // Mesma régua dos segmentos do Centro de Comando: pontos >= 2.
      onde.push(
        `EXISTS (SELECT 1 FROM crm_interesse i WHERE i.chat_id = c.chat_id AND i.pontos >= 2
                   AND i.interesse = ANY(${p(filtro.temas)}::text[]))`
      );
    }
    if (filtro.etiquetas.length) {
      const nomes = filtro.etiquetas.map((e) => e.toLocaleLowerCase("pt-BR"));
      const doPainel = [...new Set(lista(etiquetasDoPainel(nomes)))];
      const ph = p(nomes);
      onde.push(
        `(EXISTS (SELECT 1 FROM crm_contato_etiqueta ce JOIN crm_etiqueta e ON e.id = ce.etiqueta_id
                   WHERE ce.chat_id = c.chat_id AND (lower(e.nome) = ANY(${ph}::text[]) OR lower(e.id) = ANY(${ph}::text[])))
          OR c.chat_id = ANY(${p(doPainel)}::text[]))`
      );
    }
    if (filtro.chatIds) onde.push(`c.chat_id = ANY(${p(filtro.chatIds)}::text[])`);
    return { onde: onde.join("\n         AND "), args };
  }

  /** Quem recebe, na ordem de envio (quem falou por último vai primeiro). */
  async function selecionar(filtro, t, executor = db) {
    const { onde, args } = montarSelecao(filtro, t);
    const r = await executor.query(
      `SELECT c.chat_id FROM crm_contato c
        WHERE ${onde}
        ORDER BY c.ultima_em DESC NULLS LAST, c.chat_id`,
      args
    );
    const vistos = new Set();
    const saida = [];
    for (const { chat_id: chatId } of r.rows) {
      const pessoa = pessoaDe(chatId) || chatId;
      if (vistos.has(pessoa)) continue;
      vistos.add(pessoa);
      saida.push(chatId);
    }
    return saida;
  }

  async function detalhar(chatIds) {
    if (!chatIds.length) return [];
    const r = await db.query(
      `SELECT c.chat_id, c.nome, c.nome_whatsapp, c.numero,
              (SELECT array_agg(i.interesse ORDER BY i.pontos DESC)
                 FROM crm_interesse i WHERE i.chat_id = c.chat_id AND i.pontos >= 2) AS temas
         FROM crm_contato c WHERE c.chat_id = ANY($1::text[])`,
      [chatIds]
    );
    const porId = new Map(r.rows.map((x) => [x.chat_id, x]));
    return chatIds.map((id) => {
      const x = porId.get(id) || {};
      const nome = nomeDoContato(x);
      return {
        chatId: id,
        nome: nome || x.numero || id.replace(/@.*/, ""),
        primeiroNome: R.primeiroNome(nome) || null,
        temas: (x.temas || []).map((k) => I.nomeDoInteresse(k)),
      };
    });
  }

  function exigirAlgumFiltro(filtro) {
    if (!filtro.temas.length && !filtro.etiquetas.length && !filtro.chatIds) {
      throw erro(400, "Escolha pelo menos um tema ou uma etiqueta.");
    }
  }

  /** Quantos e quem (amostra de até 10), sem gravar nada. */
  async function previa(filtroBruto = {}, { texto = null } = {}) {
    const filtro = lerFiltro(filtroBruto);
    const t = agora();
    const ids = await selecionar(filtro, t);
    const amostra = await detalhar(ids.slice(0, 10));
    const teto = await tetoDiario();
    let exemplo = null;
    if (texto && String(texto).trim()) {
      const modelo = R.conferirModelo(texto);
      exemplo = R.montarTexto(modelo, { nome: amostra[0]?.primeiroNome || null });
    }
    return {
      total: ids.length,
      amostra,
      teto,
      diasDeEnvio: ids.length ? Math.ceil(ids.length / teto) : 0,
      exemplo,
      filtro: { ...filtro, chatIds: undefined },
    };
  }

  function nomeAutomatico(filtro, t) {
    const p = R.partesEmSP(t);
    const data = `${String(p.dia).padStart(2, "0")}/${String(p.mes).padStart(2, "0")}`;
    const partes = [...filtro.temas.map((x) => I.nomeDoInteresse(x)), ...filtro.etiquetas];
    const base = partes.length ? partes.join(" + ") : "Contatos escolhidos";
    return `${base} — ${data}`.slice(0, 80);
  }

  async function registrarEvento(tipo, chatId, detalhes) {
    await db
      .query(`INSERT INTO crm_evento (em, tipo, chat_id, detalhes) VALUES ($1,$2,$3,$4)`, [
        new Date(agora()),
        tipo,
        chatId,
        JSON.stringify(detalhes || {}),
      ])
      .catch((e) => log("falha ao registrar evento:", e.message));
  }

  /** Recalcula os totais da campanha a partir das linhas de envio. */
  async function recontar(campanhaId, executor = db) {
    const r = await executor.query(
      `UPDATE crm_campanha k SET
          enviados = s.enviados, falhas = s.falhas, pulados = s.pulados
         FROM (SELECT count(*) FILTER (WHERE estado = 'enviado')::int AS enviados,
                      count(*) FILTER (WHERE estado = 'falhou')::int  AS falhas,
                      count(*) FILTER (WHERE estado = 'pulado')::int  AS pulados
                 FROM crm_campanha_envio WHERE campanha_id = $1) s
        WHERE k.id = $1
        RETURNING k.*`,
      [campanhaId]
    );
    return r.rows[0] ? linhaCampanha(r.rows[0]) : null;
  }

  // ------------------------------------------------------------------
  // Campanhas
  // ------------------------------------------------------------------
  async function criar({ nome, texto, filtro: filtroBruto = {}, por = null } = {}) {
    const modelo = R.conferirModelo(texto);
    const filtro = lerFiltro(filtroBruto);
    exigirAlgumFiltro(filtro);
    const t = agora();
    const titulo = String(nome || "").trim().slice(0, 80) || nomeAutomatico(filtro, t);

    const criada = await db.transacao(async (c) => {
      const ids = await selecionar(filtro, t, c);
      if (!ids.length) {
        throw erro(400, "Nenhum contato com esse filtro (ou todos já receberam campanha nos últimos dias).");
      }
      const ins = await c.query(
        `INSERT INTO crm_campanha (nome, texto, filtro, estado, criada_por, criada_em, inicio, total)
         VALUES ($1, $2, $3, 'enviando', $4, $5, $5, $6) RETURNING id`,
        [titulo, modelo, JSON.stringify(filtro), por, new Date(t), ids.length]
      );
      const id = ins.rows[0].id;
      await c.query(
        `INSERT INTO crm_campanha_envio (campanha_id, chat_id, ordem)
         SELECT $1, x.chat_id, x.ordem::int FROM unnest($2::text[]) WITH ORDINALITY AS x(chat_id, ordem)`,
        [id, ids]
      );
      return id;
    });
    const campanha = await obter(criada);
    await registrarEvento("campanha", null, { campanhaId: campanha.id, acao: "criada", total: campanha.total, por });
    log(`campanha ${campanha.id} criada por ${por || "?"}: ${campanha.total} contato(s)`);
    avisar({ tipo: "criada", campanha });
    acordar();
    return campanha;
  }

  async function obter(id) {
    const r = await db.query(`SELECT * FROM crm_campanha WHERE id = $1`, [Number(id)]);
    return r.rows[0] ? linhaCampanha(r.rows[0]) : null;
  }

  async function listar({ limite = 30 } = {}) {
    const r = await db.query(`SELECT * FROM crm_campanha ORDER BY criada_em DESC, id DESC LIMIT $1`, [
      Math.min(200, Math.max(1, Number(limite) || 30)),
    ]);
    return { itens: r.rows.map(linhaCampanha), laco: await situacao() };
  }

  async function mudarEstado(id, acao, por = null) {
    const regra = TRANSICOES[acao];
    if (!regra) throw erro(400, "Ação desconhecida.");
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) throw erro(400, "Campanha inválida.");
    const r = await db.query(
      `UPDATE crm_campanha SET estado = $2,
              fim = CASE WHEN $2 = 'cancelada' THEN $3::timestamptz ELSE fim END
        WHERE id = $1 AND estado = ANY($4::text[])
        RETURNING *`,
      [n, regra.para, new Date(agora()), regra.de]
    );
    if (!r.rowCount) {
      const atual = await obter(n);
      if (!atual) throw erro(404, "Campanha não encontrada.");
      throw erro(409, `A campanha está ${atual.estado} — não dá para ${acao}.`);
    }
    const campanha = linhaCampanha(r.rows[0]);
    await registrarEvento("campanha", null, { campanhaId: n, acao, por });
    avisar({ tipo: "estado", campanha });
    if (acao === "retomar") acordar();
    return campanha;
  }

  /** Manda o texto só para os números do Thiago, na hora (sem fila, sem teto). */
  async function enviarTeste({ texto, numeros = null, por = null } = {}) {
    const modelo = R.conferirModelo(texto);
    const alvo = numeros == null ? [...R.NUMEROS_DE_TESTE] : lista(numeros).map((n) => n.replace(/\D/g, ""));
    if (!alvo.length || alvo.some((n) => !R.NUMEROS_DE_TESTE.includes(n))) {
      throw erro(400, "O teste só vai para os números de teste da loja.");
    }
    if (!conectado()) throw erro(503, "O WhatsApp da loja não está conectado.");
    const resultado = [];
    for (const numero of [...new Set(alvo)]) {
      const chatId = `${numero}@c.us`;
      const r = await db.query(`SELECT nome, nome_whatsapp FROM crm_contato WHERE chat_id = $1`, [chatId]);
      const textoFinal = R.montarTexto(modelo, { nome: nomeDoContato(r.rows[0]) || "Thiago" });
      try {
        const env = await enviar({ chatId, texto: textoFinal });
        resultado.push({ numero, ok: true, mensagemId: env?.id || null });
      } catch (e) {
        resultado.push({ numero, ok: false, erro: e.message });
      }
    }
    await registrarEvento("campanha_teste", null, { por, resultado });
    return { enviados: resultado.filter((x) => x.ok).length, resultado };
  }

  // ------------------------------------------------------------------
  // Laço de envio
  // ------------------------------------------------------------------

  /** Por que não mandar para esta conversa AGORA (null = pode mandar). */
  async function motivoNaHora(c, item, t) {
    const daMemoria = motivoDeFora(item.chat_id);
    if (daMemoria) return daMemoria;
    const dias = diasEntre(item.filtro?.naoReceberSeRecebeuCampanhaNosUltimosDias, 7, 1, 365);
    const r = await c.query(
      `SELECT
         (SELECT optout FROM crm_contato WHERE chat_id = $1) AS optout,
         (SELECT bloqueado FROM crm_contato WHERE chat_id = $1) AS bloqueado,
         (SELECT acao FROM crm_consentimento WHERE chat_id = $1 ORDER BY em DESC, id DESC LIMIT 1) AS consentimento,
         EXISTS (SELECT 1 FROM crm_campanha_envio WHERE chat_id = $1 AND estado = 'enviado'
                   AND campanha_id <> $2 AND enviado_em >= $3) AS recente`,
      [item.chat_id, item.campanha_id, new Date(t - dias * R.DIA_MS)]
    );
    const x = r.rows[0];
    if (x.optout || x.consentimento === "opt_out") return "pediu para sair";
    if (x.bloqueado) return "bloqueado";
    if (x.recente) return `recebeu outra campanha há menos de ${dias} dia(s)`;
    return null;
  }

  async function concluirTerminadas() {
    const r = await db.query(
      `UPDATE crm_campanha k SET estado = 'concluida', fim = $1
        WHERE k.estado = 'enviando'
          AND NOT EXISTS (SELECT 1 FROM crm_campanha_envio e WHERE e.campanha_id = k.id AND e.estado = 'pendente')
        RETURNING k.id`,
      [new Date(agora())]
    );
    for (const { id } of r.rows) {
      const campanha = await recontar(id);
      await registrarEvento("campanha", null, { campanhaId: campanha.id, acao: "concluida" });
      const partes = [`${campanha.enviados} enviada(s)`];
      if (campanha.pulados) partes.push(`${campanha.pulados} pulada(s)`);
      if (campanha.falhas) partes.push(`${campanha.falhas} com erro`);
      log(`campanha ${campanha.id} concluída: ${partes.join(", ")}`);
      avisar({ tipo: "fim", campanha, texto: `📢 Campanha "${campanha.nome}" concluída: ${partes.join(" · ")}.` });
    }
  }

  /** Envio que ficou no meio (o processo caiu): marca como falha, não repete. */
  async function fecharInterrompidos(t) {
    const r = await db.query(
      `UPDATE crm_campanha_envio SET estado = 'falhou',
              motivo = 'envio interrompido por reinício (não repetido para não duplicar)'
        WHERE estado = 'pendente' AND tentativa_em IS NOT NULL AND tentativa_em < $1
        RETURNING campanha_id`,
      [new Date(t - INTERROMPIDO_MS)]
    );
    for (const id of new Set(r.rows.map((x) => x.campanha_id))) await recontar(id);
  }

  /**
   * Um passo do laço: manda (ou pula) no máximo UMA conversa e diz quanto
   * esperar até o próximo passo. Exposto para os testes (relógio falso).
   */
  async function passo() {
    const t = agora();
    if (!conectado()) return { motivo: "whatsapp desconectado", esperarMs: ESPERA_OCIOSA_MS };
    if (!R.janelaAberta(t, janela)) {
      const abre = R.proximaAbertura(t, janela);
      return { motivo: "fora do horário", esperarMs: abre - t, retomaEm: abre };
    }
    const teto = await tetoDiario();
    if ((await enviadosHoje(t)) >= teto) {
      const abre = R.proximaAbertura(R.inicioDoProximoDia(t), janela);
      return { motivo: "teto do dia", esperarMs: abre - t, retomaEm: abre };
    }
    await fecharInterrompidos(t);

    const pego = await db.transacao(async (c) => {
      // Um envio por vez, mesmo com dois processos de pé (troca de container).
      const trava = await c.query(`SELECT pg_try_advisory_xact_lock(${TRAVA_ENVIO}) AS ok`);
      if (!trava.rows[0].ok) return { espera: { motivo: "outro processo enviando", esperarMs: 5_000 } };
      const ult = await c.query(
        `SELECT max(tentativa_em) AS em FROM crm_campanha_envio WHERE tentativa_em IS NOT NULL`
      );
      const ultima = ult.rows[0].em ? new Date(ult.rows[0].em).getTime() : 0;
      const desde = t - ultima;
      // (desde < 0: o relógio voltou; esperar até "alcançar" travaria o laço.)
      if (ultima && desde >= 0 && desde < intervalo.minMs) {
        return { espera: { motivo: "intervalo", esperarMs: intervalo.minMs - desde } };
      }
      const r = await c.query(
        `SELECT e.campanha_id, e.chat_id, k.texto, k.filtro
           FROM crm_campanha_envio e JOIN crm_campanha k ON k.id = e.campanha_id
          WHERE k.estado = 'enviando' AND e.estado = 'pendente' AND e.tentativa_em IS NULL
          ORDER BY k.criada_em, k.id, e.ordem
          LIMIT 1`
      );
      if (!r.rowCount) return { nada: true };
      const item = r.rows[0];
      const motivo = await motivoNaHora(c, item, t);
      if (motivo) {
        await c.query(
          `UPDATE crm_campanha_envio SET estado = 'pulado', motivo = $3 WHERE campanha_id = $1 AND chat_id = $2`,
          [item.campanha_id, item.chat_id, motivo]
        );
        return { pulado: item, motivo };
      }
      await c.query(`UPDATE crm_campanha_envio SET tentativa_em = $3 WHERE campanha_id = $1 AND chat_id = $2`, [
        item.campanha_id,
        item.chat_id,
        new Date(t),
      ]);
      const contato = await c.query(`SELECT nome, nome_whatsapp FROM crm_contato WHERE chat_id = $1`, [item.chat_id]);
      return { enviar: item, nome: nomeDoContato(contato.rows[0]) };
    });

    if (pego.espera) return pego.espera;
    if (pego.nada) {
      await concluirTerminadas();
      return { motivo: "sem campanha", esperarMs: ESPERA_OCIOSA_MS };
    }

    if (pego.pulado) {
      const item = pego.pulado;
      await registrarEvento("campanha_envio", item.chat_id, {
        campanhaId: Number(item.campanha_id),
        estado: "pulado",
        motivo: pego.motivo,
      });
      const campanha = await recontar(item.campanha_id);
      avisar({ tipo: "progresso", campanha });
      await concluirTerminadas();
      return { motivo: "pulado", esperarMs: 0, chatId: item.chat_id };
    }

    const item = pego.enviar;
    const texto = R.montarTexto(item.texto, { nome: pego.nome });
    let resultado;
    try {
      const r = await enviar({ chatId: item.chat_id, texto });
      resultado = { estado: "enviado", mensagemId: r?.id ? String(r.id) : null };
    } catch (e) {
      if (!conectado()) {
        // Caiu a conexão no meio: devolve para a fila, sem contar como falha.
        await db.query(
          `UPDATE crm_campanha_envio SET tentativa_em = NULL WHERE campanha_id = $1 AND chat_id = $2 AND estado = 'pendente'`,
          [item.campanha_id, item.chat_id]
        );
        return { motivo: "whatsapp desconectado", esperarMs: ESPERA_OCIOSA_MS };
      }
      resultado = { estado: "falhou", motivo: String(e?.message || e).slice(0, 300) };
    }
    const fim = agora();
    await db.query(
      `UPDATE crm_campanha_envio SET estado = $3, motivo = $4, enviado_em = $5, mensagem_id = $6
        WHERE campanha_id = $1 AND chat_id = $2`,
      [
        item.campanha_id,
        item.chat_id,
        resultado.estado,
        resultado.motivo || null,
        resultado.estado === "enviado" ? new Date(fim) : null,
        resultado.mensagemId || null,
      ]
    );
    await registrarEvento("campanha_envio", item.chat_id, {
      campanhaId: Number(item.campanha_id),
      estado: resultado.estado,
      motivo: resultado.motivo || null,
      mensagemId: resultado.mensagemId || null,
    });
    const campanha = await recontar(item.campanha_id);
    avisar({ tipo: "progresso", campanha });
    await concluirTerminadas();
    return {
      motivo: resultado.estado,
      esperarMs: R.sortearIntervalo(intervalo, aleatorio),
      chatId: item.chat_id,
      texto,
    };
  }

  let ligado = false;
  let despertar = null;
  let ultimaSituacao = { motivo: "parado", esperarMs: 0, em: null };

  function acordar() {
    // Só interrompe a espera de quem está ocioso: a pausa entre dois envios
    // e a espera pelo horário comercial nunca são encurtadas.
    if (despertar && ["sem campanha", "erro"].includes(ultimaSituacao.motivo)) despertar();
  }

  function dormir(ms) {
    return new Promise((ok) => {
      const fim = () => {
        clearTimeout(timer);
        despertar = null;
        ok();
      };
      const timer = setTimeout(fim, Math.max(0, ms));
      timer.unref?.();
      despertar = fim;
    });
  }

  function iniciar() {
    if (ligado) return;
    ligado = true;
    log(
      `laço ligado — ${janela.sempreAberta ? "SEM horário comercial" : `seg a sáb, ${janela.inicio}h às ${janela.fim}h (${R.FUSO})`}, ` +
        `${Math.round(intervalo.minMs / 1000)}-${Math.round(intervalo.maxMs / 1000)} s entre envios`
    );
    (async () => {
      while (ligado) {
        let r;
        try {
          r = await passo();
        } catch (e) {
          log("falha no laço:", e.message);
          r = { motivo: "erro", esperarMs: 30_000 };
        }
        const espera = Math.min(Math.max(0, r.esperarMs || 0), ESPERA_MAXIMA_MS);
        ultimaSituacao = { ...r, texto: undefined, em: agora(), proximoPassoEm: agora() + espera };
        if (!ligado) break;
        if (espera > 0) await dormir(espera);
      }
    })();
  }

  function parar() {
    ligado = false;
    despertar?.();
  }

  /** O que o laço está fazendo, para a tela. */
  async function situacao() {
    const t = agora();
    const teto = await tetoDiario();
    return {
      ligado,
      motivo: ultimaSituacao.motivo,
      proximoPassoEm: ultimaSituacao.proximoPassoEm ? new Date(ultimaSituacao.proximoPassoEm).toISOString() : null,
      janelaAberta: R.janelaAberta(t, janela),
      proximaAbertura: new Date(R.proximaAbertura(t, janela)).toISOString(),
      enviadosHoje: await enviadosHoje(t),
      teto,
      conectado: Boolean(conectado()),
    };
  }

  return {
    previa,
    criar,
    obter,
    listar,
    mudarEstado,
    pausar: (id, por) => mudarEstado(id, "pausar", por),
    retomar: (id, por) => mudarEstado(id, "retomar", por),
    cancelar: (id, por) => mudarEstado(id, "cancelar", por),
    enviarTeste,
    passo,
    iniciar,
    parar,
    situacao,
    tetoDiario,
  };
}

module.exports = { criarCampanhas, lerFiltro, opcoesDoAmbiente, ESTADOS, TRAVA_ENVIO };
