/**
 * CLAUD.IA — cobradora & reativação da loja.
 *
 * Roda na instância PRINCIPAL (número da loja): ela conversa com quem já é
 * cliente, então o número certo é o que a pessoa conhece. A VITOR.IA fica no
 * número próprio dele; a CLAUD.IA nunca disputa o mesmo canal com a JUL.IA —
 * clientes com conversa recente são pulados automaticamente.
 *
 * Fontes (via site, protegidas por BETO_TOKEN):
 *  - pedidos com payment_status pendente (cobrança)
 *  - prospects que a VITOR.IA contatou há 3+ dias sem resposta (reativação)
 *
 * Proteções (nunca desativar):
 *  - teto diário baixo, horário comercial, intervalo aleatório
 *  - nunca escreve pra quem tem conversa recente com a loja
 *  - opt-out reconhecido e respeitado, com confirmação
 */

const SITE_URL = (process.env.SITE_URL || "https://www.balao.info").replace(/\/$/, "");
const BETO_TOKEN = process.env.BETO_TOKEN || "";

const MAX_DIA_PADRAO = Number(process.env.CARLA_MAX_DIA) || 10;
const HORA_INI = Number(process.env.CARLA_HORA_INI) || 9;
const HORA_FIM = Number(process.env.CARLA_HORA_FIM) || 18;
const DELAY_MIN_MS = Number(process.env.CARLA_DELAY_MIN) || 120_000;
const DELAY_MAX_MS = Number(process.env.CARLA_DELAY_MAX) || 300_000;
const DIAS_RECENTES = Number(process.env.CARLA_DIAS_RECENTES) || 45;
const LOOP_MS = 60_000;
const IDADE_CONTATO_MS = 10 * 24 * 60 * 60 * 1000;

const MENSAGEM_COBRANCA_PADRAO = [
  "Oi {nome}! Tudo bem?",
  "",
  "Aqui é a *CLAUD.IA*, assistente digital da *Balão da Informática Castelo* 🙂",
  "Passando só pra lembrar: seu pedido ({valor}) está com o pagamento pendente.",
  "Se tiver qualquer dúvida ou dificuldade, me conta aqui que a gente resolve com você. 🙏",
  "",
  "Não quer mais receber mensagens? É só responder *sair*.",
].join("\n");

const MENSAGEM_REATIVACAO_PADRAO = [
  "Oi {nome}! 👋",
  "",
  "Aqui é a *CLAUD.IA*, assistente digital da *Balão da Informática Castelo*.",
  "Faz um tempinho que a gente não se fala — passa aqui no Cambuí ou me chama se precisar de algo pra sua máquina!",
  "Esta semana temos ofertas novas em *PC gamer, notebooks e upgrades*. 💻",
  "",
  "Não quer mais receber mensagens? É só responder *sair*.",
].join("\n");

const OPT_OUT_ACK = "Ok! 👍 Anotado — você não recebe mais mensagens da gente. Desculpa o incômodo, e a Balão segue à disposição. 🙂";

const estado = {
  ativo: process.env.CARLA_ATIVO === "1",
  maxDia: MAX_DIA_PADRAO,
  mensagemCobranca: process.env.CARLA_MENSAGEM_COBRANCA || MENSAGEM_COBRANCA_PADRAO,
  mensagemReativacao: process.env.CARLA_MENSAGEM_REATIVACAO || MENSAGEM_REATIVACAO_PADRAO,
  enviadosHoje: 0,
  diaAtual: "",
  stats: null,
  ultimaAcao: null,
  contatados: new Map(),
};

let deps = null;
let emVoo = false;
let pausaAte = 0;

function normalizarNumero(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("55")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(-11);
}

