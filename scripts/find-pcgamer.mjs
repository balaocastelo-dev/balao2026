import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function checkPc() {
  const prods = await db.execute("SELECT id, name, category, price, image FROM products WHERE LOWER(name) LIKE '%gamer%' OR LOWER(name) LIKE '%pc gamer%' OR LOWER(name) LIKE '%computador%' OR category = 'Computadores' OR category = 'Games' LIMIT 15");
  console.log(`Encontrados ${prods.rows.length} itens gamer/pc:`);
  for (const r of prods.rows) {
    console.log(`- [${r.category}] ${r.name} (${r.price})`);
  }
}
checkPc();
