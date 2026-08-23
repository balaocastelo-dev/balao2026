import { createClient } from '@libsql/client';
import fs from 'fs';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function clearProducts() {
  console.log("=== 1. VERIFICANDO QUANTIDADE ATUAL DE PRODUTOS ===");
  const countRes = await db.execute("SELECT COUNT(*) as c FROM products");
  console.log(`Total de produtos no banco: ${countRes.rows[0].c}`);

  console.log("=== 2. FAZENDO BACKUP COMPLETO DOS PRODUTOS ANTES DE LIMPAR ===");
  const allProducts = await db.execute("SELECT * FROM products");
  fs.writeFileSync("backup_products_safety.json", JSON.stringify(allProducts.rows, null, 2), "utf8");
  console.log(`✅ Backup salvo com sucesso em backup_products_safety.json (${allProducts.rows.length} produtos salvos)`);

  console.log("=== 3. DELETANDO 100% DOS PRODUTOS DO BANCO ===");
  await db.execute("DELETE FROM products");
  
  const verifyRes = await db.execute("SELECT COUNT(*) as c FROM products");
  console.log(`✅ Quantidade de produtos após remoção: ${verifyRes.rows[0].c}`);
}

clearProducts().catch(console.error);
