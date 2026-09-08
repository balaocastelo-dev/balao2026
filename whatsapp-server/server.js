const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const qrcode = require("qrcode");
const { Client, LocalAuth, MessageMedia, MessageAck } = require("whatsapp-web.js");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const server = http.createServer(app);

// ============================================================
// Onde ficam os dados que precisam sobreviver a um restart.
//
// Sao dois: a sessao do WhatsApp (.wwebjs_auth) e a pasta data/
// (panel-data.json com etiquetas, kanban, respostas e notas de cliente,
// mais a midia baixada). Em container, os dois precisam estar em volume:
// esquecer a pasta data/ faz o WhatsApp continuar conectado enquanto todo
// o funil de vendas volta do zero.
//
// DATA_ROOT junta os dois embaixo de um caminho so, para um unico volume
// dar conta. Sem a variavel, tudo continua ao lado do codigo, como antes.
// ============================================================
const DATA_ROOT = process.env.DATA_ROOT || __dirname;
const DATA_DIR = path.join(DATA_ROOT, "data");
const AUTH_DIR = path.join(DATA_ROOT, ".wwebjs_auth");
const CACHE_DIR = path.join(DATA_ROOT, ".wwebjs_cache");

// Estas rotas de imagem ficam ANTES do middleware de CORS la embaixo, e no
// Express um middleware so vale para o que e registrado depois dele. Sem o
// header aqui, o painel (que carrega as imagens com crossOrigin="anonymous")
// nao conseguia exibir foto de perfil nem midia de conversa.
function liberarOrigemImagem(req, res) {
  const origem = req.headers.origin;
  if (origem && isOrigemPermitida(origem)) {
    res.header("Access-Control-Allow-Origin", origem);
    res.header("Vary", "Origin");
  }
}

// Rota para servir mídia baixada.
//
// O nome vem da URL, entao precisa ser tratado como entrada hostil: o Express
// decodifica o parametro, e um "%2e%2e%2f" viraria "../" e serviria arquivo de
// fora da pasta (a sessao do WhatsApp, por exemplo). basename() derruba
// qualquer caminho, e a checagem depois garante que o alvo ficou mesmo dentro
// da pasta de midia.
app.get("/api/crm/media/:filename", (req, res) => {
  liberarOrigemImagem(req, res);
  const filename = path.basename(String(req.params.filename || ""));
  if (!filename || filename === "." || filename === "..") {
    return res.status(400).send("Nome de arquivo inválido");
  }

  const mediaDir = path.join(DATA_DIR, "media");
  const filePath = path.resolve(mediaDir, filename);
  if (filePath !== path.resolve(mediaDir, path.basename(filePath))) {
    return res.status(400).send("Nome de arquivo inválido");
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).send("Mídia não encontrada");
  }
  res.sendFile(filePath);
});

// Fotos de perfil guardadas localmente (ver baixarAvatar). Mesmo cuidado da
// rota de mídia: o nome vem da URL e e tratado como entrada hostil.
app.get("/api/crm/foto/:arquivo", (req, res) => {
  liberarOrigemImagem(req, res);
  const arquivo = path.basename(String(req.params.arquivo || ""));
  if (!/^[0-9a-f]{40}\.jpg$/.test(arquivo)) {
    return res.status(400).send("Nome inválido");
  }

  const destino = path.resolve(path.join(DATA_DIR, "avatars"), arquivo);
  if (!fs.existsSync(destino) || !fs.statSync(destino).isFile()) {
    return res.status(404).send("Foto não encontrada");
  }

  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(destino);
});

