// node --test imagem.test.js
//
// Monta uma "imagem" de mentira só com o que o Dockerfile.evo copia (as
// linhas COPY, arquivo por arquivo) e roda o confere-imagem.js dentro dela —
// o mesmo que o `docker build` faz. Sem Docker: dá para rodar a cada mudança.
//
// Em 02/10 o painel ficou em 502 porque o vigia.js não entrou na lista de
// COPY. Esta fase cria medicao.js, recarga.js, transcricao.js e upload.js:
// com o Dockerfile.evo antigo, este teste falha apontando o require que falta.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AQUI = __dirname;

/** Pares [origem, destino] das linhas COPY do Dockerfile (só as que vêm do contexto). */
function copiasDoDockerfile(texto) {
  const pares = [];
  for (const linha of texto.split("\n")) {
    const m = linha.trim().match(/^COPY\s+(?!--)(.+)$/);
    if (!m) continue;
    const partes = m[1].trim().split(/\s+/);
    const destino = partes.pop();
    for (const origem of partes) pares.push([origem, destino]);
  }
  return pares;
}

function montarImagem(dockerfile) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "imagem-evo-"));
  for (const [origem, destino] of copiasDoDockerfile(fs.readFileSync(dockerfile, "utf8"))) {
    const de = path.join(AQUI, origem);
    // package.json e package-lock.json do npm ci: não são código do servidor.
    if (/package(-lock)?\.json$/.test(origem)) continue;
    const para = destino.endsWith("/") ? path.join(raiz, destino, path.basename(origem)) : path.join(raiz, destino);
    fs.mkdirSync(path.dirname(para), { recursive: true });
    fs.cpSync(de, para, { recursive: true });
  }
  return raiz;
}

test("tudo o que o servidor.js pede com require está no Dockerfile.evo", () => {
  const raiz = montarImagem(path.join(AQUI, "Dockerfile.evo"));
  try {
    const r = spawnSync(process.execPath, [path.join(raiz, "confere-imagem.js")], { encoding: "utf8" });
    assert.strictEqual(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout, /Imagem completa/);
  } finally {
    fs.rmSync(raiz, { recursive: true, force: true });
  }
});

test("o teste pega o erro de 02/10: arquivo novo fora da lista de COPY", () => {
  const texto = fs.readFileSync(path.join(AQUI, "Dockerfile.evo"), "utf8").replace(" medicao.js", "");
  const falso = path.join(os.tmpdir(), `Dockerfile.evo.${process.pid}`);
  fs.writeFileSync(falso, texto);
  const raiz = montarImagem(falso);
  try {
    const r = spawnSync(process.execPath, [path.join(raiz, "confere-imagem.js")], { encoding: "utf8" });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /require\("\.\/medicao"\)/);
  } finally {
    fs.rmSync(raiz, { recursive: true, force: true });
    fs.rmSync(falso, { force: true });
  }
});
