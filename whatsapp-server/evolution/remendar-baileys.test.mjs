// node --test whatsapp-server/evolution/remendar-baileys.test.mjs
//
// Testa o remendo contra o arquivo REAL do Baileys 7.0.0-rc.9 — o mesmo que
// está dentro da imagem evoapicloud/evolution-api:v2.3.7. O pacote é baixado
// com `npm pack` e conferido pelo hash sha512 que o package-lock.json da
// Evolution 2.3.7 registra para ele; se o hash não bater, o teste falha (não
// é o arquivo que roda na loja). Sem rede, o teste é PULADO, não aprovado.
//
// O que fica provado:
//   1. no arquivo ORIGINAL, uma mensagem que não decodifica trava a fila: a
//      mensagem boa que chega depois nunca é processada (é o apagão de 29/09);
//   2. o script troca exatamente o trecho, e o arquivo remendado continua
//      sendo JavaScript válido;
//   3. no arquivo REMENDADO, o erro é registrado e a fila segue;
//   4. o script falha (build vermelho) se o trecho aparecer 0 ou 2 vezes, ou
//      se o dist/ da Evolution embutir o Baileys.
//
// Para usar um pacote já baixado: BAILEYS_TGZ=/caminho/baileys-7.0.0-rc.9.tgz

import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(AQUI, "remendar-baileys.cjs");
// package-lock.json da Evolution 2.3.7, "node_modules/baileys".integrity
const INTEGRIDADE =
  "sha512-Txd2dZ9MHbojvsHckeuCnAKPO/bQjKxua/0tQSJwOKXffK5vpS82k4eA/Nb46K0cK0Bx+fyY0zhnQHYMBriQcw==";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "remendo-baileys-"));

function obterPacote() {
  if (process.env.BAILEYS_TGZ) return process.env.BAILEYS_TGZ;
  try {
    const nome = execFileSync("npm", ["pack", "baileys@7.0.0-rc.9", "--pack-destination", tmp, "--silent"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 120_000,
    }).trim().split("\n").pop();
    return path.join(tmp, nome);
  } catch {
    return null;
  }
}

const tgz = obterPacote();
const pular = tgz ? false : "sem rede para o npm pack (o teste não pode provar nada sem o arquivo real)";

/** Monta uma "imagem" mínima: /evolution/node_modules/baileys + dist/. */
function montarImagem(nome) {
  const raiz = path.join(tmp, nome, "evolution");
  const pacote = path.join(tmp, "pacote");
  if (!fs.existsSync(pacote)) {
    fs.mkdirSync(pacote, { recursive: true });
    execFileSync("tar", ["-xzf", tgz, "-C", pacote]);
  }
  fs.mkdirSync(path.join(raiz, "node_modules"), { recursive: true });
  fs.cpSync(path.join(pacote, "package"), path.join(raiz, "node_modules", "baileys"), { recursive: true });
  fs.mkdirSync(path.join(raiz, "dist"), { recursive: true });
  // Como na imagem real: o dist/ só faz require("baileys").
  fs.writeFileSync(path.join(raiz, "dist", "main.js"), 'const b=require("baileys");module.exports=b;');
  return raiz;
}

const arquivoDaFila = (raiz) => path.join(raiz, "node_modules", "baileys", "lib", "Socket", "messages-recv.js");

/**
 * Tira do arquivo compilado a função da fila offline e a executa com peças
 * falsas. É o código de verdade do Baileys rodando — só o socket é de mentira.
 */
