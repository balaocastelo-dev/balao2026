// ============================================================
// RODADA 2 — os cenários que a bancada simples NÃO reproduz.
//
// O código novo passou nos 10 testes básicos, mas na loja continua falhando.
// Então o problema está nas condições reais: cache velho no navegador,
// lista gigante, e conversa identificada só pelo código interno.
// ============================================================
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import fs from "fs";

const SITE = "http://localhost:3100";
const SRV = "http://localhost:4100";
const SEG = fs.readFileSync("/tmp/claude-0/bancada/dados/webhook.segredo", "utf8").trim();
const COOKIE = "fa5afc4b2555235434cf0ae2a7af6315819a99a170201ce106ca94f4ddbb32fe";
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const webhook = (event, data) => fetch(`${SRV}/evolution/webhook`, {
  method: "POST", headers: { "content-type": "application/json", "x-balao-webhook": SEG },
  body: JSON.stringify({ event, instance: "loja", data }),
});
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const agora = () => Math.floor(Date.now() / 1000);

const resultados = [];
const checar = (n, p, d = "") => { resultados.push({ nome: n, passou: p, detalhe: d });
  console.log(`${p ? "PASSOU" : "FALHOU"}  ${n}${d ? ` — ${d}` : ""}`); };

async function naTela(page, txt, ms = 15000) {
  try { await page.waitForFunction((t) => document.body.innerText.includes(t), txt, { timeout: ms }); return true; }
  catch { return false; }
}

const navegador = await chromium.launch({ executablePath: CHROME });

// ============================================================
// CENÁRIO A — cache velho e CORROMPIDO no navegador
// (o Ctrl+Shift+R NÃO limpa o localStorage; o painel começa a partir dele)
// ============================================================
{
  const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: "balao_painel_session", value: COOKIE, url: SITE }]);
  const page = await ctx.newPage();

  // cache estragado igual ao que o bug antigo produzia: conversa duplicada,
  // outra com dados de funil de terceiro, e uma que nem existe mais
  await page.goto(`${SITE}/painel`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const lixo = [
      { id: "5519977776666@c.us", nome: "Cliente Bancada", numero: "5519977776666", timestamp: Date.now() - 86400000, lastMessage: "previa velha", tags: [], unread: 0, kanbanColId: "novos" },
      { id: "5519977776666@c.us", nome: "Cliente Bancada", numero: "5519977776666", timestamp: Date.now() - 90000000, lastMessage: "duplicata", tags: [], unread: 0, kanbanColId: "ganho" },
      { id: "5519900000000@c.us", nome: "FANTASMA", numero: "5519900000000", timestamp: Date.now() - 1000, lastMessage: "conversa que nao existe mais", tags: [], unread: 0, kanbanColId: "novos" },
    ];
    localStorage.setItem("balao_crm_chats", JSON.stringify(lixo));
  });

  await webhook("connection.update", { state: "open", wuid: "553599990000@s.whatsapp.net" });
  await espera(1000);
  await webhook("messages.upsert", { messages: [{
    key: { id: `A${Date.now()}`, remoteJid: "5519977776666@s.whatsapp.net", fromMe: false },
    message: { conversation: "mensagem de base A" }, pushName: "Cliente Bancada", messageTimestamp: agora() - 60,
  }]});
  await espera(1500);

  await page.goto(`${SITE}/crm`, { waitUntil: "domcontentloaded" });
  await espera(9000);

  const TXT = `COM-CACHE-RUIM-${Date.now()}`;
  await page.getByText("Cliente Bancada").first().click().catch(() => {});
  await espera(1200);
  await webhook("messages.upsert", { messages: [{
    key: { id: `B${Date.now()}`, remoteJid: "5519977776666@s.whatsapp.net", fromMe: false },
    message: { conversation: TXT }, pushName: "Cliente Bancada", messageTimestamp: agora(),
  }]});
  checar("A1 com cache estragado, mensagem nova ainda aparece", await naTela(page, TXT, 15000));

  const sumiuFantasma = await page.evaluate(() => !document.body.innerText.includes("FANTASMA"));
  checar("A2 conversa fantasma do cache sai da lista", sumiuFantasma);

  const dup = await page.evaluate(() => (document.body.innerText.match(/Cliente Bancada/g) || []).length);
  checar("A3 conversa nao fica duplicada na tela", dup <= 2, `apareceu ${dup}x`);

  await page.screenshot({ path: "/tmp/claude-0/e2e/cenarioA.png" });
  await ctx.close();
}

