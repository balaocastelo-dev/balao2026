// Mensagem do painel <-> linha de crm_mensagem.
//
// O painel recebe as mensagens num formato só (o de evo/normalizar.js), venha
// ela do webhook, da varredura ou — agora — do banco da loja. Se o formato do
// banco divergisse, a conversa aberta pelo histórico teria cara diferente da
// conversa ao vivo. Estas duas funções são a fronteira: o que entra no banco
// sai igual.

const N = require("../evo/normalizar");

/** Mensagem do painel -> argumentos de crmServico.registrarMensagem. */
function paraOBanco(msg) {
  if (!msg?.id || !msg?.chatId) return null;
  const midia = {};
  if (msg.segundos) midia.segundos = msg.segundos;
  if (msg.videoRecado) midia.videoRecado = true;
  if (msg.produto) midia.produto = msg.produto;
  if (msg.ligacao) midia.ligacao = msg.ligacao;
  return {
    id: msg.id,
    chatId: msg.chatId,
    direcao: msg.direction === "out" ? "out" : "in",
    corpo: msg.body || "",
    tipoMidia: msg.mediaType || (msg.ligacao ? "ligacao" : null),
    mime: msg.mimetype || null,
    nomeMidia: msg.mediaName || null,
    transcricao: msg.transcricao || null,
    produtoId: msg.produto?.id || null,
    produtoNome: msg.produto?.nome || msg.produto?.name || null,
    produtoCategoria: msg.produto?.categoria || msg.produto?.category || null,
    situacao: msg.status || null,
    numero: msg.realNumber || null,
    contato: msg.contactName || null,
    timestamp: msg.timestamp || Date.now(),
    chave: msg.chave || null,
    deMim: msg.direction === "out",
    midia: Object.keys(midia).length ? midia : null,
    citada: msg.citada || null,
    lid: msg.lid || null,
  };
}

/**
 * Linha de crm_mensagem -> mensagem do painel, no MESMO formato que o
 * webhook entrega. `numeroDaLoja` preenche from/to; `nomeDe(chatId)` o nome
 * do cliente (o banco guarda por conversa, não por mensagem).
 */
function paraOPainel(linha, { numeroDaLoja = null, nomeDe = () => null } = {}) {
  if (!linha?.id) return null;
  const chatId = String(linha.chat_id);
  const fora = linha.direcao === "out";
  const numero = chatId.endsWith("@c.us") ? N.digitos(chatId) : null;
  const midia = linha.midia || {};
  const tipo = linha.tipo_midia && linha.tipo_midia !== "ligacao" ? linha.tipo_midia : null;
  const em = linha.em instanceof Date ? linha.em.getTime() : Date.parse(linha.em);
  const msg = {
    id: String(linha.id),
    chatId,
    lid: linha.lid || null,
    from: fora ? numeroDaLoja || "me" : chatId,
    to: fora ? chatId : numeroDaLoja || null,
    body: linha.corpo || "",
    direction: fora ? "out" : "in",
    timestamp: em,
    contactName: fora ? null : nomeDe(chatId) || null,
    realNumber: numero,
    displayNumber: numero,
    hasMedia: Boolean(tipo),
    mediaType: tipo,
    mimetype: linha.mime || null,
    mediaName: linha.nome_midia || null,
    segundos: midia.segundos || null,
    mediaUrl: tipo ? `/midia/${encodeURIComponent(String(linha.id))}` : null,
    status: linha.situacao || (fora ? "sent" : "read"),
    chave: linha.chave || null,
    citada: linha.citada || null,
    reacoes: Array.isArray(linha.reacoes) && linha.reacoes.length ? linha.reacoes : undefined,
    editadaEm: linha.editada_em ? new Date(linha.editada_em).getTime() : undefined,
    apagada: linha.apagada || undefined,
    transcricao: linha.transcricao || null,
    seq: linha.seq != null ? Number(linha.seq) : undefined,
  };
  if (midia.videoRecado) msg.videoRecado = true;
  if (midia.produto) msg.produto = midia.produto;
  if (midia.ligacao) msg.ligacao = midia.ligacao;
  return msg;
}

module.exports = { paraOBanco, paraOPainel };
