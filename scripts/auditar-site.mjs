// Auditoria de cada pagina publica: o que o Google e o cliente veem.
import fs from 'node:fs';

const BASE = 'https://www.balao.info';
const rotas = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(s => s.trim()).filter(Boolean);

const pega = (html, re) => (html.match(re)?.[1] || '').trim();
const conta = (html, re) => (html.match(re) || []).length;

const linhas = [];
for (const rota of rotas) {
  try {
    const t0 = Date.now();
    const r = await fetch(BASE + rota, { redirect: 'manual' });
    const ms = Date.now() - t0;
    const html = r.status < 400 ? await r.text() : '';

    const texto = html.replace(/<script[\s\S]*?<\/script>/g, '')
                      .replace(/<style[\s\S]*?<\/style>/g, '')
                      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    linhas.push({
      rota,
      status: r.status,
      ms,
      kb: Math.round(html.length / 1024),
      titulo: pega(html, /<title>([^<]*)<\/title>/),
      descricao: pega(html, /<meta name="description" content="([^"]*)"/),
      canonical: pega(html, /<link rel="canonical" href="([^"]*)"/),
      h1: conta(html, /<h1[\s>]/g),
      og: /property="og:image"/.test(html),
      schema: conta(html, /application\/ld\+json/g),
      noindex: /noindex/.test(html),
      palavras: texto.split(' ').length,
    });
  } catch (e) {
    linhas.push({ rota, status: 'ERRO', erro: e.message });
  }
}

fs.writeFileSync(process.argv[3], JSON.stringify(linhas, null, 2));
console.log('paginas auditadas:', linhas.length);
