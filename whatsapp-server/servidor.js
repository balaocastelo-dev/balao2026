// Servidor do WhatsApp da loja — versão Evolution API.
//
// O que mudou em relação ao server.js antigo (whatsapp-web.js + Chromium):
//  - quem conversa com o WhatsApp é a Evolution API (Baileys), num container
//    ao lado. Nada de navegador escondido: foto, vídeo, áudio e documento
//    usam o mesmo protocolo do celular, e o id de cada envio é o id real;
//  - todo socket e toda rota de envio exigem o ingresso emitido pelo site
//    (ver evo/acesso.js). Antes, qualquer um lia e mandava mensagens;
//  - nenhum "sucesso" inventado: se a Evolution recusar, o painel fica
//    sabendo o motivo;
//  - conversas @lid são traduzidas para o número de telefone sempre que o
//    WhatsApp informa o par, e o histórico vem do banco da Evolution.
//
// O painel do site (components/crm/CrmWhatsAppClient.tsx) continua falando o
// mesmo "idioma" de eventos de antes (panel:* / whatsapp:*).

const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const { Server } = require("socket.io");

const { criarEvolution, ErroEvolution } = require("./evo/evolution");
const { criarAcesso } = require("./evo/acesso");
const N = require("./evo/normalizar");
const { criarEspelhoDoCatalogo } = require("./catalogo");

process.on("unhandledRejection", (motivo) => console.warn("[processo] promessa rejeitada:", motivo?.message || motivo));
process.on("uncaughtException", (erro) => console.warn("[processo] exceção:", erro?.message || erro));

// ------------------------------------------------------------------
// Configuração
// ------------------------------------------------------------------
const DATA_ROOT = process.env.DATA_ROOT || __dirname;
const DATA_DIR = path.join(DATA_ROOT, "data");
const MIDIA_DIR = path.join(DATA_DIR, "midia");
const FOTOS_DIR = path.join(DATA_DIR, "fotos");
const ARQUIVO_PAINEL = path.join(DATA_DIR, "panel-data.json");
const PORTA = Number(process.env.PORT || process.env.WHATSAPP_PANEL_PORT || 4100);
const SITE_URL = (process.env.SITE_URL || "https://www.balao.info").replace(/\/$/, "");
const INSTANCIA = process.env.EVOLUTION_INSTANCIA || "loja";
// Segunda linha, usada só no teste cruzado (recebe o que a loja manda e
// confirma que chegou de verdade, com a mídia baixável).
const INSTANCIA_TESTE = process.env.EVOLUTION_INSTANCIA_TESTE || "fora";
const WEBHOOK_URL = process.env.WEBHOOK_URL_INTERNA || `http://balao-whats:${PORTA}/evolution/webhook`;
const ORIGENS = String(process.env.WHATSAPP_PANEL_ALLOWED_ORIGIN || "https://www.balao.info,https://balao.info")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const VERSAO = (() => {
  try {
    return fs.readFileSync(path.join(__dirname, "VERSAO"), "utf8").trim();
  } catch {
    return process.env.VERSAO || "dev";
  }
})();

for (const pasta of [DATA_DIR, MIDIA_DIR, FOTOS_DIR]) fs.mkdirSync(pasta, { recursive: true });

function lerOuCriarSegredo(nomeVar, arquivo) {
  if (process.env[nomeVar]) return process.env[nomeVar];
  const caminho = path.join(DATA_ROOT, arquivo);
  try {
    return fs.readFileSync(caminho, "utf8").trim();
  } catch {
    const novo = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(caminho, novo, { mode: 0o600 });
    return novo;
  }
}

// Segredo que a Evolution manda no cabeçalho de cada webhook. Sem ele,
// qualquer um poderia forjar "mensagem recebida" para o painel.
const SEGREDO_WEBHOOK = lerOuCriarSegredo("WEBHOOK_SEGREDO", "webhook.segredo");

const evolution = criarEvolution({
  url: process.env.EVOLUTION_URL || "http://evolution:8080",
  chave: process.env.EVOLUTION_API_KEY,
});
const acesso = criarAcesso({ urlDoSite: SITE_URL });
const espelhoDoCatalogo = criarEspelhoDoCatalogo({ pasta: DATA_DIR, urlDoSite: SITE_URL });
setTimeout(() => espelhoDoCatalogo.atualizar({ motivo: "boot" }), 20_000).unref?.();
setInterval(() => espelhoDoCatalogo.atualizar({ motivo: "agendado" }), 30 * 60_000).unref?.();

// ------------------------------------------------------------------
// Dados do painel (mesmo arquivo do servidor antigo: vendedores, funil,
// preferências e atribuições continuam de onde estavam).
// ------------------------------------------------------------------
const store = {
  labels: [],
  signatures: [],
  quickReplies: [],
  schedules: [],
  chatLabels: {},
  chatAssignments: {},
  notifications: [],
  vendedores: [],
  kanbanPorVendedor: {},
  preferenciasPorVendedor: {},
  statusFeed: [],
  // Novos
  lids: {}, // "123@lid" -> "5519..." (aprendido com o próprio WhatsApp)
  transcricoes: {}, // idMensagem -> texto
  notas: {}, // chatId -> nota do cliente
  nomes: {}, // chatId -> nome que o próprio cliente usa no WhatsApp
  fotos: {}, // número -> { em, tem } última consulta da foto de perfil
};

function carregarStore() {
  try {
    const salvo = JSON.parse(fs.readFileSync(ARQUIVO_PAINEL, "utf8"));
    for (const chave of Object.keys(store)) {
      if (salvo[chave] === undefined) continue;
      const esperado = Array.isArray(store[chave]) ? "array" : "object";
      const veio = Array.isArray(salvo[chave]) ? "array" : typeof salvo[chave];
      if (veio === esperado) store[chave] = salvo[chave];
    }
  } catch (erro) {
    if (erro.code !== "ENOENT") console.error("[painel] Não consegui ler panel-data.json:", erro.message);
  }
}

let gravacaoPendente = null;
function salvarStore() {
  if (gravacaoPendente) return;
  gravacaoPendente = setTimeout(() => {
    gravacaoPendente = null;
    const ids = Object.keys(store.transcricoes);
    if (ids.length > 5000) for (const id of ids.slice(0, ids.length - 5000)) delete store.transcricoes[id];
    const temp = `${ARQUIVO_PAINEL}.tmp`;
    try {
      fs.writeFileSync(temp, JSON.stringify(store, null, 1));
      fs.renameSync(temp, ARQUIVO_PAINEL);
    } catch (erro) {
      console.error("[painel] Falha ao gravar:", erro.message);
    }
  }, 400);
}

carregarStore();

function garantirVendedoresFixos() {
  let fixos = [];
  try {
    fixos = JSON.parse(fs.readFileSync(path.join(__dirname, "vendedores-fixos.json"), "utf8")).vendedores || [];
  } catch {
    return;
  }
  for (const fixo of fixos) {
    const id = String(fixo?.id || "").trim();
    const nome = String(fixo?.nome || "").trim();
    if (!id || !nome) continue;
    const existente = store.vendedores.find((v) => String(v.id) === id);
    const dados = {
      nome,
      cargo: String(fixo.cargo || ""),
      assinatura: String(fixo.assinatura || ""),
      protegido: fixo.protegido !== false,
    };
    if (existente) Object.assign(existente, dados);
    else store.vendedores.push({ id, pin: null, ...dados });
  }
  salvarStore();
}
garantirVendedoresFixos();

const publicoVendedor = (v) => ({ id: v.id, nome: v.nome, cargo: v.cargo || "", assinatura: v.assinatura || "" });

// ------------------------------------------------------------------
// Estado da conexão e memória de conversas
// ------------------------------------------------------------------
const estado = {
  status: "initializing",
  connected: false,
  session: false,
  qrCode: null,
  rawQr: null,
  phoneNumber: null,
  perfil: null,
  ultimoErro: null,
  motor: "evolution",
};

const conversas = new Map(); // chatId -> resumo
const mensagensPorChat = new Map(); // chatId -> Map(id -> msg)
const LIMITE_POR_CHAT = 400;
let ultimaSincronizacao = null;

const lidParaNumero = (lid) => store.lids[lid] || null;

function aprenderLid(chave) {
  const par = N.jidDaChave(chave || {});
  if (par.lid && par.jid && !N.ehLid(par.jid)) {
    const numero = N.digitos(par.jid);
    if (numero && store.lids[par.lid] !== numero) {
      store.lids[par.lid] = numero;
      migrarChaveDeConversa(par.lid, `${numero}@c.us`);
      salvarStore();
    }
  }
}

