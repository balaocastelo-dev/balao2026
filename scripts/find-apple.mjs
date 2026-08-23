import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function check() {
  const prods = await db.execute("SELECT id, name, category, price FROM products WHERE category = 'Apple'");
  console.log(`Encontrados ${prods.rows.length} itens na categoria Apple:`);
  for (const r of prods.rows) {
    console.log(`- ${r.name} (${r.price})`);
  }
}
check();