// Endpoint para marcar chat como visto
app.post("/api/mark-seen", express.json(), async (req, res) => {
  const { chatId } = req.body;
  if (!chatId || !whatsappClient) {
    return res.status(400).json({ ok: false, erro: "chatId ou cliente não disponível" });
  }
  try {
    const chat = await whatsappClient.getChatById(chatId);
    if (chat) {
      await chat.sendSeen();
      res.json({ ok: true });
    } else {
      res.status(404).json({ ok: false, erro: "Chat não encontrado" });
    }
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

const port = Number(process.env.WHATSAPP_PANEL_PORT || 4100);

// Aceita mais de uma origem separada por virgula. Na pratica o site responde
// tanto em www.balao.info quanto em balao.info, e com uma origem so o painel
// abria numa e dava erro de conexao na outra.
const allowedOrigins = String(
  process.env.WHATSAPP_PANEL_ALLOWED_ORIGIN || "http://localhost:3000"
)
  .split(",")
  .map((origem) => origem.trim().replace(/\/$/, ""))
  .filter(Boolean);

function isOrigemPermitida(origem) {
  if (!origem) return true; // requisicoes sem Origin (curl, healthcheck)
  return allowedOrigins.includes(String(origem).replace(/\/$/, ""));
}

const io = new Server(server, {
  cors: {
    origin: (origem, callback) => callback(null, isOrigemPermitida(origem)),
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

// Assinatura do codigo que esta rodando: hash do proprio server.js.
//
// Serve para responder "esta VPS ja tem a ultima versao?" sem abrir o
// container. Sem isso, quando um comportamento nao mudava depois do deploy,
// nao dava para saber se o deploy nao pegou ou se a correcao estava errada —
// e as duas hipoteses levam a caminhos opostos.
const VERSAO_CODIGO = (() => {
  try {
    const conteudo = fs.readFileSync(__filename);
    return {
      hash: crypto.createHash("sha1").update(conteudo).digest("hex").slice(0, 12),
      bytes: conteudo.length,
      modificadoEm: fs.statSync(__filename).mtime.toISOString(),
    };
  } catch {
    return { hash: "desconhecido", bytes: 0, modificadoEm: null };
  }
})();

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

const dataDir = DATA_DIR;
const dataFile = path.join(dataDir, "panel-data.json");
const store = {
  labels: [],
  signatures: [],
  quickReplies: [],
  schedules: [],
  chatLabels: {},
  messages: [],
  chats: [],
  vendedores: [],
  // Kanban pessoal de cada vendedor: { [vendedorId]: { [chatId]: colunaId } }.
  // De propósito NÃO é um board único compartilhado — o mesmo cliente pode
  // estar em etapas diferentes pra vendedores diferentes.
  kanbanPorVendedor: {},
  // Preferências pessoais: { [vendedorId]: { kanbanColunas, assinaturaAuto… }.
  // Antes isso vivia só no localStorage do navegador, então o vendedor que
  // trocava de computador (ou limpava o cache) perdia as colunas do funil que
  // tinha criado. Aqui fica amarrado à pessoa, não à máquina.
  preferenciasPorVendedor: {},
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
  // Ultima falha ao subir o cliente, exposta no /status para dar para
  // diagnosticar de fora sem abrir os logs do container.
  ultimoErro: null,
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

function isStatusMessage(msg) {
  if (!msg) return false;
  const from = String(msg.from || msg.chatId || "");
  const to = String(msg.to || "");
  const remote = String(msg.id?.remote || msg.chatId || msg.id || "");
  const type = String(msg.type || "");

  if (
    msg.isStatus === true ||
    type === "status_v3" ||
    from === "status@broadcast" ||
    to === "status@broadcast" ||
    remote === "status@broadcast" ||
    from.endsWith("@broadcast") ||
    to.endsWith("@broadcast") ||
    remote.endsWith("@broadcast") ||
    from.includes("status@broadcast") ||
    to.includes("status@broadcast") ||
    remote.includes("status@broadcast") ||
    msg.broadcast === true
  ) {
    return true;
  }
  return false;
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
      ? parsed.messages
          .filter((item) => isRealDirectChatId(item.chatId) && !isStatusMessage(item))
          .slice(-2000)
      : [];
    store.chats = Array.isArray(parsed.chats)
      ? parsed.chats.filter(
          (item) => isRealDirectChatId(item.chatId || item.id) && !isStatusMessage(item)
        )
      : [];
    store.statusFeed = Array.isArray(parsed.statusFeed) ? parsed.statusFeed : [];
    store.chatAssignments =
      parsed.chatAssignments && typeof parsed.chatAssignments === "object"
        ? parsed.chatAssignments
        : {};
    store.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
    store.vendedores = Array.isArray(parsed.vendedores) ? parsed.vendedores : [];
    store.kanbanPorVendedor =
      parsed.kanbanPorVendedor && typeof parsed.kanbanPorVendedor === "object"
        ? parsed.kanbanPorVendedor
        : {};
    store.preferenciasPorVendedor =
      parsed.preferenciasPorVendedor && typeof parsed.preferenciasPorVendedor === "object"
        ? parsed.preferenciasPorVendedor
        : {};
  } catch (error) {
    console.error("Falha ao ler dados do painel do WhatsApp:", error);
  }
}

// ============================================================
// Historico por conversa.
//
// Antes tudo vivia numa lista unica, e o arquivo do painel guardava apenas as
// 400 mensagens mais recentes DO TOTAL. Com 542 conversas, isso dava menos de
// uma mensagem por conversa: o vendedor abria um cliente e via a tela vazia,
// mesmo depois de o historico ter sido baixado do WhatsApp.
//
// Agora cada conversa tem o proprio arquivo. Assim da para guardar centenas de
// mensagens por cliente sem reescrever tudo a cada mensagem nova, e o arquivo
// do painel volta a ser pequeno.
// ============================================================

const CONVERSAS_DIR = path.join(DATA_DIR, "conversas");
const MAX_MENSAGENS_POR_CONVERSA = 500;

function arquivoDaConversa(chatId) {
  const nome = crypto.createHash("sha1").update(String(chatId)).digest("hex");
  return path.join(CONVERSAS_DIR, `${nome}.json`);
}

function lerMensagensDaConversa(chatId) {
  try {
    const caminho = arquivoDaConversa(chatId);
    if (!fs.existsSync(caminho)) return [];
    const lista = JSON.parse(fs.readFileSync(caminho, "utf8"));
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    console.warn("[historico] Falha ao ler", chatId, "-", error.message);
    return [];
  }
}

function salvarMensagensDaConversa(chatId, mensagens) {
  try {
    if (!fs.existsSync(CONVERSAS_DIR)) fs.mkdirSync(CONVERSAS_DIR, { recursive: true });
    const ordenadas = [...mensagens]
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      .slice(-MAX_MENSAGENS_POR_CONVERSA);
    fs.writeFileSync(arquivoDaConversa(chatId), JSON.stringify(ordenadas));
    return ordenadas.length;
  } catch (error) {
    console.warn("[historico] Falha ao gravar", chatId, "-", error.message);
    return 0;
  }
}

// Gravar em disco a cada mensagem recebida seria custoso demais numa conversa
// movimentada; o atraso agrupa a rajada numa gravacao so por conversa.
const gravacoesPendentes = new Map();

function agendarGravacaoDaConversa(chatId) {
  if (!chatId || gravacoesPendentes.has(chatId)) return;

  gravacoesPendentes.set(
    chatId,
    setTimeout(() => {
      gravacoesPendentes.delete(chatId);
      const daConversa = store.messages.filter((m) => m.chatId === chatId);
      if (daConversa.length) {
        // Junta com o que ja estava gravado: a memoria guarda so as recentes.
        const guardadas = lerMensagensDaConversa(chatId);
        const porChave = new Map();
        [...guardadas, ...daConversa].forEach((m) => {
          porChave.set(buildMessageFingerprint(m), m);
        });
        salvarMensagensDaConversa(chatId, Array.from(porChave.values()));
      }
    }, 3000)
  );
}

function persistStore() {
  const payload = {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
    // Só as recentes ficam aqui, para o arquivo do painel continuar leve. O
    // histórico de verdade mora em data/conversas/, um arquivo por cliente.
    messages: store.messages.slice(-2000),
    chats: store.chats,
    statusFeed: store.statusFeed,
    chatAssignments: store.chatAssignments,
    notifications: store.notifications,
    vendedores: store.vendedores,
    kanbanPorVendedor: store.kanbanPorVendedor,
    preferenciasPorVendedor: store.preferenciasPorVendedor,
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

function emitNotifications() {
  io.emit("whatsapp:notifications", store.notifications);
}

function publicVendedor(v) {
  return { id: v.id, nome: v.nome, cargo: v.cargo || "", assinatura: v.assinatura || "" };
}

// Vendedores que entram pela pagina pessoal do site (ex.: /brendon). Quem
// valida a senha e o Next; aqui eles so precisam EXISTIR com um id estavel,
// porque esse id e a chave do kanban pessoal e da atribuicao de conversas.
// Sem esse seed, o primeiro acesso do vendedor cairia numa lista vazia.
function ensureVendedoresFixos() {
  const arquivo = path.join(__dirname, "vendedores-fixos.json");
  const conteudo = readJsonSafe(arquivo);
  const fixos = Array.isArray(conteudo?.vendedores) ? conteudo.vendedores : [];
  if (!fixos.length) return;

  let mudou = false;

  for (const fixo of fixos) {
    const id = String(fixo?.id || "").trim();
    const nome = String(fixo?.nome || "").trim();
    if (!id || !nome) continue;

    const existente = store.vendedores.find((v) => String(v.id) === id);

    if (!existente) {
      store.vendedores.push({
        id,
        nome,
        cargo: String(fixo.cargo || ""),
        assinatura: String(fixo.assinatura || ""),
        // Sem PIN de proposito: o login desse vendedor e a senha do site.
        pin: null,
        protegido: fixo.protegido !== false,
      });
      mudou = true;
      continue;
    }

    // Atualiza os dados de exibicao sem mexer no PIN de quem ja tinha um.
    if (
      existente.nome !== nome ||
      existente.cargo !== String(fixo.cargo || "") ||
      existente.assinatura !== String(fixo.assinatura || "") ||
      existente.protegido !== (fixo.protegido !== false)
    ) {
      existente.nome = nome;
      existente.cargo = String(fixo.cargo || "");
      existente.assinatura = String(fixo.assinatura || "");
      existente.protegido = fixo.protegido !== false;
      mudou = true;
    }
  }

  if (mudou) persistStore();
}

function emitVendedores() {
  io.emit("whatsapp:vendedores", store.vendedores.map(publicVendedor));
}

// ============================================================
// Faxina da pasta de midia.
//
// Toda foto, video, audio e documento que passa pelo WhatsApp e gravado em
// data/media para sobreviver ao refresh da pagina. Isso so cresce: numa loja
// com movimento sao alguns GB por mes, e disco cheio derruba o servidor.
// Aqui a pasta e podada por idade e, se ainda passar do teto, pelos arquivos
// mais antigos primeiro. O historico da conversa fica — some so o arquivo.
// ============================================================

const MEDIA_DIR = path.join(DATA_DIR, "media");

const MEDIA_RETENCAO_DIAS = Math.max(
  1,
  Number(process.env.MEDIA_RETENCAO_DIAS || 60) || 60
);
const MEDIA_LIMITE_MB = Math.max(
  100,
  Number(process.env.MEDIA_LIMITE_MB || 20000) || 20000
);
const MEDIA_LIMPEZA_HORAS = Math.max(
  1,
  Number(process.env.MEDIA_LIMPEZA_HORAS || 6) || 6
);
// A partir daqui o painel mostra aviso para quem administra.
const MEDIA_ALERTA_PERCENTUAL = 80;

function listarArquivosMidia() {
  if (!fs.existsSync(MEDIA_DIR)) return [];
  let nomes = [];
  try {
    nomes = fs.readdirSync(MEDIA_DIR);
  } catch (error) {
    console.warn("[midia] Nao consegui ler a pasta:", error.message);
    return [];
  }

  const arquivos = [];
  for (const nome of nomes) {
    const caminho = path.join(MEDIA_DIR, nome);
    try {
      const info = fs.statSync(caminho);
      if (info.isFile()) {
        arquivos.push({ caminho, bytes: info.size, mtime: info.mtimeMs });
      }
    } catch {
      // Arquivo sumiu no meio da varredura — segue o baile.
    }
  }
  return arquivos;
}

function estadoArmazenamento() {
  const arquivos = listarArquivosMidia();
  const bytes = arquivos.reduce((total, item) => total + item.bytes, 0);
  const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
  const percentual = Math.min(999, Math.round((mb / MEDIA_LIMITE_MB) * 100));

  return {
    arquivos: arquivos.length,
    mb,
    limiteMb: MEDIA_LIMITE_MB,
    percentual,
    retencaoDias: MEDIA_RETENCAO_DIAS,
    alerta: percentual >= MEDIA_ALERTA_PERCENTUAL,
  };
}

function emitArmazenamento() {
  io.emit("whatsapp:armazenamento", estadoArmazenamento());
}

function limparMidiaAntiga() {
  const arquivos = listarArquivosMidia();
  if (!arquivos.length) return { removidos: 0, bytesLiberados: 0 };

  const limiteIdade = Date.now() - MEDIA_RETENCAO_DIAS * 24 * 60 * 60 * 1000;
  let removidos = 0;
  let bytesLiberados = 0;

  const apagar = (item) => {
    try {
      fs.unlinkSync(item.caminho);
      removidos += 1;
      bytesLiberados += item.bytes;
      return true;
    } catch (error) {
      console.warn("[midia] Nao consegui apagar", item.caminho, "-", error.message);
      return false;
    }
  };

  // 1) Por idade.
  const restantes = [];
  for (const item of arquivos) {
    if (item.mtime < limiteIdade) {
      if (!apagar(item)) restantes.push(item);
    } else {
      restantes.push(item);
    }
  }

  // 2) Se ainda passa do teto, os mais antigos saem ate caber.
  const limiteBytes = MEDIA_LIMITE_MB * 1024 * 1024;
  let bytesAtuais = restantes.reduce((total, item) => total + item.bytes, 0);
  if (bytesAtuais > limiteBytes) {
    restantes.sort((a, b) => a.mtime - b.mtime);
    for (const item of restantes) {
      if (bytesAtuais <= limiteBytes) break;
      if (apagar(item)) bytesAtuais -= item.bytes;
    }
  }

  if (removidos > 0) {
    const mbLiberados = Math.round((bytesLiberados / (1024 * 1024)) * 10) / 10;
    console.log(
      `[midia] Faxina: ${removidos} arquivo(s) removido(s), ${mbLiberados} MB liberados.`
    );
    emitArmazenamento();
  }

  const estado = estadoArmazenamento();
  if (estado.alerta) {
    console.warn(
      `[midia] ATENCAO: ${estado.mb} MB de ${estado.limiteMb} MB (${estado.percentual}%). ` +
        `Reduza MEDIA_RETENCAO_DIAS (hoje ${MEDIA_RETENCAO_DIAS}) ou aumente o disco.`
    );
  }

  return { removidos, bytesLiberados };
}

function agendarLimpezaMidia() {
  limparMidiaAntiga();
  setInterval(limparMidiaAntiga, MEDIA_LIMPEZA_HORAS * 60 * 60 * 1000);
}

function emitLabels() {
  io.emit("whatsapp:labels", { labels: store.labels, chatLabels: store.chatLabels });
}

function emitStatusFeed() {
  io.emit("whatsapp:status-feed", store.statusFeed);
}

function emitToast(message) {
  io.emit("whatsapp:toast", { message });
}

// Confirmação real de envio, amarrada ao tempId que o painel gerou pro
// balão otimista. Sem isso, o chat mostrava "enviado" assim que o vendedor
// clicava, mesmo quando o whatsappClient.sendMessage() falhava de verdade
// (JID inválido, mídia que não baixou, sessão instável) — o vendedor via
// a mensagem "certinha" no CRM enquanto o cliente real não recebia nada.
function emitSendAck({ tempId, chatId, success, id, error, body }) {
  if (!tempId) return;
  io.emit("whatsapp:send-ack", {
    tempId,
    chatId,
    success,
    id: id || null,
    error: error || null,
    // Texto REALMENTE enviado ao cliente. O painel usa isso para corrigir o
    // balao otimista: quando ele monta um texto proprio e o servidor manda
    // outro, a mesma oferta aparecia como duas mensagens diferentes na tela.
    body: body || null,
  });
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

/**
 * Se o numero existe no WhatsApp.
 *
 * Devolve `true`, `false` ou `null` quando nao foi possivel checar — e nesse
 * caso o disparo segue mesmo assim, porque uma falha de consulta nao e prova
 * de que o cliente nao tem WhatsApp.
 */
async function numeroTemWhatsApp(numero) {
  if (!whatsappClient || !whatsappState.connected) return null;
  const limpo = getDigits(String(numero || ""));
  if (!limpo) return false;

  try {
    const id = await whatsappClient.getNumberId(limpo);
    return Boolean(id);
  } catch (error) {
    console.warn("[numero] Nao consegui verificar", limpo, "-", error.message);
    return null;
  }
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

// Segunda camada de proteção: mesmo que o cliente mande specs desatualizados
// ou um payload manual, o servidor nunca deve deixar custo de aquisição,
// markup aplicado ou nota sobre qualidade da foto vazar pra dentro de uma
// mensagem real enviada ao cliente no WhatsApp.
const SPEC_KEYS_INTERNOS = /^(custo_origem|markup|qualidade_fotos)\s*:/i;
function filtrarSpecsInternos(specs) {
  if (!Array.isArray(specs)) return [];
  return specs.filter((linha) => !SPEC_KEYS_INTERNOS.test(String(linha || "")));
}

/**
 * Monta a mensagem de oferta de um produto.
 *
 * Existe em um lugar so de proposito: o texto estava escrito em tres pontos
 * diferentes (duas vezes aqui e uma no painel) e eles sairam de sincronia —
 * o painel dizia "Oferta Balao da Informatica:" e "Para garantir a reserva",
 * o servidor dizia "Oferta Balao da Informatica" e "Para reservar". Como o
 * painel mostrava o proprio texto e o cliente recebia o do servidor, a mesma
 * oferta aparecia como duas mensagens distintas na tela do vendedor.
 */
function montarTextoDoProduto({ nome, preco, specs, obs }) {
  const precoFmt = Number(preco || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const specsVisiveis = filtrarSpecsInternos(specs);
  const linhasSpecs = specsVisiveis.length ? `\n• ${specsVisiveis.join("\n• ")}` : "";
  const linhaObs = obs && String(obs).trim() ? `\n\n_Obs: ${String(obs).trim()}_` : "";

  return (
    `⚡ *Oferta Balão da Informática*\n*${nome}*\n\n` +
    `💵 *Preço Especial:* *R$ ${precoFmt}*${linhasSpecs}${linhaObs}\n\n` +
    `📍 Pronta entrega na loja do Castelo Campinas!\n` +
    `Para reservar ou tirar dúvidas, é só responder aqui! 🎈`
  );
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

    // 10-11 dígitos: número local sem DDI (DDD + 8/9 dígitos) — prefixar "55"
    // é seguro aqui, é literalmente pra isso que serve.
    if (digits.length === 10 || digits.length === 11) {
      return `55${digits}`;
    }
    // 12-13 dígitos SÓ conta como número real se já vier com "55" na frente.
    // Sem essa exigência, um LID que por coincidência também tem 12-13
    // dígitos (ex: "2796493504750") virava um "número" fabricado prefixando
    // 55 na frente de um ID técnico que não tem nada a ver com telefone —
    // mostrava um número errado pro vendedor, sem relação com o contato real.
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
      return digits;
    }
  }
  return null;
}

// Um telefone de verdade tem DDI 55 + DDD + 8/9 digitos. O WhatsApp tambem
// entrega identificadores internos (@lid) com 15+ digitos, que NAO sao
// telefone — sem essa checagem eles apareciam na lista como se fossem, tipo
// "230188805845202".
function pareceTelefone(valor) {
  const digits = getDigits(String(valor || ""));
  if (digits.length === 12 || digits.length === 13) return digits.startsWith("55");
  return digits.length === 10 || digits.length === 11;
}

/**
 * Tira da lista o que nao e conversa de cliente:
 *
 *  - o proprio numero da loja (aparecia como se fosse um contato, porque toda
 *    mensagem enviada tem a loja como participante);
 *  - o MESMO contato repetido. O WhatsApp esta migrando de "numero@c.us" para
 *    "identificador@lid", e durante a transicao entrega os dois. Sem juntar,
 *    a pessoa aparecia duas vezes: uma com o telefone e outra com um numero
 *    comprido que nao e telefone nenhum.
 *
 * Quando ha duplicata, fica a versao com telefone de verdade, herdando o que
 * a outra tiver de melhor (nome, foto, nao lidas, mensagem mais recente).
 */
function deduplicarConversas(resumos, numeroProprio) {
  const proprio = getDigits(String(numeroProprio || ""));
  const porTelefone = new Map();
  const semTelefone = [];

  const melhorEntre = (a, b) => {
    // Mais recente manda no que e "estado atual" da conversa.
    const maisNovo = (b.lastMessageTimestamp || 0) > (a.lastMessageTimestamp || 0) ? b : a;
    const outro = maisNovo === a ? b : a;
    const nomeBom = (c) => c.contactName && !pareceTelefone(c.contactName) ? c.contactName : null;

    // Entre os dois ids do mesmo contato, fica o que NAO e @lid: e por ele
    // que da pra responder de forma confiavel. Os dois podem ter telefone
    // resolvido, entao olhar o telefone nao basta — o que decide e o formato
    // do proprio id.
    const idRespondivel = (c) => !String(c.chatId || "").endsWith("@lid");

    return {
      ...outro,
      ...maisNovo,
      chatId: idRespondivel(a)
        ? a.chatId
        : idRespondivel(b)
        ? b.chatId
        : maisNovo.chatId,
      contactName: nomeBom(maisNovo) || nomeBom(outro) || maisNovo.contactName,
      profilePicUrl: maisNovo.profilePicUrl || outro.profilePicUrl || null,
      unreadCount: Math.max(a.unreadCount || 0, b.unreadCount || 0),
    };
  };

  for (const resumo of resumos) {
    const digits = getDigits(resumo.realNumber || "");

    // Conversa consigo mesmo nao e atendimento. Duas formas de reconhecer: o
    // numero bate com o da loja, ou o proprio WhatsApp marcou o contato como
    // sendo voce — o que pega tambem o caso do @lid, que nao bate por numero.
    if (resumo.ehEu) continue;
    if (proprio && digits && digits === proprio) continue;

    if (pareceTelefone(digits)) {
      const existente = porTelefone.get(digits);
      porTelefone.set(digits, existente ? melhorEntre(existente, resumo) : resumo);
    } else {
      semTelefone.push(resumo);
    }
  }

  // Sobrou algum @lid sem telefone: so entra se o contato nao estiver ja na
  // lista pelo nome — senao seria a mesma pessoa aparecendo de novo.
  const nomesJaListados = new Set(
    Array.from(porTelefone.values())
      .map((c) => String(c.contactName || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const orfaos = semTelefone.filter((c) => {
    const nome = String(c.contactName || "").trim().toLowerCase();
    if (nome && nomesJaListados.has(nome)) return false;
    nomesJaListados.add(nome);
    return true;
  });

  return [...porTelefone.values(), ...orfaos];
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
      await garantirChatsCarregados({ forcar: true });
    } catch (error) {
      console.error("Falha ao atualizar resumo de chats:", error);
    } finally {
      chatRefreshTimer = null;
    }
  }, 1200);
}

// Controle da carga de conversas.
//
// Buscar a lista e cara: sao ate 300 chats, com as ultimas mensagens, nome do
// contato e foto de perfil de cada um. Com seis vendedores entrando de manha,
// disparar uma busca dessas por login derrubaria o ritmo do servidor. Entao:
// uma de cada vez, e so refaz se a ultima ja tiver idade.
let sincronizandoChats = false;
let ultimaSincronizacaoChats = 0;
const IDADE_MAXIMA_CHATS_MS = 60_000;

async function garantirChatsCarregados({ forcar = false } = {}) {
  if (!whatsappClient || !whatsappState.connected) return false;
  if (sincronizandoChats) return false;

  const idade = Date.now() - ultimaSincronizacaoChats;
  const temChats = store.chats.length > 0;
  // Lista vazia sempre vale uma busca: e o caso de quem acabou de logar e
  // encontraria a tela "Nenhuma conversa" sem motivo.
  if (!forcar && temChats && idade < IDADE_MAXIMA_CHATS_MS) return false;

  sincronizandoChats = true;
  try {
    await syncRecentConversations();
    ultimaSincronizacaoChats = Date.now();
    return true;
  } catch (error) {
    console.error("Falha ao carregar conversas:", error);
    return false;
  } finally {
    sincronizandoChats = false;
  }
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
    s.includes("status") ||
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

// Mensagens de mídia (foto, áudio, documento...) chegam com body="" — sem
// isso, o lead aparecia como "Sem mensagens" na lista mesmo tendo mandado
// uma foto de verdade, o que parecia (erradamente) um lead vazio.
const LEGENDA_POR_TIPO = {
  image: "📷 Foto",
  video: "🎥 Vídeo",
  ptt: "🎤 Áudio",
  audio: "🎵 Áudio",
  document: "📄 Documento",
  sticker: "🌟 Figurinha",
  location: "📍 Localização",
  vcard: "👤 Contato",
  multi_vcard: "👤 Contatos",
  call_log: "📞 Chamada",
  e2e_notification: "🔒 Notificação de segurança",
  poll_creation: "📊 Enquete",
};
function descreverMensagem(message) {
  if (!message) return "";
  if (message.body) return message.body;
  if (LEGENDA_POR_TIPO[message.type]) return LEGENDA_POR_TIPO[message.type];
  if (message.hasMedia) return "📎 Mídia";
  // `message` aqui às vezes é o `chat.lastMessage` (resumo leve do WhatsApp
  // Web, não um Message completo) quando chat.fetchMessages() falha pra
  // aquele chat — não tem type/hasMedia confiáveis, mas SABEMOS que existe
  // uma mensagem de verdade (é por isso que chegamos até aqui). Nunca
  // devolver "" nesse caso: isso fazia o lead aparecer como "Sem mensagens"
  // na lista quando na real ele tinha, sim, uma conversa.
  return "Mensagem";
}

function appendSignature(text, signatureId) {
  const signature = store.signatures.find((item) => item.id === signatureId);
  if (!signature) return text;

  return `${text}\n\n${signature.signature}\n${signature.sellerName}`;
}

/**
 * Identidade de uma mensagem, para nao guardar a mesma duas vezes.
 *
 * Quando ha id do WhatsApp, e SO ele que conta. A versao anterior misturava
 * timestamp e texto na conta, e a mesma mensagem chegando por caminhos
 * diferentes — o evento de envio e a leitura do historico — vinha com
 * timestamp levemente diferente e virava duas entradas. No painel isso
 * aparecia como a mensagem repetida, uma copia por etapa de entrega.
 *
 * Sem id (mensagem criada aqui antes da confirmacao), cai para a combinacao
 * de conversa, sentido, horario e texto.
 */
// Id que NAO veio do WhatsApp: fabricado aqui quando message.id._serialized
// vem vazio (acontece nesta versao do WhatsApp Web, mesmo problema do
// getChats()). Dois desses nunca sao iguais, entao nao servem para dizer se
// duas entradas sao a mesma mensagem.
const ID_FABRICADO = /^(msg-|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$)/i;

/**
 * Identidade de uma mensagem, para nao guardar a mesma duas vezes.
 *
 * Com id do WhatsApp, e so ele que conta.
 *
 * Sem id do WhatsApp, vale conversa + sentido + texto dentro de uma JANELA de
 * tempo. A janela e o ponto: a mesma mensagem chega por dois caminhos (o
 * envio guarda uma, o evento message_create guarda outra) com segundos de
 * diferenca — medido no servidor da loja, 00:47:14 e 00:47:15. Comparar o
 * timestamp exato fazia as duas passarem como distintas, e a oferta aparecia
 * repetida na tela do vendedor.
 */
const JANELA_MESMA_MENSAGEM_MS = 120_000;

function buildMessageFingerprint(message) {
  const id = String(message.id || "").trim();
  if (id && !ID_FABRICADO.test(id)) return `id::${id}`;

  // Sem id do WhatsApp, a identidade e o conteudo. O horario NAO entra na
  // chave — quem cuida da proximidade no tempo e `mesmaMensagem()`, porque
  // arredondar o horario em faixas separaria 00:47:59 de 00:48:01, que sao a
  // mesma mensagem.
  return [
    "conteudo",
    message.chatId || "",
    message.direction || "",
    (message.body || "").trim(),
  ].join("::");
}

/** Se duas entradas sem id do WhatsApp sao, na pratica, a mesma mensagem. */
function mesmaMensagem(a, b) {
  return (
    Math.abs(Number(a.timestamp || 0) - Number(b.timestamp || 0)) <=
    JANELA_MESMA_MENSAGEM_MS
  );
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
    .filter((m) => isRealDirectChatId(m.chatId) && !isStatusMessage(m))
    .forEach((message) => {
      const key = buildMessageFingerprint(message);
      const anterior = seen.get(key);

      // Chave de conteúdo só vale como "a mesma mensagem" se os horários
      // estiverem próximos: o cliente pode repetir "oi" no dia seguinte, e
      // isso é outra mensagem. Longe no tempo, guarda as duas.
      if (anterior && key.startsWith("conteudo::") && !mesmaMensagem(anterior, message)) {
        seen.set(`${key}::${message.timestamp}`, message);
        return;
      }

      // A ressincronização periódica do histórico (via chat.fetchMessages)
      // não baixa a mídia — sem isso, a foto sumia do chat assim que a
      // mesma mensagem era resincronizada, sobrescrevendo a versão que
      // guardava a mediaUrl no envio.
      seen.set(
        key,
        anterior?.mediaUrl && !message.mediaUrl ? { ...message, mediaUrl: anterior.mediaUrl } : message
      );
    });
  store.messages = Array.from(seen.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    // Em memória ficam as recentes; o histórico completo de cada cliente vai
    // para o arquivo da conversa, logo abaixo.
    .slice(-5000);

  // Grava o histórico das conversas que receberam mensagem agora.
  const conversasTocadas = new Set(
    messages.map((m) => m.chatId).filter((id) => id && isRealDirectChatId(id))
  );
  conversasTocadas.forEach(agendarGravacaoDaConversa);
}

function storeMessage(message) {
  if (!message || isStatusMessage(message) || !isRealDirectChatId(message.chatId)) return;
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

// As URLs de foto de perfil do WhatsApp EXPIRAM. Por isso o avatar aparecia e
// sumia sozinho: quando a lista era recarregada horas depois, o link ja nao
// valia mais e a foto virava a inicial cinza. Aqui a imagem e baixada uma vez
// e passa a ser servida por este servidor, com um caminho estavel.
const AVATAR_DIR = path.join(DATA_DIR, "avatars");
const AVATAR_VALIDADE_MS = 7 * 24 * 60 * 60 * 1000;

function nomeArquivoAvatar(chatId) {
  return crypto.createHash("sha1").update(String(chatId)).digest("hex") + ".jpg";
}

async function baixarAvatar(chatId, url) {
  if (!url || !url.startsWith("http")) return null;

  const arquivo = nomeArquivoAvatar(chatId);
  const destino = path.join(AVATAR_DIR, arquivo);

  try {
    // Ja temos uma copia recente? Nao baixa de novo.
    if (fs.existsSync(destino)) {
      const info = fs.statSync(destino);
      if (Date.now() - info.mtimeMs < AVATAR_VALIDADE_MS && info.size > 0) {
        return `/api/crm/foto/${arquivo}`;
      }
    }

    const resposta = await fetch(url);
    if (!resposta.ok) return null;

    const buffer = Buffer.from(await resposta.arrayBuffer());
    if (!buffer.length) return null;

    if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
    fs.writeFileSync(destino, buffer);
    return `/api/crm/foto/${arquivo}`;
  } catch (error) {
    console.warn("[avatar] Falha ao baixar foto de", chatId, "-", error.message);
    return null;
  }
}

async function getProfilePicUrlSafe(chatId) {
  if (!whatsappClient || !whatsappState.connected || !chatId || !isRealDirectChatId(chatId)) return null;
  try {
    const url = await whatsappClient.getProfilePicUrl(chatId);
    if (url && url.startsWith("data:")) return url;
    if (url && url.startsWith("http")) {
      // Guarda local primeiro; se o download falhar, ainda vale a URL original.
      return (await baixarAvatar(chatId, url)) || url;
    }
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

  // getFormattedNumber() é o método oficial da lib pra número real (usa a
  // própria resolução interna do WhatsApp Web, que às vezes acerta onde ler
  // contact.number/chat.id.user na mão não acerta — especialmente em
  // contatos @lid vinculados a conta business/API).
  let formattedNumber = null;
  try {
    if (contact && typeof contact.getFormattedNumber === "function") {
      formattedNumber = await contact.getFormattedNumber().catch(() => null);
    }
  } catch (e) {}

  let realNumber = extractRealNumber(
    contact?.number,
    formattedNumber,
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

  // Sufixo genérico (não só @c.us/@lid/@s.whatsapp.net) — se o WhatsApp usar
  // algum formato de JID novo, não queremos ele vazando pro nome/número.
  const cleanNum = realNumber || String(rawId || "").replace(/@.*$/, "");
  return {
    contactName: contactName || cleanNum,
    realNumber: cleanNum,
    displayNumber: cleanNum,
  };
}

// Contagem da ultima varredura, exposta no /status. Serve para descobrir ONDE
// as conversas somem quando a lista aparece vazia: se o WhatsApp nao entregou
// nada, se o filtro derrubou, ou se a juncao de duplicados zerou.
const ultimaVarredura = {
  quando: null,
  brutos: 0,
  aposFiltroId: 0,
  semMensagem: 0,
  comErro: 0,
  resumos: 0,
  aposDeduplicar: 0,
  // Que sinal de "esta conversa existe" o WhatsApp entregou. Serve para saber
  // em qual dado dá para confiar nesta versao do WhatsApp Web — ele mudou o
  // suficiente para fetchMessages()/lastMessage voltarem vazios.
  temFetch: 0,
  comMensagensBaixadas: 0,
  comLastMessage: 0,
  comTimestamp: 0,
  // Preenchido quando getChats() falha e caímos no caminho de emergência.
  erroGetChats: null,
};

/**
 * Le a lista de conversas direto dos modelos do WhatsApp Web.
 *
 * O `getChats()` da biblioteca quebra nesta versao do WhatsApp Web (o erro que
 * chega e so "r", nome de variavel do bundle minificado — nao da nem para
 * tratar). Sem isto o painel ficaria sem prévia da ultima mensagem, sem
 * arquivadas/fixadas e sem etiquetas.
 *
 * O formato devolvido imita o do Chat da biblioteca — inclusive `timestamp` em
 * SEGUNDOS, que e como o resto do codigo espera. A versao anterior devolvia em
 * milissegundos e o codigo multiplicava por mil de novo, jogando a data de
 * toda conversa para o ano 50000.
 */
async function lerChatsDaPagina() {
  if (!whatsappClient?.pupPage) return [];

  try {
    return await whatsappClient.pupPage.evaluate(async () => {
      const pegar = (fn, padrao = null) => {
        try {
          const v = fn();
          return v === undefined ? padrao : v;
        } catch {
          return padrao;
        }
      };

      const colecoes = window.require("WAWebCollections");
      const chats = pegar(() => colecoes.Chat.getModelsArray(), []) || [];

      return chats
        .filter((c) =>
          pegar(
            () =>
              !c.isGroup &&
              !c.isBroadcast &&
              !c.isNewsletter &&
              c.id?._serialized !== "status@broadcast",
            false
          )
        )
        .map((c) => {
          // A última mensagem mora na coleção de mensagens do próprio chat.
          const ultima = pegar(() => {
            const msgs = c.msgs;
            if (!msgs) return null;
            const m =
              (typeof msgs.last === "function" && msgs.last()) ||
              (Array.isArray(msgs.models) && msgs.models[msgs.models.length - 1]);
            if (!m) return null;
            return {
              body: m.body || m.caption || "",
              // `timestamp` (e não `t`) porque é o nome que o resto do código
              // espera, igual ao Message da biblioteca.
              timestamp: m.t || 0,
              type: m.type || null,
              fromMe: Boolean(m.id?.fromMe),
              hasMedia: Boolean(m.mediaData || m.isMedia),
            };
          }, null);

          return {
            id: pegar(() => c.id?._serialized, "") || "",
            user: pegar(() => c.id?.user, "") || "",
            name: pegar(() => c.name || c.formattedTitle || c.contact?.name, "") || "",
            unreadCount: pegar(() => c.unreadCount, 0) || 0,
            // Em SEGUNDOS, como o Chat da biblioteca.
            timestamp: pegar(() => c.t, 0) || 0,
            archived: Boolean(pegar(() => c.archive, false)),
            pinned: Boolean(pegar(() => c.pin, false)),
            isMuted: Boolean(pegar(() => c.mute?.isMuted, false)),
            // O próprio número da loja aparecia na lista como se fosse
            // cliente — às vezes com um @lid, que não bate com o telefone e
            // por isso escapava da comparação por número. O WhatsApp marca o
            // próprio contato, então é ele quem decide.
            ehEu: Boolean(
              pegar(() => c.contact?.isMe, false) || pegar(() => c.id?.isMe, false)
            ),
            lastMessage: ultima,
          };
        });
    });
  } catch (error) {
    console.error("[chats] Falha ao ler conversas da página:", error.message);
    return [];
  }
}

/**
 * Pede ao WhatsApp que traga do servidor dele as mensagens antigas de uma
 * conversa — o equivalente a rolar a conversa para cima no celular.
 *
 * Sem isso, `fetchMessages()` devolve apenas o que já estava carregado na
 * tela: alguns recados recentes. Cada rodada puxa mais um pedaço do passado.
 */
async function carregarMensagensAntigas(chatId, rodadas = 3) {
  if (!whatsappClient?.pupPage) return 0;

  try {
    return await whatsappClient.pupPage.evaluate(
      async (cid, vezes) => {
        try {
          const colecoes = window.require("WAWebCollections");
          const chat = colecoes.Chat.get(cid);
          if (!chat) return 0;

          let carregadas = 0;
          for (let i = 0; i < vezes; i++) {
            const antes = chat.msgs?.length || 0;

            // O nome do método mudou entre versões do WhatsApp Web; tenta os
            // conhecidos e para no primeiro que existir.
            if (typeof chat.loadEarlierMsgs === "function") {
              await chat.loadEarlierMsgs();
            } else if (chat.msgs && typeof chat.msgs.loadEarlierMsgs === "function") {
              await chat.msgs.loadEarlierMsgs();
            } else {
              const mod = window.require("WAWebChatLoadMessages");
              if (mod?.loadEarlierMsgs) await mod.loadEarlierMsgs(chat);
              else break;
            }

            const depois = chat.msgs?.length || 0;
            carregadas += depois - antes;
            // Nada novo veio: chegou ao começo da conversa.
            if (depois <= antes) break;
          }
          return carregadas;
        } catch {
          return 0;
        }
      },
      chatId,
      Math.min(10, Math.max(1, rodadas))
    );
  } catch (error) {
    console.warn("[historico] Não consegui puxar mensagens antigas:", error.message);
    return 0;
  }
}

/**
 * Baixa o historico das conversas em segundo plano, das mais recentes para as
 * mais antigas.
 *
 * Sem isto, so tinha historico a conversa que alguem ja tivesse aberto — as
 * demais apareciam vazias na primeira vez. Roda devagar de proposito: cada
 * conversa exige varias idas ao WhatsApp, e atropelar isso trava a sessao e
 * derruba o atendimento de todo mundo.
 */
let carregandoHistoricos = false;

async function carregarHistoricosEmSegundoPlano({ limite = 60, porConversa = 60 } = {}) {
  if (carregandoHistoricos) return { pulado: true };
  if (!whatsappClient || !whatsappState.connected) return { pulado: true };

  carregandoHistoricos = true;
  let baixadas = 0;
  let visitadas = 0;

  try {
    const alvos = [...store.chats]
      .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0))
      .slice(0, limite);

    for (const resumo of alvos) {
      if (!whatsappState.connected) break;

      const chatId = resumo.chatId;
      if (!chatId || !isRealDirectChatId(chatId)) continue;

      // Ja tem historico gravado? Passa para a proxima.
      if (lerMensagensDaConversa(chatId).length >= 10) continue;

      visitadas += 1;
      try {
        const chat = await getChatByIdSafe(chatId);
        if (!chat || typeof chat.fetchMessages !== "function") continue;

        await carregarMensagensAntigas(chatId, 2);
        const brutas = await chat.fetchMessages({ limit: porConversa }).catch(() => []);
        const uteis = (brutas || []).filter((m) => !isStatusMessage(m));
        if (!uteis.length) continue;

        const { contactName, realNumber } = await resolveContactDetails(chat, chatId);
        const convertidas = uteis.map((message) => ({
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
        }));

        salvarMensagensDaConversa(chatId, convertidas);
        baixadas += convertidas.length;

        // Respira entre conversas para nao sufocar a sessao do WhatsApp.
        await sleep(1500);
      } catch (error) {
        console.warn("[historico] Falha em", chatId, "-", error.message);
      }
    }

    if (baixadas) {
      console.log(
        `[historico] Segundo plano: ${baixadas} mensagens de ${visitadas} conversa(s).`
      );
    }
    return { visitadas, baixadas };
  } finally {
    carregandoHistoricos = false;
  }
}

async function syncRecentConversations() {
  if (!whatsappClient || !whatsappState.connected) return;

  try {
    let rawChats = [];
    try {
      rawChats = await whatsappClient.getChats();
    } catch (err) {
      // Guarda o motivo: quando getChats() falha, os chats vêm do caminho de
      // emergência abaixo como objetos simples, SEM os métodos da biblioteca
      // (fetchMessages, getLabels, archive…). O painel segue funcionando, mas
      // em modo reduzido — e sem registrar isso não dá para saber que se está
      // nesse modo.
      ultimaVarredura.erroGetChats = String(err?.message || err).slice(0, 300);
      console.warn("getChats() padrão falhou, usando sincronização via pupPage:", err.message);
      rawChats = await lerChatsDaPagina();
    }

    ultimaVarredura.quando = new Date().toISOString();
    ultimaVarredura.brutos = (rawChats || []).length;
    ultimaVarredura.semMensagem = 0;
    ultimaVarredura.comErro = 0;

    const relevantChats = (rawChats || [])
      .filter((chat) => {
        const rawId = chat.id?._serialized || chat.id || chat.chatId || "";
        return isRealDirectChatId(rawId) && !isStatusMessage(chat);
      })
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 1000);

    ultimaVarredura.aposFiltroId = relevantChats.length;

    const syncedMessages = [];
    const chatSummaries = [];
    const labelAwareChats = [];

    for (const chat of relevantChats) {
      const rawId = chat.id?._serialized || chat.id || chat.chatId || "";
      if (!isRealDirectChatId(rawId) || isStatusMessage(chat)) continue;

      try {
        let latestMessage = null;
        let messages = [];

        if (typeof chat.fetchMessages === "function") {
          ultimaVarredura.temFetch += 1;
          const rawMsgs = await chat.fetchMessages({ limit: 25 }).catch(() => []);
          messages = (rawMsgs || []).filter((m) => !isStatusMessage(m));
          if (messages.length) ultimaVarredura.comMensagensBaixadas += 1;
          latestMessage = messages[messages.length - 1] || (chat.lastMessage && !isStatusMessage(chat.lastMessage) ? chat.lastMessage : null);
        }
        if (chat.lastMessage) ultimaVarredura.comLastMessage += 1;
        if (chat.timestamp) ultimaVarredura.comTimestamp += 1;

        // Só entra na lista quem realmente trocou mensagem com a loja.
        //
        // A agenda tem muita coisa que não é atendimento: contato salvo que
        // nunca escreveu, e o "lead" que o WhatsApp cria sozinho quando alguém
        // clica num anúncio (Click-to-WhatsApp) sem mandar nada.
        //
        // Só que exigir a MENSAGEM em mãos não funciona nesta versão do
        // WhatsApp Web: medido no servidor da loja, 515 de 515 conversas reais
        // voltaram sem `fetchMessages()` e sem `lastMessage`, e a lista ficou
        // vazia. O `timestamp` do chat sobrevive a isso — ele é a hora da
        // última atividade, e só existe quando houve conversa. Um contato que
        // nunca trocou mensagem vem sem timestamp e sem não-lidas.
        //
        // A checagem vem ANTES de resolver contato e baixar foto de propósito:
        // essas são as partes caras, e não faz sentido pagá-las por quem seria
        // descartado logo depois.
        const referencia =
          latestMessage ||
          (chat.lastMessage && !isStatusMessage(chat.lastMessage) ? chat.lastMessage : null);
        const houveConversa =
          Boolean(referencia) ||
          Number(chat.timestamp || 0) > 0 ||
          Number(chat.unreadCount || 0) > 0;

        if (!houveConversa) {
          ultimaVarredura.semMensagem += 1;
          continue;
        }

        const { contactName, realNumber, displayNumber } = await resolveContactDetails(chat, rawId);
        const profilePicUrl = await getProfilePicUrlSafe(rawId);

        const assignedLabels = typeof chat.getLabels === "function" ? await chat.getLabels().catch(() => []) : [];
        const assignedLabelNames = (assignedLabels || [])
          .map((item) => String(item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        const bodyResumo = descreverMensagem(referencia);

        chatSummaries.push({
          chatId: rawId,
          contactName,
          realNumber,
          displayNumber,
          profilePicUrl,
          unreadCount: chat.unreadCount || 0,
          lastMessageBody: bodyResumo,
          lastMessageTimestamp:
            (referencia?.timestamp || chat.timestamp || Math.floor(Date.now() / 1000)) * 1000,
          isGroup: false,
          isArchived: Boolean(chat.archived),
          isPinned: Boolean(chat.pinned),
          isMuted: Boolean(chat.isMuted),
          muteExpiration: chat.muteExpiration || 0,
          assignedSellerId: getChatAssignment(rawId),
          // Marcação do próprio WhatsApp de que este contato é a própria loja.
          ehEu: Boolean(chat.ehEu),
        });

        if (assignedLabelNames.length) {
          store.chatLabels[rawId] = assignedLabelNames;
        }
        if (chat.id?._serialized) {
          labelAwareChats.push(chat);
        }

        (messages || []).forEach((message) => {
          if (isStatusMessage(message)) return;
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
        ultimaVarredura.comErro += 1;
        console.error("Falha ao sincronizar conversa individual:", rawId, error);
      }
    }

    mergeMessages(syncedMessages);
    if (labelAwareChats.length) {
      await syncLabelsForChats(labelAwareChats);
    }

    // Junta o mesmo contato que veio duas vezes (@c.us e @lid) e tira o
    // proprio numero da loja, ANTES de misturar com o que ja estava salvo.
    const resumosLimpos = deduplicarConversas(chatSummaries, whatsappState.phoneNumber);
    const idsValidos = new Set(resumosLimpos.map((c) => c.chatId));

    ultimaVarredura.resumos = chatSummaries.length;
    ultimaVarredura.aposDeduplicar = resumosLimpos.length;
    console.log(
      `[chats] Varredura: ${ultimaVarredura.brutos} brutos -> ${ultimaVarredura.aposFiltroId} apos filtro -> ` +
        `${ultimaVarredura.resumos} com conversa -> ${ultimaVarredura.aposDeduplicar} finais ` +
        `(sem conversa: ${ultimaVarredura.semMensagem}, com erro: ${ultimaVarredura.comErro}) | ` +
        `sinais: fetch=${ultimaVarredura.temFetch} msgs=${ultimaVarredura.comMensagensBaixadas} ` +
        `lastMessage=${ultimaVarredura.comLastMessage} timestamp=${ultimaVarredura.comTimestamp}`
    );

    const existingMap = new Map();
    (store.chats || []).forEach(c => {
      // So sobrevive o registro antigo cujo chat ainda aparece na varredura
      // atual. Sem isso, a duplicata (e o proprio numero) ficava salva para
      // sempre, mesmo depois de corrigida a origem.
      if (
        c && c.chatId &&
        isRealDirectChatId(c.chatId) &&
        !isStatusMessage(c) &&
        idsValidos.has(c.chatId)
      ) {
        existingMap.set(c.chatId, c);
      }
    });
    resumosLimpos.forEach(c => {
      if (c && c.chatId && isRealDirectChatId(c.chatId) && !isStatusMessage(c)) {
        existingMap.set(c.chatId, { ...(existingMap.get(c.chatId) || {}), ...c });
      }
    });

    store.chats = Array.from(existingMap.values())
      .filter((c) => isRealDirectChatId(c.chatId) && !isStatusMessage(c))
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

  // Entra pelo storeMessage, e nao com push direto no array.
  //
  // O push pulava a deduplicacao: em seguida o evento message_create do
  // WhatsApp registra a MESMA mensagem por outro caminho, e as duas ficavam
  // guardadas. Passando por aqui, a segunda e reconhecida como repetida e
  // nenhum evento extra vai para o painel.
  storeMessage(outMsg);

  // Devolve tambem o id usado no registro: quando o WhatsApp nao informa o
  // dele (`_serialized` vazio nesta versao), e por este id que o painel
  // consegue casar o balao provisorio com a mensagem de verdade.
  return { ...(sentMsg || {}), idRegistrado: outMsg.id };
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

  // Guarda a URL/data-URI original (não a mídia resolvida) pra imagem
  // continuar aparecendo no histórico do chat depois de recarregar a
  // página — sem isso a mensagem só tinha a legenda em texto.
  const mediaUrlParaExibir =
    typeof media === "string" && (media.startsWith("http") || media.startsWith("data:"))
      ? media
      : null;

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
    mediaUrl: mediaUrlParaExibir,
    realNumber: extractRealNumber(targetChatId),
    displayNumber: extractRealNumber(targetChatId),
    status: "sent",
  };
  // Mesmo motivo do envio de texto: pelo storeMessage, para passar pela
  // deduplicacao e pela gravacao no arquivo da conversa.
  storeMessage(outMsg);

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
ensureVendedoresFixos();
agendarLimpezaMidia();

// Onde procurar o navegador, em ordem. O whatsapp-web.js controla um Chrome
// de verdade; sem achar um, o initialize() falha e o painel fica em
// "disconnected" pra sempre, sem QR e sem dizer por que. Cada distro/imagem
// poe o binario num lugar (chromium, chromium-browser, google-chrome...),
// entao vale procurar em todos antes de desistir.
const CHROME_CANDIDATOS = [
  process.env.CHROME_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/snap/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

function acharChrome() {
  for (const caminho of CHROME_CANDIDATOS) {
    try {
      if (fs.existsSync(caminho)) return caminho;
    } catch {
      // Caminho invalido para esta plataforma — tenta o proximo.
    }
  }
  return null;
}

const CHROME_PATH = acharChrome();

if (CHROME_PATH) {
  console.log(`[whatsapp] Navegador: ${CHROME_PATH}`);
} else {
  console.warn(
    "[whatsapp] Nenhum navegador encontrado nos caminhos conhecidos:\n  " +
      CHROME_CANDIDATOS.join("\n  ") +
      "\n  Vou tentar o Chromium que vem com o Puppeteer. Se o painel ficar em" +
      "\n  'disconnected' sem gerar QR Code, e isto: instale o Chromium ou" +
      "\n  aponte CHROME_PATH para o executavel."
  );
}

// O Chromium tranca a pasta de perfil enquanto roda, para dois processos nao
// corromperem a mesma sessao. Se ele morre de forma abrupta — container
// derrubado num deploy, VPS reiniciada, OOM — a trava fica para tras. No boot
// seguinte ele encontra a trava, acha que outro Chromium esta usando o perfil
// e se recusa a abrir:
//
//   "The profile appears to be in use by another Chromium process (245) on
//    another computer (caaf34be0153)"
//
// O painel entao fica em "disconnected" para sempre, sem QR Code. Como aqui o
// perfil e usado por um processo so, uma trava sobrando e sempre resto de
// execucao anterior — limpar e seguro e evita ter que apagar a sessao inteira
// (o que custaria ler o QR Code de novo).
const ARQUIVOS_DE_TRAVA = ["SingletonLock", "SingletonCookie", "SingletonSocket"];

function limparTravasDoPerfil(dir = AUTH_DIR) {
  if (!fs.existsSync(dir)) return 0;

  let removidas = 0;
  let entradas = [];
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }

  for (const entrada of entradas) {
    const caminho = path.join(dir, entrada.name);
    if (ARQUIVOS_DE_TRAVA.includes(entrada.name)) {
      try {
        // force:true da conta de symlink quebrado, que e como o Chromium
        // costuma deixar o SingletonLock no Linux.
        fs.rmSync(caminho, { force: true });
        removidas += 1;
      } catch (error) {
        console.warn("[whatsapp] Nao consegui remover a trava", caminho, "-", error.message);
      }
    } else if (entrada.isDirectory()) {
      removidas += limparTravasDoPerfil(caminho);
    }
  }

  return removidas;
}

function buildWhatsAppClient() {
  const travas = limparTravasDoPerfil();
  if (travas > 0) {
    console.log(
      `[whatsapp] ${travas} trava(s) de perfil de execucao anterior removida(s).`
    );
  }

  // null => deixa o Puppeteer usar o navegador que ele mesmo baixou.
  const executablePath = CHROME_PATH || undefined;
  return new Client({
    authStrategy: new LocalAuth({
      clientId: "balao-whatsapp-panel",
      dataPath: AUTH_DIR,
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

// Bug fix: Configurar auto-download de mídia após cliente estar pronto
function configureAutoDownload(client) {
  try {
    client.setAutoDownloadPhotos(true);
    client.setAutoDownloadVideos(true);
    client.setAutoDownloadDocuments(true);
    client.setAutoDownloadAudio(true);
    console.log("[whatsapp] Auto-download de mídia ativado");
  } catch (e) {
    console.warn("[whatsapp] Falha ao configurar auto-download:", e.message);
  }
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
    // O WhatsApp Web às vezes dispara "loading_screen" DEPOIS do "ready"
    // (reflow interno da página). Sem essa guarda, o status voltava pra
    // "loading" com o cliente já conectado e funcional — só cosmético, mas
    // confundia quem checasse /health.
    if (!whatsappState.connected) {
      whatsappState.status = "loading";
      emitState();
    }
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
    // Conectou: a falha anterior nao interessa mais.
    whatsappState.ultimoErro = null;
    whatsappState.phoneNumber = client.info?.wid?.user || null;
    emitState();
    emitToast("WhatsApp conectado e pronto para uso.");
    // Só as conversas: o feed de status carrega quando alguém abrir a aba.
    await garantirChatsCarregados({ forcar: true });

    // Em seguida, e sem travar nada, vai baixando o historico das conversas
    // mais recentes — para o vendedor nao encontrar tela vazia ao abrir um
    // cliente pela primeira vez. O atraso deixa a conexao assentar antes.
    setTimeout(() => {
      carregarHistoricosEmSegundoPlano({ limite: 80 }).catch(() => {});
    }, 30_000);
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
    // Cair DEPOIS de conectado tem causa diferente de nao subir: costuma ser
    // o navegador morto por falta de memoria no meio da sincronizacao, ou
    // sessao encerrada no celular. Registrar o motivo evita ficar no escuro,
    // porque daqui de fora "qr" de novo parece so "esperando leitura".
    whatsappState.ultimoErro = {
      mensagem: `Sessao caiu depois de conectada. Motivo: ${reason}`,
      navegador: CHROME_PATH || "(nenhum encontrado)",
      quando: new Date().toISOString(),
    };
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
    if (isStatusMessage(message) || !isRealDirectChatId(message.from) || message.broadcast) {
      // Antes, todo status publicado por qualquer contato disparava uma
      // varredura do feed. Numa agenda grande isso e o dia inteiro carregando
      // gente que nao esta conversando com a loja. O feed agora e sob demanda.
      return;
    }

    let contactName = message._data?.notifyName || message._data?.pushname || null;
    let realNumber = extractRealNumber(message.from, contactName);

    if (!contactName || !realNumber) {
      try {
        const chat = await message.getChat();
        const resolved = await resolveContactDetails(chat, message.from);
        if (!contactName) contactName = resolved.contactName;
        if (!realNumber) realNumber = extractRealNumber(resolved.realNumber) || resolved.realNumber || null;
      } catch (e) {}
    }

    // Bug fix: Download media to disk so it survives page reloads
    let mediaUrl = null;
    if (message.hasMedia) {
      try {
        const media = await message.downloadMedia();
        if (media && media.data) {
          const mediaDir = MEDIA_DIR;
          if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
          const ext = media.mimetype ? media.mimetype.split("/")[1]?.split(";")[0] || "bin" : "bin";
          const filename = `${message.id?._serialized || createId()}.${ext}`;
          fs.writeFileSync(path.join(mediaDir, filename), Buffer.from(media.data, "base64"));
          mediaUrl = `/api/crm/media/${filename}`;
        }
      } catch (e) {
        console.warn("[whatsapp] Falha ao baixar mídia:", e.message);
      }
    }

    storeMessage({
      id: message.id?._serialized || createId(),
      chatId: message.from,
      from: message.from,
      body: message.body || "",
      direction: "in",
      timestamp: (message.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      contactName,
      realNumber,
      displayNumber: realNumber,
      hasMedia: Boolean(message.hasMedia),
      mediaType: message.type || null,
      mediaUrl,
    });
  });

  client.on("message_create", async (message) => {
    if (!message.fromMe) return;
    const targetChat = message.to || message.from;
    if (isStatusMessage(message) || !isRealDirectChatId(targetChat) || message.broadcast) {
      // Status publicado (por nos ou por um contato) nao recarrega o feed
      // sozinho — quem abre a aba de Status e que pede o carregamento.
      return;
    }

    // Nunca usar o JID cru (message.to) como nome — mesmo problema do @lid
    // do handler de mensagem recebida: tenta resolver nome/número reais
    // antes de desistir.
    let contactName = null;
    let realNumber = extractRealNumber(message.to, message.from);
    try {
      const chat = await message.getChat();
      const resolved = await resolveContactDetails(chat, targetChat);
      contactName = resolved.contactName;
      if (!realNumber) realNumber = extractRealNumber(resolved.realNumber) || resolved.realNumber || null;
    } catch (e) {}

    storeMessage({
      id: message.id?._serialized || createId(),
      chatId: targetChat,
      from: whatsappState.phoneNumber || "balao",
      to: message.to || null,
      body: message.body || "",
      direction: "out",
      timestamp: (message.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      contactName,
      realNumber,
      displayNumber: realNumber,
      hasMedia: Boolean(message.hasMedia),
      mediaType: message.type || null,
    });
  });

  // Confirmação real de entrega/leitura do WhatsApp — sem isso, o CRM não
  // tinha como saber se uma mensagem "enviada" (sendMessage() resolveu)
  // realmente chegou ao aparelho do cliente ou ficou presa no servidor do
  // WhatsApp (ACK_ERROR/ACK_PENDING).
  client.on("message_ack", (message, ack) => {
    const id = message?.id?._serialized;
    if (!id) return;

    const status =
      ack === MessageAck.ACK_ERROR
        ? "failed"
        : ack === MessageAck.ACK_READ || ack === MessageAck.ACK_PLAYED
        ? "read"
        : ack === MessageAck.ACK_DEVICE
        ? "delivered"
        : ack === MessageAck.ACK_SERVER
        ? "sent"
        : "pending";

    const stored = store.messages.find((m) => m.id === id);
    if (stored) {
      stored.status = status;
      persistStore();
      io.emit("whatsapp:message-status", { id, chatId: stored.chatId, status });
    }
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
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        fs.rmSync(CACHE_DIR, { recursive: true, force: true });
      } catch (error) {
        console.error("Falha ao limpar sessao/cache do WhatsApp:", error);
      }
    }

    const client = buildWhatsAppClient();
    attachWhatsAppClientEvents(client);
    whatsappClient = client;
    await client.initialize();
    configureAutoDownload(client);
  } catch (error) {
    console.error("Falha ao iniciar o cliente do WhatsApp:", error);
    whatsappState.status = "disconnected";
    whatsappState.connected = false;
    whatsappState.qrCode = null;
    // Guarda o motivo para aparecer no /status. Sem isso, "disconnected" e
    // tudo que se sabe de fora, e so os logs do container contam o porque —
    // o que faz o diagnostico remoto virar adivinhacao.
    whatsappState.ultimoErro = {
      mensagem: String(error?.message || error).slice(0, 400),
      navegador: CHROME_PATH || "(nenhum encontrado)",
      quando: new Date().toISOString(),
    };
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
  // Devolve a origem que pediu, quando ela esta na lista — um header com
  // varias origens separadas por virgula nao e valido e o navegador recusa.
  const origem = req.headers.origin;
  if (origem && isOrigemPermitida(origem)) {
    res.header("Access-Control-Allow-Origin", origem);
    res.header("Vary", "Origin");
  } else if (!origem) {
    res.header("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }
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
    armazenamento: estadoArmazenamento(),
    versao: VERSAO_CODIGO,
    navegador: CHROME_PATH || null,
    ultimoErro: whatsappState.ultimoErro || null,
    // Numeros para diagnosticar de fora quando a lista aparece vazia no
    // painel: da para saber se o servidor tem conversas e quando foi a
    // ultima varredura, sem precisar abrir os logs do container.
    conversas: {
      total: store.chats.length,
      mensagens: store.messages.length,
      ultimaSincronizacao: ultimaSincronizacaoChats
        ? new Date(ultimaSincronizacaoChats).toISOString()
        : null,
      sincronizando: sincronizandoChats,
      // Onde as conversas foram parar na ultima varredura.
      varredura: ultimaVarredura,
    },
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
    const text = montarTextoDoProduto({
      nome: prod.nome,
      preco: precoFinal,
      specs: prod.specs,
      obs,
    });

    let mediaSent = false;
    if (prod.imagem && prod.imagem.startsWith("http")) {
      try {
        const media = await MessageMedia.fromUrl(prod.imagem, { unsafeMime: true });
        const chatId = targetChat.includes("@") ? targetChat : `${normalizeNumber(targetChat)}@c.us`;
        const sentMsg = await resolveAndSendMessage(chatId, media, { caption: text });
        mediaSent = true;
        // Guarda a URL da foto do produto no histórico — sem isso a imagem
        // some do chat assim que a conversa ressincroniza (o listener
        // genérico de "message_create" não sabe qual foi a imagem enviada).
        storeMessage({
          id: sentMsg?.id?._serialized || `msg-produto-${Date.now()}`,
          chatId,
          from: "me",
          to: chatId,
          body: text,
          direction: "out",
          timestamp: Date.now(),
          hasMedia: true,
          mediaType: "image",
          mediaUrl: prod.imagem,
          realNumber: extractRealNumber(chatId),
          displayNumber: extractRealNumber(chatId),
        });
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
  socket.emit("whatsapp:vendedores", store.vendedores.map(publicVendedor));
  socket.emit("whatsapp:armazenamento", estadoArmazenamento());

  // Quem abre o painel — vendedor ou administração — deve encontrar a lista
  // de conversas pronta. O throttle interno evita que seis logins de manhã
  // virem seis varreduras seguidas.
  garantirChatsCarregados().catch(() => {});

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
    socket.emit("whatsapp:vendedores", store.vendedores.map(publicVendedor));
  });

  socket.on("panel:vendedor-login", (payload, callback) => {
    const pin = String(payload?.pin || "").trim();
    // Vendedor de pagina pessoal nao tem PIN (pin: null). Sem esta guarda, um
    // PIN vazio poderia casar com um registro sem PIN e abrir o painel.
    const vendedor = /^\d{4,6}$/.test(pin)
      ? store.vendedores.find((v) => v.pin && v.pin === pin)
      : null;
    const result = vendedor ? { ok: true, vendedor: publicVendedor(vendedor) } : { ok: false };
    if (typeof callback === "function") callback(result);
  });

  socket.on("panel:add-vendedor", (payload, callback) => {
    const nome = String(payload?.nome || "").trim();
    const pin = String(payload?.pin || "").trim();
    const cargo = String(payload?.cargo || "").trim();
    const assinatura = String(payload?.assinatura || "").trim();

    if (!nome || !/^\d{4,6}$/.test(pin)) {
      const result = { ok: false, erro: "Nome e PIN (4 a 6 numeros) sao obrigatorios." };
      if (typeof callback === "function") callback(result);
      emitToast(result.erro);
      return;
    }
    if (store.vendedores.some((v) => v.pin === pin)) {
      const result = { ok: false, erro: "Esse PIN ja esta em uso por outro vendedor." };
      if (typeof callback === "function") callback(result);
      emitToast(result.erro);
      return;
    }

    const novo = { id: createId(), nome, cargo, assinatura, pin };
    store.vendedores.push(novo);
    persistStore();
    emitVendedores();
    emitToast(`Vendedor ${nome} cadastrado.`);

    const result = { ok: true, vendedor: publicVendedor(novo) };
    if (typeof callback === "function") callback(result);
  });

  socket.on("panel:remove-vendedor", (payload) => {
    const id = String(payload?.id || "").trim();
    if (!id) return;

    // Vendedor de pagina pessoal e recriado no proximo boot pelo seed, entao
    // remove-lo aqui so apagaria o kanban dele sem tirar o acesso. Bloqueia e
    // avisa, em vez de fingir que funcionou.
    const alvo = store.vendedores.find((v) => String(v.id) === id);
    if (alvo?.protegido) {
      emitToast(
        `${alvo.nome} entra pela pagina pessoal do site. Para tirar o acesso, remova o registro em lib/vendedores.ts.`
      );
      return;
    }

    store.vendedores = store.vendedores.filter((v) => String(v.id) !== id);
    delete store.kanbanPorVendedor[id];
    persistStore();
    emitVendedores();
  });

  // Cada vendedor entra numa "sala" própria pra só receber o kanban dele —
  // nunca o de outro vendedor logado em outro PC ao mesmo tempo.
  socket.on("panel:identify-vendedor", (payload) => {
    const vendedorId = String(payload?.vendedorId || "").trim();
    if (!vendedorId) return;
    socket.join(`vendedor:${vendedorId}`);
    socket.emit("whatsapp:kanban", store.kanbanPorVendedor[vendedorId] || {});
    // Devolve as preferencias assim que a pessoa se identifica: e o que faz o
    // funil dela aparecer igual em qualquer computador da loja.
    socket.emit(
      "whatsapp:preferencias",
      store.preferenciasPorVendedor[vendedorId] || {}
    );

    // Entrega na hora o que ja esta em memoria, para a tela nunca abrir vazia,
    // e so entao busca o que faltar. De proposito NAO chama syncStatusFeed:
    // status sao publicacoes de contatos, nao atendimento — carregar isso no
    // login so gasta tempo e enche a tela de gente que nao esta conversando.
    socket.emit("whatsapp:chats", store.chats);
    garantirChatsCarregados().catch(() => {});
  });

  socket.on("panel:set-preferencias", (payload) => {
    const vendedorId = String(payload?.vendedorId || "").trim();
    const recebidas = payload?.preferencias;
    if (!vendedorId || !recebidas || typeof recebidas !== "object") return;

    // Teto de tamanho para o arquivo do painel nao virar deposito: sao
    // preferencias de tela, nao armazenamento geral.
    const serializado = JSON.stringify(recebidas);
    if (serializado.length > 200_000) {
      console.warn(
        `[prefs] Preferencias de ${vendedorId} grandes demais (${serializado.length} bytes) — ignorado.`
      );
      return;
    }

    store.preferenciasPorVendedor[vendedorId] = {
      ...(store.preferenciasPorVendedor[vendedorId] || {}),
      ...recebidas,
      atualizadoEm: Date.now(),
    };
    persistStore();

    // Avisa as OUTRAS abas/PCs do mesmo vendedor, nunca quem acabou de salvar
    // — devolver para a origem faria o painel reaplicar o que ele mesmo
    // mandou, e isso vira laco de salvar/receber sem fim.
    socket.broadcast
      .to(`vendedor:${vendedorId}`)
      .emit("whatsapp:preferencias", store.preferenciasPorVendedor[vendedorId]);
  });

  socket.on("panel:set-kanban-card", (payload) => {
    const vendedorId = String(payload?.vendedorId || "").trim();
    const chatId = String(payload?.chatId || "").trim();
    const colId = payload?.colId ? String(payload.colId) : null;
    if (!vendedorId || !chatId) return;

    if (!store.kanbanPorVendedor[vendedorId]) store.kanbanPorVendedor[vendedorId] = {};
    if (colId) {
      store.kanbanPorVendedor[vendedorId][chatId] = colId;
    } else {
      delete store.kanbanPorVendedor[vendedorId][chatId];
    }
    persistStore();
    io.to(`vendedor:${vendedorId}`).emit("whatsapp:kanban", store.kanbanPorVendedor[vendedorId]);
  });

  socket.on("panel:reset-session", () => {
    resetWhatsAppSession();
  });

  socket.on("panel:sync-conversations", async () => {
    emitToast("Sincronizando conversas da conta conectada.");
    await garantirChatsCarregados({ forcar: true });
  });

  // Historico de UMA conversa, buscado quando o vendedor abre ela.
  //
  // A varredura da lista nao traz mensagem nenhuma nesta versao do WhatsApp
  // Web (medido: 0 de 509 chats com fetchMessages), entao sem isto o vendedor
  // abre o cliente e encontra a tela vazia — sem saber o que ja foi falado.
  // getChatById() devolve um Chat de verdade, com os metodos da biblioteca,
  // mesmo quando getChats() falha.
  socket.on("panel:carregar-historico", async (payload, callback) => {
    const chatId = String(payload?.chatId || "").trim();
    const limite = Math.min(200, Math.max(10, Number(payload?.limite) || 50));

    const responder = (resultado) => {
      if (typeof callback === "function") callback(resultado);
    };

    if (!chatId || !isRealDirectChatId(chatId)) {
      responder({ ok: false, erro: "Conversa inválida." });
      return;
    }

    // Entrega na hora o que ja esta gravado desta conversa, antes de ir ao
    // WhatsApp. A tela deixa de abrir vazia enquanto a busca acontece.
    const jaGravadas = lerMensagensDaConversa(chatId);
    if (jaGravadas.length) {
      socket.emit("whatsapp:messages", jaGravadas);
    }

    try {
      const chat = await getChatByIdSafe(chatId);
      if (!chat || typeof chat.fetchMessages !== "function") {
        // Nao deu para falar com o WhatsApp agora — mas se o historico
        // gravado ja foi entregue acima, a conversa NAO esta vazia e nao ha
        // erro a mostrar para o vendedor.
        if (jaGravadas.length) {
          responder({ ok: true, total: jaGravadas.length, doDisco: true });
        } else {
          responder({ ok: false, erro: "Não foi possível abrir esta conversa no WhatsApp." });
        }
        return;
      }

      // O WhatsApp Web só entrega o que já carregou na tela. Para o vendedor
      // ver a conversa inteira, e não os últimos recados, é preciso pedir ao
      // WhatsApp que traga as mensagens mais antigas do servidor dele antes de
      // ler — é o mesmo que rolar a conversa para cima no celular.
      if (payload?.maisAntigas) {
        await carregarMensagensAntigas(chatId, Number(payload.maisAntigas) || 3);
      }

      const brutas = await chat.fetchMessages({ limit: limite }).catch(() => []);
      const uteis = (brutas || []).filter((m) => !isStatusMessage(m));

      const { contactName, realNumber } = await resolveContactDetails(chat, chatId);

      const convertidas = uteis.map((message) => ({
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
      }));

      mergeMessages(convertidas);

      // Grava JA, sem esperar o atraso: o vendedor acabou de abrir esta
      // conversa e o historico precisa estar em disco para a proxima vez.
      const guardadas = lerMensagensDaConversa(chatId);
      const porChave = new Map();
      [...guardadas, ...convertidas].forEach((m) => {
        porChave.set(buildMessageFingerprint(m), m);
      });
      const total = salvarMensagensDaConversa(chatId, Array.from(porChave.values()));

      persistStore();
      // Vai para todo mundo: a conversa e do numero da loja, e o historico
      // recem-baixado serve para qualquer vendedor que abrir depois.
      emitMessages();

      responder({ ok: true, total, baixadas: convertidas.length });
    } catch (error) {
      console.error("Falha ao carregar histórico de", chatId, error);
      responder({ ok: false, erro: "Falha ao carregar o histórico." });
    }
  });

  // Baixa o historico de MUITAS conversas de uma vez, sob demanda.
  //
  // A carga automatica ja roda ao conectar, mas cobre as mais recentes. Isto
  // e para quando se quer puxar o historico de tudo — vale deixar rodando e
  // ir atender enquanto isso.
  socket.on("panel:carregar-todos-historicos", async (payload, callback) => {
    const limite = Math.min(500, Math.max(10, Number(payload?.limite) || 200));

    if (carregandoHistoricos) {
      if (typeof callback === "function") {
        callback({ ok: false, erro: "Já existe um carregamento em andamento." });
      }
      return;
    }

    emitToast(`Buscando o histórico de até ${limite} conversas. Pode continuar atendendo.`);
    if (typeof callback === "function") callback({ ok: true, iniciado: true });

    const resultado = await carregarHistoricosEmSegundoPlano({
      limite,
      porConversa: 80,
    }).catch(() => null);

    if (resultado && !resultado.pulado) {
      emitToast(
        `Histórico atualizado: ${resultado.baixadas} mensagens de ${resultado.visitadas} conversa(s).`
      );
      emitMessages();
    }
  });

  // Status (as "stories" dos contatos) sao caros e nao fazem parte do
  // atendimento, entao so carregam quando alguem abre essa aba de proposito.
  socket.on("panel:sync-status", async () => {
    try {
      await syncStatusFeed();
    } catch (error) {
      console.error("Falha ao sincronizar status:", error);
      emitToast("Falha ao carregar os status.");
    }
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
    const chatIdRef = payload.chatId || null;
    try {
      const number = normalizeNumber(payload.number || payload.chatId || "");
      const chatId = payload.chatId || (number ? `${number}@c.us` : null);
      const text = String(payload.text || "").trim();
      if (!chatId || !text) return;

      const sent = await sendDirectMessage({
        number,
        text,
        signatureId: payload.signatureId || null,
        chatId,
        replyTo: payload.replyTo || null,
      });
      emitSendAck({
        tempId: payload.tempId,
        chatId,
        success: true,
        // idRegistrado cobre o caso do WhatsApp nao devolver id proprio.
        id: sent?.id?._serialized || sent?.idRegistrado || null,
      });
    } catch (error) {
      console.error("Falha ao enviar mensagem:", error);
      emitToast("⛔ Falha ao enviar mensagem: " + error.message);
      emitSendAck({ tempId: payload.tempId, chatId: chatIdRef, success: false, error: error.message });
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
    const chatIdRef = payload.chatId || null;
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

      const sent = await sendDirectMedia({
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
      emitSendAck({
        tempId: payload.tempId,
        chatId,
        success: true,
        // idRegistrado cobre o caso do WhatsApp nao devolver id proprio.
        id: sent?.id?._serialized || sent?.idRegistrado || null,
      });
    } catch (error) {
      console.error("Falha ao enviar mídia:", error);
      emitToast("⛔ Falha ao enviar mídia: " + error.message);
      emitSendAck({ tempId: payload.tempId, chatId: chatIdRef, success: false, error: error.message });
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
      let enviados = 0;
      let semWhatsApp = 0;
      let falharam = 0;

      for (let i = 0; i < lista.length; i++) {
        const number = normalizeNumber(lista[i].number || "");
        if (!number) continue;

        // Confere se o numero existe no WhatsApp ANTES de enviar. Disparar
        // para numero invalido e o que mais chama atencao do anti-spam — e a
        // lista de clientes sempre tem numero errado ou desativado.
        // Chat ja existente dispensa a checagem: se ha conversa, o numero e
        // valido, e cada consulta dessas custa tempo.
        if (!lista[i].chatId) {
          const existe = await numeroTemWhatsApp(number);
          if (existe === false) {
            semWhatsApp += 1;
            console.warn(`[disparo] ${number} nao tem WhatsApp — pulado.`);
            continue;
          }
        }

        try {
          await sendDirectMessage({
            number,
            text,
            signatureId: payload.signatureId || null,
            chatId: lista[i].chatId || null,
          });
          enviados += 1;
        } catch (sendError) {
          falharam += 1;
          console.error(`Falha ao enviar para ${number} no disparo segmentado:`, sendError.message);
        }
        if (i < lista.length - 1) {
          const espera = intervalMin + Math.random() * (intervalMax - intervalMin);
          await sleep(espera);
        }
      }

      const detalhes = [
        `${enviados} enviada(s)`,
        semWhatsApp ? `${semWhatsApp} sem WhatsApp` : null,
        falharam ? `${falharam} com erro` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      emitToast(`Envio segmentado concluido: ${detalhes}.`);
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
    const chatIdRef = payload.chatId || null;
    try {
      const number = normalizeNumber(payload.number || payload.chatId || "");
      const chatId = payload.chatId || (number ? `${number}@c.us` : null);
      const prod = payload.product || {};
      const precoFinal = Number(payload.price || prod.preco || 0);
      const custo = Number(prod.custo || 0);
      if (custo > 0 && precoFinal <= custo) {
        const msg = `Preço (R$ ${precoFinal.toFixed(2)}) menor ou igual ao custo (R$ ${custo.toFixed(2)}).`;
        emitToast(`⛔ Envio bloqueado: ${msg}`);
        emitSendAck({ tempId: payload.tempId, chatId, success: false, error: msg });
        return;
      }
      const text = montarTextoDoProduto({
        nome: prod.nome,
        preco: precoFinal,
        specs: prod.specs,
        obs: payload.obs,
      });

      let mediaSent = false;
      let sentId = null;
      if (prod.imagem && prod.imagem.startsWith("http")) {
        try {
          const media = await MessageMedia.fromUrl(prod.imagem, { unsafeMime: true });
          const sentMsg = await resolveAndSendMessage(chatId, media, { caption: text });
          mediaSent = true;
          // O WhatsApp Web nem sempre devolve o id (`_serialized` vem vazio
          // nesta versao). Quando isso acontece, fabricamos um — mas o MESMO
          // e usado no registro e na confirmacao, para o painel conseguir
          // casar o balao que ele criou com a mensagem de verdade.
          sentId = sentMsg?.id?._serialized || `msg-produto-${Date.now()}`;
          // Mesmo motivo do endpoint REST: guarda a mediaUrl explicitamente
          // pra foto do produto não sumir do histórico na próxima sincronização.
          storeMessage({
            id: sentId,
            chatId,
            from: "me",
            to: chatId,
            body: text,
            direction: "out",
            timestamp: Date.now(),
            hasMedia: true,
            mediaType: "image",
            mediaUrl: prod.imagem,
            realNumber: extractRealNumber(chatId),
            displayNumber: extractRealNumber(chatId),
          });
        } catch (e) {
          console.warn("Falha ao enviar imagem do produto via URL, enviando como texto:", e.message);
        }
      }

      if (!mediaSent) {
        const sentMsg = await sendDirectMessage({
          number,
          text,
          signatureId: payload.signatureId || null,
          chatId,
        });
        sentId = sentMsg?.id?._serialized || null;
      }

      emitToast(`Produto "${prod.nome}" enviado com sucesso!`);
      // Devolve o texto enviado para o painel corrigir o balao otimista.
      emitSendAck({ tempId: payload.tempId, chatId, success: true, id: sentId, body: text });
    } catch (error) {
      console.error("Falha ao enviar produto:", error);
      emitToast("⛔ Falha ao enviar produto: " + error.message);
      emitSendAck({ tempId: payload.tempId, chatId: chatIdRef, success: false, error: error.message });
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

  // ============================
  // NOVAS FUNCIONALIDADES SOCKET
  // ============================

  socket.on("panel:send-reaction", async (payload) => {
    try {
      const { messageId, reaction } = payload;
      await sendReaction(messageId, reaction);
      emitToast("Reação enviada!");
    } catch (e) {
      emitToast("Falha ao reagir: " + e.message);
    }
  });

  socket.on("panel:send-location", async (payload) => {
    try {
      const { chatId, lat, lng, description } = payload;
      const result = await sendLocation(chatId, lat, lng, description);
      emitToast("Localização enviada!");
      socket.emit("whatsapp:location-sent", result);
    } catch (e) {
      emitToast("Falha ao enviar localização: " + e.message);
    }
  });

  socket.on("panel:send-poll", async (payload) => {
    try {
      const { chatId, question, options } = payload;
      const result = await sendPoll(chatId, question, options);
      emitToast("Enquete criada!");
      socket.emit("whatsapp:poll-sent", result);
    } catch (e) {
      emitToast("Falha ao criar enquete: " + e.message);
    }
  });

  socket.on("panel:edit-message", async (payload) => {
    try {
      const { messageId, newText } = payload;
      await editMessage(messageId, newText);
      emitToast("Mensagem editada!");
    } catch (e) {
      emitToast("Falha ao editar: " + e.message);
    }
  });

  socket.on("panel:delete-message", async (payload) => {
    try {
      const { messageId, everyone } = payload;
      await deleteMessage(messageId, everyone);
      emitToast(everyone ? "Mensagem apagada para todos!" : "Mensagem apagada!");
    } catch (e) {
      emitToast("Falha ao apagar: " + e.message);
    }
  });

  socket.on("panel:star-message", async (payload) => {
    try {
      const { messageId, star } = payload;
      await starMessage(messageId, star);
      emitToast(star ? "Favoritado!" : "Desfavoritado!");
    } catch (e) {
      emitToast("Falha ao favoritar: " + e.message);
    }
  });

  socket.on("panel:forward-message", async (payload) => {
    try {
      const { messageId, targetChatId } = payload;
      await forwardMessage(messageId, targetChatId);
      emitToast("Mensagem encaminhada!");
    } catch (e) {
      emitToast("Falha ao encaminhar: " + e.message);
    }
  });

  socket.on("panel:search-messages", async (payload, callback) => {
    try {
      const { query, chatId, limit } = payload;
      const results = await searchMessages(query, chatId, limit);
      callback?.({ ok: true, results });
    } catch (e) {
      callback?.({ ok: false, error: e.message });
    }
  });

  socket.on("panel:get-contact", async (payload, callback) => {
    try {
      const contact = await getContactById(payload.contactId);
      callback?.({ ok: true, contact });
    } catch (e) {
      callback?.({ ok: false, error: e.message });
    }
  });

  socket.on("panel:set-presence", async (payload) => {
    try {
      await sendPresence(payload.available);
      emitToast("Presença atualizada!");
    } catch (e) {
      emitToast("Falha ao atualizar presença: " + e.message);
    }
  });

  socket.on("panel:mark-seen", async (payload) => {
    try {
      const chatId = String(payload?.chatId || "").trim();
      if (chatId && whatsappClient) {
        await whatsappClient.sendSeen(chatId);
      }
    } catch (e) {
      console.warn("Falha ao marcar como visto:", e.message);
    }
  });

});

server.listen(port, () => {
  console.log(`WhatsApp panel server running on http://localhost:${port}`);
});

// ============================
// NOVAS FUNCIONALIDADES
// ============================

// Buscar mensagens por texto
/**
 * Procura pelo texto dentro das conversas.
 *
 * Duas fontes, nesta ordem:
 *  1. o `searchMessages` da biblioteca, que varre o histórico inteiro no
 *     WhatsApp — quando funciona, é o mais completo;
 *  2. as mensagens que este servidor já guardou.
 *
 * O passo 2 não é só reserva: o `searchMessages` quebra nesta versão do
 * WhatsApp Web (mesmo problema do getChats()) e devolve vazio calado. Sem a
 * busca local, o vendedor digitava uma palavra que está na tela e recebia
 * "nada encontrado".
 */
async function searchMessages(query, chatId = null, limit = 50) {
  const termo = String(query || "").trim().toLowerCase();
  if (!termo) return [];

  const encontradas = new Map();

  if (whatsappClient && whatsappState.connected) {
    try {
      const results = await whatsappClient.searchMessages(query, { chatId, limit });
      (results || []).forEach((m) => {
        const id = m.id?._serialized;
        if (!id) return;
        encontradas.set(id, {
          id,
          chatId: m.fromMe ? m.to : m.from,
          body: m.body || "",
          timestamp: (m.timestamp || 0) * 1000,
          type: m.type,
          hasMedia: m.hasMedia,
        });
      });
    } catch (e) {
      console.warn("[search] searchMessages da lib falhou:", e.message);
    }
  }

  // Busca no que já está guardado aqui.
  for (const m of store.messages) {
    if (encontradas.size >= limit) break;
    if (chatId && m.chatId !== chatId) continue;
    if (encontradas.has(m.id)) continue;
    if (!String(m.body || "").toLowerCase().includes(termo)) continue;

    encontradas.set(m.id, {
      id: m.id,
      chatId: m.chatId,
      body: m.body || "",
      timestamp: m.timestamp || 0,
      type: m.mediaType || null,
      hasMedia: Boolean(m.hasMedia),
    });
  }

  return Array.from(encontradas.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, limit);
}

// Enviar reação
async function sendReaction(messageId, reaction) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const msg = await whatsappClient.getMessageById(messageId);
  if (!msg) throw new Error("Mensagem não encontrada");
  await msg.react(reaction);
  return { success: true };
}

// Enviar localização
async function sendLocation(chatId, lat, lng, description = "") {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const location = new (require('whatsapp-web.js').Location)(lat, lng, description);
  const sent = await whatsappClient.sendMessage(chatId, location);
  return { success: true, id: sent?.id?._serialized };
}

// Criar enquete
async function sendPoll(chatId, question, options) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const poll = await whatsappClient.sendMessage(chatId, {
    poll: {
      name: question,
      options: options.map(opt => ({ text: opt })),
      selectableOptionsCount: 1,
    }
  });
  return { success: true, id: poll?.id?._serialized };
}

// Editar mensagem
async function editMessage(messageId, newText) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const msg = await whatsappClient.getMessageById(messageId);
  if (!msg) throw new Error("Mensagem não encontrada");
  await msg.edit(newText);
  return { success: true };
}

// Apagar mensagem para todos
async function deleteMessage(messageId, everyone = false) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const msg = await whatsappClient.getMessageById(messageId);
  if (!msg) throw new Error("Mensagem não encontrada");
  await msg.delete(everyone);
  return { success: true };
}

// Favoritar/desfavoritar
async function starMessage(messageId, star = true) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const msg = await whatsappClient.getMessageById(messageId);
  if (!msg) throw new Error("Mensagem não encontrada");
  if (star) await msg.star();
  else await msg.unstar();
  return { success: true };
}

// Encaminhar mensagem
async function forwardMessage(messageId, targetChatId) {
  if (!whatsappClient) throw new Error("Cliente não disponível");
  const msg = await whatsappClient.getMessageById(messageId);
  if (!msg) throw new Error("Mensagem não encontrada");
  await msg.forward(targetChatId);
  return { success: true };
}

// Mensagens fixadas
async function getPinnedMessages(chatId) {
  if (!whatsappClient) return [];
  const chat = await whatsappClient.getChatById(chatId);
  if (!chat) return [];
  const pinned = await chat.getPinnedMessages();
  return pinned.map(m => ({
    id: m.id?._serialized,
    body: m.body || "",
    timestamp: (m.timestamp || 0) * 1000,
    type: m.type,
    hasMedia: m.hasMedia,
  }));
}

// Estado de presença
async function sendPresence(available) {
  if (!whatsappClient) return;
  if (available) await whatsappClient.sendPresenceAvailable();
  else await whatsappClient.sendPresenceUnavailable();
}

// Buscar contato
async function getContactById(contactId) {
  if (!whatsappClient) return null;
  try {
    const contact = await whatsappClient.getContactById(contactId);
    return {
      id: contact.id?._serialized,
      name: contact.name || contact.pushname,
      number: contact.number,
      isBlocked: contact.isBlocked,
      isBusiness: contact.isBusiness,
      isMyContact: contact.isMyContact,
    };
  } catch (e) {
    return null;
  }
}

// Buscar contatos bloqueados
async function getBlockedContacts() {
  if (!whatsappClient) return [];
  try {
    const blocked = await whatsappClient.getBlockedContacts();
    return blocked.map(c => ({
      id: c.id?._serialized,
      name: c.name || c.pushname,
      number: c.number,
    }));
  } catch (e) {
    return [];
  }
}

module.exports = {
  searchMessages,
  sendReaction,
  sendLocation,
  sendPoll,
  editMessage,
  deleteMessage,
  starMessage,
  forwardMessage,
  getPinnedMessages,
  sendPresence,
  getContactById,
  getBlockedContacts,
};