// Conversa que estava salva como @lid (funil, vendedor, etiqueta) passa a
// valer para o número assim que o WhatsApp revela o par.
function migrarChaveDeConversa(antigo, novo) {
  const mover = (obj) => {
    if (obj && obj[antigo] !== undefined && obj[novo] === undefined) {
      obj[novo] = obj[antigo];
      delete obj[antigo];
    }
  };
  mover(store.chatAssignments);
  mover(store.chatLabels);
  mover(store.notas);
  mover(store.nomes);
  for (const k of Object.values(store.kanbanPorVendedor || {})) mover(k);
  if (conversas.has(antigo)) {
    const c = conversas.get(antigo);
    conversas.delete(antigo);
    conversas.set(novo, { ...c, chatId: novo, realNumber: N.digitos(novo), displayNumber: N.digitos(novo) });
  }
  if (mensagensPorChat.has(antigo)) {
    const velhas = mensagensPorChat.get(antigo);
    mensagensPorChat.delete(antigo);
    const destino = mensagensPorChat.get(novo) || new Map();
    for (const [id, m] of velhas) destino.set(id, { ...m, chatId: novo });
    mensagensPorChat.set(novo, destino);
  }
}

function aprenderNome(msg) {
  if (msg?.direction !== "in" || !msg.contactName || msg.contactName === "Você") return;
  if (store.nomes[msg.chatId] !== msg.contactName) {
    store.nomes[msg.chatId] = msg.contactName;
    salvarStore();
  }
}

function comExtras(msg) {
  if (!msg) return msg;
  const t = store.transcricoes[msg.id];
  return t ? { ...msg, transcricao: t } : msg;
}

function guardarMensagem(msg) {
  let mapa = mensagensPorChat.get(msg.chatId);
  if (!mapa) {
    mapa = new Map();
    mensagensPorChat.set(msg.chatId, mapa);
  }
  const anterior = mapa.get(msg.id);
  // Um evento posterior (status, reenvio do histórico) não pode apagar o que
  // o primeiro trouxe, como o cartão do produto.
  const final = anterior ? { ...anterior, ...msg, produto: msg.produto || anterior.produto || null } : msg;
  mapa.set(msg.id, final);
  if (mapa.size > LIMITE_POR_CHAT) {
    const ordenadas = [...mapa.values()].sort((a, b) => a.timestamp - b.timestamp);
    for (const velha of ordenadas.slice(0, mapa.size - LIMITE_POR_CHAT)) mapa.delete(velha.id);
  }
  return { final, nova: !anterior };
}

function mensagensRecentes(limite = 300) {
  const todas = [];
  for (const mapa of mensagensPorChat.values()) for (const m of mapa.values()) todas.push(m);
  return todas
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-limite)
    .map(comExtras);
}

function listaDeConversas() {
  return [...conversas.values()]
    .map((c) => ({
      ...c,
      profilePicUrl: fotoLocal(c.chatId) || c.profilePicUrl || null,
      assignedSellerId: store.chatAssignments[c.chatId] || null,
    }))
    .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
}

