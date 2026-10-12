// Bancada do agente JUL.IA, de ponta a ponta:
//
//   cliente (webhook falso) -> servidor REAL -> trabalhador REAL em Python
//   (scripts/agente-local/julia.py) -> Ollama FALSO (roteiro abaixo) -> servidor
//   -> Evolution falsa (o que "sairia" para o cliente).
//
// Nada sai daqui: a Evolution é de mentira, o Bling é simulado (modo teste) e o
// "Ollama" é um roteiro que responde como o modelo responderia. O que se testa
// é o encanamento e as travas, não a inteligência do modelo.
//
//   AGENTE_TESTE_DB=postgres://postgres:teste@localhost:5432/agente_e2e node e2e/agente.e2e.mjs
//
// O banco indicado tem as tabelas crm_* APAGADAS.

import { io } from "socket.io-client";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { criarEvolutionFalsa } = require("./evolution-falsa.js");
const { Pool } = require("pg");

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = path.join(AQUI, "..", "servidor.js");
const JULIA = path.join(AQUI, "..", "..", "scripts", "agente-local", "julia.py");
const AMOSTRA = path.join(AQUI, "..", "..", "scripts", "agente-local", "testes", "catalogo-amostra.json");
const DB = process.env.AGENTE_TESTE_DB;
if (!DB) {
  console.log("Defina AGENTE_TESTE_DB (um banco Postgres de teste; as tabelas crm_* são apagadas).");
  process.exit(2);
}
const PORTA = 4161;
const PORTA_OLLAMA = 4671;
const R = fs.mkdtempSync(path.join(os.tmpdir(), "bancada-agente-"));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let passaram = 0;
let falharam = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "  PASSOU" : "  FALHOU"}  ${nome}${extra ? ` — ${extra}` : ""}`);
  cond ? passaram++ : falharam++;
};

// ------------------------------------------------------------------ Ollama falso
// Responde como o modelo responderia, olhando a conversa que o trabalhador manda.
const pedidosAoOllama = [];
const ollama = http.createServer(async (req, res) => {
  let corpo = "";
  for await (const parte of req) corpo += parte;
  const responder = (obj) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  if (req.url === "/api/tags") return responder({ models: [{ name: "qwen3:14b" }, { name: "qwen2.5vl:7b" }] });
  if (req.url === "/api/ps") return responder({ models: [{ name: "qwen3:14b" }] });
  const b = JSON.parse(corpo || "{}");
  pedidosAoOllama.push(b);
  const msgs = b.messages || [];
  const fala = (content) => responder({ message: { role: "assistant", content } });
  const ferramenta = (name, args) => responder({ message: { role: "assistant", content: "", tool_calls: [{ function: { name, arguments: args } }] } });

  // Visão: foto do cliente.
  if (msgs.some((m) => m.images?.length)) return fala("Um notebook Dell com a tela trincada no canto direito.");

  // Recado interno do sistema ("[Nota interna...]") vai como "user", mas não é o cliente.
  const ehCliente = (m) => m.role === "user" && !String(m.content || "").startsWith("[Nota interna");
  const ultimaUser = [...msgs].reverse().find(ehCliente)?.content || "";
  const iUser = msgs.map(ehCliente).lastIndexOf(true);
  const depois = msgs.slice(iUser + 1).filter((m) => m.role === "tool").map((m) => ({ nome: m.tool_name, saida: JSON.parse(m.content) }));
  const sistema = msgs.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const busca = depois.find((d) => d.nome === "buscar_produtos")?.saida;

  if (/pode fechar/i.test(ultimaUser)) {
    if (!depois.some((d) => d.nome === "salvar_dados")) return ferramenta("salvar_dados", { nome: "Thiago Teste", pagamento: "pix", entrega: "retirada" });
    if (!depois.some((d) => d.nome === "emitir_venda")) return ferramenta("emitir_venda", {});
    return fala("Obrigada pela compra, Thiago!");
  }
  if (/quero esse/i.test(ultimaUser)) {
    const id = (sistema.match(/opção 1: id (\S+) =/) || [])[1];
    if (!depois.some((d) => d.nome === "emitir_orcamento")) return ferramenta("emitir_orcamento", { itens: [{ id, quantidade: 1 }] });
    return fala("Prontinho! Posso fechar o pedido?");
  }
  if (/notebook|tela/i.test(ultimaUser)) {
    if (!busca) return ferramenta("buscar_produtos", { busca: "notebook" });
    const p = busca.produtos[0];
    if (!depois.some((d) => d.nome === "mostrar_produto")) return ferramenta("mostrar_produto", { id: p.id });
    const foto = /\[foto: ([^\]]+)\]/.exec(ultimaUser);
    return fala(`${foto ? "Vi a foto da tela. " : ""}Separei este notebook: ${p.preco_a_vista_pix} à vista no Pix. Serve para você?`);
  }
  if (/preço inventado/i.test(ultimaUser)) return fala("Sai por R$ 1.234,56!");
  return fala("Como posso te ajudar?");
});
await new Promise((r) => ollama.listen(PORTA_OLLAMA, r));

// ------------------------------------------------------------------ servidor
const banco = new Pool({ connectionString: DB, max: 2 });
await banco.query(`DROP TABLE IF EXISTS crm_agente_conversa, crm_campanha_envio, crm_campanha, crm_mensagem, crm_contato, crm_evento,
                   crm_interesse, crm_contato_etiqueta, crm_etiqueta, crm_nota, crm_consentimento,
                   crm_resposta_rapida, crm_config, migracao CASCADE`);

const evo = criarEvolutionFalsa({ porta: 4598 + 70, portaSite: 4599 + 70 });
await evo.ligar();
const SEG = "segredo-de-bancada-do-agente";
const SEG_PC = "segredo-do-pc-de-bancada";
fs.mkdirSync(path.join(R, "dados", "data"), { recursive: true });
fs.writeFileSync(path.join(R, "dados", "webhook.segredo"), SEG);
fs.writeFileSync(path.join(R, "dados", "agente.segredo"), SEG_PC);
// O espelho do catálogo do site já no disco (a amostra tem custo de mentira para provar que não sai).
const amostra = JSON.parse(fs.readFileSync(AMOSTRA, "utf8"));
amostra.produtos = amostra.produtos.map((p) => ({ ...p, cost: "1,00", supplier: "Fornecedor Secreto" }));
fs.writeFileSync(path.join(R, "dados", "data", "catalogo.json"), JSON.stringify(amostra));

const log = [];
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
    VERSAO: "bancada-agente",
    URL_INTERNA_SERVIDOR: `http://localhost:${PORTA}`,
    CONCILIAR_A_CADA_MS: "600000",
    REDE_A_CADA_MS: "600000",
    AGENTE_ESPERA_MS: "1500",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
