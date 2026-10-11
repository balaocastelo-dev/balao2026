// Bancada da fase 1: servidor REAL, Evolution falsa com o comportamento da
// 2.3.7 (e2e/evolution-falsa.js) e o banco da loja num Postgres de verdade.
//
//   FASE1_TESTE_DB=postgresql://postgres@127.0.0.1:5432/fase1_teste node e2e/fase1.e2e.mjs
//
// O banco indicado tem as tabelas crm_* APAGADAS. Para provar que cada teste
// pega o bug, rode também contra o código antigo:
//
//   SERVIDOR=/caminho/do/codigo-antigo/whatsapp-server/servidor.js FASE1_TESTE_DB=... node e2e/fase1.e2e.mjs
//
// (é a regra do e2e/README.md: teste que não falha contra o bug não prova nada).

import { io } from "socket.io-client";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { criarEvolutionFalsa } = require("./evolution-falsa.js");
const { Pool } = require("pg");

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = process.env.SERVIDOR || path.join(AQUI, "..", "servidor.js");
const DB = process.env.FASE1_TESTE_DB;
if (!DB) {
  console.log("Defina FASE1_TESTE_DB (um banco Postgres de teste; as tabelas crm_* são apagadas).");
  process.exit(2);
}
const PORTA = 4131;
const R = fs.mkdtempSync(path.join(os.tmpdir(), "bancada-fase1-"));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let passaram = 0;
let falharam = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "  PASSOU" : "  FALHOU"}  ${nome}${extra ? ` — ${extra}` : ""}`);
  cond ? passaram++ : falharam++;
};

// ---- banco limpo ----
const banco = new Pool({ connectionString: DB, max: 2 });
await banco.query(`DROP TABLE IF EXISTS crm_mensagem, crm_contato, crm_evento, crm_interesse, crm_contato_etiqueta,
                   crm_etiqueta, crm_nota, crm_consentimento, crm_resposta_rapida, crm_config, migracao CASCADE`);

// ---- Evolution falsa e servidor real ----
const evo = criarEvolutionFalsa({ porta: 4598 + 40, portaSite: 4599 + 40 });
await evo.ligar();
const SEG = "segredo-de-bancada-da-fase1";
fs.mkdirSync(path.join(R, "dados"), { recursive: true });
fs.writeFileSync(path.join(R, "dados", "webhook.segredo"), SEG);
fs.writeFileSync(path.join(R, "dados", "transcricao.segredo"), "segredo-do-trabalhador");

const agora = () => Math.floor(Date.now() / 1000);
const CLIENTE = "5500000000101@s.whatsapp.net";
const CHAT = "5500000000101@c.us";
// Mensagem que já está na Evolution ANTES do boot (para a lista inteira ter o que ler).
evo.guardar({ key: { id: "ANTIGA1", remoteJid: CLIENTE, fromMe: false }, pushName: "Cliente Falso", messageType: "conversation", message: { conversation: "oi" }, messageTimestamp: agora() - 7200 });

const servidor = spawn(process.execPath, [SERVIDOR], {
  env: {
    ...process.env,
    DATA_ROOT: path.join(R, "dados"),
    WHATSAPP_PANEL_PORT: String(PORTA),
    EVOLUTION_URL: evo.url,
    EVOLUTION_API_KEY: "teste",
    EVOLUTION_INSTANCIA: "loja",
    SITE_URL: evo.urlSite,
    WHATSAPP_PANEL_ALLOWED_ORIGIN: "http://localhost:3999",
    CRM_DB_URL: DB,
    VIGIA: "0",
    VERSAO: "bancada-fase1",
    URL_INTERNA_SERVIDOR: `http://localhost:${PORTA}`,
    REDE_A_CADA_MS: "1500",
    CONCILIAR_A_CADA_MS: "600000",
    TRANSCRICAO_URL: evo.url,
    TRANSCRICAO_PUXADA: "1",
    UPLOAD_LIMITE_MB: "2",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
const log = [];
servidor.stdout.on("data", (b) => log.push(String(b)));
servidor.stderr.on("data", (b) => log.push(String(b)));

const encerrar = async (codigo) => {
  servidor.kill("SIGKILL");
  evo.fechar();
  await banco.end().catch(() => {});
  fs.rmSync(R, { recursive: true, force: true });
  process.exit(codigo);
};

