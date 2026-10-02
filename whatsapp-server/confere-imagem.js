// Conferência de integridade da imagem — roda DENTRO do build do Docker.
//
// Em 02/10/2026 o painel ficou em 502 por um motivo bobo e evitável: o
// Dockerfile.evo lista os arquivos do servidor um por um, e um módulo novo
// (vigia.js) foi criado, testado, empacotado e deployado sem entrar nessa
// lista. O container subiu, o `require` falhou, o servidor morreu no boot.
//
// O deploy constrói a imagem ANTES de trocar o container ("o servidor antigo
// continua no ar por enquanto"). Então, se o build falhar, o painel nem pisca:
// a versão velha segue atendendo. É muito melhor um build vermelho que um 502.
//
// O que isto confere, sem subir o servidor: que todo `require("./...")` de
// todo arquivo que entrou na imagem resolve de verdade, em cadeia.

const fs = require("fs");
const path = require("path");
const Module = require("module");

const RAIZ = __dirname;
const ENTRADAS = ["servidor.js"];

const vistos = new Set();
const faltando = [];

function resolverRelativos(arquivo) {
  if (vistos.has(arquivo)) return;
  vistos.add(arquivo);

  let codigo;
  try {
    codigo = fs.readFileSync(arquivo, "utf8");
  } catch {
    faltando.push({ de: "(entrada)", pede: path.relative(RAIZ, arquivo) });
    return;
  }

  // Pega require("./x") e require('../y'). Não tenta entender require dinâmico:
  // o que interessa é o caso comum, que é o que quebra.
  const pedidos = [...codigo.matchAll(/require\(\s*["'](\.[^"']+)["']\s*\)/g)].map((m) => m[1]);

  for (const pedido of pedidos) {
    let resolvido = null;
    try {
      resolvido = Module.createRequire(arquivo).resolve(pedido);
    } catch {
      faltando.push({ de: path.relative(RAIZ, arquivo), pede: pedido });
      continue;
    }
    if (resolvido.startsWith(RAIZ) && !resolvido.includes("node_modules")) {
      resolverRelativos(resolvido);
    }
  }
}

for (const e of ENTRADAS) resolverRelativos(path.join(RAIZ, e));

if (faltando.length) {
  console.error("");
  console.error("  ERRO: a imagem está incompleta.");
  console.error("");
  for (const f of faltando) {
    console.error(`    ${f.de} faz require("${f.pede}") — e esse arquivo não entrou na imagem.`);
  }
  console.error("");
  console.error("  Acrescente o arquivo à lista de COPY do Dockerfile.evo.");
  console.error("  O build para aqui de propósito: o servidor antigo continua no ar.");
  console.error("");
  process.exit(1);
}

console.log(`  Imagem completa: ${vistos.size} arquivo(s) do servidor, todos os require resolvem.`);