// ============================================================
// CENÁRIO B — conversa identificada SÓ pelo código interno (@lid),
// sem o número resolvido. É o caso que o WhatsApp novo produz.
// ============================================================
{
  const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: "balao_painel_session", value: COOKIE, url: SITE }]);
  const page = await ctx.newPage();

  const LID = "273082677764270@lid";
  await webhook("messages.upsert", { messages: [{
    key: { id: `L${Date.now()}`, remoteJid: LID, fromMe: false },
    message: { conversation: "primeira pelo codigo interno" },
    pushName: "Cliente Codigo", messageTimestamp: agora() - 120,
  }]});
  await espera(1500);

  await page.goto(`${SITE}/crm`, { waitUntil: "domcontentloaded" });
  await espera(9000);

  const abriu = await naTela(page, "Cliente Codigo", 15000);
  checar("B1 conversa so com codigo interno aparece na lista", abriu);

  if (abriu) {
    await page.getByText("Cliente Codigo").first().click().catch(() => {});
    await espera(1200);
    const T2 = `RESPOSTA-LOJA-${Date.now()}`;
    // a loja responde pelo celular, e o WhatsApp manda com o NUMERO desta vez
    await webhook("send.message", { key: { id: `R${Date.now()}`, remoteJid: LID, fromMe: true },
      message: { conversation: T2 }, messageTimestamp: agora() });
    checar("B2 resposta do celular aparece na conversa do codigo interno", await naTela(page, T2, 15000));
  }
  await page.screenshot({ path: "/tmp/claude-0/e2e/cenarioB.png" });
  await ctx.close();
}

// ============================================================
// CENÁRIO C — lista GRANDE (como a loja: milhares de conversas)
// ============================================================
{
  console.log("\ncriando 800 conversas para o teste de escala...");
  for (let i = 0; i < 800; i++) {
    await webhook("messages.upsert", { messages: [{
      key: { id: `E${i}`, remoteJid: `55199${String(20000000 + i)}@s.whatsapp.net`, fromMe: false },
      message: { conversation: `conversa de escala ${i}` },
      pushName: `Escala ${i}`, messageTimestamp: agora() - (800 - i) * 60,
    }]});
    if (i % 200 === 0) process.stdout.write(".");
  }
  console.log(" pronto");
  await espera(3000);

  const ctx = await navegador.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: "balao_painel_session", value: COOKIE, url: SITE }]);
  const page = await ctx.newPage();
  await page.goto(`${SITE}/crm`, { waitUntil: "domcontentloaded" });
  await espera(12000);

  const TXT = `ESCALA-AO-VIVO-${Date.now()}`;
  const t0 = Date.now();
  await webhook("messages.upsert", { messages: [{
    key: { id: `EV${Date.now()}`, remoteJid: "5519977776666@s.whatsapp.net", fromMe: false },
    message: { conversation: TXT }, pushName: "Cliente Bancada", messageTimestamp: agora(),
  }]});
  const apareceu = await naTela(page, TXT, 20000);
  checar("C1 com lista grande, mensagem nova aparece", apareceu, apareceu ? `${Date.now() - t0} ms` : "nao apareceu");

  const topo = await page.evaluate(() => document.body.innerText.slice(0, 1500));
  checar("C2 a conversa que recebeu sobe para o topo da lista",
    topo.includes("Cliente Bancada"), "topo tem: " + (topo.match(/Cliente Bancada|Escala \d+/)?.[0] || "?"));

  await page.screenshot({ path: "/tmp/claude-0/e2e/cenarioC.png" });
  await ctx.close();
}

const falhas = resultados.filter((r) => !r.passou);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} passaram`);
if (falhas.length) console.log("FALHARAM: " + falhas.map((f) => f.nome).join(" | "));
fs.writeFileSync("/tmp/claude-0/e2e/resultado2.json", JSON.stringify(resultados, null, 2));
await navegador.close();
process.exit(falhas.length ? 1 : 0);