const corpoTicket = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
const TICKET = `v1.${corpoTicket}.sig`;
const webhook = (event, data) =>
  fetch(`http://localhost:${PORTA}/evolution/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-balao-webhook": SEG },
    body: JSON.stringify({ event, instance: "loja", data }),
  });
/** Como a Evolution: guarda no banco dela E avisa por webhook. */
const chega = async (rec, evento = "messages.upsert") => {
  evo.guardar(rec);
  await webhook(evento, rec);
};
const saude = async () => (await fetch(`http://localhost:${PORTA}/health`)).json();
const ate = async (fn, ms = 4000) => {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    const v = await fn();
    if (v) return v;
    await esperar(100);
  }
  return null;
};

try {
  // Espera o servidor e o Centro de Comando (banco) subirem.
  const subiu = await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).catch(() => null))?.ok, 15000);
  if (!subiu) throw new Error("servidor não subiu");
  await ate(async () => log.join("").includes("Centro de Comando ligado"), 15000);
  await esperar(500);

  const painel = io(`http://localhost:${PORTA}`, { auth: { ticket: TICKET }, transports: ["websocket"] });
  const ev = { message: [], update: [], parcial: [], transcricao: [], toast: [], status: [], settings: [], messages: [] };
  painel.on("whatsapp:message", (m) => ev.message.push(m));
  painel.on("whatsapp:message-update", (m) => ev.update.push(m));
  painel.on("whatsapp:chats-parcial", (l) => ev.parcial.push(...l));
  painel.on("whatsapp:transcricao", (m) => ev.transcricao.push(m));
  painel.on("whatsapp:toast", (m) => ev.toast.push(m));
  painel.on("whatsapp:message-status", (m) => ev.status.push(m));
  painel.on("whatsapp:settings", (m) => ev.settings.push(m));
  painel.on("whatsapp:messages", (l) => ev.messages.push(l));
  await new Promise((r, rej) => {
    painel.on("connect", r);
    painel.on("connect_error", (e) => rej(new Error(e.message)));
    setTimeout(() => rej(new Error("painel não conectou")), 5000);
  });
  const emitir = (evento, dados, ms = 4000) =>
    new Promise((r) => {
      const t = setTimeout(() => r(null), ms);
      painel.emit(evento, dados, (resp) => {
        clearTimeout(t);
        r(resp);
      });
    });

  console.log("\n— webhook e recarga —");
  const inscritos = evo.webhook()?.events || [];
  ok(
    "assina MESSAGES_EDITED, CHATS_UPSERT, CHATS_UPDATE e CALL",
    ["MESSAGES_EDITED", "CHATS_UPSERT", "CHATS_UPDATE", "CALL"].every((e) => inscritos.includes(e)),
    inscritos.join(",")
  );
  await esperar(2200); // passa uma rodada da rede de segurança (REDE_A_CADA_MS=1500)
  const fc = evo.chamadas.filter((c) => c.rota === "findChats");
  ok("lista INTEIRA só uma vez (no boot)", fc.filter((c) => c.tipo === "completa").length === 1, fc.map((c) => c.tipo).join(","));
  ok("rede de segurança: findChats só da janela de tempo", fc.some((c) => c.tipo === "janela"), fc.map((c) => c.tipo).join(","));

  console.log("\n— mensagem nova: seq e latência —");
  await chega({ key: { id: "M1", remoteJid: CLIENTE, fromMe: false }, pushName: "Cliente Falso", messageType: "conversation", message: { conversation: "tem fonte de 650W?" }, messageTimestamp: agora() });
  const m1 = await ate(() => ev.message.find((m) => m.id === "M1"));
  ok("a mensagem chega ao painel com o seq do banco", typeof m1?.seq === "number" && m1.seq > 0, JSON.stringify(m1?.seq));
  const h = await saude();
  const lat = h.diagnostico?.latencia?.webhook;
  ok("/health mostra a latência do webhook (mediana e p95)", lat?.amostras >= 1 && Number.isFinite(lat?.total?.medianaMs) && Number.isFinite(lat?.total?.p95Ms), JSON.stringify(lat));
  ok("/health separa os caminhos", ["webhook", "varredura", "historico"].every((c) => h.diagnostico?.latencia?.[c]), Object.keys(h.diagnostico?.latencia || {}).join(","));

  console.log("\n— reação, edição, citação, apagada —");
  await chega({ key: { id: "R1", remoteJid: CLIENTE, fromMe: false }, messageType: "reactionMessage", message: { reactionMessage: { key: { id: "M1", remoteJid: CLIENTE, fromMe: false }, text: "👍", senderTimestampMs: String(Date.now()) } }, messageTimestamp: agora() });
  const r1 = await ate(() => ev.update.find((u) => u.id === "M1" && u.patch?.reacoes));
  ok("reação vira whatsapp:message-update na mensagem-alvo", r1?.patch?.reacoes?.[0]?.emoji === "👍" && r1.patch.reacoes[0].de === "cliente", JSON.stringify(r1));

  await webhook("messages.edited", { key: { id: "M1", remoteJid: "5500000000999@s.whatsapp.net", fromMe: true }, type: 14, editedMessage: { conversation: "tem fonte de 750W?" }, timestampMs: String(Date.now()) });
  const e1 = await ate(() => ev.update.find((u) => u.id === "M1" && u.patch?.body));
  ok("edição (MESSAGES_EDITED) troca o texto e marca editada", e1?.patch?.body === "tem fonte de 750W?" && e1.patch.editadaEm > 0, JSON.stringify(e1?.patch));

  await chega({ key: { id: "M2", remoteJid: CLIENTE, fromMe: true }, messageType: "conversation", message: { conversation: "temos sim" }, messageTimestamp: agora() }, "send.message");
  await ate(() => ev.message.find((m) => m.id === "M2"));
  await webhook("messages.update", { keyId: "M2", remoteJid: CLIENTE, fromMe: true, status: "SERVER_ACK", message: { editedMessage: { message: { conversation: "temos sim, de 750W" } } } });
  const e2 = await ate(() => ev.update.find((u) => u.id === "M2" && u.patch?.body));
  ok("edição que vem por MESSAGES_UPDATE também vale (não vira recibo)", e2?.patch?.body === "temos sim, de 750W", JSON.stringify(e2?.patch));

  await chega({ key: { id: "M3", remoteJid: CLIENTE, fromMe: false }, messageType: "conversation", message: { conversation: "essa mesma" }, contextInfo: { stanzaId: "M2", participant: "5500000000999@s.whatsapp.net", quotedMessage: { conversation: "temos sim" } }, messageTimestamp: agora() });
  const m3 = await ate(() => ev.message.find((m) => m.id === "M3"));
  ok("citação chega com id e trecho", m3?.citada?.id === "M2" && m3.citada.trecho === "temos sim", JSON.stringify(m3?.citada));

  await webhook("messages.delete", { remoteJid: CLIENTE, fromMe: false, id: "M3", status: "DELETED" });
  const d1 = await ate(() => ev.update.find((u) => u.id === "M3" && u.patch?.apagada));
  ok("apagada para todos vira patch { apagada: true }", d1?.patch?.apagada === true, JSON.stringify(d1));
  const noBanco = (await banco.query(`SELECT corpo, apagada FROM crm_mensagem WHERE id = 'M3'`).catch(() => ({ rows: [] }))).rows[0];
  ok("o texto da apagada continua no banco", noBanco?.apagada === true && noBanco.corpo === "essa mesma", JSON.stringify(noBanco));

  console.log("\n— ligação —");
  await webhook("call", { id: "CHAMADA1", from: CLIENTE, chatId: CLIENTE, status: "offer", isVideo: false, isGroup: false, date: new Date().toISOString() });
  const l1 = await ate(() => ev.message.find((m) => m.ligacao));
  ok("ligação entra na conversa e avisa o painel", l1?.chatId === CHAT && l1.ligacao.estado === "tocando" && ev.toast.some((t) => /Ligação/.test(t.message)), JSON.stringify(l1?.ligacao));
  await webhook("call", { id: "CHAMADA1", from: CLIENTE, chatId: CLIENTE, status: "terminate", isVideo: false, isGroup: false, date: new Date().toISOString() });
  const l2 = await ate(() => ev.update.find((u) => u.patch?.ligacao?.estado === "perdida"));
  ok("ligação não atendida vira 'perdida'", Boolean(l2), JSON.stringify(l2?.patch));

  console.log("\n— conversa lida no celular —");
  const OUTRO = "5500000000102@s.whatsapp.net";
  await chega({ key: { id: "L1", remoteJid: OUTRO, fromMe: false }, pushName: "Outro", messageType: "conversation", message: { conversation: "oi" }, messageTimestamp: agora() });
  await chega({ key: { id: "L2", remoteJid: OUTRO, fromMe: false }, pushName: "Outro", messageType: "conversation", message: { conversation: "tem alguém?" }, messageTimestamp: agora() + 1 });
  const naoLidas = await ate(() => ev.parcial.filter((c) => c.chatId === "5500000000102@c.us").pop()?.unreadCount === 2);
  ok("duas mensagens = duas não lidas", Boolean(naoLidas));
  ev.parcial.length = 0;
  await webhook("messages.update", { keyId: "L2", remoteJid: OUTRO, fromMe: false, status: "READ" });
  const zerou = await ate(() => ev.parcial.find((c) => c.chatId === "5500000000102@c.us" && c.unreadCount === 0));
  ok("recibo de leitura da mensagem do cliente zera as não lidas", Boolean(zerou));

  console.log("\n— CHATS_UPDATE relê só a conversa —");
  const antes = evo.chamadas.length;
  await webhook("chats.update", [{ remoteJid: OUTRO, instanceId: "x" }]);
  const releu = await ate(() => evo.chamadas.slice(antes).find((c) => c.rota === "findChats" && c.tipo === "conversa" && c.remoteJid === OUTRO));
  ok("findChats só daquela conversa", Boolean(releu));
  ok("e a lista inteira não foi pedida de novo", evo.chamadas.filter((c) => c.rota === "findChats" && c.tipo === "completa").length === 1);

  console.log("\n— mídia nas duas direções —");
  evo.midias.set("FOTO1", { base64: Buffer.from("jpeg-de-mentira-que-a-loja-mandou-pelo-celular").toString("base64"), mimetype: "image/jpeg", fileName: null });
  await chega({ key: { id: "FOTO1", remoteJid: CLIENTE, fromMe: true }, messageType: "imageMessage", message: { imageMessage: { mimetype: "image/jpeg", caption: "olha a fonte" } }, messageTimestamp: agora() }, "send.message");
  const baixou = await ate(() => fs.existsSync(path.join(R, "dados", "data", "midia", "FOTO1.json")));
  ok("foto que a LOJA mandou pelo celular é baixada na chegada", Boolean(baixou), evo.chamadas.filter((c) => c.rota === "getBase64").map((c) => c.id).join(","));

  console.log("\n— histórico pelo banco da loja —");
  const X = "5500000000177@c.us";
  for (let i = 0; i < 30; i++) {
    await banco.query(
      `INSERT INTO crm_mensagem (id, chat_id, direcao, corpo, em, chave, de_mim) VALUES ($1,$2,'in',$3,$4,$5,false)`,
      [`HIST${String(i).padStart(2, "0")}`, X, `mensagem antiga ${i}`, new Date(Date.now() - (60 - i) * 60_000), JSON.stringify({ id: `HIST${i}`, remoteJid: "5500000000177@s.whatsapp.net", fromMe: false })]
    ).catch(() => {});
  }
  const fmAntes = evo.chamadas.filter((c) => c.rota === "findMessages").length;
  const h1 = await emitir("panel:carregar-historico", { chatId: X, limite: 20 });
  const lote1 = ev.messages.at(-1) || [];
  ok("abre a conversa pelo banco: as 20 mais recentes", h1?.ok && lote1.length === 20 && lote1.at(-1)?.id === "HIST29", `${lote1.length} msgs, última ${lote1.at(-1)?.id}`);
  ok("sem ir à Evolution (o banco tinha a página cheia)", evo.chamadas.filter((c) => c.rota === "findMessages").length === fmAntes);
  const maisAntiga = lote1[0]?.timestamp;
  const h2 = await emitir("panel:carregar-historico", { chatId: X, limite: 20, antesDe: maisAntiga });
  const lote2 = ev.messages.at(-1) || [];
  ok("maisAntigas pagina para trás pela data", h2?.ok && lote2.length === 10 && lote2.every((m) => m.timestamp < maisAntiga), `${lote2.length} msgs`);

  console.log("\n— panel:desde —");
  const seqAntes = m1?.seq || 0;
  const desde = await emitir("panel:desde", { seq: seqAntes });
  const ids = (desde?.mensagens || []).map((m) => m.id);
  ok("devolve o que veio depois do seq (e o seq atual)", desde?.ok && ids.includes("M2") && ids.includes("L2") && desde.seq >= seqAntes, `${ids.length} msgs, seq ${desde?.seq}`);
  ok("inclui as mudanças (a M1 editada, com reação)", (desde?.mensagens || []).some((m) => m.id === "M1" && m.body === "tem fonte de 750W?" && m.reacoes?.length), "");

  console.log("\n— upload direto —");
  const arquivo = Buffer.alloc(300 * 1024, 7);
  const form = new FormData();
  form.append("chatId", CHAT);
  form.append("tempId", "temp-upload-1");
  form.append("legenda", "segue a foto");
  form.append("arquivo", new Blob([arquivo], { type: "image/jpeg" }), "foto.jpg");
  const up = await fetch(`http://localhost:${PORTA}/api/crm/upload`, { method: "POST", headers: { authorization: `Bearer ${TICKET}` }, body: form });
  const upJson = await up.json().catch(() => ({}));
  const envio = evo.chamadas.filter((c) => c.rota === "sendMedia").pop();
  ok("POST /api/crm/upload envia e devolve o id", up.status === 200 && upJson.ok && upJson.msgId, `${up.status} ${JSON.stringify(upJson)}`);
  ok("a Evolution recebeu URL interna (não base64) e o arquivo inteiro", envio?.porUrl && envio.bytes === arquivo.length && /\/interno\/upload\//.test(envio.url), JSON.stringify(envio));
  ok("o arquivo vira a mídia da mensagem (sem baixar de volta)", upJson.msgId && fs.existsSync(path.join(R, "dados", "data", "midia", `${String(upJson.msgId).replace(/[^A-Za-z0-9_-]/g, "")}.json`)));
  ok("o painel recebe a mensagem com o tempId", Boolean(await ate(() => ev.message.some((m) => m.tempId === "temp-upload-1"))));
  const semIngresso = await fetch(`http://localhost:${PORTA}/api/crm/upload`, { method: "POST", body: form });
  ok("sem ingresso: 401", semIngresso.status === 401, String(semIngresso.status));
  const grande = new FormData();
  grande.append("chatId", CHAT);
  grande.append("arquivo", new Blob([Buffer.alloc(3 * 1024 * 1024, 1)], { type: "video/mp4" }), "grande.mp4");
  const gr = await fetch(`http://localhost:${PORTA}/api/crm/upload`, { method: "POST", headers: { authorization: `Bearer ${TICKET}` }, body: grande });
  ok("acima do limite: 413", gr.status === 413, String(gr.status));
  const espiao = await fetch(`http://localhost:${PORTA}${envio?.url ? new URL(envio.url).pathname : "/interno/upload/x"}?k=errada`);
  ok("URL interna sem a chave certa: 404", espiao.status === 404, String(espiao.status));

  console.log("\n— transcrição no servidor —");
  ok("o painel é avisado de que o servidor transcreve", ev.settings.some((s) => s?.apiInfo?.transcricaoNoServidor === true));
  evo.midias.set("AUDIO1", { base64: Buffer.from("OggS-audio-de-mentira").toString("base64"), mimetype: "audio/ogg; codecs=opus", fileName: null });
  await chega({ key: { id: "AUDIO1", remoteJid: CLIENTE, fromMe: false }, messageType: "audioMessage", message: { audioMessage: { ptt: true, mimetype: "audio/ogg; codecs=opus", seconds: 4 } }, messageTimestamp: agora() });
  const t1 = await ate(() => ev.transcricao.find((t) => t.id === "AUDIO1"), 6000);
  const whisper = evo.chamadas.find((c) => c.rota === "whisper");
  ok("áudio que entra é transcrito sozinho (sem abrir a conversa)", t1?.texto === "quero saber o preço da fonte de 650W" && t1.chatId === CHAT, JSON.stringify(t1));
  ok("pedido em português, com o arquivo", whisper?.portugues && whisper.temArquivo, JSON.stringify(whisper));
  const tb = (await banco.query(`SELECT transcricao FROM crm_mensagem WHERE id = 'AUDIO1'`).catch(() => ({ rows: [] }))).rows[0];
  ok("o texto fica no banco", tb?.transcricao === "quero saber o preço da fonte de 650W");
  const p1 = await fetch(`http://localhost:${PORTA}/api/transcricao/pendentes`);
  const p2 = await fetch(`http://localhost:${PORTA}/api/transcricao/pendentes`, { headers: { "x-transcricao-segredo": "segredo-do-trabalhador" } });
  ok("trabalhador sem o segredo: 401; com o segredo: 200", p1.status === 401 && p2.status === 200, `${p1.status} / ${p2.status}`);

  painel.close();
} catch (e) {
  console.log("  ERRO NA BANCADA:", e.message);
  falharam++;
}

console.log(`\n${passaram} passaram, ${falharam} falharam\n`);
if (falharam && process.env.MOSTRAR_LOG) console.log(log.join("").slice(-4000));
await encerrar(falharam ? 1 : 0);
