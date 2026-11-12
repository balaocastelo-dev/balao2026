// Tradução entre o formato da Evolution (Baileys) e o formato que o painel do
// site já entende. Tudo aqui é função pura — sem rede, sem disco — para dar
// para testar com mensagens de verdade copiadas dos logs.

const TIPOS_DE_MIDIA = {
  imageMessage: "image",
  videoMessage: "video",
  ptvMessage: "video",
  audioMessage: "audio",
  documentMessage: "document",
  stickerMessage: "sticker",
};

// Tipos que não viram balão de conversa. Reação, edição e "apagar para todos"
// estão aqui porque não são mensagem nova — mas NÃO são jogados fora: quem os
// lê é extrairEvento(), que diz qual mensagem mudou e como.
const TIPOS_IGNORADOS = new Set([
  "protocolMessage",
  "senderKeyDistributionMessage",
  "messageContextInfo",
  "reactionMessage",
  "pollUpdateMessage",
  "editedMessage",
  "keepInChatMessage",
  "unknown",
]);

const STATUS = {
  ERROR: "failed",
  PENDING: "pending",
  SERVER_ACK: "sent",
  DELIVERY_ACK: "delivered",
  READ: "read",
  PLAYED: "read",
  DELETED: "deleted",
};

function digitos(valor) {
  return String(valor || "").split("@")[0].split(":")[0].replace(/\D/g, "");
}

function ehLid(jid) {
  return String(jid || "").endsWith("@lid");
}

function ehConversaDireta(jid) {
  const s = String(jid || "");
  if (!s || s.includes("broadcast") || s.endsWith("@g.us") || s.endsWith("@newsletter")) return false;
  return s.endsWith("@s.whatsapp.net") || s.endsWith("@c.us") || s.endsWith("@lid") || /^\d{8,15}$/.test(s);
}

/**
 * Id da conversa no painel. Número de telefone vira `55...@c.us` — o mesmo
 * formato de antes, para o funil e as atribuições salvas continuarem valendo.
 * Conversa que o WhatsApp só identifica por @lid (sem o número) fica como
 * `...@lid` até o número aparecer.
 */
function paraChatId(jid, lidParaNumero) {
  const s = String(jid || "");
  if (ehLid(s)) {
    const numero = lidParaNumero?.(s);
    return numero ? `${digitos(numero)}@c.us` : s;
  }
  const d = digitos(s);
  return d ? `${d}@c.us` : null;
}

function jidQueAEvolutionPreserva(s) {
  return ehLid(s) || s.endsWith("@g.us") || s.endsWith("@newsletter") || s.endsWith("@broadcast");
}

/**
 * O que a Evolution aceita no campo `number`.
 *
 * Número puro e `@c.us` NÃO podem ir só com os dígitos. O `createJid` da
 * Evolution 2.3.7 chama `formatBRNumber`, que tira o nono dígito de celular
 * com DDD 31 ou maior: `5531999828420` vira `553199828420`. O número mutilado
 * não existe no WhatsApp e o sendText/sendMedia responde 400. JID completo
 * (`…@s.whatsapp.net`) o `createJid` devolve como está, sem esse corte.
 * `@lid` e `@g.us` também já passam direto.
 */
function paraDestino(chatIdOuNumero) {
  const s = String(chatIdOuNumero || "").trim();
  if (!s) return "";
  if (jidQueAEvolutionPreserva(s)) return s;
  const d = digitos(s);
  if (!d) return "";
  return `${d}@s.whatsapp.net`;
}

function textoCurto(valor, limite = 380) {
  if (valor == null || valor === "") return "";
  let s;
  if (typeof valor === "string") s = valor;
  else {
    try {
      s = JSON.stringify(valor);
    } catch {
      s = String(valor);
    }
  }
  s = s.replace(/\s+/g, " ").trim();
  if (!s || s === "{}" || s === "[]" || s === "null") return "";
  return s.length > limite ? `${s.slice(0, limite - 1)}…` : s;
}

function codigoNumerico(valor) {
  const s = String(valor ?? "").trim();
  return /^\d{3,4}$/.test(s) ? s : "";
}

/**
 * Frase curta para o balão "Falhou": "código 463", "código 400 — {corpo}",
 * ou "ERROR" quando o recibo não trouxe o número.
 */
