/**
 * Grava a série GTA 6 no formato do blog: um arquivo .ts por matéria,
 * capas e figuras em WebP, e a lista de origem das imagens.
 *
 *   node scripts/serie-gta6/emitir.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gravarWebp } from "./imagens.mjs";
import { MATERIAS } from "./materias/index.mjs";
import { FONTES, nomeConst } from "./fontes.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pastaArtigos = join(raiz, "content/blog/artigos");
const pastaCapas = join(raiz, "public/blog/capas");
const pastaFiguras = join(raiz, "public/blog/figuras");

const MINIMO = { guias: 1200, hardware: 1200, noticias: 350, analises: 1200, assistencia: 1000 };
const COMERCIAL = [
  [/R\$\s?\d/, "preço em reais"],
  [/sem juros|\b\d{1,2}\s?x\s+no\s+cart|parcel\w*\s+em\s+(?:até\s+)?\d/i, "parcelamento"],
  [/\d\s?%\s+(?:de\s+desconto|off|no\s+pix|à\s+vista)|desconto\s+de\s+\d/i, "desconto"],
  [/frete\s+gr[aá]tis/i, "frete grátis"],
];

function puro(texto) {
  return String(texto || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_]/g, "");
}

function palavras(texto) {
  return puro(texto)
    .split(/\s+/)
    .filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

function nomeVar(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function serial(valor, nivel) {
  const pad = "  ".repeat(nivel);
  const interno = "  ".repeat(nivel + 1);
  if (valor && typeof valor === "object" && valor.__fonte) return valor.__fonte;
  if (typeof valor === "string") return JSON.stringify(valor);
  if (typeof valor === "number" || typeof valor === "boolean") return String(valor);
  if (Array.isArray(valor)) {
    if (valor.length === 0) return "[]";
    return `[\n${valor.map((item) => `${interno}${serial(item, nivel + 1)}`).join(",\n")},\n${pad}]`;
  }
  const chaves = Object.keys(valor);
  return `{\n${chaves.map((chave) => `${interno}${chave}: ${serial(valor[chave], nivel + 1)}`).join(",\n")},\n${pad}}`;
}

function validar(materia) {
  const erros = [];
  if (materia.titulo.length < 30 || materia.titulo.length > 80) erros.push(`título ${materia.titulo.length}`);
  const seo = materia.seoTitulo || materia.titulo;
  if (seo.length > 60) erros.push(`seo.titulo ${seo.length}`);
  if (materia.resumo.length < 110 || materia.resumo.length > 165) erros.push(`resumo ${materia.resumo.length}`);
  const capas = (materia.imagens || []).filter((img) => img.papel === "capa");
  const corpos = (materia.imagens || []).filter((img) => img.papel === "corpo");
  const figuras = (materia.blocos || []).filter((bloco) => bloco.tipo === "imagem");
  if (capas.length !== 1 || corpos.length !== 3 || figuras.length !== 3) {
    erros.push(`${capas.length} capa(s), ${corpos.length} no corpo, ${figuras.length} figura(s) no texto; o combinado é 1 capa e 3 no corpo`);
  }
  const alts = new Set();
  for (const img of materia.imagens || []) {
    if (!img.alt || img.alt.trim().length < 12) erros.push(`alt curto em ${img.id}`);
    if (alts.has(img.alt)) erros.push(`alt repetido em ${img.id}`);
    alts.add(img.alt);
  }
  let total = 0;
  for (const bloco of materia.blocos) {
    if (bloco.tipo === "paragrafo") {
      const n = palavras(bloco.texto);
      total += n;
      if (n > 110) erros.push(`parágrafo com ${n} palavras`);
    } else if (bloco.tipo === "titulo") total += palavras(bloco.texto);
    else if (bloco.tipo === "resumo" || bloco.tipo === "lista") total += bloco.itens.reduce((s, i) => s + palavras(i), 0);
    else if (bloco.tipo === "tabela") {
      total += palavras(bloco.titulo || "");
      total += bloco.linhas.flat().reduce((s, c) => s + palavras(c), 0);
    } else if (bloco.tipo === "pros-contras") total += [...bloco.pros, ...bloco.contras].reduce((s, i) => s + palavras(i), 0);
    else if (bloco.tipo === "citacao") total += palavras(bloco.texto);
    else if (bloco.tipo === "destaque") total += palavras(bloco.titulo || "") + palavras(bloco.texto);
    else if (bloco.tipo === "chamada") total += palavras(bloco.titulo || "") + palavras(bloco.texto || "");
  }
  for (const pergunta of materia.perguntas || []) total += palavras(pergunta.pergunta) + palavras(pergunta.resposta);
  const minimo = MINIMO[materia.categoria] ?? 1200;
  if (total < minimo) erros.push(`${total} palavras; mínimo ${minimo}`);
  const textoTodo = JSON.stringify(materia);
  const linksInternos = textoTodo.match(/\(\/(?!\/)[^)]+\)/g) || [];
  if (linksInternos.length < 2) erros.push("menos de 2 links internos");
  if (/castelo/i.test(textoTodo)) erros.push("cita Castelo");
  for (const [padrao, nome] of COMERCIAL) {
    const achado = padrao.exec(textoTodo);
    if (achado) erros.push(`${nome}: ${achado[0]}`);
  }
  const ids = new Set((materia.imagens || []).map((img) => img.id));
  for (const bloco of materia.blocos) {
    if (bloco.tipo === "imagem" && !ids.has(bloco.id)) erros.push(`figura ${bloco.id} sem desenho`);
  }
  return { erros, palavras: total };
}

function arquivoDaImagem(materia, img) {
  if (img.papel === "capa") return { publico: `/blog/capas/${materia.slug}.webp`, disco: join(pastaCapas, `${materia.slug}.webp`) };
  return {
    publico: `/blog/figuras/${materia.slug}-${img.id}.webp`,
    disco: join(pastaFiguras, `${materia.slug}-${img.id}.webp`),
  };
}

function emitirArtigo(materia) {
  const usadas = new Set((materia.fontes || []).map((chave) => nomeConst(chave)));
  const andar = (valor) => {
    if (!valor || typeof valor !== "object") return;
    if (valor.__fonte) usadas.add(valor.__fonte);
    if (Array.isArray(valor)) valor.forEach(andar);
    else Object.values(valor).forEach(andar);
  };
  andar(materia.blocos);

  const mapa = new Map();
  for (const [chave, fonte] of Object.entries(FONTES)) mapa.set(nomeConst(chave), { chave, fonte });

  const constsTexto = [...usadas]
    .map((nome) => {
      const fonte = mapa.get(nome)?.fonte;
      if (!fonte) throw new Error(`Fonte ${nome} não existe`);
      return `const ${nome}: Fonte = ${serial(fonte, 0)};`;
    })
    .join("\n\n");

  const blocos = materia.blocos.map((bloco) => {
    if (bloco.tipo !== "imagem") return bloco;
    const img = materia.imagens.find((item) => item.id === bloco.id);
    const { publico } = arquivoDaImagem(materia, img);
    return {
      tipo: "imagem",
      imagem: {
        src: publico,
        alt: img.alt,
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: img.legenda,
    };
  });

  const capaSpec = materia.imagens.find((img) => img.papel === "capa");
  const capa = {
    src: `/blog/capas/${materia.slug}.webp`,
    alt: capaSpec.alt,
    largura: 1536,
    altura: 1024,
    pronta: true,
  };

  const artigo = {
    slug: materia.slug,
    titulo: materia.titulo,
    resumo: materia.resumo,
    categoria: materia.categoria,
    etiquetas: materia.etiquetas,
    capa,
    publicadoEm: materia.publicadoEm,
    autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
    origem: "autoral",
    seo: {
      titulo: materia.seoTitulo,
      palavrasChave: materia.palavrasChave,
    },
    blocos,
    ...(materia.perguntas ? { perguntas: materia.perguntas } : {}),
    fontes: [...usadas].map((nome) => ({ __fonte: nome })),
  };

  const corpo = `import type { Artigo, Fonte } from "@/lib/blog/tipos";

${constsTexto}

const artigo: Artigo = ${serial(artigo, 0)};

export default artigo;
`;
  writeFileSync(join(pastaArtigos, `${materia.slug}.ts`), corpo);
}

function atualizarIndice(materias) {
  const indice = join(pastaArtigos, "index.ts");
  let texto = readFileSync(indice, "utf8");
  texto = texto.replace(/[ \t]*\/\/ série gta 6 — início[\s\S]*?\/\/ série gta 6 — fim\n/g, "");
  const imports = materias.map((m) => `import ${nomeVar(m.slug)} from "./${m.slug}";`).join("\n");
  const itens = materias.map((m) => `  ${nomeVar(m.slug)},`).join("\n");
  const blocoImport = `\n// série gta 6 — início\n${imports}\n// série gta 6 — fim\n`;
  const blocoLista = `  // série gta 6 — início\n${itens}\n  // série gta 6 — fim\n`;
  if (!texto.includes('from "./steam-setembro-2026-vram-16gb";')) {
    throw new Error("index.ts mudou: não achei o import do artigo da Steam.");
  }
  texto = texto.replace('from "./steam-setembro-2026-vram-16gb";\n', `from "./steam-setembro-2026-vram-16gb";${blocoImport}`);
  texto = texto.replace("  steamSetembro2026Vram16gb,\n", `  steamSetembro2026Vram16gb,\n${blocoLista}`);
  writeFileSync(indice, texto);
}

function manifesto(materias) {
  const linhas = [
    "# Origem das imagens da série GTA 6",
    "",
    "Todas as imagens abaixo foram desenhadas para esta série, em SVG, e gravadas em WebP.",
    "Não há arte, print, logotipo ou captura oficial da Rockstar, nem foto de banco de imagens.",
    "O gerador é `scripts/serie-gta6/emitir.mjs`.",
    "",
    "| Arquivo | Matéria | O que mostra | Origem |",
    "|---|---|---|---|",
  ];
  for (const materia of materias) {
    for (const img of materia.imagens) {
      const { publico } = arquivoDaImagem(materia, img);
      linhas.push(`| \`${publico}\` | ${materia.slug} | ${img.alt.replace(/\|/g, "/")} | Ilustração original, gerada para esta matéria |`);
    }
  }
  linhas.push("");
  writeFileSync(join(raiz, "docs/blog/serie-gta6-imagens.md"), linhas.join("\n"));
}

mkdirSync(pastaCapas, { recursive: true });
mkdirSync(pastaFiguras, { recursive: true });

const slugs = new Set();
const arquivos = new Set();
let falhou = false;
for (const materia of MATERIAS) {
  if (slugs.has(materia.slug)) {
    console.error(`slug repetido: ${materia.slug}`);
    falhou = true;
  }
  slugs.add(materia.slug);
  const { erros, palavras: n } = validar(materia);
  if (erros.length) {
    console.error(`\n${materia.slug} (${n} palavras)`);
    for (const erro of erros) console.error(`  - ${erro}`);
    falhou = true;
  } else {
    console.log(`${materia.slug}: ${n} palavras, ${materia.imagens.length} imagens`);
  }
  for (const img of materia.imagens || []) {
    const { publico } = arquivoDaImagem(materia, img);
    if (arquivos.has(publico)) {
      console.error(`arquivo repetido: ${publico}`);
      falhou = true;
    }
    arquivos.add(publico);
  }
}

if (falhou) process.exit(1);
if (MATERIAS.length !== 30 && process.env.SERIE_PARCIAL !== "1") {
  console.error(`A série tem ${MATERIAS.length} matérias; o combinado é 30.`);
  process.exit(1);
}

for (const materia of MATERIAS) {
  for (const img of materia.imagens) {
    const { disco } = arquivoDaImagem(materia, img);
    await gravarWebp(img, materia.slug, disco);
  }
  emitirArtigo(materia);
}
atualizarIndice(MATERIAS);
manifesto(MATERIAS);
console.log(`\n${MATERIAS.length} matérias gravadas.`);
