/**
 * VITOR.IA — prospector digital da loja.
 *
 * Roda DENTRO do servidor de WhatsApp (VPS). Pega prospects da base do site
 * (app/api/beto/fila, protegida por BETO_TOKEN), manda o primeiro contato
 * pelo MESMO número da loja e registra o resultado de volta.
 *
 * Proteções contra banimento (nunca desativar):
 *  - Teto diário baixo por padrão (BETO_MAX_DIA=20) e mensagem pessoal com o
 *    nome da pessoa — disparo em massa é o padrão clássico de ban.
 *  - Só trabalha em horário comercial (BETO_HORA_INI..FIM).
 *  - Intervalo aleatório entre envios (BETO_DELAY_MIN..MAX ms).
 *  - Nunca escreve para quem já conversa com a loja (mensagem nos últimos
 *    BETO_DIAS_RECENTES dias): interromper atendimento ativo gera denúncia.
 *  - Nunca escreve para quem pediu sair (opt-out vive na própria linha).
 */

const BETO_URL = (process.env.BETO_URL || "https://www.balao.info").replace(/\/$/, "");
const BETO_TOKEN = process.env.BETO_TOKEN || "";
// Instância principal (número da loja): a VITOR.IA pergunta aqui se a pessoa já
// conversa com a loja antes de escrever do número dele.
const BETO_CRM_URL = (process.env.BETO_CRM_URL || "https://srv1963897.hstgr.cloud").replace(/\/$/, "");
const BETO_PANEL_TOKEN = process.env.BETO_PANEL_TOKEN || "";

const MAX_DIA_PADRAO = Number(process.env.BETO_MAX_DIA) || 20;
const HORA_INI = Number(process.env.BETO_HORA_INI) || 9;
const HORA_FIM = Number(process.env.BETO_HORA_FIM) || 18;
const DELAY_MIN_MS = Number(process.env.BETO_DELAY_MIN) || 60_000;
const DELAY_MAX_MS = Number(process.env.BETO_DELAY_MAX) || 240_000;
const DIAS_RECENTES = Number(process.env.BETO_DIAS_RECENTES) || 45;
const LOOP_MS = 45_000;
const IDADE_CONTATO_MS = 10 * 24 * 60 * 60 * 1000; // mapa de contatados guarda 10 dias

const MENSAGEM_PADRAO = [
  "Oi {nome}! Tudo bem? 👋",
  "",
  "Aqui é da *Balão da Informática Castelo*, lá do Cambuí — você já falou com a gente uma vez.",
  "",
  "Passando rapidinho pra perguntar: precisa de algo pra sua máquina? 💻",
  "PC gamer, notebook, upgrade, manutenção… qualquer coisa, é só responder aqui que um vendedor te atende na hora.",
  "",
  "Se não quiser mais receber mensagens, é só responder *sair*.",
].join("\n");

const OPT_OUT_ACK = "Ok! 👍 Anotado aqui — você não recebe mais mensagens da gente. Desculpa o incômodo, e a Balão segue à disposição se um dia precisar.";

const estado = {
  ativo: process.env.BETO_ATIVO === "1",
  maxDia: MAX_DIA_PADRAO,
  mensagem: process.env.BETO_MENSAGEM || MENSAGEM_PADRAO,
  enviadosHoje: 0,
  diaAtual: "",
  stats: null, // espelho do site
  ultimaAcao: null,
  contatados: new Map(), // whatsapp -> { nome, em }
};

let deps = null; // { store, persistStore, io, emitToast, marcarAutor, sendDirectMessage, whatsappConectado }
let emVoo = false;
let pausaAte = 0;

/* ---------------- utilidades ---------------- */

function normalizarNumero(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("55")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(-11);
}

function nomesDeChats() {
  const mapa = new Map(); // 11 dígitos -> nome
  for (const chat of deps.store.chats || []) {
    const chave = normalizarNumero(chat.realNumber || chat.chatId);
    if (!chave || chave.length < 10) continue;
    if (!mapa.has(chave)) mapa.set(chave, chat.name || chat.realNumber || chave);
  }
  return mapa;
}