function motivoDaFalha(info) {
  if (info == null || info === "") return "";
  if (typeof info !== "object") {
    const c = codigoNumerico(info);
    return c ? `código ${c}` : textoCurto(info);
  }
  const recibos = [];
  const olhar = (v) => {
    if (Array.isArray(v)) {
      v.forEach(olhar);
      return;
    }
    const c = codigoNumerico(v);
    if (c && !recibos.includes(c)) recibos.push(c);
  };
  olhar(info.error);
  olhar(info.errorCode);
  olhar(info.code);
  olhar(info.messageStubParameters);
  olhar(info.update?.messageStubParameters);
  olhar(info.message?.messageStubParameters);
  olhar(info.attrs?.error);

  const http = Number(info.status);
  const httpOk = Number.isInteger(http) && http >= 400 && http < 600;
  const recibo = recibos.find((c) => c !== String(http)) || "";
  const resposta = info.resposta?.response?.message ?? info.resposta?.message ?? info.resposta;
  let corpo = textoCurto(info.message) || textoCurto(resposta);
  if (corpo === recibo || corpo === `código ${recibo}` || (httpOk && corpo === String(http))) corpo = "";

  const partes = [];
  if (recibo) partes.push(`código ${recibo}`);
  else if (httpOk) partes.push(`código ${http}`);
  else if (String(info.status || "").toUpperCase() === "ERROR") partes.push("ERROR");
  if (corpo) partes.push(corpo);
  return partes.join(" — ").slice(0, 500);
}

/** 400 da Evolution ou recibo ERROR. A segunda falha da mesma tentativa não entra. */
function falhaQueRetenta(erro) {
  if (!erro || typeof erro !== "object" || erro.retentou) return false;
  if (Number(erro.status) === 400) return true;
  return String(erro.status || "").trim().toUpperCase() === "ERROR";
}

/**
 * Uma chamada e, se vier 400 ou ERROR, mais uma com o mesmo JID completo.
 * A segunda falha é relançada com `retentou` — quem chamou não tenta de novo.
 */
async function enviarComRetentativa(destino, enviar) {
  const jid = paraDestino(destino);
  if (!jid) throw new Error("Número de destino inválido.");
  try {
    return await enviar(jid);
  } catch (erro) {
    if (!falhaQueRetenta(erro)) throw erro;
    try {
      return await enviar(jid);
    } catch (segunda) {
      if (segunda && typeof segunda === "object") segunda.retentou = true;
      throw segunda;
    }
  }
}

/**
 * Recibo ERROR de uma mensagem que este processo acabou de enviar: vale uma
 * nova tentativa com o JID completo. Foto de catálogo não reenvia o texto da
 * oferta (são mensagens diferentes; a foto falhar não falha o texto). Sem
 * corpo, sem segunda mensagem, e nunca uma terceira.
 */
function deveRetentarEntrega({
  id,
  status,
  deSaida = true,
  retentativa = false,
  jaRetentou = false,
  fotoDeOferta = false,
  enviadaNestaSessao = true,
  corpo = "",
} = {}) {
  if (!id || !deSaida || !enviadaNestaSessao) return false;
  if (retentativa || jaRetentou || fotoDeOferta) return false;
  const s = String(status || "").toLowerCase();
  if (s !== "error" && s !== "failed") return false;
  return Boolean(String(corpo || "").trim());
}

/** Escolhe entre remoteJid e remoteJidAlt o que tem o número de telefone. */
function jidDaChave(chave) {
  const principal = chave?.remoteJid || "";
  const alternativo = chave?.remoteJidAlt || "";
  if (ehLid(principal) && alternativo && !ehLid(alternativo)) return { jid: alternativo, lid: principal };
  if (ehLid(alternativo) && principal && !ehLid(principal)) return { jid: principal, lid: alternativo };
  return { jid: principal, lid: ehLid(principal) ? principal : null };
}

function desembrulhar(message) {
  let m = message || {};
  for (let i = 0; i < 4; i++) {
    const interno =
      m.ephemeralMessage?.message ||
      m.viewOnceMessage?.message ||
      m.viewOnceMessageV2?.message ||
      m.viewOnceMessageV2Extension?.message ||
      m.documentWithCaptionMessage?.message;
    if (!interno) break;
    m = { ...m, ...interno };
    delete m.ephemeralMessage;
    delete m.viewOnceMessage;
    delete m.viewOnceMessageV2;
    delete m.viewOnceMessageV2Extension;
    delete m.documentWithCaptionMessage;
  }
  return m;
}

function tipoPrincipal(message, messageType) {
  if (messageType && message?.[messageType]) return messageType;
  const chaves = Object.keys(message || {}).filter((k) => k !== "messageContextInfo" && !k.startsWith("base64"));
  return chaves.find((k) => k.endsWith("Message") || k === "conversation") || messageType || "unknown";
}