function tocarConversa(msg) {
  if (estado.phoneNumber && N.digitos(msg.chatId) === N.digitos(estado.phoneNumber)) return;
  const atual = conversas.get(msg.chatId) || {
    chatId: msg.chatId,
    contactName: msg.contactName || (msg.realNumber ? N.formatarNumero(msg.realNumber) : "Contato"),
    realNumber: msg.realNumber,
    displayNumber: msg.displayNumber,
    profilePicUrl: null,
    unreadCount: 0,
    isGroup: false,
  };
  if (msg.timestamp >= (atual.lastMessageTimestamp || 0)) {
    atual.lastMessageBody = N.descreverResumo(msg);
    atual.lastMessageTimestamp = msg.timestamp;
  }
  if (msg.direction === "in") {
    atual.unreadCount = (atual.unreadCount || 0) + 1;
    if (msg.contactName && (!atual.contactName || /^\(?\d/.test(atual.contactName))) atual.contactName = msg.contactName;
  }
  conversas.set(msg.chatId, atual);
  agendarEnvioDaLista();
  pedirFoto(msg.chatId);
}

// ------------------------------------------------------------------
// Fotos de perfil
//
// O link de foto que o WhatsApp entrega expira em poucos dias — por isso as
// fotos "sumiam" antes. Aqui cada foto é baixada e guardada em disco, e o
// painel recebe um caminho estável (/foto/<número>). Se o contato esconder
// a foto depois, a guardada continua valendo: nunca troca foto por avatar
// genérico. Consulta de novo a cada 3 dias, uma por vez, sem pressa.
// ------------------------------------------------------------------
const VALIDADE_FOTO_MS = 3 * 24 * 3600_000;
const filaFotos = new Set();
let processandoFotos = false;

function arquivoDaFoto(numero) {
  return path.join(FOTOS_DIR, `${numero}.jpg`);
}

function fotoLocal(chatId) {
  const numero = String(chatId || "").endsWith("@c.us") ? N.digitos(chatId) : "";
  if (!numero) return null;
  return fs.existsSync(arquivoDaFoto(numero)) ? `/foto/${numero}` : null;
}

function pedirFoto(chatId) {
  const numero = String(chatId || "").endsWith("@c.us") ? N.digitos(chatId) : "";
  if (!numero || numero === N.digitos(estado.phoneNumber)) return;
  const ultima = store.fotos[numero];
  if (ultima && Date.now() - ultima.em < VALIDADE_FOTO_MS) return;
  filaFotos.add(numero);
  if (!processandoFotos) processarFilaDeFotos();
}

async function processarFilaDeFotos() {
  processandoFotos = true;
  try {
    while (filaFotos.size && estado.connected) {
      const numero = filaFotos.values().next().value;
      filaFotos.delete(numero);
      try {
        const r = await evolution.fotoDoPerfil(INSTANCIA, numero);
        const url = r?.profilePictureUrl;
        if (url) {
          const resposta = await fetch(url, { signal: AbortSignal.timeout(15_000) });
          const tipo = resposta.headers.get("content-type") || "";
          if (resposta.ok && tipo.startsWith("image/")) {
            const bytes = Buffer.from(await resposta.arrayBuffer());
            if (bytes.length > 500) {
              fs.writeFileSync(arquivoDaFoto(numero), bytes);
              const c = conversas.get(`${numero}@c.us`);
              if (c) {
                c.profilePicUrl = `/foto/${numero}`;
                c.profilePicOriginal = url;
              }
              agendarEnvioDaLista();
            }
          }
        }
        store.fotos[numero] = { em: Date.now(), tem: Boolean(url) };
        salvarStore();
      } catch (erro) {
        // Falha de rede não marca como consultado: tenta de novo depois.
        console.warn(`[fotos] ${numero}: ${erro.message}`);
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  } finally {
    processandoFotos = false;
  }
}

// ------------------------------------------------------------------
// Socket.IO (só para quem tem ingresso)
// ------------------------------------------------------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ORIGENS, methods: ["GET", "POST"] },
  maxHttpBufferSize: 80 * 1024 * 1024, // vídeo de até ~60 MB em base64
});
const SALA = "painel";
const paraPainel = () => io.to(SALA);

io.use(async (socket, next) => {
  const quem = await acesso.verificar(socket.handshake.auth?.ticket || socket.handshake.query?.ticket);
  if (!quem) return next(new Error("nao-autorizado"));
  socket.data.quem = quem;
  next();
});

const emitirEstado = () => paraPainel().emit("whatsapp:state", estado);
const emitirToast = (message, alvo = null) => (alvo || paraPainel()).emit("whatsapp:toast", { message });
function configuracoes() {
  return {
    labels: store.labels,
    signatures: store.signatures,
    quickReplies: store.quickReplies,
    schedules: store.schedules,
    chatLabels: store.chatLabels,
    chatAssignments: store.chatAssignments,
    notifications: store.notifications,
    apiInfo: { motor: "evolution", versao: VERSAO },
  };
}
const emitirConfiguracoes = () => paraPainel().emit("whatsapp:settings", configuracoes());
const emitirVendedores = () => paraPainel().emit("whatsapp:vendedores", store.vendedores.map(publicoVendedor));

let envioDaListaAgendado = null;
function agendarEnvioDaLista() {
  if (envioDaListaAgendado) return;
  envioDaListaAgendado = setTimeout(() => {
    envioDaListaAgendado = null;
    paraPainel().emit("whatsapp:chats", listaDeConversas());
  }, 1500);
}

function emitirMensagem(msg, extras = {}) {
  paraPainel().emit("whatsapp:message", { ...comExtras(msg), ...extras });
}

// ------------------------------------------------------------------
// Conexão com a Evolution
// ------------------------------------------------------------------
const EVENTOS_WEBHOOK = [
  "QRCODE_UPDATED",
  "CONNECTION_UPDATE",
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "MESSAGES_DELETE",
  "SEND_MESSAGE",
];

async function prepararInstancia() {
  const lista = await evolution.listarInstancias().catch((erro) => {
    throw new Error(`não consegui falar com a Evolution: ${erro.message}`);
  });
  const existe = (lista || []).find((i) => (i.name || i.instance?.instanceName) === INSTANCIA);

  const webhook = {
    enabled: true,
    url: WEBHOOK_URL,
    byEvents: false,
    base64: false,
    headers: { "x-balao-webhook": SEGREDO_WEBHOOK },
    events: EVENTOS_WEBHOOK,
  };

  if (!existe) {
    console.log(`[evolution] Criando a instância "${INSTANCIA}"`);
    await evolution.criarInstancia(INSTANCIA, {
      groupsIgnore: true,
      rejectCall: false,
      alwaysOnline: false,
      readMessages: false,
      readStatus: false,
      syncFullHistory: true,
      webhook,
    });
  } else {
    await evolution.definirWebhook(INSTANCIA, webhook);
  }

  await atualizarEstadoDaConexao();
}

async function atualizarEstadoDaConexao() {
  const r = await evolution.estadoConexao(INSTANCIA);
  const situacao = r?.instance?.state || r?.state;
  if (situacao === "open") {
    await aoConectar();
  } else {
    Object.assign(estado, { status: "qr", connected: false, session: false });
    emitirEstado();
    await pedirQr();
  }
}

async function pedirQr() {
  try {
    const r = await evolution.conectar(INSTANCIA);
    if (r?.base64) {
      Object.assign(estado, { status: "qr", qrCode: r.base64, rawQr: r.code || null });
      emitirEstado();
    }
  } catch (erro) {
    estado.ultimoErro = { mensagem: `Falha ao pedir QR Code: ${erro.message}`, quando: new Date().toISOString() };
    emitirEstado();
  }
}

async function aoConectar(dados = {}) {
  try {
    const lista = await evolution.listarInstancias();
    const eu = (lista || []).find((i) => (i.name || i.instance?.instanceName) === INSTANCIA) || {};
    const dono = dados.wuid || eu.ownerJid || eu.instance?.owner || "";
    Object.assign(estado, {
      status: "ready",
      connected: true,
      session: true,
      qrCode: null,
      rawQr: null,
      phoneNumber: N.digitos(dono) || estado.phoneNumber,
      perfil: dados.profileName || eu.profileName || estado.perfil,
      ultimoErro: null,
    });
  } catch {
    Object.assign(estado, { status: "ready", connected: true, session: true, qrCode: null, rawQr: null });
  }
  emitirEstado();
  sincronizarConversas().catch((e) => console.warn("[conversas] Falha na sincronização:", e.message));
}

async function sincronizarConversas() {
  // Primeiro as mensagens recentes: são elas que ensinam qual @lid é qual
  // número (remoteJidAlt) e o nome de quem escreveu. Com isso a lista de
  // conversas já sai com número e nome certos.
  const recentes = await evolution
    .buscarMensagens(INSTANCIA, { where: {}, offset: 500, page: 1 })
    .catch(() => null);
  for (const rec of recentes?.messages?.records || []) aprenderLid(rec?.key);
  for (const rec of recentes?.messages?.records || []) {
    const m = N.normalizarMensagem(rec, { lidParaNumero, numeroDaLoja: estado.phoneNumber });
    if (!m) continue;
    aprenderNome(m);
    guardarMensagem(m);
  }

  const lista = await evolution.buscarConversas(INSTANCIA, {});
  const novas = new Map();
  for (const item of lista || []) {
    if (item?.lastMessage?.key) aprenderLid(item.lastMessage.key);
    const c = N.normalizarConversa(item, { lidParaNumero, numeroDaLoja: estado.phoneNumber, fotoLocal });
    if (!c) continue;
    if (store.nomes[c.chatId] && (c.contactName === "Contato" || /^\(?\d/.test(c.contactName))) {
      c.contactName = store.nomes[c.chatId];
    }
    const ja = novas.get(c.chatId);
    if (!ja || (c.lastMessageTimestamp || 0) > (ja.lastMessageTimestamp || 0)) {
      novas.set(c.chatId, { ...(conversas.get(c.chatId) || {}), ...c });
    }
  }
  // Conversa nova que chegou pelo webhook e ainda não está no banco fica.
  for (const [id, c] of conversas) if (!novas.has(id)) novas.set(id, c);
  conversas.clear();
  for (const [id, c] of novas) conversas.set(id, c);
  ultimaSincronizacao = Date.now();
  paraPainel().emit("whatsapp:chats", listaDeConversas());
  for (const id of conversas.keys()) pedirFoto(id);

  paraPainel().emit("whatsapp:messages", mensagensRecentes());
}
setInterval(() => {
  if (estado.connected) sincronizarConversas().catch(() => {});
}, 5 * 60_000).unref?.();

let tentativasDePreparo = 0;
async function iniciar() {
  try {
    await prepararInstancia();
    tentativasDePreparo = 0;
  } catch (erro) {
    tentativasDePreparo += 1;
    estado.status = "disconnected";
    estado.ultimoErro = { mensagem: erro.message, quando: new Date().toISOString() };
    emitirEstado();
    const espera = Math.min(60_000, 3000 * tentativasDePreparo);
    console.warn(`[evolution] ${erro.message} — tento de novo em ${espera / 1000}s`);
    setTimeout(iniciar, espera);
  }
}

// ------------------------------------------------------------------
// Webhook da Evolution (rede interna do Docker)
// ------------------------------------------------------------------
function tratarMensagemRecebida(rec) {
  aprenderLid(rec.key);
  const msg = N.normalizarMensagem(rec, { lidParaNumero, numeroDaLoja: estado.phoneNumber });
  if (!msg) return;
  aprenderNome(msg);
  const { final, nova } = guardarMensagem(msg);
  emitirMensagem(final);
  if (nova) tocarConversa(final);
  // Mídia recebida é baixada logo: o link do WhatsApp expira em alguns dias.
  if (final.hasMedia && final.direction === "in") baixarMidia(final.id).catch(() => {});
  if (final.direction === "in" && /^(SAIR|PARAR|CANCELAR|DESCADASTRAR|STOP)$/i.test(final.body.trim())) {
    emitirToast(`Cliente ${final.contactName || final.realNumber} pediu para sair dos disparos.`);
  }
}

app.post("/evolution/webhook", express.json({ limit: "60mb" }), (req, res) => {
  const recebido = String(req.headers["x-balao-webhook"] || "");
  const ok =
    recebido.length === SEGREDO_WEBHOOK.length &&
    crypto.timingSafeEqual(Buffer.from(recebido), Buffer.from(SEGREDO_WEBHOOK));
  if (!ok) return res.status(401).end();
  res.status(200).json({ ok: true });

  const { event, data, instance } = req.body || {};
  const evento = String(event || "").toLowerCase().replace(/_/g, ".");
  if (instance && instance === INSTANCIA_TESTE && instance !== INSTANCIA) return tratarWebhookDeTeste(evento, data);
  if (instance && instance !== INSTANCIA) return;

  try {
    switch (evento) {
      case "qrcode.updated": {
        const qr = data?.qrcode;
        if (qr?.base64) {
          Object.assign(estado, { status: "qr", qrCode: qr.base64, rawQr: qr.code || null, connected: false });
          emitirEstado();
        }
        break;
      }
      case "connection.update": {
        if (data?.state === "open") aoConectar(data);
        else if (data?.state === "close") {
          Object.assign(estado, { status: "disconnected", connected: false, session: false });
          estado.ultimoErro = { mensagem: `Conexão fechada (código ${data?.statusReason})`, quando: new Date().toISOString() };
          emitirEstado();
          // 401 = o aparelho desconectou este computador. Precisa de QR novo.
          if (Number(data?.statusReason) === 401) setTimeout(pedirQr, 2000);
        } else if (data?.state === "connecting" && !estado.connected) {
          estado.status = estado.qrCode ? "qr" : "loading";
          emitirEstado();
        }
        break;
      }
      case "messages.upsert":
      case "send.message": {
        const lista = Array.isArray(data) ? data : data?.messages || [data];
        for (const rec of lista) if (rec?.key) tratarMensagemRecebida(rec);
        break;
      }
      case "messages.update": {
        const lista = Array.isArray(data) ? data : [data];
        for (const u of lista) {
          const id = u?.keyId || u?.key?.id;
          if (!id || !u?.status) continue;
          const status = N.statusDoPainel(u.status, u.fromMe);
          for (const mapa of mensagensPorChat.values()) {
            const m = mapa.get(id);
            if (m) {
              m.status = status;
              paraPainel().emit("whatsapp:message-status", { id, chatId: m.chatId, status });
              break;
            }
          }
        }
        break;
      }
      case "messages.delete": {
        const id = data?.id || data?.keyId || data?.key?.id;
        if (id) paraPainel().emit("whatsapp:message-status", { id, status: "deleted" });
        break;
      }
      default:
        break;
    }
  } catch (erro) {
    console.error("[webhook] Falha ao tratar", evento, erro);
  }
});

// ------------------------------------------------------------------
// Teste cruzado: loja -> linha de teste (e volta), conferindo a chegada
// ------------------------------------------------------------------
const teste = { estado: "desligado", qrCode: null, numero: null, recebidas: [] };

function tratarWebhookDeTeste(evento, data) {
  if (evento === "qrcode.updated" && data?.qrcode?.base64) {
    Object.assign(teste, { estado: "qr", qrCode: data.qrcode.base64 });
  } else if (evento === "connection.update") {
    if (data?.state === "open") Object.assign(teste, { estado: "conectado", qrCode: null, numero: N.digitos(data.wuid) || teste.numero });
    else if (data?.state === "close") teste.estado = "desconectado";
  } else if (evento === "messages.upsert") {
    const lista = Array.isArray(data) ? data : [data];
    for (const rec of lista) {
      if (!rec?.key || rec.key.fromMe) continue;
      const c = N.extrairConteudo(rec);
      teste.recebidas.push({
        id: rec.key.id,
        de: N.digitos(N.jidDaChave(rec.key).jid),
        tipo: c.mediaType || "texto",
        texto: c.body,
        mimetype: c.mimetype,
        nomeArquivo: c.mediaName,
        em: Date.now(),
      });
    }
    if (teste.recebidas.length > 200) teste.recebidas.splice(0, teste.recebidas.length - 200);
  }
}

async function prepararInstanciaDeTeste() {
  const lista = await evolution.listarInstancias();
  const existe = (lista || []).find((i) => (i.name || i.instance?.instanceName) === INSTANCIA_TESTE);
  const webhook = {
    enabled: true,
    url: WEBHOOK_URL,
    byEvents: false,
    base64: false,
    headers: { "x-balao-webhook": SEGREDO_WEBHOOK },
    events: ["QRCODE_UPDATED", "CONNECTION_UPDATE", "MESSAGES_UPSERT"],
  };
  if (!existe) {
    await evolution.criarInstancia(INSTANCIA_TESTE, {
      groupsIgnore: true,
      readMessages: false,
      syncFullHistory: false,
      webhook,
    });
  } else {
    await evolution.definirWebhook(INSTANCIA_TESTE, webhook);
  }
  const st = await evolution.estadoConexao(INSTANCIA_TESTE);
  if ((st?.instance?.state || st?.state) === "open") {
    const eu = (await evolution.listarInstancias()).find((i) => (i.name || i.instance?.instanceName) === INSTANCIA_TESTE) || {};
    Object.assign(teste, { estado: "conectado", qrCode: null, numero: N.digitos(eu.ownerJid) || teste.numero });
  } else {
    const r = await evolution.conectar(INSTANCIA_TESTE);
    if (r?.base64) Object.assign(teste, { estado: "qr", qrCode: r.base64 });
  }
  return { estado: teste.estado, qrCode: teste.qrCode, numero: teste.numero };
}

const AMOSTRAS = path.join(__dirname, "evo", "amostras");
const amostra = (nome) => fs.readFileSync(path.join(AMOSTRAS, nome)).toString("base64");

async function esperarChegada(filtro, desde, timeoutMs = 45_000) {
  const fim = Date.now() + timeoutMs;
  while (Date.now() < fim) {
    const achou = teste.recebidas.find((r) => r.em >= desde && filtro(r));
    if (achou) return achou;
    await new Promise((r) => setTimeout(r, 700));
  }
  return null;
}

async function testeCruzado({ produtoId } = {}) {
  if (!estado.connected) throw new Error("a linha da loja não está conectada");
  if (teste.estado !== "conectado" || !teste.numero) throw new Error("a linha de teste não está conectada");
  const destino = teste.numero;
  const tag = `[TESTE ${Date.now().toString(36).toUpperCase()}]`;
  const casos = [
    { nome: "texto", tipo: "texto", enviar: () => evolution.enviarTexto(INSTANCIA, destino, `${tag} texto`) },
    {
      nome: "foto (arquivo)",
      tipo: "image",
      enviar: () => enviarMidia({ destino, base64: amostra("foto.jpg"), mimetype: "image/jpeg", filename: "foto.jpg", caption: `${tag} foto` }),
    },
    {
      nome: "foto (link)",
      tipo: "image",
      enviar: () => enviarMidia({ destino, url: "https://images.kabum.com.br/produtos/fotos/926244/filtro-hepa-para-robo-aspirador-de-po-kabum-smart-550-kshpr212_1774534842_gg.jpg", mimetype: "image/jpeg", caption: `${tag} foto por link` }),
    },
    {
      nome: "vídeo",
      tipo: "video",
      enviar: () => enviarMidia({ destino, base64: amostra("video.mp4"), mimetype: "video/mp4", filename: "video.mp4", caption: `${tag} vídeo` }),
    },
    {
      nome: "áudio de voz",
      tipo: "ptt",
      enviar: () => enviarMidia({ destino, base64: amostra("audio.ogg"), mimetype: "audio/ogg", filename: "audio.ogg", comoVoz: true }),
    },
    {
      nome: "PDF",
      tipo: "document",
      enviar: () =>
        enviarMidia({ destino, base64: amostra("doc.pdf"), mimetype: "application/pdf", filename: "orcamento-teste.pdf", caption: `${tag} pdf`, comoDocumento: true }),
    },
  ];
  if (produtoId) {
    casos.push({
      nome: "produto do catálogo",
      tipo: "image",
      enviar: async () => (await enviarProduto({ destino, product: { id: produtoId }, obs: tag })).rec,
    });
  }

  const resultado = [];
  for (const caso of casos) {
    const desde = Date.now();
    const linha = { caso: caso.nome, enviado: false, idEnvio: null, chegou: false, midiaOk: null, detalhe: null, ms: null };
    try {
      const rec = await caso.enviar();
      linha.enviado = Boolean(rec?.key?.id);
      linha.idEnvio = rec?.key?.id || null;
      const chegada = await esperarChegada(
        (r) => r.de === N.digitos(estado.phoneNumber) && r.tipo === caso.tipo && (caso.tipo === "ptt" || (r.texto || "").includes(tag)),
        desde
      );
      linha.chegou = Boolean(chegada);
      linha.ms = chegada ? chegada.em - desde : null;
      if (chegada && caso.tipo !== "texto") {
        const m = await evolution.baixarMidia(INSTANCIA_TESTE, chegada.id).catch((e) => ({ erro: e.message }));
        const bytes = m?.base64 ? Buffer.from(m.base64, "base64").length : 0;
        linha.midiaOk = bytes > 0;
        linha.detalhe = bytes ? `${m.mimetype || chegada.mimetype} · ${bytes} bytes` : `mídia não baixou: ${m?.erro || "vazia"}`;
        linha.idRecebido = chegada.id;
      }
      if (!chegada) linha.detalhe = "não chegou em 45 s";
    } catch (erro) {
      linha.detalhe = `envio recusado: ${erro.message}`;
    }
    resultado.push(linha);
  }

  // Sentido inverso: a linha de teste escreve para a loja e o painel precisa
  // receber (é o caminho de um cliente mandando mensagem).
  const tagVolta = `${tag} volta`;
  const desdeVolta = Date.now();
  const volta = { caso: "cliente -> loja (texto)", enviado: false, chegou: false };
  try {
    const rec = await evolution.enviarTexto(INSTANCIA_TESTE, estado.phoneNumber, tagVolta);
    volta.enviado = Boolean(rec?.key?.id);
    const fim = Date.now() + 30_000;
    while (Date.now() < fim && !volta.chegou) {
      for (const mapa of mensagensPorChat.values()) {
        for (const m of mapa.values()) if (m.direction === "in" && m.timestamp >= desdeVolta - 5000 && m.body === tagVolta) volta.chegou = true;
      }
      if (!volta.chegou) await new Promise((r) => setTimeout(r, 700));
    }
    volta.ms = volta.chegou ? Date.now() - desdeVolta : null;
  } catch (erro) {
    volta.detalhe = erro.message;
  }
  resultado.push(volta);

  return {
    tag,
    loja: estado.phoneNumber,
    teste: destino,
    resultado,
    audioRecebidoId: resultado.find((r) => r.caso === "áudio de voz")?.idRecebido || null,
  };
}

// ------------------------------------------------------------------
// Mídia: baixada da Evolution na primeira vez, depois servida do disco
// ------------------------------------------------------------------
const baixando = new Map();
const nomeSeguro = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);

function midiaEmDisco(id) {
  const base = nomeSeguro(id);
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(MIDIA_DIR, `${base}.json`), "utf8"));
    const arquivo = path.join(MIDIA_DIR, meta.arquivo);
    if (fs.existsSync(arquivo)) return { ...meta, caminho: arquivo };
  } catch {}
  return null;
}

