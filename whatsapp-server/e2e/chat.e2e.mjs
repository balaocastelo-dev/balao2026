// ============================================================
// TESTE DE PONTA A PONTA DO CHAT
//
// Navegador REAL abrindo o /crm REAL, falando com o servidor REAL.
// É o teste que faltava: tudo que eu testei até agora parava no servidor,
// e os bugs estavam na tela.
//
// Nenhum dado de cliente, nenhuma conexão com a loja: Evolution falsa local.
// ============================================================
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import fs from "fs";

const SITE = "http://localhost:3100";
const SRV = "http://localhost:4100";
const SEG = fs.readFileSync("/tmp/claude-0/bancada/dados/webhook.segredo", "utf8").trim();
const COOKIE = "fa5afc4b2555235434cf0ae2a7af6315819a99a170201ce106ca94f4ddbb32fe";

const webhook = (event, data) =>
  fetch(`${SRV}/evolution/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-balao-webhook": SEG },
    body: JSON.stringify({ event, instance: "loja", data }),
  });
const injetarNaEvolution = (rec) =>
  fetch("http://localhost:4598/__injetar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(rec),
  });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const resultados = [];
const checar = (nome, passou, detalhe = "") => {
  resultados.push({ nome, passou, detalhe });
  console.log(`${passou ? "PASSOU" : "FALHOU"}  ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

const agora = () => Math.floor(Date.now() / 1000);
const CLIENTE = "5519977776666";
const JID = `${CLIENTE}@s.whatsapp.net`;

async function esperarNaTela(page, texto, ms = 15000) {
  try {
    await page.waitForFunction((t) => document.body.innerText.includes(t), texto, { timeout: ms });
    return true;
  } catch {
    return false;
  }
}

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
await ctx.addCookies([{ name: "balao_painel_session", value: COOKIE, url: SITE }]);
const page = await ctx.newPage();

const errosDoConsole = [];
page.on("console", (m) => { if (m.type() === "error") errosDoConsole.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errosDoConsole.push("PAGEERROR: " + String(e).slice(0, 200)));

// ---------- preparação: WhatsApp conectado e uma conversa existente ----------
await webhook("connection.update", { state: "open", wuid: "553599990000@s.whatsapp.net" });
await espera(1500);
await webhook("messages.upsert", { messages: [{
  key: { id: "BASE1", remoteJid: JID, fromMe: false },
  message: { conversation: "mensagem antiga de base" },
  pushName: "Cliente Bancada", messageTimestamp: agora() - 3600,
}]});
await espera(1500);

await page.goto(`${SITE}/crm`, { waitUntil: "domcontentloaded" });
await espera(8000);

// ---------- T1: o painel abre e conecta ----------
const abriu = await esperarNaTela(page, "Cliente Bancada", 20000);
checar("T1 o painel abre e mostra a conversa", abriu);

const aoVivo = await esperarNaTela(page, "Ao vivo", 10000);
checar("T2 o selo mostra que esta Ao vivo", aoVivo);

// ---------- T3: mensagem que ENTRA aparece sozinha ----------
await page.getByText("Cliente Bancada").first().click().catch(() => {});
await espera(1500);
const TEXTO_ENTRA = `ENTRANDO-${Date.now()}`;
await webhook("messages.upsert", { messages: [{
  key: { id: `IN${Date.now()}`, remoteJid: JID, fromMe: false },
  message: { conversation: TEXTO_ENTRA },
  pushName: "Cliente Bancada", messageTimestamp: agora(),
}]});
checar("T3 mensagem do cliente aparece na tela", await esperarNaTela(page, TEXTO_ENTRA, 12000));

// ---------- T4: mensagem digitada no CELULAR DA LOJA (fromMe) ----------
const TEXTO_CELULAR = `DO-CELULAR-${Date.now()}`;
await webhook("send.message", { key: { id: `OUT${Date.now()}`, remoteJid: JID, fromMe: true },
  message: { conversation: TEXTO_CELULAR }, messageTimestamp: agora() });
checar("T4 mensagem digitada no celular da loja aparece", await esperarNaTela(page, TEXTO_CELULAR, 12000));

// ---------- T5: o MESMO cenario, mas com o codigo interno @lid ----------
const TEXTO_LID = `VIA-LID-${Date.now()}`;
await webhook("send.message", { key: { id: `LID${Date.now()}`, remoteJid: "273082677764270@lid", fromMe: true,
  remoteJidAlt: JID },
  message: { conversation: TEXTO_LID }, messageTimestamp: agora() });
checar("T5 mensagem que chega pelo codigo interno (@lid) aparece", await esperarNaTela(page, TEXTO_LID, 12000));

// ---------- T6: mensagem que SO a varredura acha (webhook nao traz) ----------
const TEXTO_VARREDURA = `SO-VARREDURA-${Date.now()}`;
await injetarNaEvolution({
  key: { id: `VAR${Date.now()}`, remoteJid: JID, fromMe: false },
  message: { conversation: TEXTO_VARREDURA },
  pushName: "Cliente Bancada", messageTimestamp: agora() - 30 * 60,
});
checar("T6 mensagem achada so pela varredura aparece", await esperarNaTela(page, TEXTO_VARREDURA, 40000));

// ---------- T7: a conversa SOBE na lista com o horario novo ----------
const previa = await page.evaluate(() => {
  const t = document.body.innerText;
  return t.slice(0, 3000);
});
checar("T7 a previa da conversa na lista mostra a mensagem nova",
  previa.includes("SO-VARREDURA") || previa.includes("VIA-LID") || previa.includes("DO-CELULAR"),
  "previa=" + (previa.match(/SO-VARREDURA|VIA-LID|DO-CELULAR/)?.[0] || "nenhuma"));

// ---------- T8: conversa NOVA aparece sozinha, sem recarregar ----------
const NOVO = "5519911112222";
const TEXTO_NOVO = `CLIENTE-NOVO-${Date.now()}`;
await webhook("messages.upsert", { messages: [{
  key: { id: `NOVO${Date.now()}`, remoteJid: `${NOVO}@s.whatsapp.net`, fromMe: false },
  message: { conversation: TEXTO_NOVO }, pushName: "Cliente Novo", messageTimestamp: agora(),
}]});
checar("T8 conversa nova aparece na lista sozinha", await esperarNaTela(page, "Cliente Novo", 15000));

// ---------- T9: nenhuma conversa SUMIU ----------
const aindaTem = await page.evaluate(() => document.body.innerText.includes("Cliente Bancada"));
checar("T9 a conversa anterior continua na lista", aindaTem);

// ---------- T10: o console do navegador ficou limpo ----------
const errosReais = errosDoConsole.filter((e) => !/favicon|404|net::ERR|Download the React/i.test(e));
checar("T10 sem erro de JavaScript na tela", errosReais.length === 0,
  errosReais.slice(0, 2).join(" | ") || "limpo");

await page.screenshot({ path: "/tmp/claude-0/e2e/tela.png", fullPage: false });

const falhas = resultados.filter((r) => !r.passou);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} testes passaram`);
if (falhas.length) console.log("FALHARAM: " + falhas.map((f) => f.nome).join(", "));
fs.writeFileSync("/tmp/claude-0/e2e/resultado.json", JSON.stringify(resultados, null, 2));
await navegador.close();
process.exit(falhas.length ? 1 : 0);
