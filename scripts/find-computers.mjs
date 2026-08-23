import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function checkComputadores() {
  const prods = await db.execute("SELECT id, name, category, price, image FROM products WHERE category = 'Computadores' OR LOWER(name) LIKE '%computador%' OR LOWER(name) LIKE '%core i%' OR LOWER(name) LIKE '%ryzen%' OR LOWER(name) LIKE '%rtx%' LIMIT 20");
  console.log(`Encontrados ${prods.rows.length} computadores/processadores:`);
  for (const r of prods.rows) {
    console.log(`- [${r.category}] ${r.name} (${r.price})`);
  }
}
checkComputadores();
