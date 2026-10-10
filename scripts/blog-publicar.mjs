#!/usr/bin/env node
/**
 * Publica um artigo no ramo de conteúdo do blog — o caminho da rotina diária.
 *
 *   node scripts/blog-publicar.mjs preparar
 *   node scripts/blog-publicar.mjs listar
 *   node scripts/blog-publicar.mjs conferir artigo.json
 *   node scripts/blog-publicar.mjs publicar artigo.json --capa foto.jpg
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
 * Todo artigo novo leva uma foto de capa (`--capa`): fotografia ou imagem
 * simulada do assunto, sem texto e sem marca. O artigo diz só o texto
 * alternativo (`"capa": { "alt": "…" }`); o endereço quem preenche é o comando.
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

  // A foto vem em arquivo; o artigo só descreve o que ela mostra.
  let foto = null;
  if (arquivoDaFoto) {
    if (!bruto || typeof bruto !== "object" || typeof bruto.slug !== "string") sair("O artigo precisa do campo slug.");
    const alt = typeof bruto.capa?.alt === "string" ? bruto.capa.alt.trim() : "";
    if (alt.length < 12) sair('Com --capa, o artigo precisa dizer o que a foto mostra: "capa": { "alt": "…" }.');
    foto = lerCapa(arquivoDaFoto, bruto.slug);
    bruto.capa = { src: foto.src, alt, largura: foto.largura, altura: foto.altura };
  } else if (bruto?.capa && typeof bruto.capa === "object" && !bruto.capa.src) {
    sair("O artigo descreve uma capa, mas a foto não veio: passe --capa foto.jpg.");
  }

  const lido = lerArtigo(bruto);
  if (!lido.ok) sair(`Formato reprovado:\n- ${lido.erros.join("\n- ")}`);

  const artigo = lido.valor;
  const avaliacao = avaliarArtigo(artigo);
  const m = avaliacao.medidas;
  console.log(`\n${artigo.titulo}`);
  console.log(`/blog/${artigo.slug} · ${artigo.categoria} · ${m.palavras} palavras · ${m.secoes} seções · ${minutosDeLeitura(artigo)} min de leitura`);
  console.log(`${m.tabelas} tabela(s) · ${m.perguntas} pergunta(s) · ${m.linksInternos} link(s) para a loja · ${m.chamadas} chamada(s) · ${artigo.fontes?.length ?? 0} fonte(s)`);
  if (foto) console.log(`Capa: ${foto.largura} × ${foto.altura}, ${Math.round(foto.bytes.length / 1024)} KB`);
  if (avaliacao.avisos.length > 0) console.log(`\nAvisos (não impedem a publicação):\n- ${avaliacao.avisos.join("\n- ")}`);
  if (!avaliacao.aprovado) sair(`Reprovado na régua editorial:\n- ${avaliacao.erros.join("\n- ")}`);

  return { artigo, foto };
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

  if (!atualizar && !forcar) {
    const hoje = diaEmCampinas(artigo.publicadoEm);
    const doDia = indice.artigos.find((a) => diaEmCampinas(a.publicadoEm) === hoje);
    if (doDia) erros.push(`O artigo de ${hoje} já foi publicado: "${doDia.titulo}". Use --forcar para publicar mais um no mesmo dia.`);
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
  for (const a of indice.artigos) console.log(`- ${diaEmCampinas(a.publicadoEm)} · ${a.categoria} · ${a.titulo} · /blog/${a.slug}`);
  const daCasa = artigosDaCasa();
  console.log(`\nArtigos da casa (${daCasa.length}) — assuntos que também já estão cobertos:`);
  for (const a of daCasa) console.log(`- ${a.titulo || a.slug} · /blog/${a.slug}`);
  const hoje = diaEmCampinas(new Date().toISOString());
  const doDia = indice.artigos.find((a) => diaEmCampinas(a.publicadoEm) === hoje);
  console.log(doDia ? `\nO artigo de hoje (${hoje}) JÁ foi publicado: ${doDia.titulo}` : `\nAinda não há artigo de hoje (${hoje}).`);
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

    // O artigo-modelo: o mais longo dos publicados, que usa mais tipos de bloco.
    const modelos = indice.artigos
      .map((a) => path.join(pasta, "artigos", `${a.slug}.json`))
      .filter((arquivo) => fs.existsSync(arquivo))
      .sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
    if (modelos[0]) {
      const destino = path.join(os.tmpdir(), "blog-artigo-modelo.json");
      fs.copyFileSync(modelos[0], destino);
      console.log(`\nArtigo-modelo (copie a estrutura, não o texto): ${destino}`);
    }
  } finally {
    fecharRamo(pasta);
  }
} else if (comando === "conferir") {
  const { artigo } = conferir(alvo, { dataPadrao: new Date().toISOString(), arquivoDaFoto });
  if (!artigo.capa) console.log("\nAtenção: sem foto de capa. O comando publicar exige --capa foto.jpg.");
  console.log("\n✓ Aprovado. (Nada foi publicado: use o comando publicar.)");
} else if (comando === "publicar") {
  const { artigo, foto } = conferir(alvo, { dataPadrao: new Date().toISOString(), arquivoDaFoto });
  if (Date.parse(artigo.publicadoEm) > Date.now() + 60_000) sair("A data de publicação está no futuro.");
  // Capa desenhada só por exceção declarada: quando não foi possível gerar a foto.
  if (!artigo.capa && !semCapa) {
    sair("Falta a foto de capa: gere a imagem e passe --capa foto.jpg. (Se não foi possível gerar, publique com --sem-capa e relate.)");
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
    });
    gravarIndice(pasta, indice);

    enviar(pasta, `${anterior ? "Atualiza" : "Publica"}: ${artigo.titulo}`);
    console.log(`\n✓ Publicado no ramo de conteúdo. Em até uma hora aparece em:\n  ${SITE}/blog/${artigo.slug}`);
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
    enviar(pasta, `Retira: ${artigo.titulo}`);
    console.log(`\n✓ Retirado. Em até uma hora ${SITE}/blog/${alvo} sai do ar.`);
  } finally {
    fecharRamo(pasta);
  }
} else {
  console.log(`Uso:
  node scripts/blog-publicar.mjs preparar                  as regras, a pauta e o que já foi publicado
  node scripts/blog-publicar.mjs listar                    só o que já foi publicado
  node scripts/blog-publicar.mjs conferir artigo.json      confere formato e régua, sem publicar   [--capa foto.jpg]
  node scripts/blog-publicar.mjs publicar artigo.json --capa foto.jpg
                                                           confere e publica   [--atualizar] [--forcar] [--sem-capa]
  node scripts/blog-publicar.mjs retirar <endereço>        tira um artigo do ar`);
  process.exit(comando ? 2 : 0);
}
