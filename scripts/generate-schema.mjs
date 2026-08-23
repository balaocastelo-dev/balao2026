import fs from 'node:fs';
import path from 'node:path';

const BACKUP = process.env.BACKUP_DIR || 'C:\\Users\\user\\Desktop\\Backup-Supabase-ptqqvezawobgnheesgvh';
const ROOT = path.resolve(import.meta.dirname, '..');

const USED_TABLES = [
  'arena_config', 'arena_eventos_midia', 'arena_vendas', 'arena_vendedores',
  'audit_logs', 'blog_posts', 'blog_source_items', 'carousel_images',
  'categories', 'controle_part_withdrawals', 'controle_parts', 'coupons',
  'email_logs', 'home_blocks', 'import_history', 'order_items', 'orders',
  'products', 'site_conversion_events', 'site_visits', 'topbar_messages',
  'unsubscribed_emails', 'used_notebooks', 'vitrine_pages',
  'weekly_expenses', 'weekly_orders'
];

const colunas = JSON.parse(fs.readFileSync(path.join(BACKUP, '01-Estrutura', 'colunas.json'), 'utf8'));
const chaves = JSON.parse(fs.readFileSync(path.join(BACKUP, '01-Estrutura', 'chaves-primarias-estrangeiras.json'), 'utf8'));

function pgToSqlite(dataType, udtName) {
  const t = (dataType || '').toLowerCase();
  const u = (udtName || '').toLowerCase();
  if (u.startsWith('_')) return 'TEXT';
  if (['uuid', 'text', 'citext', 'json', 'jsonb', 'bytea', 'date', 'xml'].includes(t)) return 'TEXT';
  if (t.startsWith('timestamp') || t.startsWith('time ') || t.startsWith('character')) return 'TEXT';
  if (t === 'boolean') return 'INTEGER';
  if (['integer', 'smallint', 'bigint'].includes(t) || t.endsWith('serial')) return 'INTEGER';
  if (['numeric', 'decimal', 'real', 'double precision', 'money'].includes(t)) return 'REAL';
  return 'TEXT';
}

function translateDefault(def) {
  if (!def) return null;
  const d = def.trim().toLowerCase();
  if (['now()', 'clock_timestamp()', 'statement_timestamp()', 'transaction_timestamp()', 'current_timestamp', 'localtimestamp', 'localtimestamp(0)', 'now()::text'].includes(d)) return 'CURRENT_TIMESTAMP';
  if (d === 'true') return '1';
  if (d === 'false') return '0';
  if (d.includes('gen_random_uuid') || d.includes('uuid_generate')) return null;
  if (/^-?\d+(\.\d+)?$/.test(d)) return d;
  if (d.startsWith("'") && d.endsWith("'") && !d.includes("::")) return d;
  return null;
}

const byTable = {};
for (const c of colunas) {
  if (c.table_schema !== 'public') continue;
  if (!USED_TABLES.includes(c.table_name)) continue;
  (byTable[c.table_name] ||= []).push(c);
}
for (const t of Object.keys(byTable)) byTable[t].sort((a, b) => a.ordinal_position - b.ordinal_position);

const pkMap = {}, uniqMap = {};
for (const k of chaves) {
  if (k.table_schema !== 'public' || !USED_TABLES.includes(k.table_name)) continue;
  if (k.constraint_type === 'PRIMARY KEY') ((pkMap[k.table_name] ||= []).push(k.column_name));
  if (k.constraint_type === 'UNIQUE') ((uniqMap[k.table_name] ||= []).push(k.column_name));
}

let sql = `-- ============================================================
-- ESQUEMA SQLITE/LIBSQL GERADO DO BACKUP SUPABASE
-- Gerado por scripts/generate-schema.mjs — NÃO editar à mão
-- Tabelas: ${USED_TABLES.length} em uso pelo código
-- ============================================================\n\n`;

const meta = {};

for (const table of USED_TABLES.sort()) {
  const cols = byTable[table];
  if (!cols || !cols.length) { console.warn(`AVISO: sem colunas para ${table}`); continue; }
  meta[table] = cols.map(c => ({ name: c.column_name, type: pgToSqlite(c.data_type, c.udt_name) }));

  const lines = cols.map(c => {
    const parts = [`  "${c.column_name}" ${pgToSqlite(c.data_type, c.udt_name)}`];
    const dflt = translateDefault(c.column_default);
    // Se tinha QUALQUER default no Postgres, nunca fica NOT NULL aqui:
    // ou traduzimos o default, ou deixamos NULLável (o default cobria os inserts)
    if (dflt) parts.push(`DEFAULT ${dflt}`);
    if (c.is_nullable === 'NO' && !c.column_default) parts.push('NOT NULL');
    return parts.join(' ');
  });

  const pks = [...new Set(pkMap[table] || [])];
  if (pks.length) lines.push(`  PRIMARY KEY (${pks.map(p => `"${p}"`).join(', ')})`);
  for (const u of [...new Set(uniqMap[table] || [])]) lines.push(`  UNIQUE ("${u}")`);

  sql += `-- ${table}\nCREATE TABLE IF NOT EXISTS "${table}" (\n${lines.join(',\n')}\n);\n\n`;
}

fs.writeFileSync(path.join(ROOT, 'supabase', 'turso_generated_schema.sql'), sql);
fs.writeFileSync(path.join(ROOT, 'scripts', 'table-columns.json'), JSON.stringify(meta, null, 2));
console.log(`OK: ${Object.keys(meta).length} tabelas -> supabase/turso_generated_schema.sql`);
for (const t of Object.keys(meta)) console.log(`  ${t}: ${meta[t].length} colunas`);