function conversaRecente(whatsapp) {
  const agora = Date.now();
  const chave = normalizarNumero(whatsapp);
  for (const m of deps.store.messages || []) {
    if (normalizarNumero(m.chatId) !== chave) continue;
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

function montar(template, nome, extra) {
  let base = String(template || "").trim();
  if (nome && nome.trim()) base = base.replace(/\{nome\}/gi, nome.trim().split(" ")[0]);
  else base = base.replace(/\{nome\}/gi, "").replace(/\s{2,}/g, " ").trim();
  if (extra) {
    for (const [chave, valor] of Object.entries(extra)) {
      base = base.replace(new RegExp(`\\{${chave}\\}`, "gi"), valor);
    }
  }
  return base;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chamarSite(caminho, opcoes = {}) {
  if (!BETO_TOKEN) throw new Error("BETO_TOKEN não configurado");
  const resposta = await fetch(`${SITE_URL}${caminho}`, {
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

async function registrar(whatsapp, tipo, status, mensagem) {
  try {
    await chamarSite("/api/carla/status", {
      method: "POST",
      body: { whatsapp, tipo, status, mensagem: mensagem || undefined },
    });
  } catch (error) {
    console.error("[carla] falha ao registrar:", error.message);
  }
}

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
        await registrar(whatsapp, registro.tipo, "optout", "pediu para não ser contatado");
        estado.ultimaAcao = { tipo: "optout", whatsapp, em: agora };
        deps.emitToast(`📞 CLAUD.IA: ${registro.nome || whatsapp} pediu para sair`);
        try {
          await deps.sendDirectMessage({ number: whatsapp, text: OPT_OUT_ACK, chatId: null, signatureId: null, autorId: "carla" });
        } catch {}
        break;
      }

      estado.contatados.delete(whatsapp);
      await registrar(whatsapp, registro.tipo, "respondeu", "respondeu à CLAUD.IA");
      estado.ultimaAcao = { tipo: "resposta", whatsapp, em: agora };
      deps.emitToast(`📞 CLAUD.IA: ${registro.nome || whatsapp} respondeu!`);
      deps.io.emit("whatsapp:carla-acao", { tipo: "resposta", whatsapp, nome: registro.nome });
      break;
    }
  }
}

async function trabalhar() {
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

  let fila;
  try {
    const dados = await chamarSite("/api/carla/fila");
    fila = dados.fila || { cobranca: [], reativacao: [] };
  } catch (error) {
    console.error("[carla] falha ao buscar fila:", error.message);
    pausaAte = Date.now() + 10 * 60_000;
    return;
  }

  // Cobrança primeiro: dinheiro parado é prioridade.
  const alvo =
    (fila.cobranca || []).find((p) => !conversaRecente(p.whatsapp)) ||
    (fila.reativacao || []).find((p) => !conversaRecente(p.whatsapp)) ||
    null;

  if (!alvo) {
    pausaAte = Date.now() + 10 * 60_000;
    return;
  }

  const isCobranca = "total" in alvo && alvo.total !== undefined;
  const tipo = isCobranca ? "cobranca" : "reativacao";
  const texto = isCobranca
    ? montar(estado.mensagemCobranca, alvo.nome, { valor: `R$ ${Number(alvo.total).toFixed(2).replace(".", ",")}` })
    : montar(estado.mensagemReativacao, alvo.nome);

  try {
    await deps.sendDirectMessage({ number: alvo.whatsapp, text: texto, chatId: null, signatureId: null, autorId: "carla" });
  } catch (error) {
    await registrar(alvo.whatsapp, tipo, "descartado", `envio falhou: ${error.message}`.slice(0, 250));
    estado.ultimaAcao = { tipo: "falha", whatsapp: alvo.whatsapp, em: Date.now() };
    pausaAte = Date.now() + 5 * 60_000;
    return;
  }

  await registrar(alvo.whatsapp, tipo, "enviado", tipo === "cobranca" ? "lembrete de pendência" : "reativação");
  estado.contatados.set(alvo.whatsapp, { nome: alvo.nome || null, em: Date.now(), tipo });
  estado.enviadosHoje += 1;
  estado.ultimaAcao = { tipo, whatsapp: alvo.whatsapp, em: Date.now() };

  deps.io.emit("whatsapp:carla-acao", { tipo, whatsapp: alvo.whatsapp, nome: alvo.nome });
  deps.emitToast(`📞 CLAUD.IA: ${tipo} para ${alvo.nome || alvo.whatsapp}`);

  const pausa = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
  pausaAte = Date.now() + pausa;
}

async function loop() {
  if (emVoo) return setTimeout(loop, LOOP_MS);
  emVoo = true;
  try {
    if (estado.ativo) {
      await detectarRespostas();
      await trabalhar();
    }
  } catch (error) {
    console.error("[carla] erro no loop:", error.message);
  } finally {
    emVoo = false;
    setTimeout(loop, LOOP_MS);
  }
}

function iniciar(d) {
  deps = d;
  if (deps.store && deps.store.carla) {
    estado.ativo = Boolean(deps.store.carla.ativo);
    estado.maxDia = Number(deps.store.carla.maxDia) || MAX_DIA_PADRAO;
    estado.mensagemCobranca = deps.store.carla.mensagemCobranca || MENSAGEM_COBRANCA_PADRAO;
    estado.mensagemReativacao = deps.store.carla.mensagemReativacao || MENSAGEM_REATIVACAO_PADRAO;
    estado.enviadosHoje = Number(deps.store.carla.enviadosHoje) || 0;
    estado.diaAtual = deps.store.carla.diaAtual || "";
  }
  setTimeout(loop, 15_000);
}

function resumo() {
  return {
    ativo: estado.ativo,
    maxDia: estado.maxDia,
    mensagemCobranca: estado.mensagemCobranca,
    mensagemReativacao: estado.mensagemReativacao,
    enviadosHoje: estado.enviadosHoje,
    ultimaAcao: estado.ultimaAcao,
    tokenConfigurado: Boolean(BETO_TOKEN),
    horarioComercial: horarioComercial(),
  };
}

function definirConfig({ ativo, maxDia, mensagemCobranca, mensagemReativacao }) {
  let mudou = false;
  if (typeof ativo === "boolean" && ativo !== estado.ativo) {
    estado.ativo = ativo;
    mudou = true;
  }
  if (typeof maxDia === "number" && maxDia >= 1 && maxDia <= 500 && maxDia !== estado.maxDia) {
    estado.maxDia = maxDia;
    mudou = true;
  }
  if (typeof mensagemCobranca === "string" && mensagemCobranca.trim() && mensagemCobranca.trim() !== estado.mensagemCobranca) {
    estado.mensagemCobranca = mensagemCobranca.trim();
    mudou = true;
  }
  if (typeof mensagemReativacao === "string" && mensagemReativacao.trim() && mensagemReativacao.trim() !== estado.mensagemReativacao) {
    estado.mensagemReativacao = mensagemReativacao.trim();
    mudou = true;
  }
  if (mudou && deps) {
    deps.store.carla = {
      ativo: estado.ativo,
      maxDia: estado.maxDia,
      mensagemCobranca: estado.mensagemCobranca,
      mensagemReativacao: estado.mensagemReativacao,
      enviadosHoje: estado.enviadosHoje,
      diaAtual: estado.diaAtual,
    };
    deps.persistStore();
    deps.emitToast(`CLAUD.IA: ${estado.ativo ? "ligada" : "desligada"} · teto de ${estado.maxDia}/dia`);
  }
  return resumo();
}

module.exports = { iniciar, resumo, definirConfig, montar, ehPedidoDeOptout };
