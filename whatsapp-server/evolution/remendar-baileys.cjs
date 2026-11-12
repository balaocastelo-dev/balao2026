// Remendo do Baileys dentro da imagem da Evolution — roda no `docker build`.
//
// O apagão de 29/09 (dois dias sem receber nada, com tudo dizendo
// "conectado") nasceu numa linha do Baileys 7.0.0-rc.9, o que vem dentro da
// Evolution 2.3.7. Em lib/Socket/messages-recv.js, a fila de nós "offline"
// (o que chega enquanto o aparelho estava fora, e que o WhatsApp despeja de
// uma vez na reconexão) é processada assim:
//
//     while (nodes.length && ws.isOpen) {
//         ...
//         await nodeProcessor(node);        <- sem catch
//     }
//     isProcessing = false;
//
// Basta UMA mensagem que não decodifica (remetente "@bot", o "Meta Business
// Agent") para o `await` lançar. O laço morre antes do `isProcessing = false`,
// a trava fica ligada para sempre e toda mensagem nova que chega entra na
// fila e nunca sai — até ler um QR novo. Enviar continua funcionando, porque
// sai por outro caminho. É por isso que ninguém percebia.
//
// O Baileys corrigiu no rc10 (Utils/offline-node-processor.js):
//
//     await nodeProcessor(node).catch(err => deps.onUnexpectedError(err, `processing offline ${type}`));
//
// No Baileys 7.0.0-rc.9 (o da imagem oficial) este script aplica exatamente
// a mesma troca. A partir do rc10 a correção já vem em
// lib/Utils/offline-node-processor.js — aí o script vira no-op e o build
// segue. A imagem da loja instala o 7.0.0-rc13 por causa do tctoken (erro
// 463); sem o no-op, o build quebraria numa correção que já está feita.
//
// Ele continua desconfiado: se não achar nem o trecho vulnerável nem o
// catch, o BUILD falha e o deploy nem troca o container (a Evolution antiga
// continua no ar):
//   - o trecho vulnerável, se existir, tem de aparecer EXATAMENTE uma vez;
//   - depois de gravar, relê o arquivo e confere a troca;
//   - confere que o código da Evolution (dist/) não embute uma cópia própria
//     do Baileys, que ficaria sem remendo;
//   - olha toda cópia do Baileys que existir em node_modules.
//
// Uso: node remendar-baileys.cjs [raiz-da-evolution]   (padrão: /evolution)

const fs = require("fs");
const path = require("path");

const TRECHO_ANTIGO = "await nodeProcessor(node);";
const TRECHO_NOVO =
  "await nodeProcessor(node).catch(err => onUnexpectedError(err, `processing offline ${type}`));";
// Frase que só existe dentro da fila offline do Baileys. Se aparecer no dist/
// da Evolution, o Baileys foi empacotado junto e o remendo em node_modules
// não valeria para o código que de fato roda.
const ASSINATURA_DA_FILA = "processing offline nodes";
const VERSAO_CONHECIDA = "7.0.0-rc.9";

function falhar(motivo) {
  console.error("");
  console.error("  ERRO no remendo do Baileys: " + motivo);
  console.error("  O build para aqui de propósito: a Evolution que está no ar continua como está.");
  console.error("");
  process.exit(1);
}

function contar(texto, trecho) {
  let n = 0;
  for (let i = texto.indexOf(trecho); i !== -1; i = texto.indexOf(trecho, i + trecho.length)) n++;
  return n;
}

/** Toda pasta `baileys` (com package.json de nome "baileys") dentro de node_modules. */
function acharCopiasDoBaileys(pastaNodeModules) {
  const achadas = [];
  const visitar = (pasta, profundidade) => {
    if (profundidade > 6) return;
    let itens;
    try {
      itens = fs.readdirSync(pasta, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of itens) {
      if (!item.isDirectory() || item.name.startsWith(".")) continue;
      const caminho = path.join(pasta, item.name);
      if (item.name.startsWith("@")) {
        visitar(caminho, profundidade);
        continue;
      }
      if (item.name === "baileys") {
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(caminho, "package.json"), "utf8"));
          if (pkg.name === "baileys") achadas.push({ pasta: caminho, versao: pkg.version });
        } catch {
          /* pasta com o nome mas sem pacote: ignora */
        }
      }
      const aninhada = path.join(caminho, "node_modules");
      if (fs.existsSync(aninhada)) visitar(aninhada, profundidade + 1);
    }
  };
  visitar(pastaNodeModules, 0);
  return achadas;
}

