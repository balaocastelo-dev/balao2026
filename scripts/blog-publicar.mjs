#!/usr/bin/env node
/**
 * Publica um artigo no ramo de conteúdo do blog — o caminho da rotina diária.
 *
 *   node scripts/blog-publicar.mjs preparar
 *   node scripts/blog-publicar.mjs listar
 *   node scripts/blog-publicar.mjs conferir artigo.json
 *   node scripts/blog-publicar.mjs publicar artigo.json [--amanha]
 *   node scripts/blog-publicar.mjs pendentes
 *   node scripts/blog-publicar.mjs capa <endereço-do-artigo> foto.jpg
 *   node scripts/blog-publicar.mjs retirar <endereço-do-artigo>
 *
 * O artigo é um arquivo JSON no formato de `lib/blog/tipos.ts`. Antes de
 * publicar, ele passa pelas MESMAS conferências que o site aplica na hora de
 * mostrar: o formato (`lib/blog/validar.ts`) e a régua editorial
 * (`lib/blog/regua.ts`). Se não passa aqui, não passaria lá — então nada é
 * enviado.
 *
 * Publicar é gravar três arquivos no ramo `claude/blog-conteudo` e enviar:
 * o artigo, a foto de capa e a lista. O site não é refeito, e o ramo principal
 * não é tocado.
 *
 * Todo artigo leva uma foto de capa: fotografia ou imagem simulada do
 * assunto, sem texto e sem marca. NENHUM artigo da rotina aparece no site sem
 * ela (regra do Thiago, 16/10/2026): o site esconde o artigo até a foto chegar.
 * Quem escreve o artigo (na nuvem) não gera a imagem: descreve a foto
 * (`"capa": { "alt": "…", "pedido": "…" }`) e publica; o pedido entra na fila
 * `capas/pendentes.json`. A fábrica de conteúdo, no computador da loja, lê a
 * fila (`pendentes`), gera a foto na placa de vídeo local (às 22h e às 5h30,
 * quando a placa está livre) e a prende ao artigo (`capa <endereço> foto.jpg`).
 * Quem já tem a foto em mãos pode publicar direto com `--capa foto.jpg`.
 *
 * Por isso a rotina escreve na véspera e agenda (`--amanha`): o artigo fica
 * marcado para 6h, 12h ou 18h do dia seguinte (conforme o tipo), a foto é
 * feita de noite, e ele aparece na hora marcada já com a foto.
 *
 * Não precisa de `npm install`: usa só o Node (22.18 ou mais novo) e o git.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { registerHooks } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.balao.info";
const FUSO = "America/Sao_Paulo";

// O Node lê TypeScript sozinho, mas não adivinha a extensão: `./texto` precisa
// virar `./texto.ts`. Este gancho faz só isso, e só para os arquivos do blog.
if (typeof registerHooks !== "function") {
  console.error("Este comando precisa do Node 22.18 ou mais novo.");
  process.exit(2);
}
registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador.startsWith(".") && !path.extname(especificador) && contexto.parentURL?.includes("/lib/blog/")) {
      return proximo(`${especificador}.ts`, contexto);
    }
    return proximo(especificador, contexto);
  },
});

// O Node avisa que leu um .ts sem saber o tipo do pacote; não é problema nosso.
process.removeAllListeners("warning");

const importar = (arquivo) => import(pathToFileURL(path.join(RAIZ, arquivo)).href);
const { lerArtigo } = await importar("lib/blog/validar.ts");
const { avaliarArtigo } = await importar("lib/blog/regua.ts");
const { minutosDeLeitura, semAcento } = await importar("lib/blog/texto.ts");
const { RAMO_DE_CONTEUDO: RAMO, arquivoDaCapa, enderecoDaCapa } = await importar("lib/blog/capas.ts");

// ---------------------------------------------------------------- utilidades

function git(args, opcoes = {}) {
  return execFileSync("git", args, { cwd: opcoes.cwd ?? RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function sair(mensagem, codigo = 1) {
  console.error(`\n✗ ${mensagem}`);
  process.exit(codigo);
}

function diaEmCampinas(iso) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

/**
 * O blog publica três vezes por dia, e cada vez é de um tipo: o artigo
 * principal (guia, conserto, hardware…) de manhã, a notícia ao meio-dia e a
 * dica no fim da tarde. O tipo sai do próprio artigo — não é opção de comando.
 */
const TIPOS = {
  principal: "artigo principal (manhã)",
  noticia: "notícia (meio-dia)",
  dica: "dica (fim da tarde)",
};

/**
 * A hora em que cada tipo aparece no site quando é agendado (`--amanha`).
 * Campinas não tem horário de verão desde 2019: o fuso é sempre -03:00.
 */
