const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const qrcode = require("qrcode");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const server = http.createServer(app);
const port = Number(process.env.WHATSAPP_PANEL_PORT || 4100);
const allowedOrigin =
  process.env.WHATSAPP_PANEL_ALLOWED_ORIGIN || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});
const debugEnvPath = path.join(process.cwd(), ".dbg", "whatsapp-send-sync.env");
let DEBUG_SERVER_URL = "http://127.0.0.1:7777/event";
let DEBUG_SESSION_ID = "whatsapp-send-sync";
const DEBUG_RUN_ID = "post-fix";
try {
  const debugEnv = fs.readFileSync(debugEnvPath, "utf8");
  DEBUG_SERVER_URL =
    debugEnv.match(/DEBUG_SERVER_URL=(.+)/)?.[1]?.trim() || DEBUG_SERVER_URL;
  DEBUG_SESSION_ID =
    debugEnv.match(/DEBUG_SESSION_ID=(.+)/)?.[1]?.trim() || DEBUG_SESSION_ID;
} catch {}
function debugReport(hypothesisId, location, msg, data = {}) {
  fetch(DEBUG_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: DEBUG_RUN_ID,
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

const packageJson = readJsonSafe(path.join(__dirname, "package.json")) || {};
const packageLockJson = readJsonSafe(path.join(__dirname, "package-lock.json")) || {};
const resolvedWwebVersion =
  packageLockJson?.packages?.["node_modules/whatsapp-web.js"]?.version || null;
const apiInfo = {
  declaredVersion: packageJson?.dependencies?.["whatsapp-web.js"] || null,
  resolvedVersion: resolvedWwebVersion,
  supportedActions: [
    "enviar-mensagem",
    "enviar-midia",
    "publicar-status",
    "sincronizar-conversas",
    "sincronizar-etiquetas",
    "marcar-lida",
    "marcar-nao-lida",
    "arquivar",
    "desarquivar",
    "fixar",
    "desafixar",
    "silenciar",
    "remover-silencio",
    "digitando",
    "gravando",
    "limpar-estado",
    "sincronizar-historico",
    "limpar-mensagens",
    "excluir-chat",
    "nota-do-cliente",
    "bloquear-contato",
    "desbloquear-contato",
    "status-feed",
    "segmentacao-manual",
  ],
};

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "panel-data.json");
const store = {
  labels: [],
  signatures: [],
  quickReplies: [],
  schedules: [],
  chatLabels: {},
  messages: [],
  chats: [],
  statusFeed: [],
  chatAssignments: {},
  notifications: [],
};

const scheduleTimers = new Map();
let chatRefreshTimer = null;
const whatsappState = {
  status: "initializing",
  qrCode: null,
  connected: false,
  session: false,
  phoneNumber: null,
};
let whatsappClient = null;
let isInitializingClient = false;
let initializingSince = null;
let lastProgressAt = Date.now();

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function createId() {
  return crypto.randomUUID();
}

function loadStore() {
  if (!fs.existsSync(dataFile)) return;

  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    store.labels = Array.isArray(parsed.labels) ? parsed.labels : [];
    store.signatures = Array.isArray(parsed.signatures) ? parsed.signatures : [];
    store.quickReplies = Array.isArray(parsed.quickReplies) ? parsed.quickReplies : [];
    store.schedules = Array.isArray(parsed.schedules) ? parsed.schedules : [];
    store.chatLabels =
      parsed.chatLabels && typeof parsed.chatLabels === "object" ? parsed.chatLabels : {};
    store.messages = Array.isArray(parsed.messages)
      ? parsed.messages.filter((item) => isRealDirectChatId(item.chatId)).slice(-400)
      : [];
    store.chats = Array.isArray(parsed.chats)
      ? parsed.chats.filter((item) => isRealDirectChatId(item.chatId || item.id))
      : [];
    store.statusFeed = Array.isArray(parsed.statusFeed) ? parsed.statusFeed : [];
    store.chatAssignments =
      parsed.chatAssignments && typeof parsed.chatAssignments === "object"
        ? parsed.chatAssignments
        : {};
    store.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
  } catch (error) {
    console.error("Falha ao ler dados do painel do WhatsApp:", error);
  }
}

function persistStore() {
  const payload = {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
    messages: store.messages.slice(-400),
    chats: store.chats,
    statusFeed: store.statusFeed,
    chatAssignments: store.chatAssignments,
    notifications: store.notifications,
  };

  fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2));
}

function emitState() {
  io.emit("whatsapp:state", whatsappState);
}

function emitApiInfo() {
  io.emit("whatsapp:api-info", apiInfo);
}

function emitSettings() {
  io.emit("whatsapp:settings", {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
    chatAssignments: store.chatAssignments,
    notifications: store.notifications,
    apiInfo,
  });
}

function emitMessages() {
  io.emit("whatsapp:messages", store.messages.slice(-300));
}

function emitChats() {
  io.emit("whatsapp:chats", store.chats);
}

function emitStatusFeed() {
  io.emit("whatsapp:status-feed", store.statusFeed);
}

function emitToast(message) {
  io.emit("whatsapp:toast", { message });
}

