import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('ERRO: credenciais ausentes');
  process.exit(1);
}

const db = createClient({ url, authToken });

try {
  const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('✅ CONEXÃO OK com', url);
  console.log('Tabelas existentes:', res.rows.length);
  for (const r of res.rows) console.log(' -', r.name);
} catch (e) {
  console.error('❌ FALHA na conexão:', e.message);
  process.exit(1);
}