function gravarMidia(id, buffer, mimetype, nomeOriginal) {
  const base = nomeSeguro(id);
  const arquivo = `${base}.${N.extensaoDoMime(mimetype)}`;
  fs.writeFileSync(path.join(MIDIA_DIR, arquivo), buffer);
  const meta = { arquivo, mimetype: mimetype || "application/octet-stream", nome: nomeOriginal || null, em: Date.now() };
  fs.writeFileSync(path.join(MIDIA_DIR, `${base}.json`), JSON.stringify(meta));
  return { ...meta, caminho: path.join(MIDIA_DIR, arquivo) };
}

async function baixarMidia(id) {
  const pronto = midiaEmDisco(id);
  if (pronto) return pronto;
  if (!baixando.has(id)) {
    baixando.set(
      id,
      evolution
        .baixarMidia(INSTANCIA, id)
        .then((r) => {
          if (!r?.base64) throw new Error("a Evolution não devolveu a mídia");
          return gravarMidia(id, Buffer.from(r.base64, "base64"), r.mimetype, r.fileName);
        })
        .finally(() => baixando.delete(id))
    );
  }
  return baixando.get(id);
}

// Faxina: mídia com mais de 90 dias sai do disco (continua no celular).
function faxinaDeMidia() {
  const limite = Date.now() - 90 * 24 * 3600_000;
  try {
    for (const nome of fs.readdirSync(MIDIA_DIR)) {
      const caminho = path.join(MIDIA_DIR, nome);
      const st = fs.statSync(caminho);
      if (st.mtimeMs < limite) fs.unlinkSync(caminho);
    }
  } catch {}
}
setInterval(faxinaDeMidia, 12 * 3600_000).unref?.();

