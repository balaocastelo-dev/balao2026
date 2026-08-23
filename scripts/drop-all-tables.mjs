import { createClient } from '@libsql/client';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
if (!res.rows.length) { console.log('Nenhuma tabela para apagar.'); process.exit(0); }
const stmts = res.rows.map(r => ({ sql: `DROP TABLE IF EXISTS "${r.name}"`, args: [] }));
await db.batch(stmts, 'write');
console.log(`Apagadas ${res.rows.length} tabelas antigas.`);
