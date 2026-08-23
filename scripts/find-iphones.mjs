import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function check() {
  const prods = await db.execute("SELECT id, name, category, price, image FROM products WHERE category = 'Apple' OR category = 'Smartphones' OR LOWER(name) LIKE '%apple%' OR LOWER(name) LIKE '%iphone%' OR LOWER(name) LIKE '%celular%' OR LOWER(name) LIKE '%smartphone%' LIMIT 40");
  console.log(`Encontrados ${prods.rows.length} itens:`);
  for (const r of prods.rows) {
    console.log(`- [${r.category}] ${r.name} (${r.price})`);
  }
}
check();