const HORARIOS = { principal: "06:00", noticia: "12:00", dica: "18:00" };

function amanhaEmCampinas() {
  return diaEmCampinas(new Date(Date.now() + 24 * 3600 * 1000).toISOString());
}

function agendadoParaAmanha(tipo) {
  return new Date(`${amanhaEmCampinas()}T${HORARIOS[tipo]}:00-03:00`).toISOString();
}

function quando(iso) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function tipoDe(artigo) {
  if (artigo.categoria === "noticias") return "noticia";
  if (artigo.formato === "dica") return "dica";
  return "principal";
}

/** Os artigos que já existem no código do site: os escritos aqui e os do Soro. */
function artigosDaCasa() {
  const lista = [];
  const pasta = path.join(RAIZ, "content/blog/artigos");
  for (const arquivo of fs.readdirSync(pasta)) {
    if (!arquivo.endsWith(".ts") || arquivo === "index.ts") continue;
    const fonte = fs.readFileSync(path.join(pasta, arquivo), "utf8");
    const titulo = /\btitulo:\s*"((?:[^"\\]|\\.)+)"/.exec(fonte)?.[1] ?? "";
    lista.push({ slug: arquivo.replace(/\.ts$/, ""), titulo, origem: "autoral" });
  }
  try {
    const copia = JSON.parse(fs.readFileSync(path.join(RAIZ, "content/blog/soro/snapshot.json"), "utf8"));
    const artigos = Array.isArray(copia) ? copia : (copia.artigos ?? []);
    for (const a of artigos) if (a?.slug) lista.push({ slug: a.slug, titulo: a.titulo ?? "", origem: "soro" });
  } catch {
    // Sem a cópia do Soro, a lista segue só com os artigos escritos aqui.
  }
  return lista;
}

/** Abre o ramo de conteúdo numa pasta à parte, sem mexer na pasta de trabalho. */
function abrirRamo() {
  try {
    git(["fetch", "--quiet", "origin", `+refs/heads/${RAMO}:refs/remotes/origin/${RAMO}`]);
  } catch (erro) {
    sair(`Não consegui buscar o ramo ${RAMO}: ${String(erro.stderr || erro.message).trim()}`);
  }
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "blog-conteudo-"));
  git(["worktree", "add", "--quiet", "--detach", pasta, `origin/${RAMO}`]);
  return pasta;
}

function fecharRamo(pasta) {
  try {
    git(["worktree", "remove", "--force", pasta]);
  } catch {
    fs.rmSync(pasta, { recursive: true, force: true });
  }
}

function lerIndice(pasta) {
  const arquivo = path.join(pasta, "indice.json");
  if (!fs.existsSync(arquivo)) return { versao: 1, artigos: [] };
  const indice = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  return { versao: 1, artigos: Array.isArray(indice.artigos) ? indice.artigos : [] };
}

function gravarIndice(pasta, indice) {
  indice.artigos.sort((a, b) => Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm));
  indice.atualizadoEm = new Date().toISOString();
  fs.writeFileSync(path.join(pasta, "indice.json"), `${JSON.stringify(indice, null, 2)}\n`);
}

function enviar(pasta, mensagem) {
  git(["add", "-A"], { cwd: pasta });
  const identidade = [];
  try {
    git(["config", "user.email"], { cwd: pasta });
  } catch {
    identidade.push("-c", "user.name=Blog da Balão", "-c", "user.email=blog@balao.info");
  }
  const rodape = process.env.BLOG_RODAPE_DO_COMMIT ? `\n\n${process.env.BLOG_RODAPE_DO_COMMIT}` : "";
  git([...identidade, "commit", "--quiet", "-m", `${mensagem}${rodape}`], { cwd: pasta });
  try {
    git(["push", "--quiet", "origin", `HEAD:refs/heads/${RAMO}`], { cwd: pasta });
  } catch (erro) {
    sair(`O envio ao GitHub falhou. Nada foi publicado.\n${String(erro.stderr || erro.message).trim()}`);
  }
}

// --------------------------------------------------------------- foto de capa

const CAPA_PESO_MAXIMO = 900 * 1024;
const CAPA_LARGURA_MINIMA = 1200;