// ------------------------------------------------------------------
// Rotas HTTP
// ------------------------------------------------------------------
app.use((req, res, next) => {
  const origem = req.headers.origin;
  if (origem && ORIGENS.includes(origem)) {
    res.setHeader("Access-Control-Allow-Origin", origem);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "authorization, content-type, x-balao-ticket");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// Público de propósito: só diz se está no ar. Nada de QR, número ou conversa.
app.get(["/health", "/status", "/api/status"], (_req, res) => {
  res.json({
    ok: true,
    motor: "evolution",
    versao: { hash: VERSAO },
    estado: estado.status,
    status: estado.status,
    connected: estado.connected,
  });
});

// Completo, para o painel e para o site (com ingresso).
app.get(["/api/crm/status", "/api/crm/estado"], acesso.exigir(), (_req, res) => {
  res.json({
    ok: true,
    motor: "evolution",
    versao: { hash: VERSAO },
    ...estado,
    estado: estado.status,
    conta: estado.phoneNumber ? { numero: estado.phoneNumber } : null,
    conversas: {
      total: conversas.size,
      mensagensEmMemoria: [...mensagensPorChat.values()].reduce((s, m) => s + m.size, 0),
      ultimaSincronizacao: ultimaSincronizacao ? new Date(ultimaSincronizacao).toISOString() : null,
    },
    catalogo: espelhoDoCatalogo.estado,
  });
});

app.get(["/api/qr", "/api/crm/qr"], acesso.exigir(["admin"]), (_req, res) => {
  res.json({ ok: true, estado: estado.status, qrCode: estado.qrCode, rawQr: estado.rawQr, connected: estado.connected });
});

// Catálogo espelhado — são os mesmos dados públicos do site.
app.get(["/api/crm/catalogo", "/api/catalogo"], (_req, res) => {
  const { produtos, categorias, banners, blog, total, atualizadoEm } = espelhoDoCatalogo.ler();
  res.json({ ok: true, total, atualizadoEm, produtos, categorias, banners, blog });
});
app.get(["/api/crm/catalogo/estado", "/api/catalogo/estado"], (_req, res) => {
  res.json({ ok: true, ...espelhoDoCatalogo.estado, origem: SITE_URL });
});
app.post(["/api/crm/catalogo/atualizar", "/api/catalogo/atualizar"], acesso.exigir(), async (_req, res) => {
  res.json(await espelhoDoCatalogo.atualizar({ motivo: "site avisou" }));
});

app.get("/foto/:numero", acesso.exigir(), (req, res) => {
  const numero = N.digitos(req.params.numero);
  const arquivo = numero ? arquivoDaFoto(numero) : null;
  if (!arquivo || !fs.existsSync(arquivo)) return res.status(404).end();
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.sendFile(arquivo);
});

app.get("/midia/:id", acesso.exigir(), async (req, res) => {
  try {
    const m = await baixarMidia(req.params.id);
    res.setHeader("Content-Type", m.mimetype);
    res.setHeader("Cache-Control", "private, max-age=86400");
    if (m.nome) res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(m.nome)}"`);
    res.sendFile(m.caminho);
  } catch (erro) {
    res.status(404).json({ ok: false, erro: `Mídia indisponível: ${erro.message}` });
  }
});

app.post("/api/diagnostico/linha-teste", acesso.exigir(["admin"]), async (_req, res) => {
  try {
    res.json({ ok: true, ...(await prepararInstanciaDeTeste()) });
  } catch (erro) {
    res.status(500).json({ ok: false, erro: erro.message });
  }
});

// O teste leva de 1 a 3 minutos: começa com POST e o resultado sai no GET.
const execucao = { rodando: false, inicio: null, fim: null, resultado: null, erro: null };
app.post("/api/diagnostico/cruzado", acesso.exigir(["admin"]), express.json(), (req, res) => {
  if (execucao.rodando) return res.json({ ok: true, jaRodando: true, inicio: execucao.inicio });
  Object.assign(execucao, { rodando: true, inicio: Date.now(), fim: null, resultado: null, erro: null });
  testeCruzado({ produtoId: req.body?.produtoId })
    .then((r) => (execucao.resultado = r))
    .catch((e) => (execucao.erro = e.message))
    .finally(() => Object.assign(execucao, { rodando: false, fim: Date.now() }));
  res.json({ ok: true, iniciado: true, inicio: execucao.inicio });
});
app.get("/api/diagnostico/cruzado", acesso.exigir(["admin"]), (_req, res) => {
  res.json({ ok: true, ...execucao, linhaTeste: { estado: teste.estado, numero: teste.numero } });
});

// Mídia recebida pela linha de teste (para conferir a transcrição do áudio).
app.get("/api/diagnostico/midia-teste/:id", acesso.exigir(["admin"]), async (req, res) => {
  try {
    const m = await evolution.baixarMidia(INSTANCIA_TESTE, req.params.id);
    res.setHeader("Content-Type", m.mimetype || "application/octet-stream");
    res.end(Buffer.from(m.base64, "base64"));
  } catch (erro) {
    res.status(404).json({ ok: false, erro: erro.message });
  }
});

app.all(["/api/reset-session", "/api/crm/reset-session", "/api/reconnect"], acesso.exigir(["admin"]), async (_req, res) => {
  const r = await reiniciarSessao();
  res.json(r);
});

// ------------------------------------------------------------------
// Envio — o mesmo caminho para socket e HTTP
// ------------------------------------------------------------------
function assinar(texto, signatureId) {
  const a = store.signatures.find((s) => s.id === signatureId);
  return a ? `${texto}\n\n${a.signature}\n${a.sellerName}` : texto;
}

function exigirConectado() {
  if (!estado.connected) throw new Error("O WhatsApp da loja não está conectado. Leia o QR Code no /crm.");
}

/** Registra o que a Evolution confirmou e devolve a mensagem do painel. */
function registrarEnviada(rec, extras = {}) {
  if (!rec?.key?.id) throw new Error("A Evolution não confirmou o envio (sem id).");
  aprenderLid(rec.key);
  const msg =
    N.normalizarMensagem(rec, { lidParaNumero, numeroDaLoja: estado.phoneNumber }) || {
      id: rec.key.id,
      chatId: N.paraChatId(rec.key.remoteJid, lidParaNumero),
      direction: "out",
      body: "",
      timestamp: Date.now(),
    };
  const { final } = guardarMensagem({ ...msg, ...extras });
  emitirMensagem(final, extras.tempId ? { tempId: extras.tempId } : {});
  tocarConversa(final);
  return final;
}

async function enviarTexto({ destino, texto, signatureId, responderA }) {
  exigirConectado();
  const numero = N.paraDestino(destino);
  if (!numero) throw new Error("Número de destino inválido.");
  const corpo = assinar(String(texto || "").trim(), signatureId);
  if (!corpo) throw new Error("Mensagem vazia.");
  const extras = {};
  if (responderA) {
    const original = [...(mensagensPorChat.get(N.paraChatId(destino, lidParaNumero))?.values() || [])].find(
      (m) => m.id === responderA
    );
    if (original?.chave) extras.quoted = { key: original.chave, message: { conversation: original.body || "" } };
  }
  return evolution.enviarTexto(INSTANCIA, numero, corpo, extras);
}

async function fonteDaMidia({ dataUrl, url, base64, mimetype }) {
  if (url && /^https?:\/\//i.test(url)) return { media: url, mimetype: mimetype || null };
  const partes = N.separarDataUrl(dataUrl || base64 || "");
  if (!partes.base64) throw new Error("Nenhum arquivo informado.");
  return { media: partes.base64, mimetype: mimetype || partes.mimetype || null };
}

async function enviarMidia({ destino, dataUrl, url, base64, mimetype, filename, caption, comoVoz, comoDocumento }) {
  exigirConectado();
  const numero = N.paraDestino(destino);
  if (!numero) throw new Error("Número de destino inválido.");
  const fonte = await fonteDaMidia({ dataUrl, url, base64, mimetype });
  const mime = fonte.mimetype || "application/octet-stream";
  let tipo = comoDocumento ? "document" : N.tipoPeloMime(mime, filename);
  if (tipo === "sticker") tipo = "image";

  if (tipo === "audio" && comoVoz !== false) {
    // Vira mensagem de voz: a Evolution converte para ogg/opus.
    return evolution.enviarAudio(INSTANCIA, numero, fonte.media);
  }
  const nome = filename || `arquivo.${N.extensaoDoMime(mime)}`;
  return evolution.enviarMidia(INSTANCIA, numero, {
    mediatype: tipo,
    mimetype: mime,
    media: fonte.media,
    caption: tipo === "audio" ? undefined : String(caption || "") || undefined,
    fileName: nome,
  });
}

// Produto: nome, foto e link vêm do site, não de quem pede — assim ninguém
// manda "oferta" com foto ou produto trocado. O preço pode ser o do vendedor
// (desconto negociado), mas nunca abaixo do custo quando o custo é conhecido.
async function buscarProdutoNoSite(id) {
  if (!id) return null;
  try {
    const r = await fetch(`${SITE_URL}/api/products/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.product || j || null;
  } catch {
    return null;
  }
}

function lerPreco(valor) {
  if (valor == null || valor === "") return 0;
  if (typeof valor === "number") return valor;
  const s = String(valor).replace(/[^\d,.-]/g, "");
  const n = s.includes(",") ? Number(s.replace(/\./g, "").replace(",", ".")) : Number(s);
  return Number.isFinite(n) ? n : 0;
}

const SPECS_INTERNAS = /(custo|fornecedor|margem|estoque|sku|ncm|supplier|cost)/i;

async function montarOferta({ product = {}, price, obs }) {
  const doSite = await buscarProdutoNoSite(product.id);
  const nome = doSite?.name || product.nome || product.name || product.title;
  if (!nome) throw new Error("Produto sem nome.");
  const precoSite = lerPreco(doSite?.price ?? product.preco ?? product.price);
  const preco = price != null && lerPreco(price) > 0 ? lerPreco(price) : precoSite;
  if (!preco) throw new Error("Produto sem preço.");
  const custo = lerPreco(product.custo);
  if (custo > 0 && preco < custo) {
    throw new Error(`Preço (R$ ${preco.toFixed(2)}) menor que o custo (R$ ${custo.toFixed(2)}).`);
  }
  const imagem = doSite?.image || product.imagem || product.image || null;
  const slug = doSite?.slug || product.slug;
  const link = slug ? `${SITE_URL}/product/${encodeURIComponent(slug)}` : null;
  const specs = (Array.isArray(product.specs) ? product.specs : [])
    .map(String)
    .filter((s) => s && !SPECS_INTERNAS.test(s))
    .slice(0, 6);
  const precoFmt = preco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const texto = [
    `⚡ *Oferta Balão da Informática*`,
    `*${nome}*`,
    ``,
    `💵 *Preço especial:* *R$ ${precoFmt}*`,
    specs.length ? `• ${specs.join("\n• ")}` : null,
    obs ? `\n_Obs: ${String(obs).trim()}_` : null,
    link ? `\n🔗 ${link}` : null,
    ``,
    `📍 Pronta entrega na loja do Castelo, Campinas.`,
    `Para reservar ou tirar dúvidas, é só responder aqui! 🎈`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return {
    texto,
    imagem,
    produto: { id: doSite?.id || product.id, nome, preco, precoFormatado: `R$ ${precoFmt}`, imagem, link },
    conferidoNoSite: Boolean(doSite),
  };
}

async function enviarProduto({ destino, product, price, obs, signatureId }) {
  exigirConectado();
  const numero = N.paraDestino(destino);
  if (!numero) throw new Error("Número de destino inválido.");
  const oferta = await montarOferta({ product, price, obs });
  const legenda = assinar(oferta.texto, signatureId);

  if (oferta.imagem) {
    try {
      const rec = await evolution.enviarMidia(INSTANCIA, numero, {
        mediatype: "image",
        mimetype: "image/jpeg",
        media: oferta.imagem,
        caption: legenda,
        fileName: "produto.jpg",
      });
      return { rec, oferta, comFoto: true };
    } catch (erro) {
      console.warn("[produto] Foto recusada, mando só o texto:", erro.message);
      const rec = await evolution.enviarTexto(INSTANCIA, numero, legenda);
      return { rec, oferta, comFoto: false, motivoSemFoto: erro.message };
    }
  }
  const rec = await evolution.enviarTexto(INSTANCIA, numero, legenda);
  return { rec, oferta, comFoto: false, motivoSemFoto: "produto sem foto no site" };
}

async function reiniciarSessao() {
  try {
    await evolution.desconectar(INSTANCIA).catch(() => {});
    Object.assign(estado, { status: "qr", connected: false, session: false, qrCode: null });
    emitirEstado();
    await pedirQr();
    return { ok: true, mensagem: "Sessão reiniciada. Leia o novo QR Code." };
  } catch (erro) {
    return { ok: false, erro: erro.message };
  }
}

// HTTP: mesmas operações, para rotinas do site e testes.
const rotaHttp = (fn) => async (req, res) => {
  try {
    res.json({ ok: true, ...(await fn(req.body || {}, req)) });
  } catch (erro) {
    const status = erro instanceof ErroEvolution && erro.status >= 400 && erro.status < 500 ? 422 : 500;
    res.status(status).json({ ok: false, erro: erro.message });
  }
};
const json = express.json({ limit: "80mb" });

app.post(["/api/enviar", "/api/send", "/api/crm/send"], acesso.exigir(), json, rotaHttp(async (b) => {
  const rec = await enviarTexto({
    destino: b.chat || b.number,
    texto: b.texto || b.text,
    signatureId: b.signatureId,
    responderA: b.replyTo,
  });
  return { msgId: registrarEnviada(rec).id };
}));

app.post(["/api/enviar-foto", "/api/crm/enviar-foto", "/api/enviar-midia", "/api/enviar-documento", "/api/crm/enviar-documento"],
  acesso.exigir(), json, rotaHttp(async (b, req) => {
    const rec = await enviarMidia({
      destino: b.chat || b.number,
      dataUrl: b.dataUrl,
      url: b.url,
      base64: b.base64,
      mimetype: b.mimetype,
      filename: b.nome || b.filename,
      caption: b.legenda || b.caption,
      comoDocumento: req.path.includes("documento") || b.comoDocumento,
      comoVoz: b.comoVoz,
    });
    return { msgId: registrarEnviada(rec).id };
  }));

app.post(["/api/enviar-produto", "/api/crm/enviar-produto"], acesso.exigir(), json, rotaHttp(async (b) => {
  const r = await enviarProduto({
    destino: b.chat || b.number,
    product: b.product,
    price: b.price,
    obs: b.obs,
    signatureId: b.signatureId,
  });
  const msg = registrarEnviada(r.rec, { produto: r.oferta.produto });
  return { msgId: msg.id, comFoto: r.comFoto, motivoSemFoto: r.motivoSemFoto || null, conferidoNoSite: r.oferta.conferidoNoSite };
}));

// ------------------------------------------------------------------
// Eventos do painel
// ------------------------------------------------------------------
io.on("connection", (socket) => {
  const quem = socket.data.quem;
  const ehAdmin = quem.papel === "admin";
  socket.join(SALA);

  const ack = (payload, sucesso, id, erro) =>
    socket.emit("whatsapp:send-ack", {
      tempId: payload?.tempId || null,
      chatId: payload?.chatId || null,
      success: sucesso,
      id: id || null,
      error: erro || null,
    });

  const entregar = () => {
    socket.emit("whatsapp:state", estado);
    socket.emit("whatsapp:settings", configuracoes());
    socket.emit("whatsapp:messages", mensagensRecentes());
    socket.emit("whatsapp:chats", listaDeConversas());
    socket.emit("whatsapp:status-feed", store.statusFeed);
    socket.emit("whatsapp:vendedores", store.vendedores.map(publicoVendedor));
  };
  entregar();
  socket.on("panel:bootstrap", entregar);

  // ---- vendedores e funil ----
  socket.on("panel:vendedor-login", (p, cb) => {
    const pin = String(p?.pin || "").trim();
    const v = /^\d{4,6}$/.test(pin) ? store.vendedores.find((x) => x.pin && x.pin === pin) : null;
    cb?.(v ? { ok: true, vendedor: publicoVendedor(v) } : { ok: false });
  });

  socket.on("panel:add-vendedor", (p, cb) => {
    if (!ehAdmin) return cb?.({ ok: false, erro: "Só a administração cadastra vendedores." });
    const nome = String(p?.nome || "").trim();
    const pin = String(p?.pin || "").trim();
    if (!nome || !/^\d{4,6}$/.test(pin)) return cb?.({ ok: false, erro: "Nome e PIN (4 a 6 números) são obrigatórios." });
    if (store.vendedores.some((v) => v.pin === pin)) return cb?.({ ok: false, erro: "Esse PIN já está em uso." });
    const novo = { id: crypto.randomUUID(), nome, cargo: String(p?.cargo || ""), assinatura: String(p?.assinatura || ""), pin };
    store.vendedores.push(novo);
    salvarStore();
    emitirVendedores();
    cb?.({ ok: true, vendedor: publicoVendedor(novo) });
  });

  socket.on("panel:remove-vendedor", (p) => {
    if (!ehAdmin) return emitirToast("Só a administração remove vendedores.", socket);
    const id = String(p?.id || "");
    const alvo = store.vendedores.find((v) => String(v.id) === id);
    if (!alvo) return;
    if (alvo.protegido) return emitirToast(`${alvo.nome} entra pela página pessoal do site; remova em lib/vendedores.ts.`, socket);
    store.vendedores = store.vendedores.filter((v) => String(v.id) !== id);
    delete store.kanbanPorVendedor[id];
    salvarStore();
    emitirVendedores();
  });

  socket.on("panel:identify-vendedor", (p) => {
    const id = String(p?.vendedorId || "").trim();
    if (!id) return;
    socket.join(`vendedor:${id}`);
    socket.emit("whatsapp:kanban", store.kanbanPorVendedor[id] || {});
    socket.emit("whatsapp:preferencias", store.preferenciasPorVendedor[id] || {});
    socket.emit("whatsapp:chats", listaDeConversas());
  });

  socket.on("panel:set-preferencias", (p) => {
    const id = String(p?.vendedorId || "").trim();
    if (!id || !p?.preferencias || typeof p.preferencias !== "object") return;
    if (JSON.stringify(p.preferencias).length > 200_000) return;
    store.preferenciasPorVendedor[id] = { ...(store.preferenciasPorVendedor[id] || {}), ...p.preferencias, atualizadoEm: Date.now() };
    salvarStore();
    socket.broadcast.to(`vendedor:${id}`).emit("whatsapp:preferencias", store.preferenciasPorVendedor[id]);
  });

  socket.on("panel:set-kanban-card", (p) => {
    const id = String(p?.vendedorId || "").trim();
    const chatId = String(p?.chatId || "").trim();
    if (!id || !chatId) return;
    store.kanbanPorVendedor[id] = store.kanbanPorVendedor[id] || {};
    if (p.colId) store.kanbanPorVendedor[id][chatId] = String(p.colId);
    else delete store.kanbanPorVendedor[id][chatId];
    salvarStore();
    io.to(`vendedor:${id}`).emit("whatsapp:kanban", store.kanbanPorVendedor[id]);
  });

  socket.on("panel:assign-seller", (p) => {
    const chatId = String(p?.chatId || "").trim();
    if (!chatId) return;
    if (p.sellerId) store.chatAssignments[chatId] = String(p.sellerId);
    else delete store.chatAssignments[chatId];
    salvarStore();
    paraPainel().emit("whatsapp:chats", listaDeConversas());
    emitirConfiguracoes();
  });

  socket.on("panel:add-label", (p) => {
    const l = String(p?.label || "").trim();
    if (!l || store.labels.includes(l)) return;
    store.labels.push(l);
    salvarStore();
    emitirConfiguracoes();
  });

  socket.on("panel:toggle-chat-label", (p) => {
    const chatId = String(p?.chatId || "").trim();
    const l = String(p?.label || "").trim();
    if (!chatId || !l) return;
    const atuais = new Set(store.chatLabels[chatId] || []);
    if (atuais.has(l)) atuais.delete(l);
    else atuais.add(l);
    store.chatLabels[chatId] = [...atuais];
    salvarStore();
    emitirConfiguracoes();
  });

  socket.on("panel:add-signature", (p) => {
    const sellerName = String(p?.sellerName || "").trim();
    const signature = String(p?.signature || "").trim();
    if (!sellerName || !signature) return;
    store.signatures.push({ id: crypto.randomUUID(), sellerName, signature });
    salvarStore();
    emitirConfiguracoes();
  });

  socket.on("panel:add-quick-reply", (p) => {
    const title = String(p?.title || "").trim();
    const message = String(p?.message || "").trim();
    if (!title || !message) return;
    store.quickReplies.push({ id: crypto.randomUUID(), title, message });
    salvarStore();
    emitirConfiguracoes();
  });

  // ---- sessão ----
  socket.on("panel:reset-session", async () => {
    if (!ehAdmin) return emitirToast("Só a administração pode reiniciar a sessão.", socket);
    const r = await reiniciarSessao();
    emitirToast(r.ok ? r.mensagem : `Falha ao reiniciar: ${r.erro}`, socket);
  });

  socket.on("panel:sync-conversations", async () => {
    try {
      await sincronizarConversas();
    } catch (erro) {
      emitirToast(`Falha ao sincronizar: ${erro.message}`, socket);
    }
  });

  // ---- histórico de uma conversa (banco da Evolution) ----
  socket.on("panel:carregar-historico", async (p, cb) => {
    const chatId = String(p?.chatId || "").trim();
    const limite = Math.min(500, Math.max(20, Number(p?.limite) || 80));
    if (!chatId) return cb?.({ ok: false, erro: "Conversa inválida." });
    try {
      const jids = new Set();
      if (N.ehLid(chatId)) {
        jids.add(chatId);
      } else {
        jids.add(`${N.digitos(chatId)}@s.whatsapp.net`);
        for (const [lid, numero] of Object.entries(store.lids)) if (numero === N.digitos(chatId)) jids.add(lid);
      }
      const registros = [];
      for (const jid of jids) {
        for (const where of [{ key: { remoteJid: jid } }, { key: { remoteJidAlt: jid } }]) {
          const r = await evolution.buscarMensagens(INSTANCIA, { where, offset: limite, page: 1 }).catch(() => null);
          registros.push(...(r?.messages?.records || []));
        }
      }
      const vistas = new Set();
      const convertidas = [];
      for (const rec of registros) {
        if (!rec?.key?.id || vistas.has(rec.key.id)) continue;
        vistas.add(rec.key.id);
        aprenderLid(rec.key);
        const m = N.normalizarMensagem(rec, { lidParaNumero, numeroDaLoja: estado.phoneNumber });
        if (!m) continue;
        m.chatId = chatId; // a conversa aberta é a referência do painel
        convertidas.push(guardarMensagem(m).final);
      }
      socket.emit("whatsapp:messages", convertidas.sort((a, b) => a.timestamp - b.timestamp).map(comExtras));
      cb?.({ ok: true, total: convertidas.length });
    } catch (erro) {
      cb?.({ ok: false, erro: `Falha ao carregar o histórico: ${erro.message}` });
    }
  });

  // ---- envio ----
  socket.on("panel:send-message", async (p) => {
    try {
      const rec = await enviarTexto({
        destino: p.chatId || p.number,
        texto: p.text,
        signatureId: p.signatureId,
        responderA: p.replyTo,
      });
      const msg = registrarEnviada(rec, { tempId: p.tempId });
      ack(p, true, msg.id);
    } catch (erro) {
      ack(p, false, null, erro.message);
      emitirToast(`⛔ Mensagem não enviada: ${erro.message}`, socket);
    }
  });

  socket.on("panel:send-media", async (p) => {
    try {
      const rec = await enviarMidia({
        destino: p.chatId || p.number,
        dataUrl: p.dataUrl,
        url: p.url,
        base64: p.base64,
        mimetype: p.mimetype,
        filename: p.filename,
        caption: p.caption,
        comoVoz: p.sendAudioAsVoice !== false,
        comoDocumento: Boolean(p.sendMediaAsDocument),
      });
      const msg = registrarEnviada(rec, { tempId: p.tempId });
      ack(p, true, msg.id);
    } catch (erro) {
      ack(p, false, null, erro.message);
      emitirToast(`⛔ Arquivo não enviado: ${erro.message}`, socket);
    }
  });

  socket.on("panel:send-product", async (p) => {
    try {
      const r = await enviarProduto({
        destino: p.chatId || p.number,
        product: p.product,
        price: p.price,
        obs: p.obs,
        signatureId: p.signatureId,
      });
      const msg = registrarEnviada(r.rec, { tempId: p.tempId, produto: r.oferta.produto });
      ack(p, true, msg.id);
      emitirToast(
        r.comFoto
          ? `Produto "${r.oferta.produto.nome}" enviado com foto.`
          : `Produto "${r.oferta.produto.nome}" enviado SEM foto (${r.motivoSemFoto}).`,
        socket
      );
    } catch (erro) {
      ack(p, false, null, erro.message);
      emitirToast(`⛔ Produto não enviado: ${erro.message}`, socket);
    }
  });

  socket.on("panel:send-reaction", async (p) => {
    try {
      const m = [...mensagensPorChat.values()].map((mp) => mp.get(p?.messageId)).find(Boolean);
      if (!m?.chave) throw new Error("mensagem não encontrada");
      await evolution.enviarReacao(INSTANCIA, m.chave, String(p.reaction || ""));
    } catch (erro) {
      emitirToast(`Falha ao reagir: ${erro.message}`, socket);
    }
  });

  socket.on("panel:send-location", async (p) => {
    try {
      exigirConectado();
      const rec = await evolution.enviarLocalizacao(INSTANCIA, N.paraDestino(p.chatId), {
        latitude: Number(p.lat),
        longitude: Number(p.lng),
        name: p.description || "Balão da Informática",
        address: p.address || "",
      });
      registrarEnviada(rec);
      socket.emit("whatsapp:location-sent", { ok: true });
    } catch (erro) {
      emitirToast(`Falha ao enviar localização: ${erro.message}`, socket);
    }
  });

  socket.on("panel:send-poll", async (p) => {
    try {
      exigirConectado();
      const opcoes = (p.options || []).map(String).filter(Boolean).slice(0, 12);
      if (!p.question || opcoes.length < 2) throw new Error("A enquete precisa de pergunta e 2 opções.");
      const rec = await evolution.enviarEnquete(INSTANCIA, N.paraDestino(p.chatId), String(p.question), opcoes);
      registrarEnviada(rec);
      socket.emit("whatsapp:poll-sent", { ok: true });
    } catch (erro) {
      emitirToast(`Falha ao criar enquete: ${erro.message}`, socket);
    }
  });

  const apagar = async (id) => {
    const m = [...mensagensPorChat.values()].map((mp) => mp.get(id)).find(Boolean);
    if (!m?.chave) throw new Error("mensagem não encontrada");
    if (!m.chave.fromMe) throw new Error("só dá para apagar mensagens da loja");
    await evolution.apagarParaTodos(INSTANCIA, m.chave);
    paraPainel().emit("whatsapp:message-status", { id, chatId: m.chatId, status: "deleted" });
  };
  socket.on("panel:delete-message", async (p) => {
    try {
      await apagar(p?.messageId);
    } catch (erro) {
      emitirToast(`Falha ao apagar: ${erro.message}`, socket);
    }
  });

  socket.on("panel:chat-action", async (p) => {
    const chatId = String(p?.chatId || "").trim();
    const acao = String(p?.action || "").trim();
    try {
      if (acao === "delete-message") await apagar(p?.payload?.msgId || p?.msgId);
      else if (acao === "set-note") {
        store.notas[chatId] = String(p?.note ?? p?.payload?.note ?? "");
        salvarStore();
      } else if (acao === "get-note") socket.emit("whatsapp:chat-note", { chatId, note: store.notas[chatId] || "" });
      else if (acao === "typing" || acao === "recording")
        await evolution.presenca(INSTANCIA, N.paraDestino(chatId), acao === "typing" ? "composing" : "recording");
      else if (acao === "mark-read") await marcarLida(chatId);
      else throw new Error("ação não disponível nesta versão");
      socket.emit("whatsapp:chat-action-result", { chatId, action: acao, result: { success: true } });
    } catch (erro) {
      emitirToast(`Falha na ação da conversa: ${erro.message}`, socket);
    }
  });

  async function marcarLida(chatId) {
    const mapa = mensagensPorChat.get(chatId);
    const naoLidas = [...(mapa?.values() || [])].filter((m) => m.direction === "in" && m.chave).slice(-20);
    if (naoLidas.length) await evolution.marcarComoLida(INSTANCIA, naoLidas.map((m) => m.chave)).catch(() => {});
    const c = conversas.get(chatId);
    if (c) c.unreadCount = 0;
    agendarEnvioDaLista();
  }
  socket.on("panel:mark-seen", (p) => marcarLida(String(p?.chatId || "")).catch(() => {}));
  socket.on("panel:mark-chat-read", (p) => marcarLida(String(p?.chatId || "")).catch(() => {}));

  // ---- transcrição de áudio (feita pelo site, guardada aqui) ----
  socket.on("panel:salvar-transcricao", (p) => {
    const id = String(p?.id || "").trim();
    const texto = String(p?.texto || "").trim().slice(0, 20_000);
    if (!id || !texto) return;
    store.transcricoes[id] = texto;
    salvarStore();
    let chatId = null;
    for (const mapa of mensagensPorChat.values()) if (mapa.has(id)) chatId = mapa.get(id).chatId;
    paraPainel().emit("whatsapp:transcricao", { id, chatId, texto });
  });

  // ---- status ----
  socket.on("panel:post-status", async (p) => {
    try {
      exigirConectado();
      const texto = String(p?.text || "").trim();
      const temMidia = p?.base64 && p?.mimetype;
      if (!texto && !temMidia) return;
      await evolution.publicarStatus(INSTANCIA, temMidia
        ? {
            type: String(p.mimetype).startsWith("video/") ? "video" : "image",
            content: N.separarDataUrl(p.base64).base64,
            caption: texto,
            allContacts: true,
          }
        : { type: "text", content: texto, backgroundColor: p.backgroundColor || "#b91c1c", font: 1, allContacts: true });
      emitirToast("Status publicado.", socket);
    } catch (erro) {
      emitirToast(`Falha ao publicar status: ${erro.message}`, socket);
    }
  });

  socket.on("panel:sync-status", () => {
    socket.emit("whatsapp:status-feed", store.statusFeed);
    emitirToast("Ver os status dos contatos ainda não está disponível nesta versão.", socket);
  });

  socket.on("panel:reply-status", async (p) => {
    try {
      const trecho = String(p?.statusSnippet || "").trim();
      const texto = String(p?.text || p?.comment || "").trim();
      const corpo = trecho
        ? `💬 *Respondendo ao seu status:*\n> "${trecho.slice(0, 100)}"\n\n${texto}`
        : `💬 *Respondendo ao seu status:*\n\n${texto}`;
      const rec = await enviarTexto({ destino: p.chatId || p.contactNumber || p.number, texto: corpo, signatureId: p.signatureId });
      registrarEnviada(rec);
      emitirToast("Resposta enviada.", socket);
    } catch (erro) {
      emitirToast(`Falha ao responder: ${erro.message}`, socket);
    }
  });

  // ---- disparo segmentado (com pausa aleatória e checagem de número) ----
  socket.on("panel:send-segmented", async (p) => {
    const lista = (Array.isArray(p?.recipients) ? p.recipients : []).slice(0, 100);
    const texto = String(p?.text || "").trim();
    if (!lista.length || !texto) return;
    const min = Math.max(15, Number(p.intervalMin) || 30) * 1000;
    const max = Math.max(min, Number(p.intervalMax) || 60_000);
    paraPainel().emit("whatsapp:disparo-status", { ativo: true });
    let enviados = 0, semWhats = 0, falhas = 0;
    try {
      for (let i = 0; i < lista.length; i++) {
        const destino = lista[i].chatId || lista[i].number;
        try {
          if (!lista[i].chatId) {
            const r = await evolution.temWhatsApp(INSTANCIA, [N.digitos(destino)]).catch(() => null);
            if (Array.isArray(r) && r[0] && r[0].exists === false) {
              semWhats++;
              continue;
            }
          }
          registrarEnviada(await enviarTexto({ destino, texto, signatureId: p.signatureId }));
          enviados++;
        } catch {
          falhas++;
        }
        if (i < lista.length - 1) await new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
      }
      emitirToast(`Disparo concluído: ${enviados} enviada(s)${semWhats ? ` · ${semWhats} sem WhatsApp` : ""}${falhas ? ` · ${falhas} com erro` : ""}.`, socket);
    } finally {
      paraPainel().emit("whatsapp:disparo-status", { ativo: false });
    }
  });

  socket.on("panel:schedule-message", (p) => {
    const number = N.digitos(p?.number);
    const text = String(p?.text || "").trim();
    const sendAt = String(p?.sendAt || "").trim();
    if (!number || !text || !sendAt) return;
    const item = { id: crypto.randomUUID(), number, text, sendAt, signatureId: p.signatureId || null, status: "pending" };
    store.schedules.push(item);
    salvarStore();
    emitirConfiguracoes();
    agendar(item);
    emitirToast(`Mensagem agendada para ${N.formatarNumero(number)}.`, socket);
  });
});

// ------------------------------------------------------------------
// Agendamentos
// ------------------------------------------------------------------
const timers = new Map();
function agendar(item) {
  if (item.status !== "pending") return;
  const espera = Math.max(0, Date.parse(item.sendAt) - Date.now());
  if (!Number.isFinite(espera)) return;
  clearTimeout(timers.get(item.id));
  timers.set(
    item.id,
    setTimeout(async () => {
      try {
        registrarEnviada(await enviarTexto({ destino: item.number, texto: item.text, signatureId: item.signatureId }));
        item.status = "sent";
      } catch (erro) {
        item.status = "failed";
        item.erro = erro.message;
      }
      salvarStore();
      emitirConfiguracoes();
    }, Math.min(espera, 2_147_000_000))
  );
}
store.schedules.forEach(agendar);

// ------------------------------------------------------------------
server.listen(PORTA, () => {
  console.log(`[servidor] WhatsApp (Evolution) no ar na porta ${PORTA} — versão ${VERSAO}`);
  iniciar();
});

module.exports = { app, server, store, estado };
