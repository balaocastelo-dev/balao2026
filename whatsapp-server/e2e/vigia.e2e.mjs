// Bancada do vigia: servidor REAL, Evolution falsa, apagão simulado.
//
// O teste unitário prova a regra. Este prova a fiação: que a entrada de
// mensagem realmente marca o relógio, que o alarme sai pelo socket até o
// painel, que o /health conta a verdade e que a mensagem que volta desarma.
//
// Roda com o relógio da loja acelerado (VIGIA_INTERVALO_MS=800) e um ritmo
// cravado (VIGIA_BASE), porque aqui não há Postgres para aprender.
//
// Sobe a Evolution falsa sozinho, se ela não estiver de pé. A bancada tem de
// rodar com um comando, sem depender de nada montado à mão antes.

import { io } from "socket.io-client";
import fs from "node:fs";
import { spawn } from "node:child_process";

const R = "/tmp/claude-0/bancada-vigia";
const PORTA = 4111;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let falhas = 0;
const ok = (n, c, e = "") => {
  console.log(`${c ? "  PASSOU" : "  FALHOU"}  ${n}${e ? ` — ${e}` : ""}`);
  if (!c) falhas++;
};

// Ritmo: TODA hora de TODO dia é movimentada. Assim o apagão é detectado
// seja qual for a hora em que este teste rodar.
const base = {};
for (let d = 0; d <= 6; d++) for (let h = 0; h <= 23; h++) base[`${d}:${h}`] = 20;

// Evolution falsa, se precisar.
let fakes = null;
const evoDePe = await fetch("http://localhost:4598/instance/connectionState/loja", {
  headers: { apikey: "teste" },
})
  .then(() => true)
  .catch(() => false);
if (!evoDePe) {
  fakes = spawn("node", [new URL("./fakes.js", import.meta.url).pathname], {
    stdio: ["ignore", "ignore", "ignore"],
    detached: false,
  });
  await esperar(1200);
}

fs.rmSync(R, { recursive: true, force: true });
fs.mkdirSync(`${R}/dados`, { recursive: true });
const SEG = "segredo-de-bancada-do-vigia";
fs.writeFileSync(`${R}/dados/webhook.segredo`, SEG);