/** Largura e altura lidas do próprio arquivo, sem depender de biblioteca. */
function medirImagem(bytes) {
  // PNG: assinatura de 8 bytes e, logo depois, o bloco IHDR com as medidas.
  if (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47 && bytes.readUInt32BE(4) === 0x0d0a1a0a) {
    return { extensao: "png", largura: bytes.readUInt32BE(16), altura: bytes.readUInt32BE(20) };
  }
  // JPEG: percorre os segmentos até o que descreve o quadro (SOF).
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return null;
      const marcador = bytes[i + 1];
      if (marcador === 0xff) {
        i += 1;
        continue;
      }
      const tamanho = bytes.readUInt16BE(i + 2);
      const quadro = marcador >= 0xc0 && marcador <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marcador);
      if (quadro) return { extensao: "jpg", largura: bytes.readUInt16BE(i + 7), altura: bytes.readUInt16BE(i + 5) };
      i += 2 + tamanho;
    }
  }
  return null;
}

/** Confere a foto de capa e diz com que nome ela entra no ramo de conteúdo. */
function lerCapa(arquivo, slug) {
  if (!fs.existsSync(arquivo)) sair(`Foto de capa não encontrada: ${arquivo}`);
  const bytes = fs.readFileSync(arquivo);
  const medida = medirImagem(bytes);
  const erros = [];
  if (!medida) sair("A foto de capa precisa ser um arquivo JPEG ou PNG.");
  if (bytes.length > CAPA_PESO_MAXIMO) erros.push(`A foto de capa tem ${Math.round(bytes.length / 1024)} KB; o máximo é ${CAPA_PESO_MAXIMO / 1024} KB (salve em JPEG).`);
  if (medida.largura < CAPA_LARGURA_MINIMA) erros.push(`A foto de capa tem ${medida.largura} px de largura; o mínimo é ${CAPA_LARGURA_MINIMA} px.`);
  const proporcao = medida.largura / medida.altura;
  if (proporcao < 1.5 || proporcao > 2) erros.push(`A foto de capa é ${medida.largura} × ${medida.altura}; ela precisa ser deitada, perto de 16:9.`);
  if (erros.length > 0) sair(`Capa reprovada:\n- ${erros.join("\n- ")}`);

  const marca = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
  return {
    bytes,
    noRamo: arquivoDaCapa(slug, marca, medida.extensao),
    src: enderecoDaCapa(slug, marca, medida.extensao),
    largura: medida.largura,
    altura: medida.altura,
  };
}

/** As capas que um artigo já tem no ramo (uma, salvo sobra de troca). */
function capasNoRamo(pasta, slug) {
  const dir = path.join(pasta, "capas");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((nome) => nome.startsWith(`${slug}-`) && /^[0-9a-f]{8}\.(?:jpg|png)$/.test(nome.slice(slug.length + 1)))
    .map((nome) => path.join(dir, nome));
}

// ------------------------------------------------- fotos de capa por fazer

const PEDIDO_MINIMO = 60;
const PEDIDO_MAXIMO = 900;

/** A fila de fotos que o computador da loja ainda tem de gerar. */
function lerPendentes(pasta) {
  const arquivo = path.join(pasta, "capas", "pendentes.json");
  if (!fs.existsSync(arquivo)) return [];
  try {
    const lido = JSON.parse(fs.readFileSync(arquivo, "utf8"));
    return Array.isArray(lido.pendentes) ? lido.pendentes.filter((p) => p && typeof p.slug === "string") : [];
  } catch {
    return [];
  }
}

function gravarPendentes(pasta, pendentes) {
  fs.mkdirSync(path.join(pasta, "capas"), { recursive: true });
  const ordenados = [...pendentes].sort((a, b) => Date.parse(a.pedidoEm) - Date.parse(b.pedidoEm));
  fs.writeFileSync(path.join(pasta, "capas", "pendentes.json"), `${JSON.stringify({ versao: 1, pendentes: ordenados }, null, 2)}\n`);
}

/** Confere a descrição da foto que ainda vai ser gerada. Devolve os erros. */
function conferirPedidoDeCapa(capa) {
  const erros = [];
  const alt = typeof capa.alt === "string" ? capa.alt.trim() : "";
  const pedido = typeof capa.pedido === "string" ? capa.pedido.replace(/\s+/g, " ").trim() : "";
  if (alt.length < 12) erros.push('A capa precisa dizer o que a foto mostra: "capa": { "alt": "…" }.');
  if (pedido.length < PEDIDO_MINIMO || pedido.length > PEDIDO_MAXIMO) {
    erros.push(`A capa precisa do pedido da foto ("capa": { "pedido": "…" }), em inglês, de ${PEDIDO_MINIMO} a ${PEDIDO_MAXIMO} caracteres: a cena, os objetos, a luz. Tem ${pedido.length}.`);
  }
  if (/https?:|www\./i.test(pedido)) erros.push("O pedido da foto não leva endereço de site.");
  return { erros, alt, pedido };
}

/**
 * Lê o arquivo e aplica as duas conferências. Devolve o artigo pronto (e a
 * foto de capa, quando veio uma), ou encerra.
 */
