// Bancada do disparo por tema: servidor REAL, Evolution falsa
// (e2e/evolution-falsa.js) e o banco da loja num Postgres de verdade.
// Nenhuma mensagem sai daqui: a Evolution é de mentira e os clientes são
// números inventados (5500000000xxx).
//
//   DISPARO_TESTE_DB=postgres://postgres:teste@localhost:5432/disparo_e2e node e2e/disparo.e2e.mjs
//
// O banco indicado tem as tabelas crm_* APAGADAS. O servidor sobe com o
// intervalo encurtado e o horário comercial desligado (DISPARO_INTERVALO_MS e
// DISPARO_JANELA_SEMPRE_ABERTA) — a regra exercitada é a da loja; só o relógio
// muda. O horário de verdade e o teto estão em crm/campanha.test.js.

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
const DB = process.env.DISPARO_TESTE_DB;
if (!DB) {
  console.log("Defina DISPARO_TESTE_DB (um banco Postgres de teste; as tabelas crm_* são apagadas).");
  process.exit(2);
}
const PORTA = 4151;
const R = fs.mkdtempSync(path.join(os.tmpdir(), "bancada-disparo-"));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let passaram = 0;
let falharam = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "  PASSOU" : "  FALHOU"}  ${nome}${extra ? ` — ${extra}` : ""}`);
  cond ? passaram++ : falharam++;
};

const banco = new Pool({ connectionString: DB, max: 2 });
await banco.query(`DROP TABLE IF EXISTS crm_campanha_envio, crm_campanha, crm_mensagem, crm_contato, crm_evento,
                   crm_interesse, crm_contato_etiqueta, crm_etiqueta, crm_nota, crm_consentimento,
                   crm_resposta_rapida, crm_config, migracao CASCADE`);

const evo = criarEvolutionFalsa({ porta: 4598 + 60, portaSite: 4599 + 60 });
await evo.ligar();
const SEG = "segredo-de-bancada-do-disparo";
fs.mkdirSync(path.join(R, "dados"), { recursive: true });
fs.writeFileSync(path.join(R, "dados", "webhook.segredo"), SEG);

const log = [];
let servidor = null;
function subirServidor(intervalo = "300-500") {
  servidor = spawn(process.execPath, [SERVIDOR], {
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
      VERSAO: "bancada-disparo",
      URL_INTERNA_SERVIDOR: `http://localhost:${PORTA}`,
      CONCILIAR_A_CADA_MS: "600000",
      REDE_A_CADA_MS: "600000",
      DISPARO_INTERVALO_MS: intervalo,
      DISPARO_JANELA_SEMPRE_ABERTA: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  servidor.stdout.on("data", (b) => log.push(String(b)));
  servidor.stderr.on("data", (b) => log.push(String(b)));
}

const encerrar = async (codigo) => {
  servidor?.kill("SIGKILL");
  evo.fechar();
  await banco.end().catch(() => {});
  fs.rmSync(R, { recursive: true, force: true });
  process.exit(codigo);
};

const corpoTicket = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
const TICKET = `v1.${corpoTicket}.sig`;
const api = async (caminho, { metodo = "GET", corpo, ticket = TICKET } = {}) => {
  const r = await fetch(`http://localhost:${PORTA}/api/comando${caminho}`, {
    method: metodo,
    headers: { "content-type": "application/json", ...(ticket ? { authorization: `Bearer ${ticket}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  return { status: r.status, json: await r.json().catch(() => ({})) };
};
const webhook = (event, data) =>
  fetch(`http://localhost:${PORTA}/evolution/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-balao-webhook": SEG },
    body: JSON.stringify({ event, instance: "loja", data }),
  });
let nMsg = 0;
const agora = () => Math.floor(Date.now() / 1000);
/** Cliente escreve para a loja (fica na Evolution e chega pelo webhook). */
const clienteEscreve = async (numero, nome, texto, segundosAtras = 0) => {
  const rec = {
    key: { id: `IN${++nMsg}`, remoteJid: `${numero}@s.whatsapp.net`, fromMe: false },
    pushName: nome,
    messageType: "conversation",
    message: { conversation: texto },
    messageTimestamp: agora() - segundosAtras,
  };
  evo.guardar(rec);
  await webhook("messages.upsert", rec);
};
const ate = async (fn, ms = 6000) => {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    const v = await fn();
    if (v) return v;
    await esperar(100);
  }
  return null;
};
const enviadasPara = (numero) =>
  evo.mensagens.filter((m) => m.key?.fromMe && m.key.remoteJid === `${numero}@s.whatsapp.net`);
const subiu = async () => {
  const no = await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).catch(() => null))?.ok, 15000);
  if (!no) throw new Error("servidor não subiu");
  await ate(async () => log.join("").includes("[campanha] laço ligado"), 15000);
  await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).then((r) => r.json()).catch(() => null))?.connected, 8000);
};

