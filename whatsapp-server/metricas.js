// ============================================================
// Números do dashboard (/crm).
//
// Fica separado do server.js de propósito: é uma função pura sobre o `store`,
// então dá para testar sem subir o WhatsApp, o Chromium ou o Express. Todo
// número que aparece no painel sai daqui — se um valor parecer errado na tela,
// é aqui que se olha.
//
// Nada é estimado nem arredondado para ficar bonito: o que não dá para saber
// vem zero, e não um palpite.
// ============================================================

const DIA_MS = 24 * 60 * 60 * 1000;

/** Colunas do funil quando o vendedor não personalizou as dele. */
const COLUNAS_PADRAO = [
  { id: "novos", nome: "Novos Leads", cor: "#3b82f6" },
  { id: "atendimento", nome: "Em Atendimento", cor: "#8b5cf6" },
  { id: "orcamento", nome: "Orçamento Enviado", cor: "#f59e0b" },
  { id: "negociacao", nome: "Em Negociação", cor: "#ec4899" },
  { id: "aguardando_pgto", nome: "Aguardando Pix / Pgto", cor: "#06b6d4" },
  { id: "ganho", nome: "Venda Fechada / Ganho", cor: "#10b981" },
  { id: "pos_venda", nome: "Pós-Venda & Garantia", cor: "#6366f1" },
  { id: "perdido", nome: "Perdido / Sem Retorno", cor: "#64748b" },
];

/**
 * Dia no fuso de Campinas, no formato AAAA-MM-DD.
 *
 * O container roda em UTC. Sem converter, tudo que acontece depois das 21h
 * cairia no "amanhã" do gráfico — e o vendedor veria movimento num dia em que
 * a loja estava fechada.
 */
function diaLocal(timestamp, fuso = "America/Sao_Paulo") {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toISOString().slice(0, 10);
  }
}

function horaLocal(timestamp, fuso = "America/Sao_Paulo") {
  try {
    return Number(
      new Intl.DateTimeFormat("en-GB", { timeZone: fuso, hour: "2-digit", hour12: false }).format(
        new Date(timestamp)
      )
    );
  } catch {
    return new Date(timestamp).getUTCHours();
  }
}

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

/** Duas casas, sem o vaivém do ponto flutuante (0.1 + 0.2 e afins). */
function dinheiro(valor) {
  return Math.round(numero(valor) * 100) / 100;
}

/**
 * Nome da coluna do funil.
 *
 * Procura em três lugares, nesta ordem: as colunas que ESTE vendedor criou, as
 * colunas de qualquer outro vendedor, e as padrão. O segundo passo existe
 * porque cartão e coluna podem estar guardados sob pessoas diferentes — sem
 * ele, o dashboard mostrava `col-1787528992522` no lugar de "Aguardando peça",
 * que é um id de uso interno e não diz nada para quem está olhando a tela.
 */
function nomeDaColuna(colunaId, preferenciasDoDono, todasAsPreferencias = {}) {
  const procurarEm = (prefs) =>
    (Array.isArray(prefs?.kanbanColunas) ? prefs.kanbanColunas : []).find(
      (c) => c?.id === colunaId
    );

  let achada = procurarEm(preferenciasDoDono);

  if (!achada) {
    for (const prefs of Object.values(todasAsPreferencias)) {
      achada = procurarEm(prefs);
      if (achada) break;
    }
  }

  if (!achada) achada = COLUNAS_PADRAO.find((c) => c.id === colunaId);

  return {
    // Último recurso: um rótulo honesto em vez do id cru. O id é de uso
    // interno e na tela parece defeito.
    nome: achada?.nome || "Coluna sem nome",
    cor: achada?.cor || "#94a3b8",
  };
}

/**
 * Todos os números do dashboard.
 *
 * @param {object} store     O store do servidor (conversas, mensagens, vendedores, vendas).
 * @param {object} opcoes    `agora` (ms) e `dias` da série histórica.
 */
