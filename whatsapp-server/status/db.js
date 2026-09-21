// Banco do módulo de Status.
//
// Usa o Postgres que já roda no docker compose (o mesmo container da
// Evolution), mas num banco SEPARADO ("balao"): nada aqui mexe nas tabelas da
// Evolution, e a Evolution nada sabe deste módulo.
//
// As tabelas são criadas/atualizadas no boot (migrações idempotentes). Para
// evoluir: acrescentar um item novo ao fim de MIGRACOES, nunca editar um que
// já rodou.

const { Pool } = require("pg");

const MIGRACOES = [
  {
    id: "001_status_base",
    sql: `
      CREATE TABLE IF NOT EXISTS status_conteudo (
        id            uuid PRIMARY KEY,
        conta         text NOT NULL DEFAULT 'loja',
        titulo        text NOT NULL,
        tipo          text NOT NULL CHECK (tipo IN ('texto','imagem','video')),
        texto         text NOT NULL DEFAULT '',
        link          text,
        cor_fundo     text NOT NULL DEFAULT '#0a6e3d',
        fonte         int  NOT NULL DEFAULT 1,
        midia_arquivo text,
        midia_mime    text,
        categoria     text,
        campanha      text,
        assinar       boolean NOT NULL DEFAULT true,
        selo          boolean NOT NULL DEFAULT true,
        modelo        boolean NOT NULL DEFAULT false,
        criado_por    text NOT NULL,
        criado_em     timestamptz NOT NULL DEFAULT now(),
        atualizado_em timestamptz NOT NULL DEFAULT now(),
        excluido_em   timestamptz
      );

      CREATE TABLE IF NOT EXISTS status_agendamento (
        id            uuid PRIMARY KEY,
        conteudo_id   uuid NOT NULL REFERENCES status_conteudo(id),
        regra         jsonb NOT NULL,
        situacao      text NOT NULL CHECK (situacao IN ('ativo','pausado','finalizado','cancelado')),
        proxima_em    timestamptz,
        criado_por    text NOT NULL,
        criado_em     timestamptz NOT NULL DEFAULT now(),
        atualizado_em timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS status_agendamento_proxima ON status_agendamento (situacao, proxima_em);

      -- Cada publicação (agendada, manual ou nova tentativa) tem uma linha e
      -- uma chave única. É a chave que impede publicar duas vezes a mesma
      -- ocorrência: o agendador só publica se conseguiu INSERIR a linha.
      CREATE TABLE IF NOT EXISTS status_execucao (
        id             uuid PRIMARY KEY,
        chave          text NOT NULL UNIQUE,
        agendamento_id uuid REFERENCES status_agendamento(id),
        conteudo_id    uuid NOT NULL REFERENCES status_conteudo(id),
        previsto_para  timestamptz NOT NULL,
        situacao       text NOT NULL CHECK (situacao IN ('publicando','publicado','falhou','incerto','perdido','cancelado')),
        tentativa      int  NOT NULL DEFAULT 1,
        origem         text NOT NULL,
        disparado_por  text NOT NULL,
        iniciado_em    timestamptz NOT NULL DEFAULT now(),
        concluido_em   timestamptz,
        erro           text,
        id_whatsapp    text,
        publico        int
      );
      CREATE INDEX IF NOT EXISTS status_execucao_situacao ON status_execucao (situacao, iniciado_em DESC);

      CREATE TABLE IF NOT EXISTS status_auditoria (
        id             bigserial PRIMARY KEY,
        em             timestamptz NOT NULL DEFAULT now(),
        usuario        text NOT NULL,
        acao           text NOT NULL,
        conteudo_id    uuid,
        agendamento_id uuid,
        execucao_id    uuid,
        detalhes       jsonb NOT NULL DEFAULT '{}'::jsonb
      );
      CREATE INDEX IF NOT EXISTS status_auditoria_em ON status_auditoria (em DESC);

      CREATE TABLE IF NOT EXISTS status_config (
        chave text PRIMARY KEY,
        valor jsonb NOT NULL,
        atualizado_em timestamptz NOT NULL DEFAULT now(),
        atualizado_por text
      );

      -- Status publicados pelos contatos (duram 24 h no WhatsApp).
      CREATE TABLE IF NOT EXISTS status_recebido (
        id          text PRIMARY KEY,
        autor       text NOT NULL,
        autor_nome  text,
        tipo        text NOT NULL,
        texto       text NOT NULL DEFAULT '',
        mime        text,
        cor_fundo   text,
        recebido_em timestamptz NOT NULL,
        visto_em    timestamptz,
        visto_por   text
      );
      CREATE INDEX IF NOT EXISTS status_recebido_em ON status_recebido (recebido_em DESC);
    `,
  },
];

async function garantirBanco(urlAdmin, nome) {
  const admin = new Pool({ connectionString: urlAdmin, max: 1 });
  try {
    const r = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [nome]);
    if (!r.rowCount) await admin.query(`CREATE DATABASE "${nome.replace(/"/g, "")}"`);
  } finally {
    await admin.end();
  }
}

async function abrirBanco({ url, urlAdmin, registrar = console.log }) {
  // O nome do banco sai da própria URL (…/balao).
  const nome = decodeURIComponent(new URL(url).pathname.replace(/^\//, "")) || "balao";
  if (urlAdmin) await garantirBanco(urlAdmin, nome);
  const pool = new Pool({ connectionString: url, max: 5 });
  pool.on("error", (e) => registrar("[status/db] erro no pool:", e.message));

  await pool.query(`CREATE TABLE IF NOT EXISTS migracao (id text PRIMARY KEY, em timestamptz NOT NULL DEFAULT now())`);
  for (const m of MIGRACOES) {
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      // Trava para dois processos não migrarem ao mesmo tempo.
      await cliente.query("SELECT pg_advisory_xact_lock(4210921)");
      const ja = await cliente.query("SELECT 1 FROM migracao WHERE id = $1", [m.id]);
      if (!ja.rowCount) {
        await cliente.query(m.sql);
        await cliente.query("INSERT INTO migracao (id) VALUES ($1)", [m.id]);
        registrar(`[status/db] migração ${m.id} aplicada`);
      }
      await cliente.query("COMMIT");
    } catch (e) {
      await cliente.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      cliente.release();
    }
  }

  async function transacao(fn) {
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      const r = await fn(cliente);
      await cliente.query("COMMIT");
      return r;
    } catch (e) {
      await cliente.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      cliente.release();
    }
  }

  return { pool, query: (t, v) => pool.query(t, v), transacao };
}

module.exports = { abrirBanco };
