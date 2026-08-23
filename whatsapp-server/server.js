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
      ? parsed.messages.filter((item) => item.chatId !== "status@broadcast").slice(-400)
      : [];
    store.chats = Array.isArray(parsed.chats) ? parsed.chats : [];
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
    const digits = getDigits(value);
    const looksFormattedPhone =
      value.startsWith("+") || value.includes("(") || value.includes(" ") || value.includes("-");
    const looksBarePhone = /^55\d{10,11}$/.test(digits) || /^\d{10,11}$/.test(digits);

    if ((looksFormattedPhone || looksBarePhone) && isLikelyPhoneDigits(digits)) {
      return formatDisplayNumber(digits);
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
  [...store.messages, ...messages.map(normalizeStoredMessage)].forEach((message) => {
    seen.set(buildMessageFingerprint(message), message);
  });
  store.messages = Array.from(seen.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-600);
}

function storeMessage(message) {
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

async function syncRecentConversations() {
  if (!whatsappClient || !whatsappState.connected) return;

  try {
    const chats = await whatsappClient.getChats();
    const relevantChats = chats
      .filter((chat) => !chat.isGroup && !chat.isStatus && !chat.id?._serialized?.includes("broadcast"))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 40);

    const syncedMessages = [];
    const chatSummaries = [];
    const labelAwareChats = [];

    for (const chat of relevantChats) {
      try {
        const messages = await chat.fetchMessages({ limit: 25 });
        const contact = await chat.getContact();
        const contactName =
          contact?.pushname || contact?.name || contact?.shortName || chat.name || chat.id.user || null;
        const realNumber = extractRealNumber(
          chat.name,
          contact?.name,
          contact?.pushname,
          contact?.shortName
        );
        const profilePicUrl = await contact?.getProfilePicUrl?.().catch(() => null);
        const latestMessage = messages[messages.length - 1] || chat.lastMessage || null;
        const assignedLabels = await chat.getLabels().catch(() => []);
        const assignedLabelNames = (assignedLabels || [])
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        // #region debug-point C:sync-chat-contact
        debugReport("C", "whatsapp-server/server.js:syncRecentConversations", "[DEBUG] syncing chat contact", {
          chatId: chat.id?._serialized || null,
          chatName: chat.name || null,
          contactName,
          realNumber,
          contactNumber: contact?.number || null,
          contactPushname: contact?.pushname || null,
          isMyContact: typeof contact?.isMyContact === "boolean" ? contact.isMyContact : null,
          messageCount: messages.length,
        });
        // #endregion

        chatSummaries.push({
          chatId: chat.id?._serialized || null,
          contactName,
          realNumber,
          displayNumber: realNumber,
          profilePicUrl,
          unreadCount: chat.unreadCount || 0,
          lastMessageBody: latestMessage?.body || "",
          lastMessageTimestamp:
            ((latestMessage?.timestamp || chat.timestamp || Math.floor(Date.now() / 1000)) * 1000),
          isGroup: Boolean(chat.isGroup),
          isArchived: Boolean(chat.archived),
          isPinned: Boolean(chat.pinned),
          isMuted: Boolean(chat.isMuted),
          muteExpiration: chat.muteExpiration || 0,
          assignedSellerId: getChatAssignment(chat.id?._serialized || ""),
        });
        if (assignedLabelNames.length) {
          store.chatLabels[chat.id?._serialized || ""] = assignedLabelNames;
        } else {
          delete store.chatLabels[chat.id?._serialized || ""];
        }
        labelAwareChats.push(chat);

        messages.forEach((message) => {
          const chatId = message.fromMe ? message.to || chat.id._serialized : message.from;
          syncedMessages.push({
            id: message.id?._serialized || createId(),
            chatId,
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
        console.error("Falha ao sincronizar conversa:", chat?.id?._serialized, error);
      }
    }

    mergeMessages(syncedMessages);
    await syncLabelsForChats(labelAwareChats);
    store.chats = chatSummaries.sort((a, b) => {
      if ((b.unreadCount || 0) !== (a.unreadCount || 0)) {
        return (b.unreadCount || 0) - (a.unreadCount || 0);
      }
      return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
    });
    rebuildNotifications();
    persistStore();
    emitChats();
    emitMessages();
    emitSettings();
    emitToast("Conversas sincronizadas com o WhatsApp.");
  } catch (error) {
    console.error("Falha ao sincronizar conversas do WhatsApp:", error);
    emitToast("Falha ao sincronizar conversas do WhatsApp.");
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
        const profilePicUrl = await contact?.getProfilePicUrl?.().catch(() => null);
        const contactName =
          contact?.pushname ||
          contact?.name ||
          contact?.shortName ||
          broadcast.id?.user ||
          "Status";

        feed.push({
          id: broadcast.id?._serialized || broadcast.id?.user || createId(),
          contactId: broadcast.id?._serialized || null,
          contactName,
          profilePicUrl,
          unreadCount: broadcast.unreadCount || 0,
          totalCount: broadcast.totalCount || broadcast.msgs?.length || 0,
          timestamp: (broadcast.timestamp || Math.floor(Date.now() / 1000)) * 1000,
          items: (broadcast.msgs || []).slice(-8).map((item) => ({
            id: item.id?._serialized || createId(),
            body: item.body || "",
            timestamp: (item.timestamp || Math.floor(Date.now() / 1000)) * 1000,
            hasMedia: Boolean(item.hasMedia),
            mediaType: item.type || null,
          })),
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

async function sendDirectMessage({ number, text, signatureId, chatId: preferredChatId = null }) {
  if (!whatsappState.connected) {
    throw new Error("WhatsApp ainda nao conectado");
  }

  const finalText = appendSignature(text, signatureId);
  const chatId = resolveChatTarget(number, preferredChatId);
  // #region debug-point B:send-direct-message
  debugReport("B", "whatsapp-server/server.js:sendDirectMessage", "[DEBUG] preparing direct message", {
    inputNumber: number,
    preferredChatId,
    normalizedChatId: chatId,
    textPreview: finalText.slice(0, 140),
    signatureId: signatureId || null,
  });
  // #endregion
  return whatsappClient.sendMessage(chatId, finalText);
}

async function sendDirectMedia({
  number,
  chatId: preferredChatId = null,
  media,
  caption = "",
  sendAudioAsVoice = false,
  sendMediaAsDocument = false,
}) {
  if (!whatsappState.connected) {
    throw new Error("WhatsApp ainda nao conectado");
  }

  const chatId = resolveChatTarget(number, preferredChatId);
  return whatsappClient.sendMessage(chatId, media, {
    caption,
    sendAudioAsVoice,
    sendMediaAsDocument,
    sendSeen: true,
  });
}

async function postStatus({ text = "", media = null, backgroundColor = "#b91c1c" }) {
  if (!whatsappState.connected) {
    throw new Error("WhatsApp ainda nao conectado");
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
        signatureId: item.signatureId || null,
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
        "--window-size=1280,800"
      ],
    },
    webVersionCache: {
      type: "local",
      path: path.join(__dirname, ".wwebjs_cache"),
    },
  });
}

function attachWhatsAppClientEvents(client) {
  client.on("qr", async (qr) => {
    whatsappState.status = "qr";
    whatsappState.connected = false;
    whatsappState.session = false;
    whatsappState.rawQr = qr;
    whatsappState.qrCode = await qrcode.toDataURL(qr, { width: 300, margin: 1 });
    emitState();
    emitToast("QR Code gerado. Escaneie com o WhatsApp.");
  });

  client.on("authenticated", () => {
    whatsappState.status = "authenticated";
    whatsappState.session = true;
    emitState();
    emitToast("Sessao autenticada com sucesso.");
  });

  client.on("ready", async () => {
    whatsappState.status = "ready";
    whatsappState.connected = true;
    whatsappState.session = true;
    whatsappState.qrCode = null;
    whatsappState.phoneNumber = client.info?.wid?.user || null;
    emitState();
    emitToast("WhatsApp conectado e pronto para uso.");
    await syncRecentConversations();
    await syncStatusFeed();
  });

  client.on("auth_failure", (message) => {
    whatsappState.status = "auth_failure";
    whatsappState.connected = false;
    whatsappState.session = false;
    whatsappState.qrCode = null;
    emitState();
    emitToast(`Falha na autenticacao: ${message}`);
  });

  client.on("disconnected", (reason) => {
    whatsappState.status = "disconnected";
    whatsappState.connected = false;
    whatsappState.session = false;
    whatsappState.qrCode = null;
    whatsappState.phoneNumber = null;
    emitState();
    emitToast(`WhatsApp desconectado: ${reason}`);
  });

  client.on("message", async (message) => {
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

    storeMessage({
      id: message.id?._serialized || createId(),
      chatId: message.to || message.from,
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
  const { resetSession = false } = options;
  if (isInitializingClient) return;
  isInitializingClient = true;

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
    emitToast("Falha ao iniciar o cliente do WhatsApp.");
  } finally {
    isInitializingClient = false;
  }
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

  socket.on("panel:reset-session", async () => {
    emitToast("Reiniciando a sessao do WhatsApp para gerar um novo QR Code.");
    await initializeWhatsAppClient({ resetSession: true });
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
      const number = normalizeNumber(payload.number);
      const text = String(payload.text || "").trim();
      if (!number || !text) return;
      // #region debug-point D:panel-send-message
      debugReport("D", "whatsapp-server/server.js:panel-send-message", "[DEBUG] panel send requested", {
        requestedNumber: payload.number || null,
        normalizedNumber: number,
        requestedChatId: payload.chatId || null,
        signatureId: payload.signatureId || null,
        textPreview: text.slice(0, 140),
      });
      // #endregion

      await sendDirectMessage({
        number,
        text,
        signatureId: payload.signatureId || null,
        chatId: payload.chatId || null,
      });
      emitToast(`Mensagem enviada para ${number}.`);
    } catch (error) {
      console.error("Falha ao enviar mensagem:", error);
      emitToast("Falha ao enviar mensagem.");
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
      const number = normalizeNumber(payload.number);
      const base64 = String(payload.base64 || "").trim();
      const mimetype = String(payload.mimetype || "").trim();
      const filename = String(payload.filename || "arquivo").trim();
      const caption = String(payload.caption || "").trim();
      if (!number || !base64 || !mimetype) return;

      const media = new MessageMedia(mimetype, base64, filename);
      await sendDirectMedia({
        number,
        chatId: payload.chatId || null,
        media,
        caption,
        sendAudioAsVoice: Boolean(payload.sendAudioAsVoice),
        sendMediaAsDocument: Boolean(payload.sendMediaAsDocument),
      });
      emitToast(`Midia enviada para ${number}.`);
    } catch (error) {
      console.error("Falha ao enviar midia:", error);
      emitToast("Falha ao enviar midia.");
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
    try {
      const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
      const text = String(payload.text || "").trim();
      if (!recipients.length || !text) return;

      for (const recipient of recipients.slice(0, 100)) {
        const number = normalizeNumber(recipient.number || "");
        if (!number) continue;
        await sendDirectMessage({
          number,
          text,
          signatureId: payload.signatureId || null,
          chatId: recipient.chatId || null,
        });
      }

      emitToast(`Envio segmentado concluido para ${Math.min(recipients.length, 100)} clientes.`);
    } catch (error) {
      console.error("Falha no envio segmentado:", error);
      emitToast("Falha no envio segmentado.");
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

  socket.on("panel:cancel-schedule", (payload) => {
    const id = String(payload.id || "").trim();
    const item = store.schedules.find((entry) => entry.id === id);
    if (!item) return;
    item.status = "cancelled";
    clearScheduleTimer(id);
    persistStore();
    emitSettings();
    emitToast("Agendamento cancelado.");
  });
});

server.listen(port, () => {
  console.log(`WhatsApp panel server running on http://localhost:${port}`);
});