function calcularMetricas(store, opcoes = {}) {
  const agora = numero(opcoes.agora) || Date.now();
  const dias = Math.min(90, Math.max(7, numero(opcoes.dias) || 14));
  const fuso = opcoes.fuso || "America/Sao_Paulo";

  const chats = Array.isArray(store?.chats) ? store.chats : [];
  const mensagens = Array.isArray(store?.messages) ? store.messages : [];
  const vendedores = Array.isArray(store?.vendedores) ? store.vendedores : [];
  const vendas = Array.isArray(store?.vendas) ? store.vendas : [];
  const atribuicoes = store?.chatAssignments || {};
  const kanban = store?.kanbanPorVendedor || {};
  const preferencias = store?.preferenciasPorVendedor || {};

  const hoje = diaLocal(agora, fuso);
  const inicio24h = agora - DIA_MS;
  const inicio7d = agora - 7 * DIA_MS;
  const inicio30d = agora - 30 * DIA_MS;

  // ---------- série por dia ----------
  // A série é montada a partir de uma grade de dias, não das mensagens: dia
  // sem movimento precisa aparecer como zero, senão o gráfico "pula" o dia
  // parado e a linha mente sobre o ritmo.
  const grade = [];
  for (let i = dias - 1; i >= 0; i--) {
    grade.push(diaLocal(agora - i * DIA_MS, fuso));
  }
  const porDia = new Map(
    grade.map((dia) => [dia, { dia, recebidas: 0, enviadas: 0, clientesNovos: 0, vendas: 0, faturamento: 0 }])
  );

  const porHora = Array.from({ length: 24 }, (_, h) => ({ hora: h, recebidas: 0, enviadas: 0 }));

  let recebidas = 0;
  let enviadas = 0;
  let recebidasHoje = 0;
  let enviadasHoje = 0;

  for (const m of mensagens) {
    const ts = numero(m?.timestamp);
    if (!ts) continue;
    const entrada = m?.direction !== "out";

    if (entrada) recebidas += 1;
    else enviadas += 1;

    const dia = diaLocal(ts, fuso);
    if (dia === hoje) {
      if (entrada) recebidasHoje += 1;
      else enviadasHoje += 1;
    }

    const linha = porDia.get(dia);
    if (linha) {
      if (entrada) linha.recebidas += 1;
      else linha.enviadas += 1;
    }

    if (ts >= inicio24h) {
      const faixa = porHora[horaLocal(ts, fuso)];
      if (faixa) {
        if (entrada) faixa.recebidas += 1;
        else faixa.enviadas += 1;
      }
    }
  }

  // ---------- clientes ----------
  // "Cliente novo" é a primeira mensagem daquela conversa que conhecemos.
  // Como o histórico é carregado aos poucos, isso pode retroceder quando um
  // pedaço antigo chega — é uma medida do que o servidor viu, não da vida
  // inteira do contato, e o painel diz isso na tela.
  const primeiraMensagemPorChat = new Map();
  const ultimaMensagemPorChat = new Map();
  for (const m of mensagens) {
    const chatId = m?.chatId;
    const ts = numero(m?.timestamp);
    if (!chatId || !ts) continue;
    const antes = primeiraMensagemPorChat.get(chatId);
    if (!antes || ts < antes) primeiraMensagemPorChat.set(chatId, ts);
    const depois = ultimaMensagemPorChat.get(chatId);
    if (!depois || ts > depois) ultimaMensagemPorChat.set(chatId, ts);
  }

  for (const [, ts] of primeiraMensagemPorChat) {
    const linha = porDia.get(diaLocal(ts, fuso));
    if (linha) linha.clientesNovos += 1;
  }

  let novosHoje = 0;
  let novos7d = 0;
  let ativos24h = 0;
  let ativos7d = 0;
  for (const chat of chats) {
    const id = chat?.chatId;
    if (!id) continue;
    const primeira = primeiraMensagemPorChat.get(id);
    if (primeira) {
      if (diaLocal(primeira, fuso) === hoje) novosHoje += 1;
      if (primeira >= inicio7d) novos7d += 1;
    }
    const ultima = ultimaMensagemPorChat.get(id) || numero(chat?.lastMessageTimestamp);
    if (ultima >= inicio24h) ativos24h += 1;
    if (ultima >= inicio7d) ativos7d += 1;
  }

  // Conversa cuja última mensagem é do cliente: ninguém respondeu ainda.
  // É o número que mais importa no dia a dia — cada unidade aqui é uma pessoa
  // esperando.
  const ultimaDirecaoPorChat = new Map();
  for (const m of mensagens) {
    const chatId = m?.chatId;
    const ts = numero(m?.timestamp);
    if (!chatId || !ts) continue;
    const atual = ultimaDirecaoPorChat.get(chatId);
    if (!atual || ts >= atual.ts) {
      ultimaDirecaoPorChat.set(chatId, { ts, entrada: m?.direction !== "out" });
    }
  }
  let semResposta = 0;
  let semRespostaAtribuidas = 0;
  for (const [chatId, info] of ultimaDirecaoPorChat) {
    if (!info.entrada) continue;
    semResposta += 1;
    if (atribuicoes[chatId]) semRespostaAtribuidas += 1;
  }

  const naoLidas = chats.reduce((soma, c) => soma + numero(c?.unreadCount), 0);

  // ---------- vendas e comissão ----------
  let faturamentoTotal = 0;
  let faturamentoMes = 0;
  let faturamentoHoje = 0;
  let comissaoTotal = 0;
  const vendasPorVendedor = new Map();

  const percentualDoVendedor = new Map(
    vendedores.map((v) => [v.id, numero(v?.comissaoPercentual)])
  );

  for (const venda of vendas) {
    const valor = dinheiro(venda?.valor);
    const ts = numero(venda?.data) || numero(venda?.criadoEm);
    // A comissão é congelada na venda: mudar o percentual do vendedor hoje
    // não pode reescrever o que ele já ganhou no mês passado.
    const percentual =
      venda?.comissaoPercentual != null
        ? numero(venda.comissaoPercentual)
        : numero(percentualDoVendedor.get(venda?.vendedorId));
    const comissao = dinheiro((valor * percentual) / 100);

    faturamentoTotal += valor;
    comissaoTotal += comissao;
    if (ts >= inicio30d) faturamentoMes += valor;
    if (ts && diaLocal(ts, fuso) === hoje) faturamentoHoje += valor;

    if (ts) {
      const linha = porDia.get(diaLocal(ts, fuso));
      if (linha) {
        linha.vendas += 1;
        linha.faturamento = dinheiro(linha.faturamento + valor);
      }
    }

    const atual = vendasPorVendedor.get(venda?.vendedorId) || {
      quantidade: 0,
      faturamento: 0,
      comissao: 0,
      faturamentoMes: 0,
    };
    atual.quantidade += 1;
    atual.faturamento = dinheiro(atual.faturamento + valor);
    atual.comissao = dinheiro(atual.comissao + comissao);
    if (ts >= inicio30d) atual.faturamentoMes = dinheiro(atual.faturamentoMes + valor);
    vendasPorVendedor.set(venda?.vendedorId, atual);
  }

  // ---------- por vendedor ----------
  const mensagensEnviadasPorVendedor = new Map();
  for (const m of mensagens) {
    if (m?.direction !== "out") continue;
    const dono = m?.vendedorId || atribuicoes[m?.chatId];
    if (!dono) continue;
    const atual = mensagensEnviadasPorVendedor.get(dono) || { total: 0, hoje: 0, semana: 0 };
    atual.total += 1;
    const ts = numero(m?.timestamp);
    if (ts && diaLocal(ts, fuso) === hoje) atual.hoje += 1;
    if (ts >= inicio7d) atual.semana += 1;
    mensagensEnviadasPorVendedor.set(dono, atual);
  }

  const conversasPorVendedor = new Map();
  for (const [chatId, vendedorId] of Object.entries(atribuicoes)) {
    const atual = conversasPorVendedor.get(vendedorId) || { total: 0, ativas7d: 0, semResposta: 0 };
    atual.total += 1;
    const ultima = ultimaMensagemPorChat.get(chatId);
    if (ultima >= inicio7d) atual.ativas7d += 1;
    if (ultimaDirecaoPorChat.get(chatId)?.entrada) atual.semResposta += 1;
    conversasPorVendedor.set(vendedorId, atual);
  }

  const porVendedor = vendedores.map((v) => {
    const msgs = mensagensEnviadasPorVendedor.get(v.id) || { total: 0, hoje: 0, semana: 0 };
    const convs = conversasPorVendedor.get(v.id) || { total: 0, ativas7d: 0, semResposta: 0 };
    const vnd = vendasPorVendedor.get(v.id) || {
      quantidade: 0,
      faturamento: 0,
      comissao: 0,
      faturamentoMes: 0,
    };
    const meta = dinheiro(v?.meta);

    return {
      id: v.id,
      nome: v.nome,
      slug: v.slug || v.id,
      cargo: v.cargo || "",
      ativo: v.ativo !== false,
      protegido: Boolean(v.protegido),
      comissaoPercentual: numero(v.comissaoPercentual),
      meta,
      conversas: convs.total,
      conversasAtivas7d: convs.ativas7d,
      conversasSemResposta: convs.semResposta,
      mensagensEnviadas: msgs.total,
      mensagensHoje: msgs.hoje,
      mensagensSemana: msgs.semana,
      vendas: vnd.quantidade,
      faturamento: dinheiro(vnd.faturamento),
      faturamentoMes: dinheiro(vnd.faturamentoMes),
      comissao: dinheiro(vnd.comissao),
      ticketMedio: vnd.quantidade ? dinheiro(vnd.faturamento / vnd.quantidade) : 0,
      // Sem meta definida o progresso é null, não 0% nem 100%: "não medido" e
      // "não atingido" são coisas diferentes.
      progressoMeta: meta > 0 ? Math.round((vnd.faturamentoMes / meta) * 100) : null,
    };
  });

  porVendedor.sort((a, b) => b.faturamento - a.faturamento || b.mensagensEnviadas - a.mensagensEnviadas);

  // ---------- funil ----------
  // Um cliente pode estar em etapas diferentes para vendedores diferentes (o
  // kanban é pessoal). Aqui conta-se cada par vendedor+cliente.
  const funilContagem = new Map();
  for (const [vendedorId, cartoes] of Object.entries(kanban)) {
    for (const [, colunaId] of Object.entries(cartoes || {})) {
      if (!colunaId || colunaId === "fora") continue;
      const { nome, cor } = nomeDaColuna(colunaId, preferencias[vendedorId], preferencias);
      const chave = colunaId;
      const atual = funilContagem.get(chave) || { id: colunaId, nome, cor, total: 0 };
      atual.total += 1;
      funilContagem.set(chave, atual);
    }
  }
  const ordemPadrao = COLUNAS_PADRAO.map((c) => c.id);
  const funil = Array.from(funilContagem.values()).sort((a, b) => {
    const ia = ordemPadrao.indexOf(a.id);
    const ib = ordemPadrao.indexOf(b.id);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return b.total - a.total;
  });

  return {
    geradoEm: agora,
    fuso,
    clientes: {
      total: chats.length,
      novosHoje,
      novos7d,
      ativos24h,
      ativos7d,
      semResposta,
      semRespostaAtribuidas,
      semDono: chats.length - Object.keys(atribuicoes).length,
      naoLidas,
    },
    mensagens: {
      total: mensagens.length,
      recebidas,
      enviadas,
      recebidasHoje,
      enviadasHoje,
      // Quantas respostas saem para cada mensagem que entra. Abaixo de 1 quer
      // dizer que está entrando mais do que sai.
      respostaPorMensagem: recebidas ? Math.round((enviadas / recebidas) * 100) / 100 : 0,
    },
    vendas: {
      quantidade: vendas.length,
      faturamento: dinheiro(faturamentoTotal),
      faturamentoMes: dinheiro(faturamentoMes),
      faturamentoHoje: dinheiro(faturamentoHoje),
      comissaoTotal: dinheiro(comissaoTotal),
      ticketMedio: vendas.length ? dinheiro(faturamentoTotal / vendas.length) : 0,
    },
    serie: grade.map((dia) => porDia.get(dia)),
    porHora,
    vendedores: porVendedor,
    funil,
  };
}

module.exports = { calcularMetricas, COLUNAS_PADRAO, diaLocal };
