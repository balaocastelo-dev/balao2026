/**
 * Gera os 30 arquivos da série a partir do texto novo, mantendo slug,
 * data de publicação, categoria e as fotos que já estão no ar.
 *
 * Uso: node scripts/gta6-reescrever/emitir.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { noticias } from "./noticias.mjs";
import { maisNoticias } from "./mais-noticias.mjs";
import { pecas } from "./pecas.mjs";
import { maisPecas } from "./mais-pecas.mjs";
import { maquinas } from "./maquinas.mjs";
import { maisMaquinas } from "./mais-maquinas.mjs";
import { lives } from "./lives.mjs";
import { maisLives } from "./mais-lives.mjs";
import { aplicarFolga } from "./folgas.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "../..");
const fotos = JSON.parse(fs.readFileSync(path.join(aqui, "fotos.json"), "utf8"));
const porSlug = new Map(fotos.map((f) => [f.slug, f]));
const destino = path.join(raiz, "content/blog/artigos");

const AUTOR = {
  nome: "Balão da Informática Anchieta",
  cargo: "Loja de informática em Campinas",
  url: "/sobre-nos",
};

const ATUALIZADO = "2026-11-19T12:00:00.000Z";

function emitirArtigo(spec) {
  const base = porSlug.get(spec.slug);
  if (!base) throw new Error(`Slug sem foto gravada: ${spec.slug}`);
  const imagens = spec.blocos.filter((b) => b.tipo === "imagem");
  if (imagens.length !== 3) throw new Error(`${spec.slug}: ${imagens.length} imagens no corpo (precisam ser 3)`);
  if (base.imgs.length !== 4) throw new Error(`${spec.slug}: arquivo de fotos com ${base.imgs.length} imagens`);

  let nImg = 0;
  const blocos = spec.blocos.map((b) => {
    if (b.tipo === "paragrafo" && /^A série (completa |do jogo )?está em \[GTA 6 no blog\]/.test(b.texto)) {
      const tema = spec.titulo.split(":")[0];
      b = { ...b, texto: `${tema} segue, com o restante da série, em [GTA 6 no blog](/blog/gta-6).` };
    }
    if (b.tipo !== "imagem") return b;
    const foto = base.imgs[nImg + 1];
    nImg += 1;
    return {
      tipo: "imagem",
      imagem: {
        src: foto.src,
        alt: b.alt,
        largura: foto.largura,
        altura: foto.altura,
        pronta: false,
      },
      legenda: b.legenda,
    };
  });

  const capa = base.imgs[0];
  const artigo = {
    slug: spec.slug,
    titulo: spec.titulo,
    resumo: spec.resumo,
    categoria: base.cat,
    etiquetas: spec.etiquetas,
    capa: {
      src: capa.src,
      alt: spec.capaAlt,
      largura: capa.largura,
      altura: capa.altura,
      pronta: false,
    },
    publicadoEm: base.pub,
    atualizadoEm: ATUALIZADO,
    autor: AUTOR,
    origem: "autoral",
    ...(base.destaque ? { destaque: base.destaque } : {}),
    seo: {
      titulo: spec.seoTitulo,
      descricao: spec.resumo,
      palavrasChave: spec.palavrasChave,
    },
    blocos,
    perguntas: spec.perguntas,
    fontes: spec.fontes,
  };

  const corpo = `import type { Artigo } from "@/lib/blog/tipos";\n\nconst artigo: Artigo = ${JSON.stringify(artigo, null, 2)};\n\nexport default artigo;\n`;
  fs.writeFileSync(path.join(destino, `${spec.slug}.ts`), corpo);
}

const todos = [...noticias, ...maisNoticias, ...pecas, ...maisPecas, ...maquinas, ...maisMaquinas, ...lives, ...maisLives];
const slugs = new Set(todos.map((a) => a.slug));
if (slugs.size !== 30) throw new Error(`Esperava 30 slugs únicos, veio ${slugs.size}`);
for (const foto of fotos) {
  if (!slugs.has(foto.slug)) throw new Error(`Faltou reescrever ${foto.slug}`);
}
function palavras(spec) {
  const textos = [];
  const visita = (v) => {
    if (typeof v === "string") textos.push(v);
    else if (Array.isArray(v)) v.forEach(visita);
    else if (v && typeof v === "object") Object.values(v).forEach(visita);
  };
  visita(spec.blocos);
  visita(spec.perguntas);
  return textos.join(" ").split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

for (const spec of todos.map(aplicarFolga)) {
  emitirArtigo(spec);
  const n = palavras(spec);
  const marca = n < 900 || n > 1500 ? " <<" : "";
  console.log(`${n}\t${spec.slug}${marca}`);
}
console.log(`Emitidos ${todos.length} artigos.`);
