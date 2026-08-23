import { createClient, Client } from '@libsql/client';

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
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  return Boolean(url && url !== 'file:local.db' && token);
}

let _client: Client | null = null;
let _cachedUrl: string | null = null;
let _cachedToken: string | null = null;

export function getTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || url === 'file:local.db' || !token) {
    if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
      console.warn('[turso] TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN ausentes — usando cliente inativo.');
    }
    return makeStub();
  }

  if (!_client || _cachedUrl !== url || _cachedToken !== token) {
    try {
      _client = createClient({ url, authToken: token });
      _cachedUrl = url;
      _cachedToken = token;
    } catch (error) {
      console.error('[turso] Erro ao inicializar conexão LibSQL:', error);
      return makeStub();
    }
  }

  return _client;
}

export const turso: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getTursoClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default turso;