function emitDisparoStatus(ativo) {
  io.emit("whatsapp:disparo-status", { ativo });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rebuildNotifications() {
  store.notifications = store.chats
    .filter((chat) => chat.unreadCount > 0)
    .map((chat) => ({
      id: chat.chatId,
      chatId: chat.chatId,
      sellerId: store.chatAssignments[chat.chatId] || null,
      type: store.chatAssignments[chat.chatId] ? "seller" : "new_customer",
      title: store.chatAssignments[chat.chatId]
        ? `Cliente com mensagens para vendedor`
        : "Cliente novo aguardando vendedor",
      subtitle: chat.contactName || chat.realNumber || chat.chatId,
      unreadCount: chat.unreadCount,
      timestamp: chat.lastMessageTimestamp || Date.now(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 60);
}

async function getChatByIdSafe(chatId) {
  if (!whatsappClient || !whatsappState.connected || !chatId) {
    return null;
  }

  try {
    return await whatsappClient.getChatById(chatId);
  } catch {
    return null;
  }
}

async function syncLabelsForChats(chats = []) {
  if (!whatsappClient || !whatsappState.connected) return;

  try {
    const nativeLabels = await whatsappClient.getLabels().catch(() => []);
    const labelNames = Array.isArray(nativeLabels)
      ? nativeLabels
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      : [];

    const nextChatLabels = {};
    for (const chat of chats) {
      try {
        const assigned = await chat.getLabels().catch(() => []);
        const names = (assigned || [])
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        if (names.length) {
          nextChatLabels[chat.id?._serialized || chat.id] = names;
        }
      } catch (error) {
        console.error("Falha ao sincronizar etiquetas de um chat:", error);
      }
    }

    store.labels = labelNames;
    store.chatLabels = nextChatLabels;
    persistStore();
    emitSettings();
  } catch (error) {
    console.error("Falha ao sincronizar etiquetas:", error);
  }
}

function normalizeNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function getDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isLikelyPhoneDigits(digits) {
  return digits.length >= 10 && digits.length <= 13;
}

function formatDisplayNumber(value) {
  const digits = getDigits(value);
  if (!isLikelyPhoneDigits(digits)) return null;
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
}

function extractRealNumber(...candidates) {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value) continue;
    const clean = value.replace(/@.*$/, "");
    const digits = getDigits(clean);
    if (digits.length >= 10 && digits.length <= 13) {
      return digits.startsWith("55") ? digits : `55${digits}`;
    }
  }
  return null;
}

function resolveChatTarget(number, preferredChatId = null) {
  if (preferredChatId) {
    return preferredChatId;
  }

  const normalizedNumber = normalizeNumber(number);
  const byHistory = [...store.messages]
    .reverse()
    .find((message) => normalizeNumber(message.realNumber || message.displayNumber || "") === normalizedNumber);

  if (byHistory?.chatId) {
    return byHistory.chatId;
  }

  return toChatId(number);
}

function getChatAssignment(chatId) {
  return store.chatAssignments[chatId] || null;
}

function scheduleChatRefresh() {
  if (chatRefreshTimer) {
    clearTimeout(chatRefreshTimer);
  }
  chatRefreshTimer = setTimeout(async () => {
    try {
      await syncRecentConversations();
      await syncStatusFeed();
    } catch (error) {
      console.error("Falha ao atualizar resumo de chats/status:", error);
    } finally {
      chatRefreshTimer = null;
    }
  }, 1200);
}

function isRealDirectChatId(id) {
  if (!id) return false;
  const s = String(id).trim();
  if (
    s === "status@broadcast" ||
    s.endsWith("@broadcast") ||
    s.endsWith("@newsletter") ||
    s.endsWith("@g.us") ||
    s.includes("broadcast") ||
    s === "13135550002@c.us" ||
    s === "0@c.us"
  ) {
    return false;
  }
  return true;
}

function toChatId(number) {
  return `${normalizeNumber(number)}@c.us`;
}

function appendSignature(text, signatureId) {
  const signature = store.signatures.find((item) => item.id === signatureId);
  if (!signature) return text;

  return `${text}\n\n${signature.signature}\n${signature.sellerName}`;
}

function buildMessageFingerprint(message) {
  return [
    message.id || "",
    message.chatId || "",
    message.direction || "",
    message.timestamp || 0,
    message.body || "",
  ].join("::");
}

function normalizeStoredMessage(message) {
  return {
    ...message,
    labels: store.chatLabels[message.chatId] || [],
  };
}

function mergeMessages(messages) {
  const seen = new Map();
  [...store.messages, ...messages.map(normalizeStoredMessage)]
    .filter((m) => isRealDirectChatId(m.chatId))
    .forEach((message) => {
      seen.set(buildMessageFingerprint(message), message);
    });
  store.messages = Array.from(seen.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-600);
}

function storeMessage(message) {
  if (!message || !isRealDirectChatId(message.chatId)) return;
  const next = normalizeStoredMessage(message);
  const exists = store.messages.some(
    (item) => buildMessageFingerprint(item) === buildMessageFingerprint(next)
  );

  mergeMessages([next]);
  persistStore();

  if (!exists) {
    io.emit("whatsapp:message", next);
  }

  scheduleChatRefresh();
}

async function getProfilePicUrlSafe(chatId) {
  if (!whatsappClient || !whatsappState.connected || !chatId || !isRealDirectChatId(chatId)) return null;
  try {
    const url = await whatsappClient.getProfilePicUrl(chatId);
    if (url && (url.startsWith("http") || url.startsWith("data:"))) return url;
  } catch (e) {}

  try {
    const pic = await whatsappClient.pupPage.evaluate(async (cid) => {
      try {
        const thumb = await window.require('WAWebCollections').ProfilePicThumb.find(cid);
        if (thumb?.imgFull) return thumb.imgFull;
        if (thumb?.img) return thumb.img;
        if (thumb?.eurl) return thumb.eurl;
        return null;
      } catch (e) {
        return null;
      }
    }, chatId);
    if (pic) return pic;
  } catch (e) {}

  return null;
}

async function resolveContactDetails(chat, rawId) {
  let contact = null;
  try {
    if (chat && typeof chat.getContact === "function") {
      contact = await chat.getContact().catch(() => null);
    }
  } catch (e) {}

  let contactName = contact?.pushname || contact?.name || contact?.shortName || chat?.name || null;
  let realNumber = extractRealNumber(
    contact?.number,
    chat?.id?.user,
    contact?.name,
    contact?.pushname,
    chat?.name
  );

  // If chat is @lid or contact has no phone number, resolve via WhatsApp Web collections in pupPage
  if ((!realNumber || String(rawId).endsWith("@lid") || !contactName) && whatsappClient?.pupPage) {
    try {
      const details = await whatsappClient.pupPage.evaluate(async (cid) => {
        try {
          const cModel = window.require('WAWebCollections').Contact.get(cid);
          if (cModel) {
            return {
              name: cModel.name || cModel.pushname || cModel.formattedTitle || null,
              phoneNumber: cModel.phoneNumber || cModel.id?.user || null,
              pushname: cModel.pushname || null,
            };
          }
          const chatModel = window.require('WAWebCollections').Chat.get(cid);
          if (chatModel) {
            return {
              name: chatModel.name || chatModel.formattedTitle || null,
              phoneNumber: chatModel.contact?.phoneNumber || chatModel.contact?.id?.user || null,
              pushname: chatModel.contact?.pushname || null,
            };
          }
        } catch (e) {}
        return null;
      }, rawId);

      if (details) {
        if (!contactName && (details.name || details.pushname)) {
          contactName = details.name || details.pushname;
        }
        if (!realNumber && details.phoneNumber) {
          realNumber = extractRealNumber(details.phoneNumber);
        }
      }
    } catch (e) {}
  }

  const cleanNum = realNumber || rawId.replace(/@(c\.us|s\.whatsapp\.net|lid)$/, "");
  return {
    contactName: contactName || cleanNum,
    realNumber: cleanNum,
    displayNumber: cleanNum,
  };
}

async function syncRecentConversations() {
  if (!whatsappClient || !whatsappState.connected) return;

  try {
    let rawChats = [];
    try {
      rawChats = await whatsappClient.getChats();
    } catch (err) {
      console.warn("getChats() padrão falhou, usando sincronização via pupPage:", err.message);
      rawChats = await whatsappClient.pupPage.evaluate(async () => {
        try {
          const cArray = window.require('WAWebCollections').Chat.getModelsArray();
          return (cArray || [])
            .filter((c) => !c.isGroup && !c.isBroadcast && !c.isNewsletter && c.id?._serialized !== 'status@broadcast')
            .map((c) => ({
              id: c.id ? c.id._serialized : '',
              user: c.id ? c.id.user : '',
              name: c.name || c.formattedTitle || '',
              unreadCount: c.unreadCount || 0,
              timestamp: (c.t || 0) * 1000,
            }));
        } catch (e) {
          return [];
        }
      });
    }

    const relevantChats = (rawChats || [])
      .filter((chat) => {
        const rawId = chat.id?._serialized || chat.id || chat.chatId || "";
        return isRealDirectChatId(rawId);
      })
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 300);

    const syncedMessages = [];
    const chatSummaries = [];
    const labelAwareChats = [];

    for (const chat of relevantChats) {
      const rawId = chat.id?._serialized || chat.id || chat.chatId || "";
      if (!isRealDirectChatId(rawId)) continue;

      try {
        const { contactName, realNumber, displayNumber } = await resolveContactDetails(chat, rawId);
        const profilePicUrl = await getProfilePicUrlSafe(rawId);
        let latestMessage = null;
        let messages = [];

        if (typeof chat.fetchMessages === "function") {
          messages = await chat.fetchMessages({ limit: 25 }).catch(() => []);
          latestMessage = messages[messages.length - 1] || chat.lastMessage || null;
        }

        const assignedLabels = typeof chat.getLabels === "function" ? await chat.getLabels().catch(() => []) : [];
        const assignedLabelNames = (assignedLabels || [])
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        chatSummaries.push({
          chatId: rawId,
          contactName,
          realNumber,
          displayNumber,
          profilePicUrl,
          unreadCount: chat.unreadCount || 0,
          lastMessageBody: latestMessage?.body || "",
          lastMessageTimestamp:
            ((latestMessage?.timestamp || chat.timestamp || Math.floor(Date.now() / 1000)) * 1000),
          isGroup: false,
          isArchived: Boolean(chat.archived),
          isPinned: Boolean(chat.pinned),
          isMuted: Boolean(chat.isMuted),
          muteExpiration: chat.muteExpiration || 0,
          assignedSellerId: getChatAssignment(rawId),
        });

        if (assignedLabelNames.length) {
          store.chatLabels[rawId] = assignedLabelNames;
        }
        if (chat.id?._serialized) {
          labelAwareChats.push(chat);
        }

        (messages || []).forEach((message) => {
          const cId = message.fromMe ? message.to || rawId : message.from;
          if (!isRealDirectChatId(cId)) return;
          syncedMessages.push({
            id: message.id?._serialized || createId(),
            chatId: cId,
            from: message.from,
            to: message.to || null,
            body: message.body || "",
            direction: message.fromMe ? "out" : "in",
            timestamp: (message.timestamp || Math.floor(Date.now() / 1000)) * 1000,
            contactName,
            realNumber,
            displayNumber: realNumber,
            hasMedia: Boolean(message.hasMedia),
            mediaType: message.type || null,
          });
        });
      } catch (error) {
        console.error("Falha ao sincronizar conversa individual:", rawId, error);
      }
    }

    mergeMessages(syncedMessages);
    if (labelAwareChats.length) {
      await syncLabelsForChats(labelAwareChats);
    }

    const existingMap = new Map();
    (store.chats || []).forEach(c => {
      if (c && c.chatId && isRealDirectChatId(c.chatId)) {
        existingMap.set(c.chatId, c);
      }
    });
    chatSummaries.forEach(c => {
      if (c && c.chatId && isRealDirectChatId(c.chatId)) {
        existingMap.set(c.chatId, { ...(existingMap.get(c.chatId) || {}), ...c });
      }
    });

    store.chats = Array.from(existingMap.values())
      .filter((c) => isRealDirectChatId(c.chatId))
      .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

    rebuildNotifications();
    persistStore();
    emitChats();
    emitNotifications();
    emitLabels();
  } catch (error) {
    console.error("Falha geral ao sincronizar conversas recentes:", error);
  }
}

async function runChatAction(chatId, action, payload = {}) {
  const chat = await getChatByIdSafe(chatId);
  if (!chat) {
    throw new Error("Conversa nao encontrada");
  }

  switch (action) {
    case "archive":
      await chat.archive();
      return { success: true };
    case "unarchive":
      await chat.unarchive();
      return { success: true };
    case "pin":
      return { success: await chat.pin() };
    case "unpin":
      return { success: await chat.unpin() };
    case "mute":
      return { success: true, payload: await chat.mute(payload.unmuteDate ? new Date(payload.unmuteDate) : undefined) };
    case "unmute":
      return { success: true, payload: await chat.unmute() };
    case "mark-unread":
      await chat.markUnread();
      return { success: true };
    case "typing":
      await chat.sendStateTyping();
      return { success: true };
    case "recording":
      await chat.sendStateRecording();
      return { success: true };
    case "clear-state":
      await chat.clearState();
      return { success: true };
    case "sync-history":
      await chat.syncHistory();
      return { success: true };
    case "clear-messages":
      return { success: await chat.clearMessages() };
    case "delete-chat":
      return { success: await chat.delete() };
    case "set-note":
      await chat.addOrEditCustomerNote(String(payload.note || ""));
      return { success: true };
    case "get-note":
      return { success: true, note: await chat.getCustomerNote() };
    case "block": {
      const contact = await chat.getContact();
      if (!contact?.block) throw new Error("Contato sem suporte para bloqueio");
      await contact.block();
      return { success: true };
    }
    case "unblock": {
      const contact = await chat.getContact();
      if (!contact?.unblock) throw new Error("Contato sem suporte para desbloqueio");
      await contact.unblock();
      return { success: true };
    }
    default:
      throw new Error("Acao nao suportada");
  }
}

async function syncStatusFeed() {
  if (!whatsappClient || !whatsappState.connected) return;

  try {
    const broadcasts = await whatsappClient.getBroadcasts();
    const feed = [];

    for (const broadcast of broadcasts || []) {
      try {
        const contact = await broadcast.getContact().catch(() => null);
        let profilePicUrl = null;
        try {
          profilePicUrl = await whatsappClient.getProfilePicUrl(
            broadcast.id?._serialized || contact?.id?._serialized
          );
        } catch (e) {
          try {
            profilePicUrl = await contact?.getProfilePicUrl?.();
          } catch (e2) {}
        }

        const contactName =
          contact?.pushname ||
          contact?.name ||
          contact?.shortName ||
          broadcast.id?.user ||
          "Status";

        const rawMsgs = (broadcast.msgs || []).slice(-8);
        const items = [];

        for (const item of rawMsgs) {
          let mediaUrl = null;
          if (item.hasMedia) {
            try {
              const media = await item.downloadMedia().catch(() => null);
              if (media && media.data) {
                mediaUrl = `data:${media.mimetype || "image/jpeg"};base64,${media.data}`;
              }
            } catch (e) {}
          }

          items.push({
            id: item.id?._serialized || createId(),
            body: item.body || item.caption || "",
            timestamp: (item.timestamp || Math.floor(Date.now() / 1000)) * 1000,
            hasMedia: Boolean(item.hasMedia),
            mediaType: item.type || (mediaUrl ? "image" : null),
            mediaUrl,
          });
        }

        feed.push({
          id: broadcast.id?._serialized || broadcast.id?.user || createId(),
          contactId: broadcast.id?._serialized || null,
          contactName,
          contactNumber: extractRealNumber(broadcast.id?.user, contact?.number),
          profilePicUrl,
          unreadCount: broadcast.unreadCount || 0,
          totalCount: broadcast.totalCount || items.length,
          timestamp: (broadcast.timestamp || Math.floor(Date.now() / 1000)) * 1000,
          items,
        });
      } catch (error) {
        console.error("Falha ao sincronizar status individual:", error);
      }
    }

    store.statusFeed = feed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    persistStore();
    emitStatusFeed();
  } catch (error) {
    console.error("Falha ao sincronizar status:", error);
  }
}

async function resolveAndSendMessage(chatId, content, options = {}) {
  try {
    const res = await whatsappClient.sendMessage(chatId, content, options);
    if (res) return res;
  } catch (err1) {
    console.warn(`[WHATSAPP-SEND] Tentativa direta para ${chatId} falhou: "${err1.message}". Tentando resolução de JID...`);

    const clean = normalizeNumber(chatId);
    if (clean) {
      // 1. Try resolving via getNumberId
      try {
        const numberId = await whatsappClient.getNumberId(clean);
        if (numberId?._serialized && numberId._serialized !== chatId) {
          console.log(`[WHATSAPP-SEND] JID resolvido via getNumberId: ${numberId._serialized}`);
          const res = await whatsappClient.sendMessage(numberId._serialized, content, options);
          if (res) return res;
        }
      } catch (e) {}

      // 2. If 13 digits (55 + DDD + 9 digits), try without the 9th digit (12 digits)
      if (clean.length === 13 && clean.startsWith("55")) {
        const alt12 = `${clean.slice(0, 4)}${clean.slice(5)}@c.us`;
        try {
          console.log(`[WHATSAPP-SEND] Tentando variação sem 9º dígito: ${alt12}`);
          const res = await whatsappClient.sendMessage(alt12, content, options);
          if (res) return res;
        } catch (e) {}
      }

      // 3. If 12 digits (55 + DDD + 8 digits), try with the 9th digit (13 digits)
      if (clean.length === 12 && clean.startsWith("55")) {
        const alt13 = `${clean.slice(0, 4)}9${clean.slice(4)}@c.us`;
        try {
          console.log(`[WHATSAPP-SEND] Tentando variação com 9º dígito: ${alt13}`);
          const res = await whatsappClient.sendMessage(alt13, content, options);
          if (res) return res;
        } catch (e) {}
      }
    }

    throw err1;
  }
}

async function resolveMediaObject(mediaSource, filename = "arquivo", mimetype = null) {
  if (!mediaSource) return null;

  if (mediaSource instanceof MessageMedia || (mediaSource.mimetype && mediaSource.data)) {
    return mediaSource;
  }

  if (typeof mediaSource === "string" && mediaSource.startsWith("data:")) {
    const match = mediaSource.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return new MessageMedia(match[1], match[2], filename);
    }
  }

  if (typeof mediaSource === "string" && mimetype && !mediaSource.startsWith("http")) {
    const cleanB64 = mediaSource.replace(/^data:[^;]+;base64,/, "");
    return new MessageMedia(mimetype, cleanB64, filename);
  }

  if (typeof mediaSource === "string" && mediaSource.startsWith("http")) {
    try {
      const media = await MessageMedia.fromUrl(mediaSource, { unsafeMime: true });
      if (media && media.data) return media;
    } catch (e) {
      console.warn("MessageMedia.fromUrl falhou, tentando download com fetch nativo:", e.message);
      try {
        const resp = await fetch(mediaSource);
        const arrayBuf = await resp.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString("base64");
        const detectedMime = resp.headers.get("content-type") || mimetype || "image/jpeg";
        return new MessageMedia(detectedMime, base64, filename);
      } catch (e2) {
        console.error("Falha ao baixar imagem via fetch nativo:", e2.message);
      }
    }
  }

  return null;
}

