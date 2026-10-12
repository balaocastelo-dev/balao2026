// Regras do agente JUL.IA que não dependem de banco nem de WhatsApp.
//
// O agente "pensa" no computador do Thiago (Ollama, Whisper, modelo de visão)
// e a VPS só decide QUANDO ele pode falar e o que fazer com o que ele devolve.
// Tudo o que é decisão está aqui, em funções puras, para dar para testar sem
// subir nada.

const ID_DO_AGENTE = "julia-ia";
const NOME_DO_AGENTE = "JUL.IA";

// "Público": no modo teste o agente só fala com os números do Thiago. É o
// padrão, para ninguém ligar o automático e ver cliente de verdade recebendo
// resposta de robô antes de conferir como ela conversa.
const NUMEROS_DE_TESTE = ["5519984515960", "5519987510267"];

const MODOS = ["desligado", "copiloto", "automatico"];
const PUBLICOS = ["teste", "clientes"];

const PADRAO = Object.freeze({
  modo: "desligado",
  publico: "teste",
  // Decisão do Thiago (11/10/2026): o pedido entra sozinho no Bling, em aberto,
  // e ele e o vendedor são avisados.
  vendaAutomatica: true,
  ligadoEm: null,
});

// Espera depois da última mensagem do cliente antes de responder: cliente de
// WhatsApp manda três mensagens seguidas ("oi" / "tudo bem?" / "queria ver
// notebook"). Responder a primeira e ignorar as outras é o pior dos mundos.
// (AGENTE_ESPERA_MS só para a bancada: a regra da loja é 8 s.)
const ESPERA_MS = Number(process.env.AGENTE_ESPERA_MS) || 8_000;
// Mensagem mais velha que isto não é respondida pelo robô: ligar o agente
// não pode sair respondendo conversa de ontem.
const JANELA_MS = 45 * 60_000;
// Quanto tempo o PC tem para devolver um trabalho antes de ele voltar à fila.
const PRAZO_DO_TRABALHO_MS = 4 * 60_000;
// Vendedor respondeu pelo celular ou pelo painel: o robô sai da conversa por
// este tempo (contado da última mensagem do vendedor).
const PAUSA_HUMANO_MS = 24 * 3_600_000;
// O agente pediu ajuda: a conversa fica com os humanos por este tempo.
const PAUSA_TRANSFERENCIA_MS = 24 * 3_600_000;
// Sem batida do PC há mais que isto = trabalhador fora do ar.
const BATIDA_VALE_MS = 45_000;

const MAX_RESPOSTAS = 6;
const MAX_TEXTO = 1500;

const SAIR = /^(SAIR|PARAR|CANCELAR|DESCADASTRAR|STOP)$/i;

/** Só conversa de uma pessoa: nunca grupo, status, canal ou lista. */
function ehConversaIndividual(chatId) {
  const c = String(chatId || "");
  return /@(c\.us|s\.whatsapp\.net|lid)$/.test(c) && !c.startsWith("status@");
}

