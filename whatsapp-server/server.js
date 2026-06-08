const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

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

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "panel-data.json");
const store = {
  labels: [],
  signatures: [],
  quickReplies: [],
  schedules: [],
  chatLabels: {},
  messages: [],
};

const scheduleTimers = new Map();
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
    store.messages = Array.isArray(parsed.messages) ? parsed.messages.slice(-400) : [];
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
  };

  fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2));
}

function emitState() {
  io.emit("whatsapp:state", whatsappState);
}

function emitSettings() {
  io.emit("whatsapp:settings", {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
  });
}

function emitMessages() {
  io.emit("whatsapp:messages", store.messages.slice(-300));
}

function emitToast(message) {
  io.emit("whatsapp:toast", { message });
}

function normalizeNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
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

    for (const chat of relevantChats) {
      try {
        const messages = await chat.fetchMessages({ limit: 25 });
        const contact = await chat.getContact();
        const contactName =
          contact?.pushname || contact?.name || contact?.shortName || chat.name || chat.id.user || null;

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
          });
        });
      } catch (error) {
        console.error("Falha ao sincronizar conversa:", chat?.id?._serialized, error);
      }
    }

    mergeMessages(syncedMessages);
    persistStore();
    emitMessages();
    emitToast("Conversas sincronizadas com o WhatsApp.");
  } catch (error) {
    console.error("Falha ao sincronizar conversas do WhatsApp:", error);
    emitToast("Falha ao sincronizar conversas do WhatsApp.");
  }
}

async function sendDirectMessage({ number, text, signatureId }) {
  if (!whatsappState.connected) {
    throw new Error("WhatsApp ainda nao conectado");
  }

  const finalText = appendSignature(text, signatureId);
  const chatId = toChatId(number);
  return whatsappClient.sendMessage(chatId, finalText);
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

function buildWhatsAppClient() {
  return new Client({
    authStrategy: new LocalAuth({
      clientId: "balao-whatsapp-panel",
      dataPath: path.join(__dirname, ".wwebjs_auth"),
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
    whatsappState.qrCode = await qrcode.toDataURL(qr);
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

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    status: whatsappState.status,
    connected: whatsappState.connected,
    session: whatsappState.session,
    phoneNumber: whatsappState.phoneNumber,
  });
});

io.on("connection", (socket) => {
  socket.emit("whatsapp:state", whatsappState);
  socket.emit("whatsapp:settings", {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
  });
  socket.emit("whatsapp:messages", store.messages.slice(-300));

  socket.on("panel:bootstrap", () => {
    socket.emit("whatsapp:state", whatsappState);
    socket.emit("whatsapp:settings", {
      labels: store.labels,
      signatures: store.signatures,
      quickReplies: store.quickReplies,
      schedules: store.schedules,
      chatLabels: store.chatLabels,
    });
    socket.emit("whatsapp:messages", store.messages.slice(-300));
  });

  socket.on("panel:reset-session", async () => {
    emitToast("Reiniciando a sessao do WhatsApp para gerar um novo QR Code.");
    await initializeWhatsAppClient({ resetSession: true });
  });

  socket.on("panel:sync-conversations", async () => {
    emitToast("Sincronizando conversas da conta conectada.");
    await syncRecentConversations();
  });

  socket.on("panel:send-message", async (payload) => {
    try {
      const number = normalizeNumber(payload.number);
      const text = String(payload.text || "").trim();
      if (!number || !text) return;

      await sendDirectMessage({
        number,
        text,
        signatureId: payload.signatureId || null,
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

  socket.on("panel:toggle-chat-label", (payload) => {
    const chatId = String(payload.chatId || "").trim();
    const label = String(payload.label || "").trim();
    if (!chatId || !label) return;

    const current = new Set(store.chatLabels[chatId] || []);
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    store.chatLabels[chatId] = Array.from(current);
    persistStore();
    emitSettings();
    emitMessages();
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