const servidor = spawn("node", ["/home/claude/balao2026/whatsapp-server/servidor.js"], {
  env: {
    ...process.env,
    DATA_ROOT: `${R}/dados`,
    WHATSAPP_PANEL_PORT: String(PORTA),
    EVOLUTION_URL: "http://localhost:4598",
    EVOLUTION_API_KEY: "teste",
    EVOLUTION_INSTANCIA: "loja",
    VERSAO: "bancada-vigia",
    SITE_URL: "http://localhost:4599",
    WHATSAPP_PANEL_ALLOWED_ORIGIN: "http://localhost:4599",
    VIGIA_BASE: JSON.stringify(base),
    VIGIA_INTERVALO_MS: "800",
    // Limites em fracao de minuto: 0,2 min = 12 s. E o que permite rodar um
    // apagao de verdade em meio minuto de bancada, com a MESMA regra da loja.
    VIGIA_SILENCIO_MIN: "0.2",
    VIGIA_ESCALA_MIN: "0.2",
    VIGIA_REPETIR_MIN: "0.5",
    VIGIA_CURA_CADA_MIN: "0.1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
const log = [];
servidor.stdout.on("data", (b) => log.push(String(b)));
servidor.stderr.on("data", (b) => log.push(String(b)));

const encerrar = (codigo) => {
  servidor.kill("SIGKILL");
  fakes?.kill("SIGKILL");
  process.exit(codigo);
};

try {
  await esperar(4000);

  const saude = async () => (await fetch(`http://localhost:${PORTA}/health`)).json();
  const h0 = await saude();
  ok("servidor subiu com o vigia", h0.ok === true, JSON.stringify(h0.versao));

  // Painel conectado, escutando o alarme.
  const corpo = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const painel = io(`http://localhost:${PORTA}`, {
    auth: { ticket: `v1.${corpo}.sig` },
    transports: ["websocket"],
  });
  const avisos = [];
  painel.on("whatsapp:vigia", (a) => avisos.push(a));
  await new Promise((r, rej) => {
    painel.on("connect", r);
    painel.on("connect_error", (e) => rej(new Error(e.message)));
    setTimeout(() => rej(new Error("painel nao conectou")), 5000);
  });
  ok("painel conectou", painel.connected);

  // --- 1. Chega mensagem de cliente. O relogio de entrada tem de marcar.
  const webhook = (event, data) =>
    fetch(`http://localhost:${PORTA}/evolution/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-balao-webhook": SEG },
      body: JSON.stringify({ event, instance: "loja", data }),
    });

  const agora = Date.now();
  await webhook("messages.upsert", {
    key: { id: `VIGIA${agora}`, remoteJid: "5531999990001@s.whatsapp.net", fromMe: false },
    message: { conversation: "oi, tem placa de video?" },
    messageTimestamp: Math.floor(agora / 1000),
    pushName: "Cliente da bancada",
  });
  await esperar(1500);
  const h1 = await saude();
  ok("entrada de cliente marca o relogio", Boolean(h1.diagnostico.ultimaEntradaEm), JSON.stringify(h1.diagnostico.ultimaEntradaEm));
  ok("vigia ainda calado logo apos a mensagem", avisos.length === 0, JSON.stringify(avisos));

  // --- 2. Mensagem que a LOJA manda nao pode mascarar a surdez.
  await webhook("send.message", {
    key: { id: `SAIU${Date.now()}`, remoteJid: "5531999990001@s.whatsapp.net", fromMe: true },
    message: { conversation: "temos sim" },
    messageTimestamp: Math.floor(Date.now() / 1000),
  });
  await esperar(800);
  const h2 = await saude();
  ok(
    "mensagem da loja NAO mexe no relogio de entrada",
    h2.diagnostico.ultimaEntradaEm === h1.diagnostico.ultimaEntradaEm,
    `${h1.diagnostico.ultimaEntradaEm} -> ${h2.diagnostico.ultimaEntradaEm}`
  );

  // --- 3. O apagao. Ninguem escreve. Com os limites acelerados, 2 min de
  //        relogio de parede bastam... mas o teste nao pode durar 2 min.
  //        Entao empurramos o relogio de entrada para tras, que e exatamente
  //        o que o apagao faz: a ultima entrada fica velha.
  await webhook("messages.upsert", {
    key: { id: `VELHA${Date.now()}`, remoteJid: "5531999990002@s.whatsapp.net", fromMe: false },
    message: { conversation: "mensagem antiga" },
    messageTimestamp: Math.floor((Date.now() - 45 * 60_000) / 1000),
    pushName: "Cliente antigo",
  });
  await esperar(2500);
  const h3 = await saude();
  ok(
    "mensagem antiga nao finge recebimento vivo",
    h3.diagnostico.ultimaEntradaEm === h1.diagnostico.ultimaEntradaEm,
    String(h3.diagnostico.ultimaEntradaEm)
  );

  console.log("\n  (aguardando o vigia fechar o diagnostico de surdez...)");
  const limite = Date.now() + 25_000;
  while (Date.now() < limite && !avisos.some((a) => a.estado === "surdo")) await esperar(700);

  const h4 = await saude();
  ok("vigia acusou surdez", avisos.some((a) => a.estado === "surdo"), JSON.stringify(avisos.map((a) => a.estado)));
  ok("o /health conta a mesma coisa", h4.diagnostico.vigia?.estado === "surdo", JSON.stringify(h4.diagnostico.vigia));
  ok(
    "o aviso explica que ENVIAR funciona e RECEBER nao",
    /recebimento/i.test(avisos.find((a) => a.estado === "surdo")?.corpo || ""),
    avisos.find((a) => a.estado === "surdo")?.corpo
  );
  ok("tentou se curar antes de gritar", (h4.diagnostico.vigia?.curas || 0) >= 1, JSON.stringify(h4.diagnostico.vigia));
  ok(
    "nao martelou a Evolution a cada ciclo",
    (h4.diagnostico.vigia?.curas || 0) <= 4,
    `curas=${h4.diagnostico.vigia?.curas}`
  );

  // --- 4. Painel que abre NO MEIO da pane ja abre avisado.
  const segundo = io(`http://localhost:${PORTA}`, { auth: { ticket: `v1.${corpo}.sig` }, transports: ["websocket"] });
  const avisosDoSegundo = [];
  segundo.on("whatsapp:vigia", (a) => avisosDoSegundo.push(a));
  await esperar(2000);
  ok("painel que abre durante a pane ja abre avisado", avisosDoSegundo.some((a) => a.estado === "surdo"), JSON.stringify(avisosDoSegundo));
  segundo.close();

  // --- 5. Volta a entrar mensagem: o alarme desarma.
  await webhook("messages.upsert", {
    key: { id: `VOLTOU${Date.now()}`, remoteJid: "5531999990003@s.whatsapp.net", fromMe: false },
    message: { conversation: "voltei" },
    messageTimestamp: Math.floor(Date.now() / 1000),
    pushName: "Cliente que voltou",
  });
  const limite2 = Date.now() + 12_000;
  while (Date.now() < limite2 && !avisos.some((a) => a.estado === "ok")) await esperar(500);
  const h5 = await saude();
  ok("avisou que voltou", avisos.some((a) => a.estado === "ok"), JSON.stringify(avisos.map((a) => a.estado)));
  ok("vigia volta para ok", h5.diagnostico.vigia?.estado === "ok", JSON.stringify(h5.diagnostico.vigia));

  painel.close();
} catch (e) {
  console.log("  ERRO NA BANCADA:", e.message);
  console.log(log.join("").slice(-2500));
  falhas++;
}

console.log(`\n${falhas === 0 ? "TUDO PASSOU" : `${falhas} FALHARAM`}\n`);
if (falhas) console.log(log.join("").slice(-3000));
encerrar(falhas ? 1 : 0);
