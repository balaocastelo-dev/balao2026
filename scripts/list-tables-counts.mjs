import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function listTables() {
  const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  console.log("Tabelas no banco:");
  for (const t of tables.rows) {
    const count = await db.execute(`SELECT COUNT(*) as c FROM ${t.name}`);
    console.log(`- ${t.name}: ${count.rows[0].c} registros`);
  }
}
listTables().catch(console.error);