/** Texto, tipo e dados da mídia de uma mensagem crua. */
function extrairConteudo(record) {
  const message = desembrulhar(record?.message);
  const tipo = tipoPrincipal(message, record?.messageType);
  const conteudo = message?.[tipo] || {};

  const mediaType = TIPOS_DE_MIDIA[tipo] || null;
  const ptt = tipo === "audioMessage" && Boolean(conteudo.ptt);

  let body = "";
  if (tipo === "conversation") body = typeof message.conversation === "string" ? message.conversation : "";
  else if (tipo === "extendedTextMessage") body = conteudo.text || "";
  else if (mediaType) body = conteudo.caption || "";
  else if (tipo === "locationMessage" || tipo === "liveLocationMessage") {
    const nome = [conteudo.name, conteudo.address].filter(Boolean).join(" — ");
    body = `📍 ${nome || "Localização"} https://maps.google.com/?q=${conteudo.degreesLatitude},${conteudo.degreesLongitude}`;
  } else if (tipo === "contactMessage") body = `👤 ${conteudo.displayName || "Contato"}`;
  else if (tipo === "contactsArrayMessage") body = `👤 ${(conteudo.contacts || []).length} contatos`;
  else if (tipo === "pollCreationMessage" || tipo === "pollCreationMessageV3" || tipo === "pollCreationMessageV2") {
    const opcoes = (conteudo.options || []).map((o) => o.optionName).filter(Boolean);
    body = `📊 ${conteudo.name || "Enquete"}${opcoes.length ? `\n• ${opcoes.join("\n• ")}` : ""}`;
  } else if (tipo === "buttonsResponseMessage") body = conteudo.selectedDisplayText || "";
  else if (tipo === "listResponseMessage") body = conteudo.title || "";
  else if (tipo === "templateButtonReplyMessage") body = conteudo.selectedDisplayText || "";

  return {
    tipo,
    body: String(body || ""),
    mediaType: mediaType === "audio" && ptt ? "ptt" : mediaType,
    mimetype: conteudo.mimetype || null,
    mediaName: tipo === "documentMessage" ? conteudo.fileName || conteudo.title || null : null,
    segundos: conteudo.seconds || null,
    // Vídeo-recado (a bolinha de vídeo): é vídeo para tocar, mas é FALA para
    // ler — entra na fila de transcrição junto com o áudio.
    videoRecado: tipo === "ptvMessage",
    ignorar: TIPOS_IGNORADOS.has(tipo),
    contextInfo: conteudo.contextInfo || null,
  };
}

