import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function run() {
  console.log("=== 1. VERIFICANDO / CRIANDO CATEGORIAS ===");
  const existingCats = await db.execute("SELECT * FROM categories");
  const catNames = existingCats.rows.map(r => r.name);
  console.log("Categorias atuais:", catNames);

  // Criar 'iPhones Seminovos' se não existir
  let iphoneCat = existingCats.rows.find(r => r.name.toLowerCase().includes('iphone'));
  if (!iphoneCat) {
    const id = randomUUID();
    await db.execute({
      sql: "INSERT INTO categories (id, name, slug, display_order, icon, active, created_at) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))",
      args: [id, "iPhones Seminovos", "iphones-seminovos", 15, "Smartphone"]
    });
    console.log("✅ Categoria 'iPhones Seminovos' criada com ID:", id);
  } else {
    console.log("ℹ️ Categoria de iPhone já existe:", iphoneCat.name);
  }

  // Criar 'Notebooks Seminovos' se não existir
  let notebookCat = existingCats.rows.find(r => r.name.toLowerCase().includes('notebook') && r.name.toLowerCase().includes('seminov'));
  if (!notebookCat) {
    const id = randomUUID();
    await db.execute({
      sql: "INSERT INTO categories (id, name, slug, display_order, icon, active, created_at) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))",
      args: [id, "Notebooks Seminovos", "notebooks-seminovos", 16, "Laptop"]
    });
    console.log("✅ Categoria 'Notebooks Seminovos' criada com ID:", id);
  } else {
    console.log("ℹ️ Categoria de Notebook Seminovo já existe:", notebookCat.name);
  }

  console.log("\n=== 2. BUSCANDO PRODUTOS EXISTENTES POR NOME ===");
  // Buscar iPhones
  const iphonesRes = await db.execute("SELECT id, name, category, price FROM products WHERE LOWER(name) LIKE '%iphone%'");
  console.log(`Encontrados ${iphonesRes.rows.length} produtos de iPhone.`);

  // Buscar Notebooks
  const notebooksRes = await db.execute("SELECT id, name, category, price FROM products WHERE LOWER(name) LIKE '%notebook%' OR LOWER(name) LIKE '%macbook%' OR LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%thinkpad%'");
  console.log(`Encontrados ${notebooksRes.rows.length} produtos de Notebook.`);

  console.log("\n=== 3. ATUALIZANDO CATEGORIAS DOS PRODUTOS SELECIONADOS ===");
  // Atualizar os iPhones para a categoria 'iPhones Seminovos'
  if (iphonesRes.rows.length > 0) {
    const iphoneIds = iphonesRes.rows.map(r => r.id);
    const placeholders = iphoneIds.map(() => '?').join(',');
    await db.execute({
      sql: `UPDATE products SET category = 'iPhones Seminovos' WHERE id IN (${placeholders})`,
      args: iphoneIds
    });
    console.log(`✅ ${iphoneIds.length} produtos atualizados para a categoria 'iPhones Seminovos'!`);
  }

  // Atualizar os Notebooks para a categoria 'Notebooks Seminovos'
  if (notebooksRes.rows.length > 0) {
    const nbIds = notebooksRes.rows.map(r => r.id);
    const placeholders = nbIds.map(() => '?').join(',');
    await db.execute({
      sql: `UPDATE products SET category = 'Notebooks Seminovos' WHERE id IN (${placeholders})`,
      args: nbIds
    });
    console.log(`✅ ${nbIds.length} produtos atualizados para a categoria 'Notebooks Seminovos'!`);
  }

  // Também verificar a tabela home_blocks para incluir as duas novas categorias
  const hbRes = await db.execute("SELECT * FROM home_blocks WHERE category_id IN ('iPhones Seminovos', 'Notebooks Seminovos')");
  if (hbRes.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO home_blocks (id, category_id, title, display_order, active, created_at) VALUES (?, ?, ?, ?, 1, datetime('now'))",
      args: [randomUUID(), "iPhones Seminovos", "iPhones Seminovos", 7]
    });
    await db.execute({
      sql: "INSERT INTO home_blocks (id, category_id, title, display_order, active, created_at) VALUES (?, ?, ?, ?, 1, datetime('now'))",
      args: [randomUUID(), "Notebooks Seminovos", "Notebooks Seminovos", 8]
    });
    console.log("✅ Blocos adicionados na tabela home_blocks!");
  }

  console.log("\n=== VERIFICAÇÃO FINAL ===");
  const finalIphones = await db.execute("SELECT id, name, price, category FROM products WHERE category = 'iPhones Seminovos' LIMIT 5");
  console.log("Amostra iPhones Seminovos:", finalIphones.rows);

  const finalNbs = await db.execute("SELECT id, name, price, category FROM products WHERE category = 'Notebooks Seminovos' LIMIT 5");
  console.log("Amostra Notebooks Seminovos:", finalNbs.rows);
}

run().catch(console.error);