function fabricarFila(texto, { aoErro }) {
  const inicio = texto.indexOf("const makeOfflineNodeProcessor = () => {");
  const fim = texto.indexOf("const offlineNodeProcessor = makeOfflineNodeProcessor();");
  assert.ok(inicio > 0 && fim > inicio, "não achei a fila offline no arquivo");
  const fonte = texto.slice(inicio, fim);
  const processados = [];
  const tratar = async (node) => {
    // O "Meta Business Agent" (remetente @bot): a mensagem não decodifica.
    if (node.ruim) throw new Error("mensagem que não decodifica");
    processados.push(node.id);
  };
  const ws = { isOpen: true };
  const fabricar = new Function(
    "ws",
    "onUnexpectedError",
    "handleMessage",
    "handleCall",
    "handleReceipt",
    "handleNotification",
    `${fonte}\nreturn makeOfflineNodeProcessor;`
  );
  const fila = fabricar(ws, aoErro, tratar, tratar, tratar, tratar)();
  return { fila, processados };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

test("remendo do Baileys contra o pacote real 7.0.0-rc.9", { skip: pular }, async (t) => {
  await t.test("o pacote baixado é o mesmo da imagem (hash do package-lock da Evolution 2.3.7)", () => {
    const hash = "sha512-" + crypto.createHash("sha512").update(fs.readFileSync(tgz)).digest("base64");
    assert.strictEqual(hash, INTEGRIDADE);
  });

  await t.test("PROVA DO BUG: no arquivo original, uma mensagem ruim trava a fila para sempre", async () => {
    const raiz = montarImagem("original");
    const erros = [];
    const { fila, processados } = fabricarFila(fs.readFileSync(arquivoDaFila(raiz), "utf8"), {
      aoErro: (e, onde) => erros.push(onde),
    });
    fila.enqueue("message", { id: "ruim", ruim: true });
    fila.enqueue("message", { id: "boa-1" });
    await esperar(50);
    fila.enqueue("message", { id: "boa-2" }); // chega depois, como o cliente que escreve mais tarde
    await esperar(50);
    assert.deepStrictEqual(processados, [], "no original nada depois da mensagem ruim é processado");
    assert.deepStrictEqual(erros, ["processing offline nodes"]);
  });

  let raizRemendada;
  await t.test("o script troca exatamente o trecho e o arquivo continua válido", () => {
    raizRemendada = montarImagem("remendada");
    const antes = fs.readFileSync(arquivoDaFila(raizRemendada), "utf8");
    const r = spawnSync(process.execPath, [SCRIPT, raizRemendada], { encoding: "utf8" });
    assert.strictEqual(r.status, 0, r.stderr);
    const depois = fs.readFileSync(arquivoDaFila(raizRemendada), "utf8");
    assert.ok(!depois.includes("await nodeProcessor(node);"));
    assert.strictEqual(
      depois.split("await nodeProcessor(node).catch(err => onUnexpectedError(err, `processing offline ${type}`));").length,
      2
    );
    // Só aquela linha mudou.
    const a = antes.split("\n");
    const d = depois.split("\n");
    assert.strictEqual(a.length, d.length);
    assert.strictEqual(a.filter((l, i) => l !== d[i]).length, 1);
    const check = spawnSync(process.execPath, ["--check", arquivoDaFila(raizRemendada)], { encoding: "utf8" });
    assert.strictEqual(check.status, 0, check.stderr);
  });

  await t.test("no arquivo remendado, o erro é registrado e a fila segue", async () => {
    const erros = [];
    const { fila, processados } = fabricarFila(fs.readFileSync(arquivoDaFila(raizRemendada), "utf8"), {
      aoErro: (e, onde) => erros.push(onde),
    });
    fila.enqueue("message", { id: "ruim", ruim: true });
    fila.enqueue("message", { id: "boa-1" });
    await esperar(50);
    fila.enqueue("message", { id: "boa-2" });
    await esperar(50);
    assert.deepStrictEqual(processados, ["boa-1", "boa-2"]);
    assert.deepStrictEqual(erros, ["processing offline message"]);
  });

  await t.test("rodar de novo no arquivo já remendado falha (o trecho não está mais lá)", () => {
    const r = spawnSync(process.execPath, [SCRIPT, raizRemendada], { encoding: "utf8" });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /aparece 0 vez/);
  });

  await t.test("trecho repetido também falha", () => {
    const raiz = montarImagem("duplicada");
    const arq = arquivoDaFila(raiz);
    fs.appendFileSync(arq, "\n// await nodeProcessor(node);\n");
    const r = spawnSync(process.execPath, [SCRIPT, raiz], { encoding: "utf8" });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /aparece 2 vez/);
  });

  await t.test("Baileys embutido no dist/ da Evolution falha", () => {
    const raiz = montarImagem("embutida");
    fs.writeFileSync(path.join(raiz, "dist", "main.js"), "x.catch(e=>o(e,'processing offline nodes'))");
    const r = spawnSync(process.execPath, [SCRIPT, raiz], { encoding: "utf8" });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /embute/);
  });

  await t.test("cópia aninhada do Baileys também é remendada", () => {
    const raiz = montarImagem("aninhada");
    const outra = path.join(raiz, "node_modules", "@alguem", "pacote", "node_modules", "baileys");
    fs.mkdirSync(path.dirname(outra), { recursive: true });
    fs.cpSync(path.join(raiz, "node_modules", "baileys"), outra, { recursive: true });
    const r = spawnSync(process.execPath, [SCRIPT, raiz], { encoding: "utf8" });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /2 arquivo\(s\)/);
    const texto = fs.readFileSync(path.join(outra, "lib", "Socket", "messages-recv.js"), "utf8");
    assert.ok(texto.includes("onUnexpectedError(err, `processing offline ${type}`)"));
  });
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
