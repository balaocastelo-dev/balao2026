import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

const BACKUP = process.env.BACKUP_DIR || 'C:\\Users\\user\\Desktop\\Backup-Supabase-ptqqvezawobgnheesgvh';
const DATA_DIR = path.join(BACKUP, '02-Dados', 'public');

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) { console.error('ERRO: defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (--env-file=.env.local)'); process.exit(1); }
const db = createClient({ url, authToken: token });

const ROOT = path.resolve(import.meta.dirname, '..');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'table-columns.json'), 'utf8'));

const args = process.argv.slice(2);
const onlyTables = args.find(a => a.startsWith('--tables='))?.split('=')[1]?.split(',') || null;
const rewriteImages = args.includes('--rewrite-images');
const dryRun = args.includes('--dry-run');
const CHUNK = 40;

const STORAGE_RE = /^https:\/\/ptqqvezawobgnheesgvh\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

function convertValue(v) {
  if (v === true) return 1;
  if (v === false) return 0;
  if (v !== null && typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string' && rewriteImages) {
    const m = v.match(STORAGE_RE);
    if (m) return `/uploads/${m[1]}/${m[2]}`;
  }
  return v;
}

// tabela especial do backup: posts_blog (257 posts) -> blog_posts (a que o código usa)
const TABLE_ALIASES = { blog_posts: ['blog_posts', 'posts_blog'] };

// mapeamento de colunas antigas (posts_blog) -> novas (blog_posts)
const COLUMN_MAPS = {
  blog_posts: {
    content_html: r => r.markdown ?? r.excerpt ?? '',
    cover_image_url: r => r.image_url,
    cover_image: r => r.image_url,
    source_site: r => r.source_name,
    source_type: r => (r.source_url ? 'rss' : 'manual'),
    language: () => 'pt-BR',
    status: () => 'published',
  },
};

const tables = Object.keys(meta)
  .filter(t => !onlyTables || onlyTables.includes(t))
  .sort();

let grandTotal = 0;
for (const table of tables) {
  const sources = TABLE_ALIASES[table] || [table];
  let rows = [];
  let sourceUsed = table;
  for (const src of sources) {
    const f = path.join(DATA_DIR, `${src}.json`);
    if (fs.existsSync(f)) {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (Array.isArray(data) && data.length > 0) { rows = data; sourceUsed = src; break; }
    }
  }
  if (!rows.length) { console.log(`- ${table}: sem dados no backup, pulando`); continue; }

  const validCols = new Set(meta[table].map(c => c.name));
  const sample = rows[0];
  const colMap = COLUMN_MAPS[table] || {};
  // colunas diretas presentes no backup + colunas mapeadas
  const directKeys = Object.keys(sample).filter(k => validCols.has(k) && !colMap[k]);
  const mappedKeys = Object.keys(colMap);
  const rowKeys = [...directKeys, ...mappedKeys];

  const ignored = Object.keys(sample).filter(k => !validCols.has(k) && !colMap[k]);

  const prepared = rows.map(r => {
    const obj = {};
    for (const k of directKeys) obj[k] = convertValue(r[k]);
    for (const k of mappedKeys) { const v = colMap[k](r); if (v !== undefined) obj[k] = convertValue(v); }
    return rowKeys.map(k => obj[k] ?? null);
  });
  let inserted = 0;
  if (!dryRun) {
    const sql = `INSERT OR REPLACE INTO "${table}" (${rowKeys.map(c => `"${c}"`).join(', ')}) VALUES (${rowKeys.map(() => '?').join(', ')})`;
    for (let i = 0; i < prepared.length; i += CHUNK) {
      const chunk = prepared.slice(i, i + CHUNK).map(args => ({ sql, args }));
      await db.batch(chunk, 'write');
      inserted += chunk.length;
    }
  } else {
    inserted = prepared.length;
  }

  grandTotal += inserted;
  console.log(`✅ ${table} ← ${sourceUsed}.json: ${inserted}/${rows.length} linhas${ignored.length ? ` | colunas ignoradas: ${ignored.join(', ')}` : ''}`);
}

console.log(`\n${dryRun ? '[DRY-RUN] ' : ''}Total importado: ${grandTotal} linhas`);
if (!dryRun) {
  for (const table of tables) {
    try {
      const r = await db.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
      console.log(`  ${table}: ${r.rows[0].n} linhas no Turso`);
    } catch { /* tabela pode não existir */ }
  }
}