async function sendDirectMessage({ number, text, signatureId, chatId: preferredChatId = null, replyTo = null }) {
  if (!whatsappClient) {
    throw new Error("WhatsApp ainda não iniciado");
  }

  const isConnected = whatsappState.connected || Boolean(whatsappClient.info?.wid) || Boolean(whatsappClient.pupPage);
  if (!isConnected) {
    throw new Error("WhatsApp ainda não conectado. Por favor aguarde ou escaneie o QR Code.");
  }

  const finalText = appendSignature(text, signatureId);
  let targetChatId = preferredChatId;

  if (!targetChatId || !targetChatId.includes("@")) {
    const cleanNumber = normalizeNumber(number || preferredChatId);
    if (cleanNumber) {
      try {
        const numberId = await whatsappClient.getNumberId(cleanNumber);
        if (numberId?._serialized) {
          targetChatId = numberId._serialized;
        }
      } catch (e) {}
      if (!targetChatId) {
        targetChatId = `${cleanNumber}@c.us`;
      }
    }
  }

  if (!targetChatId) {
    throw new Error("Destinatário inválido para envio de mensagem");
  }

  console.log(`[WHATSAPP-SEND] Disparando texto para ${targetChatId}: "${finalText.slice(0, 60)}"`);
  const options = replyTo ? { quotedMessageId: replyTo } : {};
  const sentMsg = await resolveAndSendMessage(targetChatId, finalText, options);
  console.log(`[WHATSAPP-SEND] Mensagem entregue com sucesso! ID: ${sentMsg?.id?._serialized || 'ok'}`);

  const outMsg = {
    id: sentMsg?.id?._serialized || `msg-${Date.now()}`,
    chatId: targetChatId,
    from: "me",
    to: targetChatId,
    body: finalText,
    direction: "out",
    timestamp: Date.now(),
    realNumber: extractRealNumber(targetChatId),
    displayNumber: extractRealNumber(targetChatId),
    status: "sent",
  };
  store.messages.push(outMsg);
  if (store.messages.length > 5000) store.messages.shift();
  io.emit("whatsapp:message", outMsg);

  return sentMsg;
}

