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

// Tipos que não são conversa: controle interno do WhatsApp.
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

/** O que a Evolution aceita no campo `number`. */
function paraDestino(chatIdOuNumero) {
  const s = String(chatIdOuNumero || "").trim();
  if (ehLid(s)) return s;
  return digitos(s);
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
    ignorar: TIPOS_IGNORADOS.has(tipo),
  };
}

function statusDoPainel(status, fromMe) {
  if (!status) return fromMe ? "sent" : "read";
  return STATUS[String(status).toUpperCase()] || (fromMe ? "sent" : "read");
}

function timestampMs(valor) {
  const n = Number(valor?.low ?? valor ?? 0);
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
    status: statusDoPainel(statusCru, fromMe),
    chave: { id: String(record.key.id), remoteJid: record.key.remoteJid, fromMe },
  };
}

function descreverResumo(msg) {
  if (!msg) return "";
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
  jidDaChave,
  extrairConteudo,
  normalizarMensagem,
  normalizarConversa,
  descreverResumo,
  formatarNumero,
  separarDataUrl,
  tipoPeloMime,
  extensaoDoMime,
  statusDoPainel,
  timestampMs,
};