function digitos(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizarConfig(valor = {}) {
  const v = valor && typeof valor === "object" ? valor : {};
  return {
    modo: MODOS.includes(v.modo) ? v.modo : PADRAO.modo,
    publico: PUBLICOS.includes(v.publico) ? v.publico : PADRAO.publico,
    vendaAutomatica: typeof v.vendaAutomatica === "boolean" ? v.vendaAutomatica : PADRAO.vendaAutomatica,
    ligadoEm: typeof v.ligadoEm === "number" ? v.ligadoEm : null,
  };
}

/**
 * Pode o agente responder esta conversa agora?
 *
 * Devolve { pode: true } ou { pode: false, motivo } — o motivo aparece no
 * painel ("por que a JUL.IA não respondeu?").
 */
function podeResponder({
  config,
  chatId,
  numero,
  vendedorId,
  barrado,
  situacao,
  ultima,
  respondidoAte = 0,
  respondidoId = null,
  agora,
  arrendado = false,
}) {
  if (!config || config.modo === "desligado") return { pode: false, motivo: "agente desligado" };
  if (!ehConversaIndividual(chatId)) return { pode: false, motivo: "não é conversa individual" };
  if (config.publico === "teste" && !NUMEROS_DE_TESTE.includes(digitos(numero))) {
    return { pode: false, motivo: "modo teste: só os números do Thiago" };
  }
  if (barrado) return { pode: false, motivo: barrado };
  if (vendedorId && vendedorId !== ID_DO_AGENTE) return { pode: false, motivo: "conversa com vendedor" };
  if (situacao?.situacao && situacao.situacao !== "ativo" && (situacao.ate || 0) > agora) {
    return { pode: false, motivo: situacao.situacao === "transferida" ? "pediu um vendedor" : "vendedor respondeu" };
  }
  if ((situacao?.esperarAte || 0) > agora) return { pode: false, motivo: "o envio falhou; tenta de novo em instantes", espera: true };
  if (!ultima) return { pode: false, motivo: "sem mensagem" };
  if (ultima.direction !== "in") return { pode: false, motivo: "a última mensagem é da loja" };
  // Hora em segundos: no mesmo segundo da última respondida só vale se for outra mensagem.
  if (ultima.timestamp < respondidoAte || (ultima.timestamp === respondidoAte && ultima.id === respondidoId)) {
    return { pode: false, motivo: "já respondida" };
  }
  if (agora - ultima.timestamp > JANELA_MS) return { pode: false, motivo: "mensagem antiga" };
  if (config.ligadoEm && ultima.timestamp < config.ligadoEm - 2 * 60_000) {
    return { pode: false, motivo: "chegou antes de ligar o agente" };
  }
  if (SAIR.test(String(ultima.body || "").trim())) return { pode: false, motivo: "cliente pediu para sair" };
  if (agora - ultima.timestamp < ESPERA_MS) return { pode: false, motivo: "esperando o cliente terminar", espera: true };
  if (arrendado) return { pode: false, motivo: "o PC já está pensando nesta", espera: true };
  return { pode: true };
}

/** Texto comparável: sem espaço sobrando nem maiúscula. */
function chaveDeTexto(t) {
  return String(t || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 400);
}

const reais = (n) =>
  `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Confere e limpa o que o PC devolveu. Nada do que vem de lá é confiado às
 * cegas: o segredo prova quem mandou, não que o conteúdo é bom.
 */
function validarResultado(corpo) {
  const b = corpo && typeof corpo === "object" ? corpo : {};
  const erros = [];
  const id = String(b.id || "");
  const chatId = String(b.chatId || "");
  if (!id) erros.push("sem id do trabalho");
  if (!chatId) erros.push("sem chatId");

  const respostas = [];
  for (const r of Array.isArray(b.respostas) ? b.respostas.slice(0, 50) : []) {
    if (respostas.length >= MAX_RESPOSTAS) break;
    if (r?.tipo === "texto") {
      const texto = String(r.texto || "").trim().slice(0, MAX_TEXTO);
      if (texto) respostas.push({ tipo: "texto", texto });
    } else if (r?.tipo === "produto" && r.produtoId != null && String(r.produtoId).trim()) {
      respostas.push({ tipo: "produto", produtoId: String(r.produtoId).trim().slice(0, 80) });
    }
  }

  const transcricoes = (Array.isArray(b.transcricoes) ? b.transcricoes : [])
    .filter((t) => t && t.id && String(t.texto || "").trim())
    .slice(0, 20)
    .map((t) => ({ id: String(t.id), texto: String(t.texto).trim().slice(0, 4000) }));

  const acoes = (Array.isArray(b.acoes) ? b.acoes : [])
    .filter((a) => a && (a.tipo === "orcamento" || a.tipo === "venda"))
    .slice(0, 4)
    .map((a) => ({
      tipo: a.tipo,
      numero: a.numero != null ? String(a.numero).slice(0, 40) : null,
      blingId: a.blingId != null ? String(a.blingId).slice(0, 40) : null,
      total: Number(a.total) || 0,
      itens: (Array.isArray(a.itens) ? a.itens : []).slice(0, 20).map((i) => ({
        nome: String(i?.nome || "").slice(0, 160),
        quantidade: Number(i?.quantidade) || 0,
        valor: Number(i?.valor) || 0,
      })),
      erro: a.erro ? String(a.erro).slice(0, 300) : null,
    }));

  const objeto = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : null);
  const tamanhoOk = (v) => !v || JSON.stringify(v).length <= 20_000;
  const dados = objeto(b.dados);
  const memoria = objeto(b.memoria);
  if (!tamanhoOk(dados) || !tamanhoOk(memoria)) erros.push("dados ou memória grandes demais");

  const transferir = objeto(b.transferir) ? { motivo: String(b.transferir.motivo || "sem motivo").slice(0, 300) } : null;

  return {
    ok: erros.length === 0,
    erros,
    id,
    chatId,
    ultimaId: b.ultimaId ? String(b.ultimaId) : null,
    respostas,
    transcricoes,
    acoes,
    dados,
    memoria,
    transferir,
    erro: b.erro ? String(b.erro).slice(0, 500) : null,
    duracaoMs: Number(b.duracaoMs) || null,
    modelo: b.modelo ? String(b.modelo).slice(0, 80) : null,
  };
}

/** Nota que fica na ficha do cliente quando o agente mexe no Bling. */
function notaDaAcao(acao) {
  const tipo = acao.tipo === "venda" ? "Pedido de venda" : "Orçamento (proposta comercial)";
  if (acao.erro) return `⚠️ JUL.IA tentou emitir ${tipo.toLowerCase()} no Bling e não conseguiu: ${acao.erro}`;
  const linhas = acao.itens.map((i) => `• ${i.quantidade} × ${i.nome} — ${reais(i.valor)}`);
  return [
    `${acao.tipo === "venda" ? "🛒" : "🧾"} ${tipo} nº ${acao.numero || "?"} emitido pela JUL.IA no Bling${
      acao.tipo === "venda" ? " (em aberto)" : ""
    }`,
    ...linhas,
    `Total: ${reais(acao.total)}`,
  ].join("\n");
}

module.exports = {
  ID_DO_AGENTE,
  NOME_DO_AGENTE,
  NUMEROS_DE_TESTE,
  MODOS,
  PUBLICOS,
  PADRAO,
  ESPERA_MS,
  JANELA_MS,
  PRAZO_DO_TRABALHO_MS,
  PAUSA_HUMANO_MS,
  PAUSA_TRANSFERENCIA_MS,
  BATIDA_VALE_MS,
  SAIR,
  ehConversaIndividual,
  digitos,
  normalizarConfig,
  podeResponder,
  chaveDeTexto,
  validarResultado,
  notaDaAcao,
  reais,
};
