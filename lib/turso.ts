import { createPool, Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// ============================================================
// Adaptador de banco para a loja.
// Antes: Turso (LibSQL/SQLite). Agora: MariaDB/MySQL na
// Hostinger — mantida a MESMA interface (execute/batch/
// transaction) para que lib/db.ts e as rotas continuem
// funcionando sem mudanças de chamada.
//
// Config via env: MYSQL_HOST, MYSQL_PORT, MYSQL_USER,
// MYSQL_PASSWORD, MYSQL_DATABASE
// ============================================================

export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  rowsAffected: number;
  lastInsertRowid: number | undefined;
}

interface StatementInput {
  sql: string;
  args?: unknown[];
}

export interface DbClient {
  execute(input: StatementInput | string): Promise<QueryResult>;
  batch(stmts: StatementInput[], mode?: string): Promise<QueryResult[]>;
  transaction(input?: unknown): Promise<any>;
  close(): Promise<void>;
  closed: boolean;
  protocol: string;
}

// Resolve o modo "inativo": tudo vira execução vazia (o app trata
// `isTursoActive() === false` devolvendo listas vazias nas páginas).
function makeStub(): DbClient {
  const empty = async (): Promise<QueryResult> => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined });
  return {
    execute: empty,
    batch: async () => [] as QueryResult[],
    transaction: async () => ({}),
    close: async () => {},
    closed: false,
    protocol: 'http',
  };
}

export function isTursoActive(): boolean {
  const host = process.env.MYSQL_HOST;
  const database = process.env.MYSQL_DATABASE;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  return Boolean(host && database && user && password);
}

function getConfig() {
  return {
    host: process.env.MYSQL_HOST || '',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4_unicode_ci',
    dateStrings: true,
  };
}

let _pool: Pool | null = null;
let _poolSignature: string | null = null;

function getPool(): Pool {
  const cfg = getConfig();
  const signature = [cfg.host, cfg.port, cfg.user, cfg.database].join('|');
  if (!_pool || _poolSignature !== signature) {
    try {
      _pool = createPool(cfg);
      _poolSignature = signature;
    } catch (error) {
      console.error('[db] Erro ao inicializar pool MySQL:', error);
      throw error;
    }
  }
  return _pool;
}

// Normaliza parâmetros: LibSQL aceitava `undefined` e objetos; o MySQL
// precisa de null/valores planos — objetos viram JSON, boolean vira 0/1.
function toParams(args?: unknown[]): any[] {
  return (args ?? []).map((a) => {
    if (a === null || a === undefined) return null;
    if (typeof a === 'boolean') return a ? 1 : 0;
    if (typeof a === 'bigint') return Number(a);
    if (typeof a === 'object') {
      if (typeof (a as Date).toISOString === 'function') return (a as Date).toISOString();
      try {
        return JSON.stringify(a);
      } catch {
        return null;
      }
    }
    return a;
  });
}

function toResult(result: any, fields?: any[]): QueryResult {
  if (Array.isArray(result)) {
    const rows = (result as RowDataPacket[]).map((r) => ({ ...r } as Record<string, unknown>));
    return {
      rows,
      columns: fields?.map((f) => f.name) ?? (rows[0] ? Object.keys(rows[0]) : []),
      rowsAffected: rows.length,
      lastInsertRowid: undefined,
    };
  }
  const header = result as ResultSetHeader;
  return {
    rows: [],
    columns: [],
    rowsAffected: header.affectedRows ?? 0,
    lastInsertRowid: header.insertId !== undefined && header.insertId > 0 ? Number(header.insertId) : undefined,
  };
}

async function runQuery(poolOrConn: Pool | PoolConnection, input: StatementInput | string): Promise<QueryResult> {
  const { sql, args } = typeof input === 'string' ? { sql: input, args: [] as unknown[] } : input;
  const [result, fields] = await poolOrConn.query({ sql, values: toParams(args) });
  return toResult(result, fields as any[]);
}

async function execute(input: StatementInput | string): Promise<QueryResult> {
  return runQuery(getPool(), input);
}

async function batch(stmts: StatementInput[], mode?: string): Promise<QueryResult[]> {
  const pool = getPool();
  const results: QueryResult[] = [];
  const useTransaction = mode === 'write';
  const conn = useTransaction ? await pool.getConnection() : null;
  try {
    if (conn) await conn.beginTransaction();
    for (const stmt of stmts) {
      results.push(conn ? await runQuery(conn, stmt) : await runQuery(pool, stmt));
    }
    if (conn) await conn.commit();
  } catch (e) {
    if (conn) await conn.rollback().catch(() => {});
    throw e;
  } finally {
    if (conn) conn.release();
  }
  return results;
}

interface Tx {
  execute(input: StatementInput | string): Promise<QueryResult>;
  batch(stmts: StatementInput[], mode?: string): Promise<QueryResult[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

async function transaction(input?: unknown): Promise<any> {
  const pool = getPool();
  const conn = await pool.getConnection();

  // Forma com handler: transaction(async (tx) => { ... })
  if (typeof input === 'function') {
    const handler = input as (tx: Tx) => any;
    const tx: Tx = {
      execute: (s) => runQuery(conn, s),
      batch: async (stmts, mode) => {
        for (const stmt of stmts) await runQuery(conn, stmt);
        return [];
      },
      commit: async () => conn.commit(),
      rollback: async () => conn.rollback(),
    };
    try {
      await conn.beginTransaction();
      const result = await handler(tx);
      await conn.commit();
      conn.release();
      return result;
    } catch (e) {
      await conn.rollback().catch(() => {});
      conn.release();
      throw e;
    }
  }

  // Forma com modo: transaction("write") retorna um objeto com execute/batch
  await conn.beginTransaction();
  return {
    execute: (s: StatementInput | string) => runQuery(conn, s),
    batch: async (stmts: StatementInput[]) => {
      for (const stmt of stmts) await runQuery(conn, stmt);
      return [];
    },
    commit: async () => { try { await conn.commit(); } finally { conn.release(); } },
    rollback: async () => { try { await conn.rollback(); } finally { conn.release(); } },
  };
}

export function getTursoClient(): DbClient {
  if (!isTursoActive()) {
    if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
      console.warn('[db] MYSQL_* ausentes — usando cliente inativo.');
    }
    return makeStub();
  }
  return {
    execute,
    batch,
    transaction,
    close: async () => { if (_pool) { await _pool.end(); _pool = null; } },
    closed: false,
    protocol: 'mysql',
  };
}

// Proxy mantém a fatia: `turso.execute(...)` resolve o cliente a cada
// chamada (permite trocar config via env sem recriar imports).
export const turso: DbClient = new Proxy({} as DbClient, {
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