async function sendDirectMedia({
  number,
  chatId: preferredChatId = null,
  media,
  caption = "",
  filename = "arquivo",
  mimetype = null,
  sendAudioAsVoice = false,
  sendMediaAsDocument = false,
}) {
  if (!whatsappClient) {
    throw new Error("WhatsApp ainda não iniciado");
  }

  const isConnected = whatsappState.connected || Boolean(whatsappClient.info?.wid) || Boolean(whatsappClient.pupPage);
  if (!isConnected) {
    throw new Error("WhatsApp ainda não conectado. Por favor aguarde ou escaneie o QR Code.");
  }

  let targetChatId = preferredChatId;
  if (!targetChatId || !targetChatId.includes("@")) {
    const cleanNumber = normalizeNumber(number || preferredChatId);
    targetChatId = `${cleanNumber}@c.us`;
  }

  const mediaObj = await resolveMediaObject(media, filename, mimetype);
  if (!mediaObj) {
    throw new Error("Mídia inválida ou não foi possível carregar a imagem.");
  }

  const options = {};
  if (caption) options.caption = caption;
  if (sendAudioAsVoice) options.sendAudioAsVoice = true;
  if (sendMediaAsDocument) options.sendMediaAsDocument = true;

  console.log(`[WHATSAPP-SEND-MEDIA] Disparando mídia para ${targetChatId} (${mediaObj.mimetype})`);
  const sent = await resolveAndSendMessage(targetChatId, mediaObj, options);
  console.log(`[WHATSAPP-SEND-MEDIA] Sucesso ao enviar mídia para ${targetChatId}!`);

  const outMsg = {
    id: sent?.id?._serialized || `msg-media-${Date.now()}`,
    chatId: targetChatId,
    from: "me",
    to: targetChatId,
    body: caption || (sendMediaAsDocument ? `📄 ${filename}` : "📷 Foto"),
    direction: "out",
    timestamp: Date.now(),
    hasMedia: true,
    mediaType: sendMediaAsDocument ? "document" : mediaObj.mimetype?.startsWith("image") ? "image" : "media",
    realNumber: extractRealNumber(targetChatId),
    displayNumber: extractRealNumber(targetChatId),
    status: "sent",
  };
  store.messages.push(outMsg);
  if (store.messages.length > 5000) store.messages.shift();
  io.emit("whatsapp:message", outMsg);

  return sent;
}

async function postStatus({ text = "", media = null, backgroundColor = "#b91c1c" }) {
  if (!whatsappState.connected && !whatsappClient?.info?.wid && !whatsappClient?.pupPage) {
    throw new Error("WhatsApp ainda não conectado");
  }

  if (media) {
    return whatsappClient.sendMessage("status@broadcast", media, {
      caption: text || undefined,
      sendSeen: false,
    });
  }

  return whatsappClient.sendMessage("status@broadcast", text, {
    fontStyle: 1,
    backgroundColor,
    sendSeen: false,
  });
}

function clearScheduleTimer(id) {
  const existing = scheduleTimers.get(id);
  if (existing) {
    clearTimeout(existing);
    scheduleTimers.delete(id);
  }
}

