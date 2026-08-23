import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) { console.error('ERRO: defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (--env-file=.env.local)'); process.exit(1); }

const db = createClient({ url, authToken: token });
const ROOT = path.resolve(import.meta.dirname, '..');
const files = [
  path.join(ROOT, 'supabase', 'turso_generated_schema.sql'),
  path.join(ROOT, 'supabase', 'turso_manual_tables.sql'),
];

function toStatements(sql) {
  return sql
    .split('\n')
    .filter(l => !l.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
}

for (const f of files) {
  if (!fs.existsSync(f)) { console.error('Falta arquivo:', f); process.exit(1); }
  const stmts = toStatements(fs.readFileSync(f, 'utf8'));
  console.log(`Aplicando ${path.basename(f)} (${stmts.length} comandos)...`);
  await db.batch(stmts.map(sql => ({ sql, args: [] })), 'write');
}

const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log(`\n✅ Esquema aplicado. Tabelas no banco (${res.rows.length}):`);
for (const r of res.rows) console.log(' -', r.name);