/** Texto que uma mensagem crua mostra (texto, legenda, ou o rótulo da mídia). */
function textoDe(message) {
  const m = desembrulhar(message || {});
  if (typeof m.conversation === "string" && m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  for (const tipo of ["imageMessage", "videoMessage", "documentMessage", "ptvMessage"]) {
    if (m[tipo]?.caption) return m[tipo].caption;
  }
  const rotulos = {
    imageMessage: "📷 Foto",
    videoMessage: "🎥 Vídeo",
    ptvMessage: "🎥 Vídeo-recado",
    audioMessage: "🎤 Áudio",
    documentMessage: "📄 Documento",
    stickerMessage: "Figurinha",
    locationMessage: "📍 Localização",
    contactMessage: "👤 Contato",
  };
  for (const [tipo, rotulo] of Object.entries(rotulos)) if (m[tipo]) return rotulo;
  return "";
}

/**
 * A mensagem citada ("respondendo a…"). A Evolution tira o contextInfo de
 * dentro do conteúdo e o põe no registro (prepareMessage); por isso procura
 * nos dois lugares. Só o id e um trecho — o painel não precisa de mais.
 */
function extrairCitada(record, conteudo, numeroDaLoja) {
  const ctx = record?.contextInfo || conteudo?.contextInfo || null;
  if (!ctx?.quotedMessage || !ctx.stanzaId) return null;
  const autor = String(ctx.participant || "");
  return {
    id: String(ctx.stanzaId),
    trecho: textoDe(ctx.quotedMessage).slice(0, 200),
    deMim: autor && numeroDaLoja ? digitos(autor) === digitos(numeroDaLoja) : null,
  };
}

// Tipo do protocolMessage: o Baileys manda número; JSON às vezes vem com o nome.
const PROTOCOLO_APAGAR = new Set([0, "0", "REVOKE"]);
const PROTOCOLO_EDITAR = new Set([14, "14", "MESSAGE_EDIT"]);

/**
 * protocolMessage (o que a Evolution manda no webhook MESSAGES_EDITED, e o
 * que vem dentro de uma mensagem de controle) -> evento. Para editar e
 * apagar, o id que importa é o da mensagem ALVO (proto.key.id): o remoteJid
 * de dentro vem do ponto de vista de quem mandou e não serve para achar a
 * conversa — quem acha é o id.
 */
function eventoDoProtocolo(proto, emPadrao) {
  if (!proto?.key?.id) return null;
  const alvoId = String(proto.key.id);
  if (PROTOCOLO_APAGAR.has(proto.type)) return { tipo: "apagada", alvoId, em: emPadrao || Date.now() };
  if (PROTOCOLO_EDITAR.has(proto.type) || proto.editedMessage) {
    const em = proto.timestampMs ? timestampMs(proto.timestampMs) : emPadrao || Date.now();
    return { tipo: "edicao", alvoId, texto: textoDe(proto.editedMessage), em };
  }
  return null;
}

/**
 * Mensagem que não é conversa mas MUDA outra: reação, edição, apagar para
 * todos. Antes tudo isso caía em TIPOS_IGNORADOS e sumia — o cliente apagava
 * a mensagem e o painel continuava mostrando; reagia e ninguém via.
 * Devolve { tipo: "reacao"|"edicao"|"apagada", alvoId, ... } ou null.
 */
function extrairEvento(record) {
  if (!record?.key) return null;
  const message = desembrulhar(record.message);
  const em = timestampMs(record.messageTimestamp);
  if (message.reactionMessage?.key?.id) {
    const r = message.reactionMessage;
    return {
      tipo: "reacao",
      alvoId: String(r.key.id),
      // Texto vazio = a reação foi retirada.
      emoji: String(r.text || ""),
      deMim: Boolean(record.key.fromMe),
      em: r.senderTimestampMs ? timestampMs(r.senderTimestampMs) : em,
    };
  }
  const proto = message.protocolMessage || message.editedMessage?.message?.protocolMessage;
  if (proto) return eventoDoProtocolo(proto, em);
  return null;
}

function statusDoPainel(status, fromMe) {
  if (!status) return fromMe ? "sent" : "read";
  return STATUS[String(status).toUpperCase()] || (fromMe ? "sent" : "read");
}

function timestampMs(valor) {
  // Long do protobuf serializado em JSON: {low, high}. O `low` sozinho só
  // serve para segundos; milissegundos (timestampMs, senderTimestampMs)
  // passam de 32 bits e precisam do `high`.
  if (valor && typeof valor === "object" && "low" in valor) {
    valor = (Number(valor.high) >>> 0) * 4294967296 + (Number(valor.low) >>> 0);
  }
  const n = Number(valor ?? 0);
  if (!n) return Date.now();
  return n < 10_000_000_000 ? n * 1000 : n;
}

/**
 * Mensagem da Evolution -> mensagem do painel. Devolve null para o que não é
 * conversa (grupo, status, mensagem de controle).
 */
function normalizarMensagem(record, { lidParaNumero, numeroDaLoja } = {}) {
  if (!record?.key) return null;
  const { jid, lid } = jidDaChave(record.key);
  if (!ehConversaDireta(jid)) return null;

  const conteudo = extrairConteudo(record);
  if (conteudo.ignorar) return null;

  const chatId = paraChatId(jid, lidParaNumero);
  if (!chatId) return null;

  const fromMe = Boolean(record.key.fromMe);
  const numero = chatId.endsWith("@c.us") ? digitos(chatId) : null;
  const statusCru = record.status || record.MessageUpdate?.[record.MessageUpdate.length - 1]?.status || null;
  const status = statusDoPainel(statusCru, fromMe);
  const motivoFalha =
    status === "failed"
      ? motivoDaFalha({
          status: statusCru,
          messageStubParameters: record.messageStubParameters,
          error: record.error,
        }) || undefined
      : undefined;

  return {
    id: String(record.key.id),
    chatId,
    lid: lid || null,
    from: fromMe ? numeroDaLoja || "me" : chatId,
    to: fromMe ? chatId : numeroDaLoja || null,
    body: conteudo.body,
    direction: fromMe ? "out" : "in",
    timestamp: timestampMs(record.messageTimestamp),
    contactName: fromMe ? null : record.pushName || null,
    realNumber: numero,
    displayNumber: numero,
    hasMedia: Boolean(conteudo.mediaType),
    mediaType: conteudo.mediaType,
    mimetype: conteudo.mimetype,
    mediaName: conteudo.mediaName,
    segundos: conteudo.segundos,
    // A mídia é servida sob demanda por este servidor (ele baixa da Evolution
    // na primeira vez e guarda em disco). O painel só precisa do caminho.
    mediaUrl: conteudo.mediaType ? `/midia/${encodeURIComponent(String(record.key.id))}` : null,
    videoRecado: conteudo.videoRecado || undefined,
    status,
    motivoFalha,
    chave: { id: String(record.key.id), remoteJid: record.key.remoteJid, fromMe },
    citada: extrairCitada(record, conteudo, numeroDaLoja),
  };
}

function descreverResumo(msg) {
  if (!msg) return "";
  if (msg.ligacao) return msg.ligacao.video ? "📹 Ligação de vídeo" : "📞 Ligação";
  if (msg.body) return msg.body.slice(0, 120);
  const rotulos = {
    image: "📷 Foto",
    video: "🎥 Vídeo",
    audio: "🎵 Áudio",
    ptt: "🎤 Mensagem de voz",
    document: "📄 Documento",
    sticker: "Figurinha",
  };
  return rotulos[msg.mediaType] || "";
}

/** Conversa do findChats -> resumo de conversa do painel. */
function normalizarConversa(item, { lidParaNumero, numeroDaLoja, fotoLocal } = {}) {
  const ultima = item?.lastMessage
    ? normalizarMensagem(item.lastMessage, { lidParaNumero, numeroDaLoja })
    : null;

  let jid = item?.remoteJid;
  if (ehLid(jid) && item?.lastMessage?.key) {
    const par = jidDaChave(item.lastMessage.key);
    if (!ehLid(par.jid)) jid = par.jid;
  }
  if (!ehConversaDireta(jid)) return null;

  const chatId = paraChatId(jid, lidParaNumero);
  if (!chatId) return null;
  if (numeroDaLoja && digitos(chatId) === digitos(numeroDaLoja)) return null;

  const numero = chatId.endsWith("@c.us") ? digitos(chatId) : null;
  const nome = String(item.pushName || "").trim();
  const nomeValido = nome && nome !== "Você" && !/^\d+$/.test(nome) ? nome : null;

  return {
    chatId,
    lid: ehLid(item.remoteJid) ? item.remoteJid : null,
    contactName: nomeValido || (numero ? formatarNumero(numero) : "Contato"),
    realNumber: numero,
    displayNumber: numero,
    profilePicUrl: fotoLocal?.(chatId) || item.profilePicUrl || null,
    // Link original do WhatsApp: o painel usa como reserva se a foto guardada
    // não carregar. Expira em alguns dias, por isso não é a primeira opção.
    profilePicOriginal: item.profilePicUrl || null,
    unreadCount: Number(item.unreadCount || 0),
    lastMessageBody: descreverResumo(ultima),
    lastMessageTimestamp: ultima?.timestamp || (item.updatedAt ? Date.parse(item.updatedAt) : Date.now()),
    isGroup: false,
    isArchived: false,
    isPinned: false,
    isMuted: false,
  };
}

function formatarNumero(numero) {
  const d = digitos(numero);
  const m = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : d;
}

/** Tira o "data:image/jpeg;base64," da frente, se tiver. */
function separarDataUrl(valor) {
  const s = String(valor || "");
  const m = s.match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.*)$/s);
  if (m) return { mimetype: m[1] || null, base64: m[2] };
  return { mimetype: null, base64: s };
}

function tipoPeloMime(mimetype, nome = "") {
  const m = String(mimetype || "").toLowerCase();
  if (m.startsWith("image/")) return m === "image/webp" && /sticker/i.test(nome) ? "sticker" : "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  return "document";
}

const EXTENSOES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/3gpp": "3gp",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "application/pdf": "pdf",
};

function extensaoDoMime(mimetype) {
  const base = String(mimetype || "").split(";")[0].trim().toLowerCase();
  return EXTENSOES[base] || (base.split("/")[1] || "bin").replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
}

module.exports = {
  digitos,
  ehLid,
  ehConversaDireta,
  paraChatId,
  paraDestino,
  motivoDaFalha,
  falhaQueRetenta,
  enviarComRetentativa,
  deveRetentarEntrega,
  jidDaChave,
  extrairConteudo,
  normalizarMensagem,
  normalizarConversa,
  extrairEvento,
  eventoDoProtocolo,
  textoDe,
  descreverResumo,
  formatarNumero,
  separarDataUrl,
  tipoPeloMime,
  extensaoDoMime,
  statusDoPainel,
  timestampMs,
};