function schedulePendingMessage(item) {
  clearScheduleTimer(item.id);

  if (item.status !== "pending") return;

  const delay = new Date(item.sendAt).getTime() - Date.now();
  const runIn = Math.max(delay, 0);

  const timer = setTimeout(async () => {
    try {
      await sendDirectMessage({
        number: item.number,
        text: item.text,
        signatureId: item.signatureId,
      });
      item.status = "sent";
      persistStore();
      emitSettings();
      emitToast(`Mensagem agendada enviada para ${item.number}.`);
    } catch (error) {
      console.error("Falha ao enviar mensagem agendada:", error);
      item.status = "failed";
      persistStore();
      emitSettings();
      emitToast(`Falha ao enviar agendamento para ${item.number}.`);
    } finally {
      clearScheduleTimer(item.id);
    }
  }, runIn);

  scheduleTimers.set(item.id, timer);
}

loadStore();

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function buildWhatsAppClient() {
  const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : undefined;
  return new Client({
    authStrategy: new LocalAuth({
      clientId: "balao-whatsapp-panel",
      dataPath: path.join(__dirname, ".wwebjs_auth"),
    }),
    puppeteer: {
      headless: true,
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-software-rasterizer",
        "--no-default-browser-check",
        "--window-size=1280,800"
      ],
    },
  });
}