servidor.stdout.on("data", (b) => log.push(String(b)));
servidor.stderr.on("data", (b) => log.push(String(b)));

// ------------------------------------------------------------------ trabalhador (Python)
const pastaPc = path.join(R, "pc");
fs.mkdirSync(pastaPc, { recursive: true });
fs.writeFileSync(path.join(pastaPc, "segredo.txt"), SEG_PC);
const logPc = [];
let pc = null;
function subirPc() {
  pc = spawn(process.env.PYTHON || "python3", [JULIA], {
    env: {
      ...process.env,
      JULIA_VPS_URL: `http://localhost:${PORTA}`,
      JULIA_ARQUIVO_SEGREDO: path.join(pastaPc, "segredo.txt"),
      JULIA_OLLAMA_URL: `http://localhost:${PORTA_OLLAMA}`,
      JULIA_PASTA_DADOS: path.join(pastaPc, "dados"),
      JULIA_RESPEITAR_PLACA: "0",
      JULIA_BLING_TOKENS: path.join(pastaPc, "nao-existe.json"),
      JULIA_INTERVALO_S: "0.3",
      PYTHONIOENCODING: "utf-8",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  pc.stdout.on("data", (b) => logPc.push(String(b)));
  pc.stderr.on("data", (b) => logPc.push(String(b)));
}

const encerrar = async (codigo) => {
  pc?.kill("SIGKILL");
  servidor.kill("SIGKILL");
  evo.fechar();
  ollama.close();
  await banco.end().catch(() => {});
  if (codigo) {
    console.log("\n--- log do servidor (fim) ---\n" + log.join("").slice(-3000));
    console.log("\n--- log do PC (fim) ---\n" + logPc.join("").slice(-3000));
  }
  fs.rmSync(R, { recursive: true, force: true });
  process.exit(codigo);
};

const TICKET = `v1.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.sig`;
const api = async (caminho, { metodo = "GET", corpo } = {}) => {
  const r = await fetch(`http://localhost:${PORTA}/api/comando${caminho}`, {
    method: metodo,
    headers: { "content-type": "application/json", authorization: `Bearer ${TICKET}` },
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
const clienteEscreve = async (numero, texto, extra = {}) => {
  const rec = {
    key: { id: `IN${++nMsg}`, remoteJid: `${numero}@s.whatsapp.net`, fromMe: false },
    pushName: "Thiago",
    messageType: "conversation",
    message: { conversation: texto },
    messageTimestamp: agora(),
    ...extra,
  };
  evo.guardar(rec);
  await webhook("messages.upsert", rec);
  return rec;
};
const lojaEscreveNoCelular = async (numero, texto) => {
  const rec = { key: { id: `CEL${++nMsg}`, remoteJid: `${numero}@s.whatsapp.net`, fromMe: true }, messageType: "conversation", message: { conversation: texto }, messageTimestamp: agora() };
  evo.guardar(rec);
  await webhook("send.message", rec);
};
const ate = async (fn, ms = 8000) => {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    const v = await fn();
    if (v) return v;
    await esperar(150);
  }
  return null;
};
const enviadasPara = (numero) => evo.mensagens.filter((m) => m.key?.fromMe && m.key.remoteJid === `${numero}@s.whatsapp.net` && !String(m.key.id).startsWith("CEL"));
const textoDe = (m) => m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || "";

const TESTE = "5519984515960"; // número pessoal do Thiago (só aqui na bancada: a Evolution é falsa)
const CLIENTE = "5500000000701";

try {
  await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).catch(() => null))?.ok, 15000);
  await ate(async () => log.join("").includes("[agente] JUL.IA"), 15000);
  await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).then((r) => r.json()).catch(() => null))?.connected, 8000);

  const painel = io(`http://localhost:${PORTA}`, { auth: { ticket: TICKET }, transports: ["websocket"] });
  const ev = { agente: [], toast: [] };
  painel.on("whatsapp:agente", (d) => ev.agente.push(d));
  painel.on("whatsapp:toast", (d) => ev.toast.push(d?.message));
  await new Promise((r, rej) => {
    painel.on("connect", r);
    setTimeout(() => rej(new Error("painel não conectou")), 5000);
  });

  console.log("\n— portas do PC —");
  const semSegredo = await fetch(`http://localhost:${PORTA}/api/agente/trabalho`);
  ok("sem o segredo do PC: 401", semSegredo.status === 401);
  const cat = await fetch(`http://localhost:${PORTA}/api/agente/catalogo`, { headers: { "x-agente-segredo": SEG_PC } }).then((r) => r.json());
  ok("catálogo para o agente sem custo nem fornecedor", cat.total > 0 && !JSON.stringify(cat).includes("Fornecedor Secreto") && !JSON.stringify(cat).includes('"cost"'));
  const est0 = await api("/agente");
  ok("começa desligado e no modo teste", est0.json.agente?.config?.modo === "desligado" && est0.json.agente?.config?.publico === "teste");

  subirPc();
  const online = await ate(async () => (await api("/agente")).json.agente?.trabalhador?.online, 20000);
  ok("o PC bate o ponto e aparece online", Boolean(online), logPc.join("").slice(-300));

  console.log("\n— desligado não responde —");
  await clienteEscreve(TESTE, "oi, quero um notebook");
  await esperar(3500);
  ok("desligado: nada enviado", enviadasPara(TESTE).length === 0);

  console.log("\n— automático, público teste —");
  const lig = await api("/agente", { metodo: "PUT", corpo: { modo: "automatico" } });
  ok("ligar (admin)", lig.status === 200 && lig.json.config?.modo === "automatico", JSON.stringify(lig.json));
  await clienteEscreve(CLIENTE, "quero um notebook");
  await clienteEscreve(TESTE, "quero um notebook para estudar");
  const respondeu = await ate(async () => enviadasPara(TESTE).length >= 2 && enviadasPara(TESTE), 25000);
  ok("respondeu o número de teste (texto + cartão do produto)", Boolean(respondeu), String(enviadasPara(TESTE).length));
  const [t1, cartao] = respondeu || [];
  ok("se apresenta na primeira resposta", /JUL\.IA/.test(textoDe(t1 || {})), textoDe(t1 || {}));
  ok("preço vem do catálogo", /R\$ [\d.]+,\d\d/.test(textoDe(t1 || {})));
  ok("cartão com foto, preço e link do site", /balao|product\//.test(textoDe(cartao || {})) || /Pix/.test(textoDe(cartao || {})), textoDe(cartao || {}).slice(0, 120));
  ok("cliente de verdade NÃO recebe no modo teste", enviadasPara(CLIENTE).length === 0);
  const atrib = await ate(async () => (await fetch(`http://localhost:${PORTA}/health`).then((r) => r.json()))?.diagnostico?.agente?.pcOnline);
  ok("/health mostra o PC online", Boolean(atrib));
  const ev1 = await ate(async () => (await banco.query(`SELECT count(*)::int n FROM crm_evento WHERE tipo='agente_resposta'`)).rows[0].n >= 1);
  ok("evento agente_resposta no banco", Boolean(ev1));

  console.log("\n— foto do cliente —");
  const antesFoto = enviadasPara(TESTE).length;
  evo.midias.set("FOTO9", { base64: Buffer.from("jpeg-falso").toString("base64"), mimetype: "image/jpeg", fileName: "f.jpg" });
  await clienteEscreve(TESTE, "", {
    key: { id: "FOTO9", remoteJid: `${TESTE}@s.whatsapp.net`, fromMe: false },
    messageType: "imageMessage",
    message: { imageMessage: { mimetype: "image/jpeg", caption: "olha a tela" } },
  });
  const comFoto = await ate(async () => enviadasPara(TESTE).length > antesFoto && enviadasPara(TESTE).slice(antesFoto), 25000);
  ok("a foto foi vista pelo modelo de visão", Boolean(comFoto) && /Vi a foto/.test(textoDe(comFoto[0])), comFoto && textoDe(comFoto[0]));
  ok("o modelo de visão recebeu a imagem", pedidosAoOllama.some((p) => p.messages?.some((m) => m.images?.length)));

  console.log("\n— orçamento e venda (Bling simulado no modo teste) —");
  await esperar(500);
  const antesOrc = enviadasPara(TESTE).length;
  await clienteEscreve(TESTE, "quero esse");
  const orc = await ate(async () => enviadasPara(TESTE).slice(antesOrc).find((m) => /Orçamento nº/.test(textoDe(m))), 25000);
  ok("orçamento pronto vai ao cliente", Boolean(orc), orc && textoDe(orc).split("\n")[0]);
  ok("orçamento marcado como teste", orc && /\(teste\)/.test(textoDe(orc)));
  const nota = await ate(async () => (await banco.query(`SELECT texto FROM crm_nota WHERE texto LIKE '%Orçamento%'`)).rows[0]);
  ok("nota do orçamento na ficha", Boolean(nota));

  await esperar(500);
  const antesVenda = enviadasPara(TESTE).length;
  await clienteEscreve(TESTE, "sim, pode fechar. meu cpf é 529.982.247-25");
  const venda = await ate(async () => enviadasPara(TESTE).slice(antesVenda).find((m) => /Pedido nº/.test(textoDe(m))), 25000);
  ok("confirmação do pedido vai ao cliente", Boolean(venda), venda && textoDe(venda).split("\n")[0]);
  ok("aviso de venda no painel", Boolean(await ate(async () => ev.toast.find((t) => /fechou venda/.test(t || "")))));
  const pq = (await api(`/agente/conversas/${TESTE}@c.us`)).json.conversa;
  ok("depois da venda a conversa passa para um vendedor", pq?.situacao === "transferida", JSON.stringify(pq));
  ok("CPF ficou nos dados da conversa", pq?.dados?.cpf_cnpj === "52998224725");

  console.log("\n— vendedor responde pelo celular —");
  await api(`/agente/conversas/${TESTE}@c.us/retomar`, { metodo: "POST" });
  await lojaEscreveNoCelular(TESTE, "Oi Thiago, é o Marcos!");
  await esperar(300);
  const antesHumano = enviadasPara(TESTE).length;
  await clienteEscreve(TESTE, "oi Marcos, quero outro notebook");
  await esperar(4000);
  ok("o robô não fala por cima do vendedor", enviadasPara(TESTE).length === antesHumano);
  const motivo = (await api(`/agente/conversas/${TESTE}@c.us`)).json.conversa?.motivo;
  ok("o motivo aparece no painel", /vendedor respondeu/.test(motivo || ""), motivo);

  console.log("\n— copiloto —");
  await api("/agente", { metodo: "PUT", corpo: { modo: "copiloto" } });
  await api(`/agente/conversas/${TESTE}@c.us/retomar`, { metodo: "POST" });
  const antesCop = enviadasPara(TESTE).length;
  await clienteEscreve(TESTE, "tem outro notebook?");
  const sug = await ate(async () => ev.agente.find((a) => a.tipo === "sugestao")?.sugestao, 25000);
  ok("copiloto: sugestão para o vendedor", Boolean(sug));
  ok("copiloto: nada enviado sozinho", enviadasPara(TESTE).length === antesCop);
  const env = await api(`/agente/sugestoes/${sug?.id}/enviar`, { metodo: "POST", corpo: {} });
  ok("vendedor aprova e a sugestão sai", env.json.enviados >= 1 && enviadasPara(TESTE).length > antesCop, JSON.stringify(env.json));

  console.log("\n— resposta com preço inventado —");
  await api("/agente", { metodo: "PUT", corpo: { modo: "automatico" } });
  await esperar(300);
  const antesInv = enviadasPara(TESTE).length;
  await clienteEscreve(TESTE, "me diz um preço inventado");
  const inv = await ate(async () => enviadasPara(TESTE).length > antesInv && enviadasPara(TESTE).slice(antesInv), 25000);
  ok("preço que não está no catálogo não sai", inv && !inv.some((m) => /1\.234,56/.test(textoDe(m))), inv && textoDe(inv[0]));
  ok("e a conversa vai para um vendedor", Boolean(await ate(async () => ev.toast.find((t) => /responder com segurança/.test(t || "")))));

  console.log("\n— desligar —");
  await api("/agente", { metodo: "PUT", corpo: { modo: "desligado" } });
  const antesDesl = evo.mensagens.length;
  await clienteEscreve(TESTE, "oi de novo, notebook?");
  await esperar(3500);
  ok("desligado de novo: nada enviado", enviadasPara(TESTE).filter((m) => evo.mensagens.indexOf(m) >= antesDesl).length === 0);
} catch (e) {
  console.error("ERRO NA BANCADA:", e);
  falharam++;
}

console.log(`\n${passaram} passaram, ${falharam} falharam`);
await encerrar(falharam ? 1 : 0);
