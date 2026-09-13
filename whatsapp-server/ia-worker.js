/**
 * Júlia IA — atendente digital da loja.
 *
 * Roda DENTRO do servidor de WhatsApp (VPS) e chama o cérebro dela
 * (balao-assistente, FastAPI + Ollama) via JULIA_IA_URL.
 *
 * Modos:
 *   off      — desligada
 *   copilot  — ela SUGERE respostas; um humano aprova e envia
 *   autopilot— ela envia a resposta sozinha
 *
 * Regras de segurança (nunca desativar):
 *  - Nunca responde duas vezes a mesma mensagem do cliente.
 *  - Só responde conversas em que a ÚLTIMA mensagem é do cliente
 *    (nunca fala por cima de um vendedor humano).
 *  - Só responde mensagens recentes (não desenterra conversa antiga).
 *  - Só responde conversas atribuídas a ela OU (com autolead) leads
 *    novos sem vendedor.
 */

const IA_SELLER_ID = process.env.JULIA_IA_SELLER_ID || "julia-ia";
const IA_URL = process.env.JULIA_IA_URL || "";
const MODO_INICIAL = ["off", "copilot", "autopilot"].includes(process.env.JULIA_IA_MODO)
  ? process.env.JULIA_IA_MODO
  : "off";

const INTERVALO_MS = 8_000;
const ATRASO_MIN_MS = Number(process.env.JULIA_IA_DELAY_MS) || 15_000;
const IDADE_MAX_MS = 45 * 60_000; // não responde mensagem com mais de 45 min
const MAX_CONCORRENTES = Number(process.env.JULIA_IA_MAX_CONCURRENT) || 3;
const MAX_HISTORICO = 8; // últimas mensagens enviadas ao cérebro da Júlia
const TIMEOUT_CHAMADA_MS = 120_000;
// O WhatsApp precisa de alguns segundos para carregar a imagem do preview
// antes de mandar o link — sem isso o cartão chega sem foto no celular.
const DELAY_LINK_MS = Number(process.env.JULIA_IA_LINK_DELAY_MS) || 5_000;

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Separa os links do corpo do texto. Links em linha própria viram mensagem
// separada (o WhatsApp transforma URL pura em cartão com foto). Link grudado
// em frase continua no texto.
function separarLinks(texto) {
  const links = [];
  const linhas = String(texto).split("\n");
  const restantes = linhas.filter((linha) => {
    const m = linha.trim().match(/^https?:\/\/\S+$/);
    if (m) {
      links.push(m[0]);
      return false;
    }
    return true;
  });
  return { corpo: restantes.join("\n").trim(), links };
}

const estado = {
  modo: MODO_INICIAL,
  autolead: false,
  sugestoes: new Map(), // chatId -> { texto, mensagemId, hora }
  respondidas: new Map(), // chatId -> { mensagemId, hora }
  emAndamento: new Map(), // chatId -> hora de início
  stats: { respostas: 0, sugestoes: 0, falhas: 0 },
  ultimaAcao: null,
};

let deps = null; // { store, persistStore, io, emitToast, marcarAutor, sendDirectMessage, whatsappConectado }

function iniciar(d) {
  deps = d;
  // Restaura o modo salvo no painel (o env inicial serve só de padrão).
  if (d.store && d.store.ia) {
    estado.modo = ["off", "copilot", "autopilot"].includes(d.store.ia.modo) ? d.store.ia.modo : estado.modo;
    estado.autolead = Boolean(d.store.ia.autolead);
  }
  loop();
}

function configurada() {
  return Boolean(IA_URL);
}

function resumo() {
  return {
    vendedorId: IA_SELLER_ID,
    modo: estado.modo,
    autolead: estado.autolead,
    configurada: configurada(),
    url: configurada() ? "configurada" : "faltando JULIA_IA_URL na VPS",
    sugestoes: Array.from(estado.sugestoes.entries()).map(([chatId, s]) => ({
      chatId,
      texto: s.texto,
      hora: s.hora,
    })),
    stats: { ...estado.stats },
    ultimaAcao: estado.ultimaAcao,
    processando: estado.emAndamento.size,
  };
}