// Clientes inventados.
const MARIA = "5500000000501"; // notebook, com nome
const SEM_NOME = "5500000000502"; // notebook, nome é só o número
const CARLOS = "5500000000503"; // pc gamer
const SAIU_ANTES = "5500000000504"; // notebook, pediu SAIR antes da campanha
const SAI_NO_MEIO = "5500000000505"; // notebook, pede SAIR depois da campanha criada
const TESTE = ["5519987510267", "5519984515960"];

try {
  subirServidor();
  await subiu();

  const painel = io(`http://localhost:${PORTA}`, { auth: { ticket: TICKET }, transports: ["websocket"] });
  const ev = { campanha: [], toast: [], disparoStatus: [] };
  painel.on("whatsapp:campanha", (d) => ev.campanha.push(d));
  painel.on("whatsapp:toast", (d) => ev.toast.push(d?.message));
  painel.on("whatsapp:disparo-status", (d) => ev.disparoStatus.push(d));
  await new Promise((r, rej) => {
    painel.on("connect", r);
    painel.on("connect_error", (e) => rej(new Error(e.message)));
    setTimeout(() => rej(new Error("painel não conectou")), 5000);
  });

  console.log("\n— conversas viram tema —");
  await clienteEscreve(MARIA, "maria souza", "Bom dia, meu notebook não liga", 60);
  await clienteEscreve(SEM_NOME, SEM_NOME, "quero um notebook novo", 120);
  await clienteEscreve(CARLOS, "Carlos", "quero montar um pc gamer com rtx", 180);
  await clienteEscreve(SAIU_ANTES, "Bia", "preciso de notebook", 240);
  await clienteEscreve(SAIU_ANTES, "Bia", "SAIR", 230);
  await clienteEscreve(SAI_NO_MEIO, "Rafa", "notebook para trabalho", 300);
  const temas = await ate(async () => {
    const r = await banco.query(`SELECT count(*)::int AS n FROM crm_interesse WHERE interesse = 'notebook' AND pontos >= 2`).catch(() => null);
    return r?.rows[0].n >= 4 ? r.rows[0].n : null;
  });
  ok("as conversas chegam ao banco com o tema", temas === 4, String(temas));
  const seg = await api("/segmentos");
  ok("/segmentos conta o tema Notebook", seg.json.itens?.find((s) => s.chave === "notebook")?.contatos === 4);

  console.log("\n— acesso —");
  const semIngresso = await api("/campanhas", { ticket: null });
  ok("sem o ingresso do painel: 401", semIngresso.status === 401, String(semIngresso.status));

  console.log("\n— prévia —");
  const previa = await api("/campanhas/previa", { metodo: "POST", corpo: { filtro: { temas: ["notebook"] }, texto: "Olá, {nome}!" } });
  const quem = (previa.json.amostra || []).map((a) => a.chatId);
  ok("prévia: 3 contatos (quem pediu SAIR fica de fora)", previa.json.total === 3, JSON.stringify(quem));
  ok("prévia não inclui quem pediu SAIR", !quem.includes(`${SAIU_ANTES}@c.us`));
  ok("prévia mostra o texto pronto", previa.json.exemplo === "Olá, Maria!\n\nPara não receber mais, responda SAIR.", JSON.stringify(previa.json.exemplo));
  ok("criar sem tema nem etiqueta: 400", (await api("/campanhas", { metodo: "POST", corpo: { texto: "oi", filtro: {} } })).status === 400);
  ok(
    "variável que não existe: 400",
    (await api("/campanhas", { metodo: "POST", corpo: { texto: "oi {promocao}", filtro: { temas: ["notebook"] } } })).status === 400
  );

  console.log("\n— teste para os números do Thiago —");
  const antesTeste = evo.mensagens.filter((m) => m.key?.fromMe).length;
  const teste = await api("/campanhas/teste", { metodo: "POST", corpo: { texto: "Olá, {nome}! {whatsapp}" } });
  const doTeste = evo.mensagens.filter((m) => m.key?.fromMe).slice(antesTeste);
  ok("teste: 2 enviados", teste.json.enviados === 2, JSON.stringify(teste.json));
  ok(
    "teste: só os dois números de teste",
    doTeste.length === 2 && doTeste.every((m) => TESTE.some((n) => m.key.remoteJid === `${n}@s.whatsapp.net`)),
    doTeste.map((m) => m.key.remoteJid).join(",")
  );
  const outroNumero = await api("/campanhas/teste", { metodo: "POST", corpo: { texto: "oi", numeros: [MARIA] } });
  const misturado = await api("/campanhas/teste", { metodo: "POST", corpo: { texto: "oi", numeros: [TESTE[0], MARIA] } });
  ok(
    "teste com outro número: 400 e nada sai",
    outroNumero.status === 400 && misturado.status === 400 && evo.mensagens.filter((m) => m.key?.fromMe).length === antesTeste + 2,
    `${outroNumero.status} / ${misturado.status}`
  );

  console.log("\n— campanha —");
  const criada = await api("/campanhas", {
    metodo: "POST",
    corpo: { texto: "Olá, {nome}! Novidade em notebook: {whatsapp}", filtro: { temas: ["notebook"] } },
  });
  const id = criada.json.campanha?.id;
  ok("campanha criada com 3 na fila", criada.status === 200 && criada.json.campanha?.total === 3, JSON.stringify(criada.json));
  // Rafa responde SAIR logo depois (é o último da fila: falou há mais tempo).
  await clienteEscreve(SAI_NO_MEIO, "Rafa", "sair", 0);

  const fim = await ate(async () => {
    const l = await api("/campanhas");
    const c = l.json.itens?.find((x) => x.id === id);
    return c?.estado === "concluida" ? c : null;
  }, 15000);
  ok("a campanha termina sozinha", Boolean(fim), JSON.stringify(fim));
  ok("2 enviadas, 1 pulada", fim?.enviados === 2 && fim?.pulados === 1 && fim?.falhas === 0);
  const paraMaria = enviadasPara(MARIA);
  const paraSemNome = enviadasPara(SEM_NOME);
  ok(
    "Maria recebe com o primeiro nome, o link e a linha do SAIR",
    paraMaria.length === 1 &&
      paraMaria[0].message.conversation ===
        "Olá, Maria! Novidade em notebook: https://wa.me/5519987510267\n\nPara não receber mais, responda SAIR.",
    JSON.stringify(paraMaria.map((m) => m.message.conversation))
  );
  ok(
    "sem nome, a frase fica natural",
    paraSemNome.length === 1 && paraSemNome[0].message.conversation.startsWith("Olá! Novidade em notebook"),
    JSON.stringify(paraSemNome.map((m) => m.message.conversation))
  );
  ok("quem pediu SAIR no meio da campanha não recebe", enviadasPara(SAI_NO_MEIO).length === 0);
  ok("quem pediu SAIR antes não recebe", enviadasPara(SAIU_ANTES).length === 0);
  ok("pc gamer não estava no filtro", enviadasPara(CARLOS).length === 0);
  const linhas = (await banco.query(`SELECT chat_id, estado, motivo FROM crm_campanha_envio WHERE campanha_id = $1 ORDER BY ordem`, [id])).rows;
  ok(
    "no banco: o SAIR do meio da campanha fica registrado como pulado",
    linhas.find((l) => l.chat_id === `${SAI_NO_MEIO}@c.us`)?.motivo === "pediu para sair",
    JSON.stringify(linhas)
  );
  const eventos = (await banco.query(`SELECT count(*)::int AS n FROM crm_evento WHERE tipo = 'campanha_envio'`)).rows[0].n;
  ok("crm_evento campanha_envio para cada contato", eventos === 3, String(eventos));
  const envios = evo.chamadas.filter((c) => c.rota === "sendText").slice(-2);
  ok("um por vez, com intervalo (≥ 300 ms na bancada)", envios.length === 2 && envios[1].em - envios[0].em >= 300, envios.map((e) => e.em).join(" → "));
  ok("o painel recebe o progresso pelo socket", ev.campanha.filter((d) => d.tipo === "progresso" && d.campanha?.id === id).length >= 3);
  const avisoDeFim = await ate(
    () => ev.campanha.some((d) => d.tipo === "fim" && d.campanha?.id === id) && ev.toast.some((t) => /concluída/.test(t)),
    3000
  );
  ok("e o aviso de fim (evento e toast)", Boolean(avisoDeFim));
  ok("pausar campanha concluída: 409", (await api(`/campanhas/${id}/pausar`, { metodo: "POST" })).status === 409);
  const repetida = await api("/campanhas/previa", { metodo: "POST", corpo: { filtro: { temas: ["notebook"] } } });
  ok("quem recebeu campanha agora fica fora por 7 dias", repetida.json.total === 0, String(repetida.json.total));

  console.log("\n— tela antiga (panel:send-segmented) —");
  painel.emit("panel:send-segmented", {
    recipients: [{ chatId: `${CARLOS}@c.us`, number: CARLOS }],
    text: "Oi {nome}!\n{promocao}\nChama aqui: {whatsapp}",
    intervalMin: 25,
    intervalMax: 60,
  });
  const antiga = await ate(async () => {
    const l = await api("/campanhas");
    const c = l.json.itens?.find((x) => x.nome === "Disparo do painel antigo");
    return c?.estado === "concluida" ? c : null;
  }, 10000);
  ok("o disparo antigo vira campanha e termina", antiga?.enviados === 1, JSON.stringify(antiga));
  ok(
    "com {nome} trocado e sem {promocao}",
    enviadasPara(CARLOS)[0]?.message.conversation ===
      "Oi Carlos!\nChama aqui: https://wa.me/5519987510267\n\nPara não receber mais, responda SAIR.",
    JSON.stringify(enviadasPara(CARLOS).map((m) => m.message.conversation))
  );
  ok("a tela antiga é destravada", ev.disparoStatus.some((d) => d?.ativo === false));
  ok("e avisada de que virou campanha", ev.toast.some((t) => /virou campanha/.test(t)));
  painel.close();

  console.log("\n— reinício no meio da campanha —");
  const IMPRESSORA = ["5500000000601", "5500000000602", "5500000000603", "5500000000604"];
  for (const [i, n] of IMPRESSORA.entries()) await clienteEscreve(n, `Cliente ${i + 1}`, "minha impressora não imprime", 60 * (i + 1));
  await ate(async () => (await banco.query(`SELECT count(*)::int AS n FROM crm_interesse WHERE interesse = 'impressora'`)).rows[0].n === 4);
  // Servidor de novo, agora com 1,5 s entre envios para dar tempo de derrubar.
  servidor.kill("SIGKILL");
  await esperar(300);
  subirServidor("1500-1600");
  await subiu();
  const c2 = (await api("/campanhas", { metodo: "POST", corpo: { texto: "Oi {nome}, tinta com desconto.", filtro: { temas: ["impressora"] } } })).json.campanha;
  await ate(() => IMPRESSORA.some((n) => enviadasPara(n).length), 5000);
  servidor.kill("SIGKILL"); // cai no meio da campanha
  await esperar(300);
  const noMeio = IMPRESSORA.reduce((s, n) => s + enviadasPara(n).length, 0);
  subirServidor("300-500");
  await subiu();
  // Se a queda pegou um envio no meio (mandou e não chegou a gravar), essa
  // linha fica "interrompida": não é repetida e vira falha depois de 5 min.
  // Por isso o critério é "todo mundo recebeu UMA vez", e não "concluída já".
  await ate(() => IMPRESSORA.every((n) => enviadasPara(n).length >= 1), 15000);
  await esperar(1500);
  const porCliente = IMPRESSORA.map((n) => enviadasPara(n).length);
  const linhas2 = (
    await banco.query(`SELECT estado, tentativa_em IS NOT NULL AS tentou FROM crm_campanha_envio WHERE campanha_id = $1`, [c2?.id])
  ).rows;
  const enviados2 = linhas2.filter((l) => l.estado === "enviado").length;
  const interrompidos = linhas2.filter((l) => l.estado === "pendente" && l.tentou).length;
  ok("caiu com a campanha pela metade", noMeio >= 1 && noMeio < 4, String(noMeio));
  ok("depois de reiniciar, continua de onde parou", enviados2 + interrompidos === 4 && interrompidos <= 1, `${enviados2} enviados + ${interrompidos} interrompido(s)`);
  ok("cada cliente recebe exatamente uma vez", porCliente.every((n) => n === 1), porCliente.join(","));
} catch (e) {
  console.log("  ERRO NA BANCADA:", e.message);
  falharam++;
}

console.log(`\n${passaram} passaram, ${falharam} falharam\n`);
if (falharam && process.env.MOSTRAR_LOG) console.log(log.join("").slice(-6000));
await encerrar(falharam ? 1 : 0);
