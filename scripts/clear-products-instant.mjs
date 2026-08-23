import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function clear() {
  console.log("=== EXCLUINDO TODOS OS PRODUTOS DO BANCO TURSO ===");
  await db.execute("DELETE FROM products");
  const count = await db.execute("SELECT COUNT(*) as c FROM products");
  console.log(`✅ Produtos restantes no banco: ${count.rows[0].c}`);
}

clear().catch(console.error);
