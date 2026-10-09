#!/usr/bin/env node
/**
 * Atualiza a cópia guardada dos artigos do Soro.
 *
 *   npm run blog:soro
 *
 * O site já busca artigos novos do Soro sozinho, de hora em hora. Esta cópia é
 * a reserva: é ela que mantém o blog no ar se o Soro ficar fora, e é dela que
 * saem as capas servidas pelo próprio site. Vale rodar de tempos em tempos
 * (uma vez por mês basta) e enviar o resultado.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(raiz, "content", "blog", "soro", "snapshot.json");
const pastaDasCapas = join(raiz, "public", "blog", "capas");
const BASE = "https://app.trysoro.com";
const TOKEN = process.env.BLOG_SORO_TOKEN || "71c5ae65-e641-4dca-928b-d80ac924512b";

function listaDoScript(js) {
  const marca = js.indexOf("SORO_ARTICLES");
  const inicio = js.indexOf("[", marca);
  if (marca === -1 || inicio === -1) return [];
  let nivel = 0;
  let emTexto = false;
  let escape = false;
  for (let i = inicio; i < js.length; i += 1) {
    const c = js[i];
    if (emTexto) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') emTexto = false;
    } else if (c === '"') emTexto = true;
    else if (c === "[") nivel += 1;
    else if (c === "]" && --nivel === 0) return JSON.parse(js.slice(inicio, i + 1));
  }
  return [];
}

const anterior = existsSync(destino) ? JSON.parse(readFileSync(destino, "utf8")).artigos : [];
const porId = new Map(anterior.map((a) => [a.id, a]));

const resposta = await fetch(`${BASE}/api/embed/${TOKEN}`);
if (!resposta.ok) {
  console.error(`O Soro respondeu ${resposta.status}. A cópia anterior foi mantida.`);
  process.exit(1);
}
const lista = listaDoScript(await resposta.text());
if (lista.length === 0) {
  console.error("Não encontrei artigos na resposta do Soro. A cópia anterior foi mantida.");
  process.exit(1);
}

mkdirSync(pastaDasCapas, { recursive: true });
const artigos = [];
let novos = 0;

for (const item of lista) {
  const guardado = porId.get(item.id);
  let html = guardado?.html;
  if (!html) {
    const r = await fetch(`${BASE}/api/embed/${TOKEN}/article/${item.id}`);
    html = r.ok ? (await r.json()).content : null;
    if (!html) {
      console.warn(`Sem texto para "${item.title}"; ficou de fora.`);
      continue;
    }
    novos += 1;
  }

  let capaLocal = guardado?.capaLocal ?? null;
  const arquivoDaCapa = join(pastaDasCapas, `${item.slug}.webp`);
  if (item.image && !existsSync(arquivoDaCapa)) {
    const img = await fetch(item.image);
    if (img.ok) writeFileSync(arquivoDaCapa, Buffer.from(await img.arrayBuffer()));
  }
  if (existsSync(arquivoDaCapa)) capaLocal = `/blog/capas/${item.slug}.webp`;

  artigos.push({
    id: item.id,
    slug: item.slug,
    titulo: item.title,
    resumo: item.excerpt ?? "",
    publicadoEm: item.isoDate,
    capaRemota: item.image ?? null,
    capaLocal,
    html,
  });
}

// Artigo que saiu da lista do Soro continua no site: o endereço já está no Google.
for (const antigo of anterior) if (!artigos.some((a) => a.id === antigo.id)) artigos.push(antigo);

writeFileSync(destino, `${JSON.stringify({ geradoEm: new Date().toISOString(), artigos }, null, 2)}\n`);
console.log(`Cópia atualizada: ${artigos.length} artigos (${novos} novos).`);