function attachWhatsAppClientEvents(client) {
  client.on("qr", async (qr) => {
    lastProgressAt = Date.now();
    console.log("[whatsapp] QR Code recebido! Gerando imagem...");
    whatsappState.status = "qr";
    whatsappState.connected = false;
    whatsappState.session = false;
    whatsappState.rawQr = qr;
    try {
      whatsappState.qrCode = await qrcode.toDataURL(qr, { width: 320, margin: 2 });
    } catch (e) {
      console.error("Falha ao converter QR para base64:", e);
    }
    emitState();
    emitToast("QR Code gerado. Escaneie com o WhatsApp.");
  });

  client.on("loading_screen", (percent, message) => {
    lastProgressAt = Date.now();
    console.log(`[whatsapp] Carregando tela: ${percent}% - ${message}`);
    whatsappState.status = "loading";
    emitState();
  });

  client.on("authenticated", () => {
    lastProgressAt = Date.now();
    console.log("[whatsapp] Sessão autenticada!");
    whatsappState.status = "authenticated";
    whatsappState.connected = true;
    whatsappState.session = true;
    whatsappState.qrCode = null;
    whatsappState.rawQr = null;
    emitState();
    emitToast("Sessão autenticada com sucesso.");
  });

  client.on("ready", async () => {
    lastProgressAt = Date.now();
    console.log("[whatsapp] WhatsApp cliente conectado e pronto!");
    whatsappState.status = "ready";
    whatsappState.connected = true;
    whatsappState.session = true;
    whatsappState.qrCode = null;
    whatsappState.rawQr = null;
    whatsappState.phoneNumber = client.info?.wid?.user || null;
    emitState();
    emitToast("WhatsApp conectado e pronto para uso.");
    await syncRecentConversations();
    await syncStatusFeed();
  });

  client.on("auth_failure", (message) => {
    lastProgressAt = Date.now();
    console.error("[whatsapp] Falha de autenticação:", message);
    whatsappState.status = "auth_failure";
    whatsappState.connected = false;
    whatsappState.session = false;
    whatsappState.qrCode = null;
    whatsappState.rawQr = null;
    emitState();
    emitToast(`Falha na autenticação: ${message}`);
    // Sessão local corrompida/expirada: limpar e gerar QR novo automaticamente
    // em vez de ficar travado exigindo reset manual.
    setTimeout(() => initializeWhatsAppClient({ resetSession: true }), 3000);
  });

  client.on("disconnected", (reason) => {
    lastProgressAt = Date.now();
    console.log(`[whatsapp] Desconectado: ${reason}`);
    whatsappState.status = "disconnected";
    whatsappState.connected = false;
    whatsappState.qrCode = null;
    whatsappState.rawQr = null;
    emitState();
    emitToast(`WhatsApp desconectado: ${reason}`);

    if (reason === "LOGOUT") {
      whatsappState.session = false;
      whatsappState.phoneNumber = null;
      setTimeout(() => initializeWhatsAppClient({ resetSession: true }), 2000);
    } else {
      setTimeout(() => initializeWhatsAppClient({ resetSession: false }), 4000);
    }
  });

  client.on("message", async (message) => {
    if (!isRealDirectChatId(message.from) || message.broadcast) {
      if (message.from === "status@broadcast" || message.broadcast || message.from?.includes("broadcast")) {
        syncStatusFeed().catch(() => {});
      }
      return;
    }

    const contactName =
      message._data?.notifyName || message._data?.pushname || message.from || null;

    storeMessage({
      id: message.id?._serialized || createId(),
      chatId: message.from,
      from: message.from,
      body: message.body || "",
      direction: "in",
      timestamp: (message.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      contactName,
      realNumber: extractRealNumber(message.from, contactName),
      displayNumber: extractRealNumber(message.from, contactName),
      hasMedia: Boolean(message.hasMedia),
      mediaType: message.type || null,
    });
  });

  client.on("message_create", async (message) => {
    if (!message.fromMe) return;
    const targetChat = message.to || message.from;
    if (!isRealDirectChatId(targetChat) || message.broadcast) {
      if (targetChat === "status@broadcast" || message.broadcast) {
        syncStatusFeed().catch(() => {});
      }
      return;
    }

    storeMessage({
      id: message.id?._serialized || createId(),
      chatId: targetChat,
      from: whatsappState.phoneNumber || "balao",
      to: message.to || null,
      body: message.body || "",
      direction: "out",
      timestamp: (message.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      contactName: message.to || null,
      realNumber: extractRealNumber(message.to, message.from),
      displayNumber: extractRealNumber(message.to, message.from),
      hasMedia: Boolean(message.hasMedia),
      mediaType: message.type || null,
    });
  });
}

async function initializeWhatsAppClient(options = {}) {
  const { resetSession = false, force = false } = options;
  // "force" existe para ações explícitas do usuário (botão de reconectar/sair)
  // e para o watchdog: sem isso, uma inicialização travada deixava o botão de
  // reset completamente mudo (o guard nunca liberava sozinho).
  if (isInitializingClient && !force) return;
  isInitializingClient = true;
  initializingSince = Date.now();
  lastProgressAt = Date.now();

  try {
    whatsappState.status = "initializing";
    whatsappState.qrCode = null;
    whatsappState.connected = false;
    if (resetSession) {
      whatsappState.session = false;
      whatsappState.phoneNumber = null;
    }
    emitState();

    if (whatsappClient) {
      try {
        await whatsappClient.destroy();
      } catch (error) {
        console.error("Falha ao destruir cliente atual do WhatsApp:", error);
      }
      whatsappClient.removeAllListeners();
      whatsappClient = null;
    }

    if (resetSession) {
      try {
        fs.rmSync(path.join(__dirname, ".wwebjs_auth"), { recursive: true, force: true });
        fs.rmSync(path.join(__dirname, ".wwebjs_cache"), { recursive: true, force: true });
      } catch (error) {
        console.error("Falha ao limpar sessao/cache do WhatsApp:", error);
      }
    }

    const client = buildWhatsAppClient();
    attachWhatsAppClientEvents(client);
    whatsappClient = client;
    await client.initialize();
  } catch (error) {
    console.error("Falha ao iniciar o cliente do WhatsApp:", error);
    whatsappState.status = "disconnected";
    whatsappState.connected = false;
    whatsappState.qrCode = null;
    emitState();
    emitToast("Falha ao iniciar o cliente do WhatsApp. Tentando novamente...");
    // Antes disso, uma falha aqui (Puppeteer/Chrome instável, timeout de rede)
    // deixava o painel travado pra sempre sem QR e sem retry automático.
    setTimeout(() => initializeWhatsAppClient({ resetSession: false }), 8000);
  } finally {
    isInitializingClient = false;
    initializingSince = null;
  }
}

// Watchdog: garante que o QR/sessão nunca fica travado sem se recuperar
// sozinho — nem numa inicialização que trava no meio, nem num estado morto
// (desconectado, sem client, sem nenhuma tentativa em andamento).
const WATCHDOG_INTERVAL_MS = 20000;
const WATCHDOG_STUCK_INIT_MS = 45000;
const WATCHDOG_STUCK_PROGRESS_MS = 90000;

setInterval(() => {
  const now = Date.now();

  if (isInitializingClient && initializingSince && now - initializingSince > WATCHDOG_STUCK_INIT_MS) {
    console.warn("[whatsapp][watchdog] Inicialização travada há mais de 45s — forçando reinício.");
    isInitializingClient = false;
    initializeWhatsAppClient({ resetSession: false, force: true });
    return;
  }

  if (!isInitializingClient && !whatsappState.connected && !whatsappClient) {
    console.warn("[whatsapp][watchdog] Sem cliente ativo e desconectado — reiniciando.");
    initializeWhatsAppClient({ resetSession: false });
    return;
  }

  if (
    !isInitializingClient &&
    !whatsappState.connected &&
    whatsappState.status !== "ready" &&
    now - lastProgressAt > WATCHDOG_STUCK_PROGRESS_MS
  ) {
    console.warn(`[whatsapp][watchdog] Sem progresso há mais de ${WATCHDOG_STUCK_PROGRESS_MS / 1000}s (status=${whatsappState.status}) — forçando novo QR.`);
    initializeWhatsAppClient({ resetSession: true, force: true });
  }
}, WATCHDOG_INTERVAL_MS);

async function resetWhatsAppSession() {
  // force:true porque é sempre uma ação explícita (botão "Gerar Novo QR
  // Code"/"Sair"): tem que funcionar mesmo se uma inicialização anterior
  // ficou presa, senão o botão de reset vira um no-op silencioso.
  return initializeWhatsAppClient({ resetSession: true, force: true });
}

initializeWhatsAppClient();

store.schedules.forEach((item) => {
  if (item.status === "pending") {
    schedulePendingMessage(item);
  }
});

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get(["/health", "/status", "/api/status", "/api/crm/status"], (_req, res) => {
  res.json({
    ok: true,
    estado: whatsappState.status,
    status: whatsappState.status,
    qr: whatsappState.qrCode,
    qrCode: whatsappState.qrCode,
    rawQr: whatsappState.rawQr,
    connected: whatsappState.connected,
    session: whatsappState.session,
    phoneNumber: whatsappState.phoneNumber,
    conta: whatsappState.phoneNumber ? { numero: whatsappState.phoneNumber } : null,
  });
});

app.all(["/api/reset-session", "/api/crm/reset-session", "/api/reconnect", "/api/crm/reconnect"], async (_req, res) => {
  console.log("[whatsapp] Reiniciando sessão a pedido do painel...");
  resetWhatsAppSession();
  res.json({ ok: true, mensagem: "Sessão reiniciada. Aguarde o novo QR Code." });
});

app.get(["/api/qr", "/api/crm/qr"], (_req, res) => {
  res.json({
    ok: true,
    estado: whatsappState.status,
    qr: whatsappState.qrCode,
    qrCode: whatsappState.qrCode,
    rawQr: whatsappState.rawQr,
    connected: whatsappState.connected,
  });
});

app.get("/api/avatar", async (req, res) => {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ erro: "id obrigatório" });
  try {
    const url = await getProfilePicUrlSafe(String(id));
    if (url) {
      return res.json({ ok: true, url });
    }
    return res.status(404).json({ ok: false, erro: "Foto não encontrada" });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post(["/api/enviar", "/api/send", "/api/crm/send"], async (req, res) => {
  try {
    const { chat, texto, number, text, signatureId, replyTo } = req.body || {};
    const targetChat = chat || number;
    const bodyText = texto || text;
    if (!targetChat || !bodyText) {
      return res.status(400).json({ ok: false, erro: "Chat e texto são obrigatórios." });
    }
    const sent = await sendDirectMessage({
      number: targetChat,
      text: bodyText,
      chatId: targetChat.includes("@") ? targetChat : null,
      signatureId: signatureId || null,
      replyTo: replyTo || null,
    });
    res.json({ ok: true, msgId: sent?.id?._serialized || null });
  } catch (e) {
    console.error("Erro /api/enviar:", e.message);
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post(["/api/enviar-produto", "/api/crm/enviar-produto"], async (req, res) => {
  try {
    const { chat, number, product, price, obs, signatureId } = req.body || {};
    const targetChat = chat || number;
    const prod = product || {};
    if (!targetChat || !prod.nome) {
      return res.status(400).json({ ok: false, erro: "Chat e produto são obrigatórios." });
    }
    const precoFinal = Number(price || prod.preco || 0);
    const custo = Number(prod.custo || 0);
    if (custo > 0 && precoFinal <= custo) {
      return res.status(400).json({
        ok: false,
        erro: `Preço de envio (R$ ${precoFinal.toFixed(2)}) não pode ser menor ou igual ao custo (R$ ${custo.toFixed(2)}).`,
      });
    }
    const obsTxt = obs ? `\n\n_Obs: ${obs}_` : "";
    const specs = prod.specs?.length ? `\n• ${prod.specs.join("\n• ")}` : "";
    const precoFmt = precoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const text = `⚡ *Oferta Balão da Informática*\n*${prod.nome}*\n\n💵 *Preço Especial:* *R$ ${precoFmt}*${specs}${obsTxt}\n\n📍 Pronta entrega na loja do Castelo Campinas!\nPara reservar ou tirar dúvidas, é só responder aqui! 🎈`;

    let mediaSent = false;
    if (prod.imagem && prod.imagem.startsWith("http")) {
      try {
        const media = await MessageMedia.fromUrl(prod.imagem, { unsafeMime: true });
        const chatId = targetChat.includes("@") ? targetChat : `${normalizeNumber(targetChat)}@c.us`;
        await whatsappClient.sendMessage(chatId, media, { caption: text });
        mediaSent = true;
      } catch (e) {
        console.warn("Falha ao anexar foto do produto (via /api/enviar-produto), enviando só texto:", e.message);
      }
    }

    if (!mediaSent) {
      await sendDirectMessage({
        number: targetChat,
        text,
        signatureId: signatureId || null,
        chatId: targetChat.includes("@") ? targetChat : null,
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Erro /api/enviar-produto:", e.message);
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post(["/api/enviar-foto", "/api/crm/enviar-foto"], async (req, res) => {
  try {
    const { chat, number, url, base64, dataUrl, mimetype, legenda, caption } = req.body || {};
    const targetChat = chat || number;
    const finalCaption = legenda || caption || "";
    if (!targetChat) {
      return res.status(400).json({ ok: false, erro: "Chat de destino obrigatório." });
    }

    const mediaSource = dataUrl || url || base64;
    if (!mediaSource) {
      return res.status(400).json({ ok: false, erro: "Nenhuma imagem informada." });
    }

    const sent = await sendDirectMedia({
      number: targetChat,
      chatId: targetChat.includes("@") ? targetChat : null,
      media: mediaSource,
      caption: finalCaption,
      filename: "foto.jpg",
      mimetype: mimetype || "image/jpeg",
    });

    res.json({ ok: true, msgId: sent?.id?._serialized || null });
  } catch (e) {
    console.error("Erro /api/enviar-foto:", e.message);
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post(["/api/enviar-documento", "/api/crm/enviar-documento"], async (req, res) => {
  try {
    const { chat, number, base64, dataUrl, mimetype, nome, filename, legenda, caption } = req.body || {};
    const targetChat = chat || number;
    const finalCaption = legenda || caption || "";
    const finalName = nome || filename || "documento.pdf";
    const finalMime = mimetype || "application/octet-stream";

    if (!targetChat) {
      return res.status(400).json({ ok: false, erro: "Chat de destino obrigatório." });
    }

    const mediaSource = dataUrl || base64;
    if (!mediaSource) {
      return res.status(400).json({ ok: false, erro: "Nenhum arquivo informado." });
    }

    const sent = await sendDirectMedia({
      number: targetChat,
      chatId: targetChat.includes("@") ? targetChat : null,
      media: mediaSource,
      caption: finalCaption,
      filename: finalName,
      mimetype: finalMime,
      sendMediaAsDocument: true,
    });

    res.json({ ok: true, msgId: sent?.id?._serialized || null });
  } catch (e) {
    console.error("Erro /api/enviar-documento:", e.message);
    res.status(500).json({ ok: false, erro: e.message });
  }
});

io.on("connection", (socket) => {
  socket.emit("whatsapp:state", whatsappState);
  socket.emit("whatsapp:api-info", apiInfo);
  socket.emit("whatsapp:settings", {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
    chatAssignments: store.chatAssignments,
    notifications: store.notifications,
    apiInfo,
  });
  socket.emit("whatsapp:messages", store.messages.slice(-300));
  socket.emit("whatsapp:chats", store.chats);
  socket.emit("whatsapp:status-feed", store.statusFeed);

  socket.on("panel:bootstrap", () => {
    socket.emit("whatsapp:state", whatsappState);
    socket.emit("whatsapp:api-info", apiInfo);
    socket.emit("whatsapp:settings", {
      labels: store.labels,
      signatures: store.signatures,
      quickReplies: store.quickReplies,
      schedules: store.schedules,
      chatLabels: store.chatLabels,
      chatAssignments: store.chatAssignments,
      notifications: store.notifications,
      apiInfo,
    });
    socket.emit("whatsapp:messages", store.messages.slice(-300));
    socket.emit("whatsapp:chats", store.chats);
    socket.emit("whatsapp:status-feed", store.statusFeed);
  });

  socket.on("panel:reset-session", () => {
    resetWhatsAppSession();
  });

  socket.on("panel:sync-conversations", async () => {
    emitToast("Sincronizando conversas da conta conectada.");
    await syncRecentConversations();
    await syncStatusFeed();
  });

  socket.on("panel:refresh-labels", async () => {
    try {
      const chats = await whatsappClient.getChats();
      await syncLabelsForChats(chats || []);
      emitToast("Etiquetas sincronizadas com o WhatsApp.");
    } catch (error) {
      console.error("Falha ao sincronizar etiquetas manualmente:", error);
      emitToast("Falha ao sincronizar etiquetas.");
    }
  });

  socket.on("panel:send-message", async (payload) => {
    try {
      const number = normalizeNumber(payload.number || payload.chatId || "");
      const chatId = payload.chatId || (number ? `${number}@c.us` : null);
      const text = String(payload.text || "").trim();
      if (!chatId || !text) return;

      await sendDirectMessage({
        number,
        text,
        signatureId: payload.signatureId || null,
        chatId,
        replyTo: payload.replyTo || null,
      });
      emitToast("Mensagem enviada.");
    } catch (error) {
      console.error("Falha ao enviar mensagem:", error);
      emitToast("Falha ao enviar mensagem: " + error.message);
    }
  });

  socket.on("panel:add-label", (payload) => {
    const label = String(payload.label || "").trim();
    if (!label || store.labels.includes(label)) return;
    store.labels.push(label);
    persistStore();
    emitSettings();
  });

  socket.on("panel:assign-seller", (payload) => {
    const chatId = String(payload.chatId || "").trim();
    const sellerId = payload.sellerId ? String(payload.sellerId) : null;
    if (!chatId) return;

    if (sellerId) {
      store.chatAssignments[chatId] = sellerId;
    } else {
      delete store.chatAssignments[chatId];
    }

    store.chats = store.chats.map((chat) =>
      chat.chatId === chatId ? { ...chat, assignedSellerId: sellerId } : chat
    );
    rebuildNotifications();
    persistStore();
    emitChats();
    emitSettings();
    emitToast("Vendedor atualizado para o cliente.");
  });

  socket.on("panel:mark-chat-read", async (payload) => {
    const chatId = String(payload.chatId || "").trim();
    if (!chatId) return;

    try {
      await whatsappClient.sendSeen(chatId);
      store.chats = store.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat
      );
      rebuildNotifications();
      persistStore();
      emitChats();
      emitSettings();
    } catch (error) {
      console.error("Falha ao marcar conversa como lida:", error);
      emitToast("Falha ao marcar conversa como lida.");
    }
  });

  socket.on("panel:toggle-chat-label", (payload) => {
    const chatId = String(payload.chatId || "").trim();
    const label = String(payload.label || "").trim();
    if (!chatId || !label) return;

    (async () => {
      try {
        const chat = await getChatByIdSafe(chatId);
        if (!chat) return;

        const nativeLabels = await whatsappClient.getLabels().catch(() => []);
        const selectedLabel = (nativeLabels || []).find(
          (item) => String(item?.name || "").trim().toLowerCase() === label.toLowerCase()
        );
        if (!selectedLabel) {
          emitToast("Etiqueta nao encontrada no WhatsApp. Sincronize a conta primeiro.");
          return;
        }

        const currentLabels = await chat.getLabels().catch(() => []);
        const currentIds = (currentLabels || []).map((item) => String(item?.id || item?._id || ""));
        const labelId = String(selectedLabel.id || selectedLabel._id || "").trim();
        const nextIds = currentIds.includes(labelId)
          ? currentIds.filter((item) => item !== labelId)
          : [...currentIds, labelId];

        await chat.changeLabels(nextIds);
        await syncLabelsForChats([chat]);
        emitToast("Etiquetas da conversa atualizadas.");
      } catch (error) {
        console.error("Falha ao alterar etiqueta da conversa:", error);
        emitToast("Falha ao alterar etiqueta da conversa.");
      }
    })();
  });

  socket.on("panel:chat-action", async (payload) => {
    const chatId = String(payload.chatId || "").trim();
    const action = String(payload.action || "").trim();
    if (!chatId || !action) return;

    try {
      const result = await runChatAction(chatId, action, payload);
      if (action === "get-note") {
        socket.emit("whatsapp:chat-note", {
          chatId,
          note: String(result.note || ""),
        });
      } else {
        socket.emit("whatsapp:chat-action-result", { chatId, action, result });
      }
      if (action !== "get-note") {
        await syncRecentConversations();
      }
      emitToast("Acao da conversa executada com sucesso.");
    } catch (error) {
      console.error("Falha em acao de conversa:", error);
      emitToast("Falha ao executar a acao da conversa.");
    }
  });

  socket.on("panel:add-signature", (payload) => {
    const sellerName = String(payload.sellerName || "").trim();
    const signature = String(payload.signature || "").trim();
    if (!sellerName || !signature) return;

    store.signatures.push({
      id: createId(),
      sellerName,
      signature,
    });
    persistStore();
    emitSettings();
  });

  socket.on("panel:add-quick-reply", (payload) => {
    const title = String(payload.title || "").trim();
    const message = String(payload.message || "").trim();
    if (!title || !message) return;

    store.quickReplies.push({
      id: createId(),
      title,
      message,
    });
    persistStore();
    emitSettings();
  });

  socket.on("panel:send-media", async (payload) => {
    try {
      const number = normalizeNumber(payload.number || payload.chatId || "");
      const chatId = payload.chatId || (number ? `${number}@c.us` : null);
      const caption = String(payload.caption || "").trim();
      const filename = String(payload.filename || "arquivo").trim();
      const mimetype = String(payload.mimetype || "").trim();
      const mediaSource = payload.dataUrl || payload.url || payload.base64;

      if (!chatId || !mediaSource) {
        throw new Error("Chat de destino ou mídia não informados");
      }

      await sendDirectMedia({
        number,
        chatId,
        media: mediaSource,
        caption,
        filename,
        mimetype,
        sendAudioAsVoice: Boolean(payload.sendAudioAsVoice),
        sendMediaAsDocument: Boolean(payload.sendMediaAsDocument),
      });

      emitToast("Mídia enviada com sucesso!");
    } catch (error) {
      console.error("Falha ao enviar mídia:", error);
      emitToast("Falha ao enviar mídia: " + error.message);
    }
  });

  socket.on("panel:post-status", async (payload) => {
    try {
      const text = String(payload.text || "").trim();
      const base64 = String(payload.base64 || "").trim();
      const mimetype = String(payload.mimetype || "").trim();
      const filename = String(payload.filename || "status").trim();
      const media =
        base64 && mimetype ? new MessageMedia(mimetype, base64, filename) : null;

      if (!text && !media) return;
      await postStatus({
        text,
        media,
        backgroundColor: String(payload.backgroundColor || "#b91c1c"),
      });
      emitToast("Status publicado com sucesso.");
      await syncStatusFeed();
    } catch (error) {
      console.error("Falha ao publicar status:", error);
      emitToast("Falha ao publicar status.");
    }
  });

  socket.on("panel:send-segmented", async (payload) => {
    const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
    const text = String(payload.text || "").trim();
    if (!recipients.length || !text) return;

    // Intervalo aleatório entre envios para não parecer disparo automatizado
    // (evita banimento do número). Nunca deixar rodar sem pausa.
    const intervalMin = Math.max(15, Number(payload.intervalMin) || 30) * 1000;
    const intervalMax = Math.max(intervalMin, Number(payload.intervalMax) || 60000);

    emitDisparoStatus(true);
    try {
      const lista = recipients.slice(0, 100);
      for (let i = 0; i < lista.length; i++) {
        const number = normalizeNumber(lista[i].number || "");
        if (!number) continue;
        try {
          await sendDirectMessage({
            number,
            text,
            signatureId: payload.signatureId || null,
            chatId: lista[i].chatId || null,
          });
        } catch (sendError) {
          console.error(`Falha ao enviar para ${number} no disparo segmentado:`, sendError.message);
        }
        if (i < lista.length - 1) {
          const espera = intervalMin + Math.random() * (intervalMax - intervalMin);
          await sleep(espera);
        }
      }

      emitToast(`Envio segmentado concluido para ${Math.min(recipients.length, 100)} clientes.`);
    } catch (error) {
      console.error("Falha no envio segmentado:", error);
      emitToast("Falha no envio segmentado.");
    } finally {
      emitDisparoStatus(false);
    }
  });

  socket.on("panel:schedule-message", (payload) => {
    const number = normalizeNumber(payload.number);
    const text = String(payload.text || "").trim();
    const sendAt = String(payload.sendAt || "").trim();
    if (!number || !text || !sendAt) return;

    const item = {
      id: createId(),
      number,
      text,
      sendAt,
      signatureId: payload.signatureId || null,
      status: "pending",
    };
    store.schedules.push(item);
    persistStore();
    emitSettings();
    schedulePendingMessage(item);
    emitToast(`Mensagem agendada para ${number}.`);
  });

  socket.on("panel:reply-status", async (payload) => {
    try {
      const contactNumber = normalizeNumber(payload.contactNumber || payload.number || "");
      const chatId = payload.chatId || (contactNumber ? `${contactNumber}@c.us` : null);
      const text = String(payload.text || payload.comment || "").trim();
      const statusSnippet = String(payload.statusSnippet || payload.statusBody || "").trim();
      if (!chatId || !text) return;

      const replyText = statusSnippet
        ? `💬 *Respondendo ao seu Status do WhatsApp:*\n> "${statusSnippet.slice(0, 100)}"\n\n${text}`
        : `💬 *Respondendo ao seu Status do WhatsApp:*\n\n${text}`;

      await sendDirectMessage({
        number: contactNumber,
        text: replyText,
        signatureId: payload.signatureId || null,
        chatId,
      });

      emitToast("Resposta ao Status enviada com sucesso!");
    } catch (error) {
      console.error("Falha ao responder ao status:", error);
      emitToast("Falha ao responder ao status.");
    }
  });

  socket.on("panel:send-product", async (payload) => {
    try {
      const number = normalizeNumber(payload.number || payload.chatId || "");
      const chatId = payload.chatId || (number ? `${number}@c.us` : null);
      const prod = payload.product || {};
      const precoFinal = Number(payload.price || prod.preco || 0);
      const custo = Number(prod.custo || 0);
      if (custo > 0 && precoFinal <= custo) {
        emitToast(`⛔ Envio bloqueado: preço (R$ ${precoFinal.toFixed(2)}) menor ou igual ao custo (R$ ${custo.toFixed(2)}).`);
        return;
      }
      const obs = payload.obs ? `\n\n_Obs: ${payload.obs}_` : "";
      const specs = prod.specs?.length ? `\n• ${prod.specs.join("\n• ")}` : "";
      const precoFmt = precoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

      const text = `⚡ *Oferta Balão da Informática*\n*${prod.nome}*\n\n💵 *Preço Especial:* *R$ ${precoFmt}*${specs}${obs}\n\n📍 Pronta entrega na loja do Castelo Campinas!\nPara reservar ou tirar dúvidas, é só responder aqui! 🎈`;

      let mediaSent = false;
      if (prod.imagem && prod.imagem.startsWith("http")) {
        try {
          const media = await MessageMedia.fromUrl(prod.imagem, { unsafeMime: true });
          await whatsappClient.sendMessage(chatId, media, { caption: text });
          mediaSent = true;
        } catch (e) {
          console.warn("Falha ao enviar imagem do produto via URL, enviando como texto:", e.message);
        }
      }

      if (!mediaSent) {
        await sendDirectMessage({
          number,
          text,
          signatureId: payload.signatureId || null,
          chatId,
        });
      }

      emitToast(`Produto "${prod.nome}" enviado com sucesso!`);
    } catch (error) {
      console.error("Falha ao enviar produto:", error);
      emitToast("Falha ao enviar produto.");
    }
  });

  socket.on("panel:post-status", async (payload) => {
    try {
      const text = String(payload.text || "").trim();
      const backgroundColor = payload.backgroundColor || "#0f9d58";
      await postStatus({ text, backgroundColor });
      await syncStatusFeed();
      emitToast("Status publicado com sucesso no WhatsApp!");
    } catch (error) {
      console.error("Falha ao publicar status:", error);
      emitToast("Falha ao publicar status.");
    }
  });
});

server.listen(port, () => {
  console.log(`WhatsApp panel server running on http://localhost:${port}`);
});