function definirModo(modo, autolead) {
  let mudou = false;
  if (modo && ["off", "copilot", "autopilot"].includes(modo) && modo !== estado.modo) {
    estado.modo = modo;
    mudou = true;
  }
  if (typeof autolead === "boolean" && autolead !== estado.autolead) {
    estado.autolead = autolead;
    mudou = true;
  }
  if (mudou && deps) {
    deps.store.ia = { modo: estado.modo, autolead: estado.autolead };
    deps.persistStore();
    deps.emitToast(`Júlia IA: modo ${estado.modo}${estado.autolead ? " · novos leads ativado" : ""}`);
  }
  return resumo();
}

function nomeDoChat(chatId) {
  if (!deps) return chatId;
  const chat = deps.store.chats.find((c) => c.chatId === chatId);
  const nome = chat?.name || chat?.realNumber || chat?.id || chatId;
  return String(nome).replace(/@c\.us$/, "").replace(/@lid$/, "");
}

function ultimasMensagens(chatId, limite = MAX_HISTORICO) {
  if (!deps) return [];
  return deps.store.messages
    .filter((m) => m.chatId === chatId && m.body && !m.hasMedia)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    .slice(-limite);
}

function candidatos() {
  if (!deps || estado.modo === "off" || !configurada()) return [];
  if (!deps.whatsappConectado()) return [];

  const agora = Date.now();
  const chatsComMensagem = new Map();
  for (const m of deps.store.messages) {
    const atual = chatsComMensagem.get(m.chatId);
    if (!atual || (m.timestamp || 0) > (atual.timestamp || 0)) {
      chatsComMensagem.set(m.chatId, m);
    }
  }

  const lista = [];
  for (const chat of deps.store.chats) {
    const chatId = chat.chatId;
    if (!chatId || estado.emAndamento.has(chatId) || estado.sugestoes.has(chatId)) continue;

    const ultima = chatsComMensagem.get(chatId);
    if (!ultima) continue;
    if (ultima.direction !== "in") continue; // última é da loja: nada a fazer
    const ts = Number(ultima.timestamp) || 0;
    if (agora - ts < ATRASO_MIN_MS) continue; // deixa o humano responder antes
    if (agora - ts > IDADE_MAX_MS) continue; // mensagem velha demais

    const ja = estado.respondidas.get(chatId);
    if (ja && ja.mensagemId === buildFingerprint(ultima)) continue;

    const atribuida = chat.assignedSellerId === IA_SELLER_ID;
    const leadLivre = !chat.assignedSellerId;
    if (!atribuida && !(estado.autolead && leadLivre)) continue;

    lista.push({ chatId, nome: nomeDoChat(chatId), ultima });
  }
  return lista;
}

function buildFingerprint(m) {
  if (m.id && !/^(msg-)/.test(String(m.id))) return `id::${m.id}`;
  return `conteudo::${m.chatId}::${m.direction}::${m.timestamp}::${String(m.body || "").slice(0, 120)}`;
}