async function conversaRecente(whatsapp) {
  // Pergunta à instância principal da loja: quem tem conversa recente lá
  // não é prospect — é cliente. A instância da VITOR.IA só conhece os chats dele.
  try {
    const resposta = await fetch(
      `${BETO_CRM_URL}/api/crm/contato-recente?numero=${encodeURIComponent(whatsapp)}&dias=${DIAS_RECENTES}`,
      {
        headers: { Authorization: `Bearer ${BETO_PANEL_TOKEN}` },
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (resposta.ok) {
      const dados = await resposta.json();
      if (dados && typeof dados.recente === "boolean") return dados.recente;
    }
  } catch (error) {
    console.error("[beto] falha ao consultar a loja:", error.message);
    // Na dúvida, não escreve: bloqueio seguro.
    return true;
  }

  // Fallback local (chats do próprio número da VITOR.IA).
  const agora = Date.now();
  const chave = normalizarNumero(whatsapp);
  for (const m of deps.store.messages || []) {
    const chatNum = normalizarNumero(m.chatId);
    if (chatNum !== chave) continue;
    if (agora - (m.timestamp || 0) <= DIAS_RECENTES * 24 * 60 * 60 * 1000) return true;
  }
  return false;
}

function horarioComercial() {
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  return h >= HORA_INI && h < HORA_FIM;
}

function ehPedidoDeOptout(texto) {
  const t = String(texto || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!t) return false;
  const pedidos = [
    "sair", "pare", "para", "não quero", "nao quero", "não me mande", "nao me mande",
    "pare de mandar", "para de mandar", "não me envie", "nao me envie", "tira meu numero",
    "tira meu número", "remove", "nunca mais", "opt-out", "optout", "descadastr",
  ];
  return pedidos.some((p) => t === p || t.includes(p));
}

function montarMensagem(nome) {
  let base = String(estado.mensagem || MENSAGEM_PADRAO).trim();
  if (nome && nome.trim()) {
    return base.replace(/\{nome\}/gi, nome.trim().split(" ")[0]);
  }
  return base.replace(/\{nome\}/gi, "").replace(/\s{2,}/g, " ").trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chamarSite(caminho, opcoes = {}) {
  if (!BETO_TOKEN) throw new Error("BETO_TOKEN não configurado na VPS");
  const resposta = await fetch(`${BETO_URL}${caminho}`, {
    method: opcoes.method || "GET",
    headers: {
      Authorization: `Bearer ${BETO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  if (!resposta.ok) throw new Error(`site respondeu HTTP ${resposta.status}`);
  return resposta.json();
}

async function registrar(whatsapp, status, observacao) {
  try {
    await chamarSite("/api/beto/status", {
      method: "POST",
      body: { whatsapp, status, observacao: observacao || undefined },
    });
  } catch (error) {
    console.error("[beto] falha ao registrar status:", error.message);
  }
}

/* ---------------- ciclo de resposta ---------------- */

async function detectarRespostas() {
  const agora = Date.now();
  for (const [whatsapp, registro] of estado.contatados) {
    if (agora - registro.em > IDADE_CONTATO_MS) {
      estado.contatados.delete(whatsapp);
      continue;
    }
    const chave = normalizarNumero(whatsapp);
    for (const m of deps.store.messages || []) {
      if (normalizarNumero(m.chatId) !== chave) continue;
      if (m.direction !== "in") continue;
      if ((m.timestamp || 0) <= registro.em) continue;

      if (ehPedidoDeOptout(m.body)) {
        estado.contatados.delete(whatsapp);
        await registrar(whatsapp, "optout", "pediu para não ser contatado");
        estado.ultimaAcao = { tipo: "optout", whatsapp, em: agora };
        deps.emitToast(`🤖 VITOR.IA: ${registro.nome || whatsapp} pediu para sair da lista`);
        try {
          await deps.sendDirectMessage({ number: whatsapp, text: OPT_OUT_ACK, chatId: null, signatureId: null, autorId: "beto" });
        } catch {}
        break;
      }

      estado.contatados.delete(whatsapp);
      await registrar(whatsapp, "respondeu", "respondeu ao primeiro contato da VITOR.IA");
      estado.ultimaAcao = { tipo: "resposta", whatsapp, em: agora };
      deps.emitToast(`🤖 VITOR.IA: ${registro.nome || whatsapp} respondeu!`);
      deps.io.emit("whatsapp:beto-acao", { tipo: "resposta", whatsapp, nome: registro.nome });
      break;
    }
  }
}

/* ---------------- ciclo de envio ---------------- */

async function enviarProximo() {
  const agora = new Date();
  const dia = agora.toISOString().slice(0, 10);
  if (estado.diaAtual !== dia) {
    estado.diaAtual = dia;
    estado.enviadosHoje = 0;
  }

  if (!estado.ativo) return;
  if (Date.now() < pausaAte) return;
  if (!horarioComercial()) return;
  if (estado.enviadosHoje >= estado.maxDia) return;
  if (!deps.whatsappConectado()) return;

  let prospect = null;
  try {
    const dados = await chamarSite("/api/beto/fila?limite=1");
    estado.stats = dados.stats || null;
    prospect = (dados.fila || [])[0] || null;
  } catch (error) {
    estado.stats = null;
    console.error("[beto] falha ao buscar fila:", error.message);
    pausaAte = Date.now() + 10 * 60_000;
    return;
  }

  if (!prospect) {
    pausaAte = Date.now() + 10 * 60_000; // fila vazia: não martela o site
    return;
  }

  const { whatsapp, nome, empresa } = prospect;

  // Quem já fala com a loja não é prospect: é cliente. Manda de volta.
  if (conversaRecente(whatsapp)) {
    await registrar(whatsapp, "descartado", "já fala com a loja (conversa recente)");
    estado.ultimaAcao = { tipo: "pulado", whatsapp, em: Date.now() };
    return;
  }

  const texto = montarMensagem(nome);
  try {
    await deps.sendDirectMessage({ number: whatsapp, text: texto, chatId: null, signatureId: null, autorId: "beto" });
  } catch (error) {
    await registrar(whatsapp, "novo", `envio falhou: ${error.message}`.slice(0, 300));
    estado.ultimaAcao = { tipo: "falha", whatsapp, em: Date.now() };
    pausaAte = Date.now() + 5 * 60_000;
    return;
  }

  await registrar(whatsapp, "contatado", "primeiro contato enviado pelo VITOR.IA");
  estado.contatados.set(whatsapp, { nome: nome || empresa || null, em: Date.now() });
  estado.enviadosHoje += 1;
  estado.ultimaAcao = { tipo: "enviado", whatsapp, em: Date.now() };

  deps.io.emit("whatsapp:beto-acao", { tipo: "enviado", whatsapp, nome });
  deps.emitToast(`🤖 VITOR.IA: primeiro contato com ${nome || whatsapp}`);

  // Intervalo aleatório: humano, não robô de disparo.
  const pausa = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
  pausaAte = Date.now() + pausa;
}

/* ---------------- loop principal ---------------- */

async function loop() {
  if (emVoo) return setTimeout(loop, LOOP_MS);
  emVoo = true;
  try {
    if (estado.ativo) {
      await detectarRespostas();
      await enviarProximo();
    }
  } catch (error) {
    console.error("[beto] erro no loop:", error.message);
  } finally {
    emVoo = false;
    setTimeout(loop, LOOP_MS);
  }
}

function iniciar(d) {
  deps = d;
  if (deps.store && deps.store.beto) {
    estado.ativo = Boolean(deps.store.beto.ativo);
    estado.maxDia = Number(deps.store.beto.maxDia) || MAX_DIA_PADRAO;
    estado.mensagem = deps.store.beto.mensagem || MENSAGEM_PADRAO;
    estado.enviadosHoje = Number(deps.store.beto.enviadosHoje) || 0;
    estado.diaAtual = deps.store.beto.diaAtual || "";
  }
  setTimeout(loop, 10_000);
}

function resumo() {
  return {
    ativo: estado.ativo,
    maxDia: estado.maxDia,
    mensagem: estado.mensagem,
    enviadosHoje: estado.enviadosHoje,
    stats: estado.stats,
    ultimaAcao: estado.ultimaAcao,
    tokenConfigurado: Boolean(BETO_TOKEN),
    horarioComercial: horarioComercial(),
  };
}

function definirConfig({ ativo, maxDia, mensagem }) {
  let mudou = false;
  if (typeof ativo === "boolean" && ativo !== estado.ativo) {
    estado.ativo = ativo;
    mudou = true;
  }
  if (typeof maxDia === "number" && maxDia >= 1 && maxDia <= 500 && maxDia !== estado.maxDia) {
    estado.maxDia = maxDia;
    mudou = true;
  }
  if (typeof mensagem === "string" && mensagem.trim() && mensagem.trim() !== estado.mensagem) {
    estado.mensagem = mensagem.trim();
    mudou = true;
  }
  if (mudou && deps) {
    deps.store.beto = {
      ativo: estado.ativo,
      maxDia: estado.maxDia,
      mensagem: estado.mensagem,
      enviadosHoje: estado.enviadosHoje,
      diaAtual: estado.diaAtual,
    };
    deps.persistStore();
    deps.emitToast(`VITOR.IA: ${estado.ativo ? "ligado" : "desligado"} · teto de ${estado.maxDia}/dia`);
  }
  return resumo();
}

module.exports = { iniciar, resumo, definirConfig, montarMensagem, ehPedidoDeOptout };
