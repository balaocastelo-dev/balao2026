import { createClient, Client } from '@libsql/client';

// Credenciais vêm SEMPRE de variáveis de ambiente (.env.local / Vercel).
// Nunca colocar token direto no código!
const envUrl = process.env.TURSO_DATABASE_URL;
const envToken = process.env.TURSO_AUTH_TOKEN;

const active = Boolean(envUrl && envUrl !== 'file:local.db' && envToken);

function makeStub(): Client {
  return {
    execute: async () => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined }),
    batch: async () => [],
    transaction: async () => ({} as any),
    close: () => {},
    closed: false,
    protocol: 'http',
  } as unknown as Client;
}

export function isTursoActive(): boolean {
  return active;
}

let tursoClient: Client;

if (active) {
  try {
    tursoClient = createClient({ url: envUrl!, authToken: envToken });
  } catch (error) {
    console.error('Turso DB initialization error:', error);
    tursoClient = makeStub();
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[turso] TURSO_DATABASE_URL/TURSO_AUTH_TOKEN ausentes — usando cliente inativo.');
  }
  tursoClient = makeStub();
}

export const turso = tursoClient;
export default turso;