function conferir(arquivo, { dataPadrao, arquivoDaFoto }) {
  if (!arquivo || !fs.existsSync(arquivo)) sair(`Arquivo não encontrado: ${arquivo ?? "(nenhum)"}`);

  let bruto;
  try {
    bruto = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  } catch (erro) {
    sair(`O arquivo não é um JSON válido: ${erro.message}`);
  }
  // A data é a da publicação: quem escreve não precisa preencher.
  if (bruto && typeof bruto === "object" && !bruto.publicadoEm) bruto.publicadoEm = dataPadrao;

  // A foto vem em arquivo, ou fica para o computador da loja gerar; o artigo
  // só descreve o que ela mostra.
  let foto = null;
  let pendente = null;
  if (semCapa) {
    if (bruto && typeof bruto === "object" && bruto.capa && !bruto.capa.src) delete bruto.capa;
  } else if (arquivoDaFoto) {
    if (!bruto || typeof bruto !== "object" || typeof bruto.slug !== "string") sair("O artigo precisa do campo slug.");
    const alt = typeof bruto.capa?.alt === "string" ? bruto.capa.alt.trim() : "";
    if (alt.length < 12) sair('Com --capa, o artigo precisa dizer o que a foto mostra: "capa": { "alt": "…" }.');
    foto = lerCapa(arquivoDaFoto, bruto.slug);
    bruto.capa = { src: foto.src, alt, largura: foto.largura, altura: foto.altura };
  } else if (bruto?.capa && typeof bruto.capa === "object" && !bruto.capa.src) {
    const pedido = conferirPedidoDeCapa(bruto.capa);
    if (pedido.erros.length > 0) sair(`Capa reprovada:\n- ${pedido.erros.join("\n- ")}`);
    pendente = { alt: pedido.alt, pedido: pedido.pedido };
    delete bruto.capa;
  }

  const lido = lerArtigo(bruto);
  if (!lido.ok) sair(`Formato reprovado:\n- ${lido.erros.join("\n- ")}`);

  const artigo = lido.valor;
  const avaliacao = avaliarArtigo(artigo);
  const m = avaliacao.medidas;
  console.log(`\n${artigo.titulo}`);
  console.log(`/blog/${artigo.slug} · ${artigo.categoria} · ${m.palavras} palavras · ${m.secoes} seções · ${minutosDeLeitura(artigo)} min de leitura`);
  console.log(`${m.tabelas} tabela(s) · ${m.perguntas} pergunta(s) · ${m.linksInternos} link(s) para a loja · ${m.chamadas} chamada(s) · ${artigo.fontes?.length ?? 0} fonte(s)`);
  console.log(`Tipo: ${TIPOS[tipoDe(artigo)]}`);
  if (artigo.roteiro) console.log(`Roteiro do vídeo: ${artigo.roteiro.fala.split(/\s+/).length} palavras de fala, ${artigo.roteiro.destaques.length} destaques`);
  if (foto) console.log(`Capa: ${foto.largura} × ${foto.altura}, ${Math.round(foto.bytes.length / 1024)} KB`);
  if (pendente) console.log("Capa: a foto será gerada no computador da loja; o artigo só aparece no site depois que ela chegar.");
  const avisos = pendente ? avaliacao.avisos.filter((a) => !a.startsWith("Sem imagem de capa")) : avaliacao.avisos;
  if (avisos.length > 0) console.log(`\nAvisos (não impedem a publicação):\n- ${avisos.join("\n- ")}`);
  if (!avaliacao.aprovado) sair(`Reprovado na régua editorial:\n- ${avaliacao.erros.join("\n- ")}`);

  return { artigo, foto, pendente };
}

