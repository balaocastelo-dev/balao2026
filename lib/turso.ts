import { createClient, Client } from '@libsql/client';

const FALLBACK_URL = 'libsql://balao2026-balao.aws-us-east-1.turso.io';
const FALLBACK_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYzNTIxNTAsImlkIjoiMDE5ZmVhZTItMGMwMS03NTEwLTgwNDktMmE5OGE5M2IwNyJ9.tU1BXjMbeAss2hgfETKQxIfuX6RYZh6iLJkvZLnwX1nnjxKZRsQH6FmcB4lCH0L2Dad4qi3as4LslrAzw-uMBg';

const envUrl = process.env.TURSO_DATABASE_URL;
const envToken = process.env.TURSO_AUTH_TOKEN;

const hasEnvTurso = Boolean(envUrl && envUrl !== 'file:local.db');
const url = hasEnvTurso ? envUrl! : FALLBACK_URL;
const authToken = hasEnvTurso && envToken ? envToken : FALLBACK_TOKEN;

export function isTursoActive(): boolean {
  const effective = process.env.TURSO_DATABASE_URL || FALLBACK_URL;
  return Boolean(effective && effective !== 'file:local.db');
}

let tursoClient: Client;

try {
  tursoClient = createClient({
    url,
    authToken: authToken || undefined,
  });
} catch (error) {
  console.error('Turso DB initialization error:', error);
  tursoClient = {
    execute: async () => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined }),
    batch: async () => [],
    transaction: async () => ({} as any),
    close: () => {},
    closed: false,
    protocol: 'http',
  } as unknown as Client;
}

export const turso = tursoClient;
export default turso;
