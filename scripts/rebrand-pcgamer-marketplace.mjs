// Substitui as marcas de marketplace informadas (bluepc, tob, 2eletro, 3green, skill,
// level up, amorim shop, studiopc, kalango) por "Balão.info" nos campos de texto do
// dump de PC Gamer (marketplace, sem filtro kabum_product). Preserva url/image/images
// e qualquer URL embutida dentro de description_html.

import fs from 'fs';
import path from 'path';

const IN_FILE = path.resolve(process.cwd(), 'scripts', 'output', 'kabum-pcgamer-marketplace.json');
const BACKUP_FILE = path.resolve(
  process.cwd(),
  'scripts',
  'output',
  'kabum-pcgamer-marketplace.before-rebrand.json'
);

const URL_RE = /(https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+)/gi;

// Ordem importa: frases mais específicas antes de tokens soltos que poderiam colidir.
const BRAND_PATTERNS = [
  /\bblue\s*pc\b/gi,
  /\bamorim\s*shop\b/gi,
  /\bstudio\s*pc\b/gi,
  /\blevel\s*up\b/gi,
  /\b2\s*eletro\b/gi,
  /\b3\s*green\b/gi,
  /\btob\b/gi,
  /\bskill\b/gi,
  /\bkalango\b/gi
];

function rebrandText(str) {
  if (typeof str !== 'string' || !str) return str;
  const urls = [];
  const masked = str.replace(URL_RE, (m) => {
    urls.push(m);
    return ` URL${urls.length - 1} `;
  });

  let out = masked;
  for (const re of BRAND_PATTERNS) {
    out = out.replace(re, 'Balão.info');
  }

  return out.replace(/ URL(\d+) /g, (_, i) => urls[Number(i)]);
}

const TEXT_FIELDS = ['name', 'tag_description', 'description_html', 'seller_name', 'manufacturer', 'category'];

function run() {
  const raw = fs.readFileSync(IN_FILE, 'utf8');
  if (!fs.existsSync(BACKUP_FILE)) {
    fs.writeFileSync(BACKUP_FILE, raw);
    console.log('Backup salvo em', BACKUP_FILE);
  }

  const data = JSON.parse(raw);
  let changed = 0;

  for (const p of data) {
    let touched = false;
    for (const field of TEXT_FIELDS) {
      const before = p[field];
      const after = rebrandText(before);
      if (after !== before) {
        p[field] = after;
        touched = true;
      }
    }
    if (touched) changed++;
  }

  // Limpa eventuais "Balão.info Balão.info" resultantes de frases compostas
  // (ex.: "2eletro" + "bluepc" no mesmo nome) e "Balão.info!" residual.
  let jsonStr = JSON.stringify(data, null, 2);
  jsonStr = jsonStr.replace(/Balão\.info(\s+Balão\.info)+/g, 'Balão.info');

  fs.writeFileSync(IN_FILE, jsonStr);
  console.log(`✅ ${changed} de ${data.length} produtos tiveram menções de marca substituídas por Balão.info.`);
}

run();