function arquivosJs(pasta) {
  const saida = [];
  const visitar = (p) => {
    let itens;
    try {
      itens = fs.readdirSync(p, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of itens) {
      const c = path.join(p, item.name);
      if (item.isDirectory()) visitar(c);
      else if (/\.(c|m)?js$/.test(item.name)) saida.push(c);
    }
  };
  visitar(pasta);
  return saida;
}

function correcaoJaEsta(texto) {
  return texto.includes("await nodeProcessor(node).catch(") && texto.includes("processing offline");
}

const ARQUIVOS_DA_FILA = [
  path.join("lib", "Socket", "messages-recv.js"),
  path.join("lib", "Utils", "offline-node-processor.js"),
];

function remendarUmArquivo(arquivo, versao, raiz) {
  const original = fs.readFileSync(arquivo, "utf8");
  const vezes = contar(original, TRECHO_ANTIGO);
  const corrigido = correcaoJaEsta(original);
  if (vezes === 0) return { arquivo, versao, noop: corrigido, ausente: !corrigido };
  if (vezes !== 1) {
    falhar(
      `em ${path.relative(raiz, arquivo)} (Baileys ${versao}) o trecho "${TRECHO_ANTIGO}" aparece ${vezes} vez(es); ` +
        `esperava exatamente 1.`
    );
  }
  // O laço offline tem de estar onde imaginamos: o trecho fica dentro do
  // `while` que lê `nodes.shift()`, com `onUnexpectedError` e `type` à mão.
  const pos = original.indexOf(TRECHO_ANTIGO);
  const antes = original.slice(Math.max(0, pos - 600), pos);
  if (!/nodes\.shift\(\)/.test(antes) || !/const \{ type, node \}/.test(antes)) {
    falhar(`o trecho em ${path.relative(raiz, arquivo)} não está dentro do laço da fila offline`);
  }
  if (!/onUnexpectedError/.test(original.slice(0, pos))) {
    falhar(`onUnexpectedError não está disponível antes do trecho em ${path.relative(raiz, arquivo)}`);
  }

  const remendado = original.replace(TRECHO_ANTIGO, TRECHO_NOVO);
  fs.writeFileSync(arquivo, remendado);

  const relido = fs.readFileSync(arquivo, "utf8");
  if (contar(relido, TRECHO_ANTIGO) !== 0 || contar(relido, TRECHO_NOVO) !== 1) {
    falhar(`a troca em ${path.relative(raiz, arquivo)} não ficou gravada como esperado`);
  }
  if (relido.length !== original.length - TRECHO_ANTIGO.length + TRECHO_NOVO.length) {
    falhar(`o tamanho de ${path.relative(raiz, arquivo)} depois do remendo não confere`);
  }
  return { arquivo, versao, aplicado: true };
}

function remendar(raiz) {
  const nodeModules = path.join(raiz, "node_modules");
  if (!fs.existsSync(nodeModules)) falhar(`não achei ${nodeModules}`);

  // 1) O Baileys que a Evolution carrega de verdade: o mesmo que o require dela acha.
  let oficial;
  try {
    oficial = path.dirname(require.resolve("baileys/package.json", { paths: [raiz] }));
  } catch {
    falhar(`a Evolution em ${raiz} não tem o pacote "baileys" instalado`);
  }

  // 2) Toda cópia (inclusive aninhada). Cada uma recebe o mesmo remendo.
  const copias = acharCopiasDoBaileys(nodeModules);
  if (!copias.some((c) => path.resolve(c.pasta) === path.resolve(oficial))) {
    copias.push({ pasta: oficial, versao: JSON.parse(fs.readFileSync(path.join(oficial, "package.json"), "utf8")).version });
  }

  // 3) O código da Evolution não pode trazer uma cópia embutida do Baileys.
  const dist = path.join(raiz, "dist");
  if (!fs.existsSync(dist)) falhar(`não achei ${dist} (a imagem mudou de formato?)`);
  const embutido = arquivosJs(dist).filter((a) => fs.readFileSync(a, "utf8").includes(ASSINATURA_DA_FILA));
  if (embutido.length) {
    falhar(
      `o dist/ da Evolution embute o código da fila offline do Baileys (${embutido
        .map((a) => path.relative(raiz, a))
        .join(", ")}). Remendar node_modules não adiantaria.`
    );
  }

  const aplicados = [];
  const noops = [];
  for (const { pasta, versao } of copias) {
    const arquivos = ARQUIVOS_DA_FILA.map((rel) => path.join(pasta, rel)).filter((a) => fs.existsSync(a));
    if (!arquivos.length) {
      falhar(`o Baileys ${versao} em ${pasta} não tem a fila offline (messages-recv.js nem offline-node-processor.js)`);
    }
    const resultados = arquivos.map((a) => remendarUmArquivo(a, versao, raiz));
    const destaCopia = resultados.filter((r) => r.aplicado);
    const jaTinha = resultados.filter((r) => r.noop);
    if (!destaCopia.length && !jaTinha.length) {
      falhar(
        `Baileys ${versao} em ${pasta} não tem o trecho vulnerável nem o catch da fila offline. ` +
          `Esperava o ${VERSAO_CONHECIDA} (para remendar) ou o rc10+ (no-op).`
      );
    }
    for (const r of destaCopia) aplicados.push(`${path.relative(raiz, r.arquivo)} (Baileys ${versao})`);
    if (jaTinha.length) noops.push(`${versao} em ${path.relative(raiz, pasta)}`);
  }

  if (aplicados.length) {
    console.log(`  Remendo do Baileys aplicado em ${aplicados.length} arquivo(s):`);
    for (const f of aplicados) console.log(`    - ${f}`);
    console.log("  A fila offline agora registra a mensagem que não decodifica e segue para a próxima.");
  }
  if (noops.length && !aplicados.length) {
    console.log(`  Baileys já traz a correção da fila offline. Remendo em no-op (${noops.length} cópia(s)).`);
  } else if (noops.length) {
    console.log(`  Correção já presente (no-op) em: ${noops.join(", ")}.`);
  }
  return aplicados;
}

if (require.main === module) {
  remendar(path.resolve(process.argv[2] || "/evolution"));
}

module.exports = { remendar, TRECHO_ANTIGO, TRECHO_NOVO, ASSINATURA_DA_FILA };
