import { createClient } from '@libsql/client';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
let total = 0;
for (const r of res.rows) {
  const t = r.name;
  const c = await db.execute(`SELECT COUNT(*) AS n FROM "${t}"`);
  const n = Number(c.rows[0].n);
  total += n;
  if (n > 0) console.log(`${t}: ${n} linhas`);
}
console.log(`---\nTotal geral: ${total} linhas em ${res.rows.length} tabelas`);
