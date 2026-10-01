// TESTE DE INTEGRAÇÃO — precisa do banco de testes de pé (fakes.js + servidor).
//
// O que ele prova: mensagem que o WEBHOOK NÃO trouxe, achada pela varredura de
// 20 segundos e com mais de 10 minutos de idade, tem de (a) chegar ao painel e
// (b) ATUALIZAR A CONVERSA NA LISTA — subir, com a prévia e o horário novos.
//
// Era o (b) que faltava, e foi o que deixou a lista do Thiago com um buraco de
// 15:47 até 00:22: a mensagem aparecia dentro da conversa, mas a conversa não
// se movia, então ele não tinha como saber que havia mensagem nova ali.
//
// Rodando contra o código antigo, (a) passa e (b) FALHA. É a prova do bug.
const { io } = require("socket.io-client");
const fs = require("fs");
const SEG = fs.readFileSync(`${__dirname}/dados-teste/webhook.segredo`, "utf8").trim();
const corpo = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url");
const s = io("http://localhost:4100", { auth: { ticket: `v1.${corpo}.sig` }, transports: ["websocket"] });
s.on("connect_error", (e) => { console.log("ERRO:", e.message); process.exit(1); });
const webhook = (event, data) => fetch("http://localhost:4100/evolution/webhook", {
  method: "POST", headers: { "content-type": "application/json", "x-balao-webhook": SEG },
  body: JSON.stringify({ event, instance: "loja", data }),
});
const injetar = (rec) => fetch("http://localhost:4598/__injetar", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(rec),
});
const ID_UNICO = `SOVARREDURA${Date.now()}`;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

let falhas = 0;
const ok = (n, c, e = "") => { console.log(`${c ? "PASSOU" : "FALHOU"}  ${n}${e ? ` — ${e}` : ""}`); if (!c) falhas++; };

const parciais = [];
const mensagens = [];
let listaCompleta = [];

(async () => {
  await new Promise((r) => s.on("connect", r));
  s.on("whatsapp:chats-parcial", (l) => parciais.push(...l));
  s.on("whatsapp:chats", (l) => (listaCompleta = l));
  s.on("whatsapp:message", (m) => mensagens.push(m));

  await webhook("connection.update", { state: "open", wuid: "553599990000@s.whatsapp.net" });
  await espera(2500);

  // conversa com atividade "velha", so pelo webhook
  const ONTEM = Math.floor(Date.now()/1000) - 9 * 3600;
  await webhook("messages.upsert", { messages: [{
    key: { id: "VELHA1", remoteJid: "5519977776666@s.whatsapp.net", fromMe: false },
    message: { conversation: "mensagem das 15h" }, pushName: "Cliente Teste",
    messageTimestamp: ONTEM,
  }]});
  await espera(1500);
  s.emit("panel:bootstrap");
  await espera(1200);
  const antes = (listaCompleta.find((c) => c.chatId === "5519977776666@c.us") || {}).lastMessageTimestamp;
  ok("conversa criada pelo webhook", Boolean(antes), antes ? new Date(antes).toISOString() : "nao achei");

  // AGORA: mensagem de 30 MINUTOS atras que o webhook NAO trouxe.
  // Vai so para o banco da Evolution; quem tem de achar e a varredura.
  parciais.length = 0; mensagens.length = 0;
  const TRINTA_MIN = Math.floor(Date.now()/1000) - 30 * 60;
  await injetar({
    key: { id: ID_UNICO, remoteJid: "5519977776666@s.whatsapp.net", fromMe: false },
    message: { conversation: "esta chegou SO pela varredura" },
    pushName: "Cliente Teste", messageTimestamp: TRINTA_MIN,
  });

  // a varredura roda a cada 20s
  console.log("\nesperando a varredura (ate 30s)...");
  for (let i = 0; i < 30 && !mensagens.some((m) => m.id === ID_UNICO); i++) await espera(1000);

  ok("a mensagem chegou ao painel pela varredura", mensagens.some((m) => m.id === ID_UNICO));

  // a atualizacao da conversa e agrupada em 400ms: esperar antes de conferir
  await espera(1500);

  const tocada = parciais.filter((c) => c.chatId === "5519977776666@c.us").pop();
  ok("a CONVERSA foi atualizada na lista", Boolean(tocada), tocada ? `horario=${new Date(tocada.lastMessageTimestamp).toISOString()}` : "NAO veio atualizacao da conversa");
  if (tocada) {
    ok("o horario da conversa pulou para a mensagem nova",
       tocada.lastMessageTimestamp >= TRINTA_MIN * 1000,
       `${new Date(tocada.lastMessageTimestamp).toISOString()} >= ${new Date(TRINTA_MIN*1000).toISOString()}`);
    ok("a previa mostra a mensagem nova", String(tocada.lastMessageBody || "").includes("varredura"),
       JSON.stringify(tocada.lastMessageBody));
    ok("NAO contou como nao lida (tem mais de 10 min)", (tocada.unreadCount || 0) <= 1,
       `unread=${tocada.unreadCount}`);
  }

  // e o webhook: o /health tem de dizer o que a Evolution registrou
  const h = await (await fetch("http://localhost:4100/health")).json();
  const w = h.diagnostico?.webhook;
  ok("o /health reporta o estado do webhook", w !== undefined, JSON.stringify(w));

  console.log(`\n${falhas === 0 ? "TUDO PASSOU" : falhas + " FALHA(S)"}`);
  s.close(); process.exit(falhas ? 1 : 0);
})();
