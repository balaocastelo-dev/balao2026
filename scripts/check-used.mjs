import { createClient } from '@libsql/client';
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function checkUsed() {
  const used = await db.execute("SELECT * FROM used_notebooks");
  console.log(`used_notebooks count: ${used.rows.length}`);
  for (const r of used.rows) {
    console.log(r);
  }
}
checkUsed();