/** Conferências que dependem do que já está publicado. */
function conferirContraOPublicado(artigo, indice, { atualizar, forcar }) {
  const erros = [];
  const daCasa = artigosDaCasa();
  const noIndice = indice.artigos.find((a) => a.slug === artigo.slug);

  if (daCasa.some((a) => a.slug === artigo.slug)) erros.push(`Já existe um artigo da casa com o endereço /blog/${artigo.slug}.`);
  if (noIndice && !atualizar) erros.push(`/blog/${artigo.slug} já está publicado. Para trocar o texto, use --atualizar.`);

  // Mesmo assunto com outro título é o erro mais fácil de cometer todo dia.
  const palavras = (t) => new Set(semAcento(t).split(/[^a-z0-9]+/).filter((p) => p.length > 3));
  const minhas = palavras(artigo.titulo);
  for (const outro of [...daCasa, ...indice.artigos]) {
    if (outro.slug === artigo.slug || !outro.titulo) continue;
    const dele = palavras(outro.titulo);
    const comuns = [...minhas].filter((p) => dele.has(p)).length;
    if (comuns >= 3 && comuns / Math.min(minhas.size, dele.size) >= 0.75 && !forcar) {
      erros.push(`O título repete o assunto de "${outro.titulo}" (/blog/${outro.slug}). Escolha outro tema, ou use --forcar se o ângulo for mesmo diferente.`);
    }
  }

  // Link para artigo do blog tem de apontar para artigo que existe.
  const existentes = new Set([...daCasa.map((a) => a.slug), ...indice.artigos.map((a) => a.slug)]);
  const texto = JSON.stringify(artigo.blocos);
  for (const [, slug] of texto.matchAll(/\]\(\/blog\/([a-z0-9-]+)[)#?]/g)) {
    if (!existentes.has(slug)) erros.push(`O texto aponta para /blog/${slug}, que não existe.`);
  }

  // Um de cada tipo por dia: é o que impede a tarefa de publicar em dobro se rodar duas vezes.
  if (!atualizar && !forcar) {
    const hoje = diaEmCampinas(artigo.publicadoEm);
    const tipo = tipoDe(artigo);
    const doDia = indice.artigos.find((a) => diaEmCampinas(a.publicadoEm) === hoje && tipoDe(a) === tipo);
    if (doDia) erros.push(`A publicação do dia ${hoje} do tipo ${TIPOS[tipo]} já existe: "${doDia.titulo}". Use --forcar para publicar mais uma.`);
  }

  if (erros.length > 0) sair(`Não publicado:\n- ${[...new Set(erros)].join("\n- ")}`);
}

// ------------------------------------------------------------------ comandos

const [comando, alvo, ...resto] = process.argv.slice(2);
const argumentos = [alvo, ...resto].filter((a) => typeof a === "string");
const opcoes = new Set(argumentos.filter((a) => a.startsWith("--")).map((a) => a.split("=")[0]));
const atualizar = opcoes.has("--atualizar");
const forcar = opcoes.has("--forcar");
const semCapa = opcoes.has("--sem-capa");
const amanha = opcoes.has("--amanha");

/** `--capa foto.jpg` ou `--capa=foto.jpg`. */
function valorDaOpcao(nome) {
  const i = argumentos.findIndex((a) => a === nome || a.startsWith(`${nome}=`));
  if (i < 0) return null;
  const valor = argumentos[i].includes("=") ? argumentos[i].slice(nome.length + 1) : argumentos[i + 1];
  if (!valor || valor.startsWith("--")) sair(`Diga o arquivo: ${nome} foto.jpg`);
  return valor;
}
const arquivoDaFoto = valorDaOpcao("--capa");
if (arquivoDaFoto && semCapa) sair("Use --capa ou --sem-capa, não os dois.");

/** O que já está no ar — para a rotina não repetir assunto. */
function mostrarPublicados(indice) {
  console.log(`Publicados pela rotina diária (${indice.artigos.length}), do mais novo para o mais antigo:`);
  const agora = Date.now();
  for (const a of indice.artigos) {
    const marcas = [
      Date.parse(a.publicadoEm) > agora ? `agendado para ${quando(a.publicadoEm)}` : "",
      a.capa ? "" : "esperando a foto, fora do site",
    ].filter(Boolean);
    console.log(`- ${diaEmCampinas(a.publicadoEm)} · ${a.categoria}${a.formato === "dica" ? " (dica)" : ""} · ${a.titulo} · /blog/${a.slug}${marcas.length ? ` (${marcas.join("; ")})` : ""}`);
  }
  const daCasa = artigosDaCasa();
  console.log(`\nArtigos da casa (${daCasa.length}) — assuntos que também já estão cobertos:`);
  for (const a of daCasa) console.log(`- ${a.titulo || a.slug} · /blog/${a.slug}`);
  const hoje = diaEmCampinas(new Date().toISOString());
  for (const [rotulo, dia, ja] of [["Hoje", hoje, "JÁ PUBLICADO"], ["Amanhã", amanhaEmCampinas(), "JÁ AGENDADO"]]) {
    if (rotulo === "Amanhã" && !amanha) continue;
    console.log(`\n${rotulo} (${dia}):`);
    for (const [tipo, nome] of Object.entries(TIPOS)) {
      const doDia = indice.artigos.find((a) => diaEmCampinas(a.publicadoEm) === dia && tipoDe(a) === tipo);
      console.log(`- ${nome}: ${doDia ? `${ja} — ${doDia.titulo}` : "ainda não tem"}`);
    }
  }
}

if (comando === "listar") {
  const pasta = abrirRamo();
  try {
    mostrarPublicados(lerIndice(pasta));
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "preparar") {
  // Tudo que a rotina precisa ler antes de escrever, de uma vez.
  const pasta = abrirRamo();
  try {
    const indice = lerIndice(pasta);
    for (const arquivo of ["ROTINA.md", "pauta.md"]) {
      const caminho = path.join(pasta, arquivo);
      console.log(`\n${"=".repeat(24)} ${arquivo} ${"=".repeat(24)}\n`);
      console.log(fs.existsSync(caminho) ? fs.readFileSync(caminho, "utf8") : `(o ramo de conteúdo não tem ${arquivo})`);
    }
    console.log(`\n${"=".repeat(24)} O que já foi publicado ${"=".repeat(24)}\n`);
    mostrarPublicados(indice);

    // Um modelo de cada tipo: o mais longo dos publicados, que usa mais tipos de bloco.
    console.log("\nModelos (copie a estrutura, não o texto):");
    for (const [tipo, nome] of Object.entries(TIPOS)) {
      const modelos = indice.artigos
        .filter((a) => tipoDe(a) === tipo)
        .map((a) => path.join(pasta, "artigos", `${a.slug}.json`))
        .filter((arquivo) => fs.existsSync(arquivo))
        .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
      if (!modelos[0]) {
        console.log(`- ${nome}: ainda não há; siga o formato descrito no ROTINA.md`);
        continue;
      }
      const destino = path.join(os.tmpdir(), `blog-modelo-${tipo}.json`);
      fs.copyFileSync(modelos[0], destino);
      console.log(`- ${nome}: ${destino}`);
    }
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "conferir") {
  const { artigo, pendente } = conferir(alvo, { dataPadrao: new Date().toISOString(), arquivoDaFoto });
  if (!artigo.capa && !pendente) {
    console.log('\nAtenção: o artigo não descreve a foto de capa. O comando publicar exige "capa": { "alt": "…", "pedido": "…" }.');
  }
  if (amanha) console.log(`Com --amanha, aparece no site em ${quando(agendadoParaAmanha(tipoDe(artigo)))}, já com a foto.`);
  console.log("\n✓ Aprovado. (Nada foi publicado: use o comando publicar.)");
} else if (comando === "publicar") {
  // Regra do Thiago (16/10/2026): nenhuma publicação sai sem imagem.
  if (semCapa) sair('Publicar sem foto de capa não é mais permitido: descreva a foto no artigo ("capa": { "alt": "…", "pedido": "…" }).');
  const { artigo, foto, pendente } = conferir(alvo, { dataPadrao: new Date().toISOString(), arquivoDaFoto });
  if (amanha) artigo.publicadoEm = agendadoParaAmanha(tipoDe(artigo));
  else if (Date.parse(artigo.publicadoEm) > Date.now() + 60_000) sair("A data de publicação está no futuro. Para agendar, use --amanha.");
  if (!artigo.capa && !pendente) {
    sair('Falta a foto de capa: descreva-a no artigo ("capa": { "alt": "…", "pedido": "…" }) para o computador da loja gerar, ou passe --capa foto.jpg.');
  }

  const pasta = abrirRamo();
  try {
    const indice = lerIndice(pasta);
    conferirContraOPublicado(artigo, indice, { atualizar, forcar });

    // O autor e a origem não vão no arquivo: quem lê o ramo é que os define.
    const paraGravar = { ...artigo };
    delete paraGravar.autor;
    delete paraGravar.origem;
    const anterior = indice.artigos.find((a) => a.slug === artigo.slug);
    if (anterior) {
      paraGravar.publicadoEm = anterior.publicadoEm;
      paraGravar.atualizadoEm = new Date().toISOString();
    }

    // A foto entra com o artigo; a anterior, se o endereço mudou, sai.
    const capaEmUso = artigo.capa ? path.join(pasta, "capas", path.basename(artigo.capa.src)) : null;
    if (foto) {
      fs.mkdirSync(path.join(pasta, "capas"), { recursive: true });
      fs.writeFileSync(path.join(pasta, foto.noRamo), foto.bytes);
    } else if (capaEmUso && !fs.existsSync(capaEmUso)) {
      sair("O artigo aponta para uma foto de capa que não está no ramo de conteúdo: passe --capa foto.jpg.");
    }
    for (const antiga of capasNoRamo(pasta, artigo.slug)) {
      if (antiga !== capaEmUso) fs.rmSync(antiga, { force: true });
    }

    fs.mkdirSync(path.join(pasta, "artigos"), { recursive: true });
    fs.writeFileSync(path.join(pasta, "artigos", `${artigo.slug}.json`), `${JSON.stringify(paraGravar, null, 2)}\n`);

    indice.artigos = indice.artigos.filter((a) => a.slug !== artigo.slug);
    indice.artigos.push({
      slug: artigo.slug,
      titulo: artigo.titulo,
      resumo: artigo.resumo,
      categoria: artigo.categoria,
      etiquetas: artigo.etiquetas,
      capa: artigo.capa,
      publicadoEm: paraGravar.publicadoEm,
      minutos: minutosDeLeitura(artigo),
      ...(artigo.formato ? { formato: artigo.formato } : {}),
    });
    gravarIndice(pasta, indice);

    // A fila de fotos: entra quem descreveu a foto, sai quem já chegou com ela.
    const fila = lerPendentes(pasta).filter((p) => p.slug !== artigo.slug);
    if (pendente && !artigo.capa) {
      fila.push({ slug: artigo.slug, titulo: artigo.titulo, categoria: artigo.categoria, alt: pendente.alt, pedido: pendente.pedido, pedidoEm: new Date().toISOString() });
    }
    if (pendente || fs.existsSync(path.join(pasta, "capas", "pendentes.json"))) gravarPendentes(pasta, fila);

    const futuro = Date.parse(paraGravar.publicadoEm) > Date.now();
    enviar(pasta, `${anterior ? "Atualiza" : futuro ? "Agenda" : "Publica"}: ${artigo.titulo}`);
    const semFoto = pendente && !artigo.capa;
    if (futuro) console.log(`\n✓ Agendado no ramo de conteúdo para ${quando(paraGravar.publicadoEm)}:\n  ${SITE}/blog/${artigo.slug}`);
    else console.log(`\n✓ Publicado no ramo de conteúdo:\n  ${SITE}/blog/${artigo.slug}`);
    if (semFoto) console.log("  O site só mostra o artigo depois que a foto chegar: ela está na fila do computador da loja (capas/pendentes.json), que faz as fotos às 22h e às 5h30.");
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "pendentes") {
  // O que o computador da loja lê: uma linha de JSON, sem mais nada.
  const pasta = abrirRamo();
  try {
    console.log(JSON.stringify(lerPendentes(pasta)));
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "capa") {
  // Prende a foto a um artigo já publicado. Só mexe na capa: o texto fica como está.
  if (!alvo || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alvo)) sair("Diga o endereço do artigo: capa <endereço> foto.jpg");
  const desistir = opcoes.has("--desistir");
  const trocar = opcoes.has("--trocar");
  // `--pedir` põe na fila a foto de um artigo que saiu sem ela: --alt "…" --pedido "…".
  const pedir = opcoes.has("--pedir");
  // `--alt` também vale com arquivo: a foto saiu de outra cena (a reserva do computador da loja).
  const altPedido = valorDaOpcao("--alt");
  const textoPedido = pedir ? valorDaOpcao("--pedido") : null;
  const valores = new Set([altPedido, textoPedido].filter(Boolean));
  const arquivo = resto.find((a) => !a.startsWith("--") && !valores.has(a));
  if (!desistir && !pedir && !arquivo) sair("Diga o arquivo da foto: capa <endereço> foto.jpg (ou --pedir, ou --desistir).");

  const pasta = abrirRamo();
  try {
    const indice = lerIndice(pasta);
    const noIndice = indice.artigos.find((a) => a.slug === alvo);
    if (!noIndice) sair(`/blog/${alvo} não está entre os artigos da rotina diária.`);
    const fila = lerPendentes(pasta);
    const pedido = fila.find((p) => p.slug === alvo);

    if (pedir) {
      if (noIndice.capa && !trocar) sair(`/blog/${alvo} já tem foto de capa. Para pedir outra, use --trocar.`);
      const novo = conferirPedidoDeCapa({ alt: altPedido, pedido: textoPedido });
      if (novo.erros.length > 0) sair(`Pedido reprovado:\n- ${novo.erros.join("\n- ")}`);
      gravarPendentes(pasta, [
        ...fila.filter((p) => p.slug !== alvo),
        { slug: alvo, titulo: noIndice.titulo, categoria: noIndice.categoria, alt: novo.alt, pedido: novo.pedido, pedidoEm: new Date().toISOString() },
      ]);
      enviar(pasta, `Capa: pede a foto de ${noIndice.titulo}`);
      console.log(`\n✓ Foto de /blog/${alvo} na fila do computador da loja.`);
    } else if (desistir) {
      if (!pedido) sair(`/blog/${alvo} não tem foto na fila.`);
      gravarPendentes(pasta, fila.filter((p) => p.slug !== alvo));
      enviar(pasta, `Capa: sem foto para ${noIndice.titulo}`);
      console.log(`\n✓ Pedido retirado da fila. /blog/${alvo} fica com a capa desenhada pelo site.`);
    } else {
      const caminhoDoArtigo = path.join(pasta, "artigos", `${alvo}.json`);
      const bruto = JSON.parse(fs.readFileSync(caminhoDoArtigo, "utf8"));
      if (bruto.capa && !trocar) sair(`/blog/${alvo} já tem foto de capa. Para trocar, use --trocar.`);
      const alt = (altPedido ?? pedido?.alt ?? bruto.capa?.alt ?? "").trim();
      if (alt.length < 12) sair(`/blog/${alvo} não tem a descrição da foto (nem na fila, nem no artigo).`);

      const foto = lerCapa(arquivo, alvo);
      bruto.capa = { src: foto.src, alt, largura: foto.largura, altura: foto.altura };
      const lido = lerArtigo(bruto);
      if (!lido.ok) sair(`Formato reprovado:\n- ${lido.erros.join("\n- ")}`);
      const avaliacao = avaliarArtigo(lido.valor);
      if (!avaliacao.aprovado) sair(`Reprovado na régua editorial:\n- ${avaliacao.erros.join("\n- ")}`);

      fs.mkdirSync(path.join(pasta, "capas"), { recursive: true });
      const novo = path.join(pasta, foto.noRamo);
      fs.writeFileSync(novo, foto.bytes);
      for (const antiga of capasNoRamo(pasta, alvo)) if (antiga !== novo) fs.rmSync(antiga, { force: true });
      fs.writeFileSync(caminhoDoArtigo, `${JSON.stringify(bruto, null, 2)}\n`);
      noIndice.capa = lido.valor.capa;
      gravarIndice(pasta, indice);
      if (pedido) gravarPendentes(pasta, fila.filter((p) => p.slug !== alvo));

      enviar(pasta, `Capa: ${noIndice.titulo}`);
      console.log(`\n✓ Foto de capa publicada (${foto.largura} × ${foto.altura}, ${Math.round(foto.bytes.length / 1024)} KB). Em até uma hora aparece em:\n  ${SITE}/blog/${alvo}`);
    }
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "retirar") {
  if (!alvo || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alvo)) sair("Diga o endereço do artigo: retirar <endereço>");
  const pasta = abrirRamo();
  try {
    const indice = lerIndice(pasta);
    const artigo = indice.artigos.find((a) => a.slug === alvo);
    if (!artigo) sair(`/blog/${alvo} não está entre os artigos da rotina diária.`);
    indice.artigos = indice.artigos.filter((a) => a.slug !== alvo);
    fs.rmSync(path.join(pasta, "artigos", `${alvo}.json`), { force: true });
    for (const capa of capasNoRamo(pasta, alvo)) fs.rmSync(capa, { force: true });
    gravarIndice(pasta, indice);
    const fila = lerPendentes(pasta);
    if (fila.some((p) => p.slug === alvo)) gravarPendentes(pasta, fila.filter((p) => p.slug !== alvo));
    enviar(pasta, `Retira: ${artigo.titulo}`);
    console.log(`\n✓ Retirado. Em até uma hora ${SITE}/blog/${alvo} sai do ar.`);
  } finally {
    fecharRamo(pasta);
  }
} else {
  console.log(`Uso:
  node scripts/blog-publicar.mjs preparar [--amanha]       as regras, a pauta e o que já foi publicado (e o que já há para amanhã)
  node scripts/blog-publicar.mjs listar                    só o que já foi publicado
  node scripts/blog-publicar.mjs conferir artigo.json      confere formato e régua, sem publicar   [--capa foto.jpg]
  node scripts/blog-publicar.mjs publicar artigo.json      confere e publica; a foto descrita no artigo entra na fila
                                                           [--amanha] [--capa foto.jpg] [--atualizar] [--forcar]
                                                           --amanha: agenda para 6h, 12h ou 18h de amanhã (conforme o tipo)
  node scripts/blog-publicar.mjs pendentes                 as fotos de capa que faltam gerar (JSON)
  node scripts/blog-publicar.mjs capa <endereço> foto.jpg  prende a foto a um artigo já publicado   [--trocar] [--alt "…"]
  node scripts/blog-publicar.mjs capa <endereço> --pedir --alt "…" --pedido "…"   põe na fila a foto de um artigo sem foto
  node scripts/blog-publicar.mjs capa <endereço> --desistir               tira o pedido da fila
  node scripts/blog-publicar.mjs retirar <endereço>        tira um artigo do ar`);
  process.exit(comando ? 2 : 0);
}
