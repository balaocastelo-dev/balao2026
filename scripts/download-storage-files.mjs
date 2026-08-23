import fs from 'node:fs';
import path from 'node:path';

const BACKUP = process.env.BACKUP_DIR || 'C:\\Users\\user\\Desktop\\Backup-Supabase-ptqqvezawobgnheesgvh';
const DATA_DIR = path.join(BACKUP, '02-Dados', 'public');
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'uploads');

// tabelas/colunas que podem guardar URL do Storage do Supabase
const CHECKS = [
  ['carousel_images.json', r => [r.image_url]],
  ['controle_parts.json', r => [r.photo_url]],
  ['controle_part_withdrawals.json', r => [r.part_snapshot_photo_url]],
  ['order_items.json', r => [r.product_image]],
];

const STORAGE_RE = /https:\/\/ptqqvezawobgnheesgvh\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/([^\s"']+)/;

const urls = new Set();
for (const [file, pick] of CHECKS) {
  const f = path.join(DATA_DIR, file);
  if (!fs.existsSync(f)) continue;
  const rows = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of rows) {
    for (const v of pick(r)) {
      if (typeof v !== 'string') continue;
      const m = v.match(STORAGE_RE);
      if (m) urls.add(`${m[1]}/${m[2]}`);
    }
  }
}

console.log(`Arquivos únicos a baixar: ${urls.size}`);
let ok = 0, skip = 0, fail = 0;
const failures = [];

for (const ref of urls) {
  const [bucket, ...rest] = ref.split('/');
  const rel = rest.join('/');
  const dest = path.join(OUT_DIR, bucket, rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skip++; continue; }

  const url = `https://ptqqvezawobgnheesgvh.supabase.co/storage/v1/object/public/${bucket}/${rel}`;
  let done = false;
  for (let attempt = 1; attempt <= 3 && !done; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      ok++; done = true;
    } catch (e) {
      if (attempt === 3) { fail++; failures.push(`${ref} -> ${e.message}`); }
      else await new Promise(r => setTimeout(r, 800 * attempt));
    }
  }
}

console.log(`\nBaixados: ${ok} | Já existiam: ${skip} | Falhas: ${fail}`);
if (failures.length) { console.log('Falhas:'); failures.forEach(f => console.log(' -', f)); }