async function gerarResposta(chatId, nomeCliente) {
  const mensagens = ultimasMensagens(chatId);
  const historico = mensagens.map((m) => ({
    role: m.direction === "in" ? "user" : "assistant",
    content: String(m.body || "").trim(),
  }));

  const resposta = await fetch(`${IA_URL.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensagens: historico,
      modo: "cliente",
      ficha: { nome: nomeCliente },
    }),
    signal: AbortSignal.timeout(TIMEOUT_CHAMADA_MS),
  });
  if (!resposta.ok) throw new Error(`cérebro respondeu HTTP ${resposta.status}`);
  const dados = await resposta.json();
  const texto = String(dados?.resposta || "").trim();
  if (!texto) throw new Error("cérebro devolveu resposta vazia");
  return texto;
}

async function processar({ chatId, nome, ultima }) {
  estado.emAndamento.set(chatId, Date.now());
  try {
    const texto = await gerarResposta(chatId, nome);

    if (estado.modo === "autopilot") {
      // Credita a mensagem à Júlia antes do envio: o listener de
      // message_create herda a autoria e o dashboard mostra "Júlia IA".
      deps.marcarAutor(chatId, IA_SELLER_ID);
      await deps.sendDirectMessage({ number: chatId, text: texto, chatId, signatureId: null });
      estado.respondidas.set(chatId, { mensagemId: buildFingerprint(ultima), hora: Date.now() });
      estado.stats.respostas += 1;
      estado.ultimaAcao = { tipo: "resposta", chatId, nome, hora: Date.now() };
      deps.io.emit("whatsapp:ia-acao", { tipo: "resposta", chatId, nome, texto });
      deps.emitToast(`🤖 Júlia IA respondeu ${nome}`);
    } else {
      estado.sugestoes.set(chatId, { texto, mensagemId: buildFingerprint(ultima), hora: Date.now() });
      estado.stats.sugestoes += 1;
      estado.ultimaAcao = { tipo: "sugestao", chatId, nome, hora: Date.now() };
      deps.io.emit("whatsapp:ia-sugestao", { chatId, nome, texto });
      deps.emitToast(`🤖 Júlia IA sugeriu resposta para ${nome}`);
    }
  } catch (error) {
    estado.stats.falhas += 1;
    console.error("[julia-ia]", chatId, "-", error.message);
  } finally {
    estado.emAndamento.delete(chatId);
  }
}

function loop() {
  const pendentes = candidatos();
  if (pendentes.length) {
    const vagas = Math.max(0, MAX_CONCORRENTES - estado.emAndamento.size);
    for (const alvo of pendentes.slice(0, vagas)) {
      processar(alvo); // fire-and-forget: ela atende vários chats ao mesmo tempo
    }
  }
  setTimeout(loop, INTERVALO_MS);
}

function enviarSugestao(chatId) {
  const sugestao = estado.sugestoes.get(chatId);
  if (!sugestao) return { ok: false, erro: "Sem sugestão pendente para esta conversa." };
  estado.sugestoes.delete(chatId);
  estado.respondidas.set(chatId, { mensagemId: sugestao.mensagemId, hora: Date.now() });
  deps.marcarAutor(chatId, IA_SELLER_ID);
  deps
    .sendDirectMessage({ number: chatId, text: sugestao.texto, chatId, signatureId: null })
    .then(() => {
      estado.stats.respostas += 1;
      deps.io.emit("whatsapp:ia-acao", { tipo: "resposta", chatId, nome: nomeDoChat(chatId), texto: sugestao.texto });
    })
    .catch((error) => {
      estado.stats.falhas += 1;
      console.error("[julia-ia] falha ao enviar sugestão:", error.message);
    });
  return { ok: true, mensagem: "Resposta enviada." };
}

function descartarSugestao(chatId) {
  if (!estado.sugestoes.has(chatId)) return { ok: false, erro: "Sem sugestão pendente." };
  estado.sugestoes.delete(chatId);
  return { ok: true, mensagem: "Sugestão descartada." };
}

function atribuirLead(chatId) {
  if (!deps) return { ok: false, erro: "Servidor não pronto." };
  deps.store.chatAssignments[chatId] = IA_SELLER_ID;
  deps.store.chats = deps.store.chats.map((chat) =>
    chat.chatId === chatId ? { ...chat, assignedSellerId: IA_SELLER_ID } : chat
  );
  deps.persistStore();
  deps.emitToast(`Lead ${nomeDoChat(chatId)} passado para a Júlia IA`);
  return { ok: true, mensagem: "Lead atribuído à Júlia IA." };
}

module.exports = {
  IA_SELLER_ID,
  iniciar,
  resumo,
  definirModo,
  enviarSugestao,
  descartarSugestao,
  atribuirLead,
};
