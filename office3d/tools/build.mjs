// Builds the dev page (ES modules, served over http) and the production folder (works from file://).
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { execSync } from 'child_process';
const mode = process.argv[2] || 'dev';
// The models pack: build/assets.bin.gz when it was rebuilt here, otherwise the one already published with the site (same bytes).
const sitePack = () => { const d = '../public/3d'; if (!fs.existsSync(d)) return null; const f = fs.readdirSync(d).find(n => /^assets\.[0-9a-f]+\.pack$/.test(n)); return f ? path.join(d, f) : null; };
const packFile = () => { if (fs.existsSync('build/assets.bin.gz')) return 'build/assets.bin.gz'; const f = sitePack(); if (!f) throw new Error('modelos não encontrados: falta build/assets.bin.gz ou public/3d/assets.<hash>.pack'); return f; };
const tpl = fs.readFileSync('app/template.html', 'utf8');
fs.writeFileSync('app/ui.built.css', fs.readFileSync('app/font.css', 'utf8') + '\n' + fs.readFileSync('app/ui.css', 'utf8'));
const logo = mode === 'dev' ? '/assets/balao-logo.png' : 'office3d/logo.png';
if (mode === 'dev') {
  const html = tpl.replaceAll('{{LOGO}}', logo).replace('{{CSS}}', '/app/ui.built.css').replace('<!--HEAD-->', '').replace('<!--CONFIG-->', '').replace('<!--SCRIPTS-->', `<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>\n<script type="module" src="/src/main.js"></script>`);
  fs.writeFileSync('app/dev.html', html); console.log('dev ok');
} else if (mode === 'web') {
  // Site build: everything under /3d/, models fetched as one compressed file (with a progress bar), file names carry a content hash so they can be cached forever.
  const crypto = await import('crypto'); const out = 'dist-web/3d'; fs.rmSync('dist-web', { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const base = process.env.WEB_BASE || '/3d'; const site = process.env.WEB_SITE || 'https://www.balao.info';
  const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
  fs.mkdirSync('build', { recursive: true });
  execSync(`npx esbuild src/main.js --bundle --minify --format=iife --target=es2020 --outfile=build/engine.web.js --log-level=warning`, { stdio: 'inherit' });
  const put = (name, ext, buf) => { const f = `${name}.${hash(buf)}.${ext}`; fs.writeFileSync(path.join(out, f), buf); return f; };
  const eng = put('engine', 'js', fs.readFileSync('build/engine.web.js')); const gz = fs.readFileSync(packFile()); const pack = put('assets', 'pack', gz); const css = put('ui', 'css', fs.readFileSync('app/ui.built.css'));
  fs.copyFileSync('assets/balao-logo.png', path.join(out, 'logo.png')); if (fs.existsSync('assets/capa.jpg')) fs.copyFileSync('assets/capa.jpg', path.join(out, 'capa.jpg'));
  const head = `<link rel="canonical" href="${site}${base}">
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#f3f1ec">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:url" content="${site}${base}">
<meta property="og:title" content="Office 3D — Balão da Informática"><meta property="og:description" content="Escritório virtual 3D da Balão da Informática: conheça a equipe e os agentes de IA trabalhando, em uma simulação interativa.">
<meta property="og:image" content="${site}${base}/capa.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${base}/${eng}" as="script">`;
  let html = tpl.replaceAll('{{LOGO}}', `${base}/logo.png`).replace('{{CSS}}', `${base}/${css}`).replace('<!--HEAD-->', head).replace('<!--CONFIG-->', '<noscript><p style="position:fixed;inset:0;display:grid;place-items:center;font:16px system-ui">O Office 3D precisa de JavaScript ligado no navegador.</p></noscript>')
    .replace('<!--SCRIPTS-->', `<script>window.OFFICE_WEB=true;window.OFFICE_ASSETS_URL=${JSON.stringify(`${base}/${pack}`)};window.OFFICE_ASSETS_SIZE=${gz.length};</script>\n<script src="${base}/${eng}"></script>`);
  html = html.replace(/<img alt="Balão da Informática" src="([^"]+)">/, '<a href="/" title="Ir para a loja Balão da Informática"><img alt="Balão da Informática" src="$1"></a>');
  fs.writeFileSync(path.join(out, 'index.html'), html);
  for (const f of fs.readdirSync(out)) console.log(f, (fs.statSync(path.join(out, f)).size / 1e6).toFixed(2), 'MB');
  // inside the site repository: put the fresh build where the site serves it (public/3d), dropping the files it replaces
  if (process.argv[3] === 'publicar') { const dest = '../public/3d'; fs.mkdirSync(dest, { recursive: true }); for (const f of fs.readdirSync(dest)) fs.rmSync(path.join(dest, f)); for (const f of fs.readdirSync(out)) fs.copyFileSync(path.join(out, f), path.join(dest, f)); console.log('copiado para', dest); }
} else {
  const out = 'dist'; const sub = 'office3d'; fs.mkdirSync(path.join(out, sub), { recursive: true });
  execSync(`npx esbuild src/main.js --bundle --minify --format=iife --target=es2020 --outfile=${out}/${sub}/engine.js --log-level=warning`, { stdio: 'inherit' });
  fs.copyFileSync('assets/balao-logo.png', path.join(out, sub, 'logo.png'));
  const gz = fs.readFileSync(packFile());
  fs.writeFileSync(path.join(out, sub, 'assets.js'), 'window.OFFICE_ASSETS_B64="' + gz.toString('base64') + '";\n');
  const cfg = fs.readFileSync('app/config.snippet.html', 'utf8');
  fs.copyFileSync('app/ui.built.css', path.join(out, sub, 'ui.css')); fs.copyFileSync('app/LEIA-ME.txt', path.join(out, sub, 'LEIA-ME.txt'));
  const html = tpl.replaceAll('{{LOGO}}', logo).replace('{{CSS}}', sub + '/ui.css').replace('<!--HEAD-->', '').replace('<!--CONFIG-->', cfg).replace('<!--SCRIPTS-->', `<script src="${sub}/assets.js"></script>\n<script src="${sub}/engine.js"></script>`);
  fs.writeFileSync(path.join(out, 'HERMES_OFFICE_3D.html'), html);
  for (const f of fs.readdirSync(path.join(out, sub))) console.log(f, (fs.statSync(path.join(out, sub, f)).size / 1e6).toFixed(2), 'MB');
  console.log('html', (html.length / 1e3).toFixed(1), 'KB');
}
