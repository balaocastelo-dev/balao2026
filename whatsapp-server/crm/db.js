// Banco do CRM (contatos, mensagens, etiquetas, interesses, consentimento).
//
// Por que isto existe: até aqui o servidor guardava mensagem só na MEMÓRIA
// (um Map, no máximo 400 por conversa) e o resto num arquivo JSON. Reiniciou
// o container, perdeu. Passou de 400, perdeu. Sem histórico gravado não existe
// painel da operação, não existe busca, não existe segmento e não existe
// remarketing — os dados simplesmente não estão lá para serem mostrados.
//
// Usa o MESMO Postgres que o módulo de Status já usa (banco "balao"), com
// tabelas próprias prefixadas `crm_` e uma trava de migração própria. Nada
// aqui toca nas tabelas da Evolution nem nas do Status.
//
// Para evoluir: acrescente um item novo ao fim de MIGRACOES. Nunca edite um
// que já rodou.

const { Pool } = require("pg");

const TRAVA_MIGRACAO = 4210922; // o módulo de Status usa 4210921

const MIGRACOES = [
  {
    id: "crm_001_base",
    sql: `
      -- Uma linha por conversa. É o "cliente" do CRM.
      CREATE TABLE IF NOT EXISTS crm_contato (
        chat_id        text PRIMARY KEY,
        numero         text,
        nome           text,
        nome_whatsapp  text,
        foto_url       text,
        vendedor_id    text,
        etapa          text,
        origem         text,
        primeira_em    timestamptz,
        ultima_em      timestamptz,
        ultima_direcao text,
        ultima_previa  text,
        total_entrada  int NOT NULL DEFAULT 0,
        total_saida    int NOT NULL DEFAULT 0,
        optin          boolean NOT NULL DEFAULT false,
        optout         boolean NOT NULL DEFAULT false,
        bloqueado      boolean NOT NULL DEFAULT false,
        oculto         boolean NOT NULL DEFAULT false,
        observacao     text,
        criado_em      timestamptz NOT NULL DEFAULT now(),
        atualizado_em  timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS crm_contato_ultima ON crm_contato (ultima_em DESC NULLS LAST);
      CREATE INDEX IF NOT EXISTS crm_contato_numero ON crm_contato (numero);
      CREATE INDEX IF NOT EXISTS crm_contato_vendedor ON crm_contato (vendedor_id);

      -- Toda mensagem que entra ou sai, venha de onde vier (webhook da
      -- Evolution, varredura de conciliação, histórico ou o próprio CRM).
      CREATE TABLE IF NOT EXISTS crm_mensagem (
        id           text PRIMARY KEY,
        chat_id      text NOT NULL,
        direcao      text NOT NULL CHECK (direcao IN ('in','out')),
        corpo        text NOT NULL DEFAULT '',
        tipo_midia   text,
        mime         text,
        nome_midia   text,
        transcricao  text,
        produto_id   text,
        produto_nome text,
        vendedor_id  text,
        origem       text,
        situacao     text,
        em           timestamptz NOT NULL,
        criado_em    timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS crm_mensagem_chat ON crm_mensagem (chat_id, em DESC);
      CREATE INDEX IF NOT EXISTS crm_mensagem_em ON crm_mensagem (em DESC);
      CREATE INDEX IF NOT EXISTS crm_mensagem_produto ON crm_mensagem (produto_id) WHERE produto_id IS NOT NULL;

      -- Etiquetas da LOJA (hoje elas vivem no localStorage de cada navegador,
      -- ou seja, são do micro e não da equipe).
      CREATE TABLE IF NOT EXISTS crm_etiqueta (
        id         text PRIMARY KEY,
        nome       text NOT NULL,
        cor        text NOT NULL DEFAULT '#0f9d58',
        automatica boolean NOT NULL DEFAULT false,
        criado_em  timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS crm_contato_etiqueta (
        chat_id     text NOT NULL,
        etiqueta_id text NOT NULL REFERENCES crm_etiqueta(id) ON DELETE CASCADE,
        por         text,
        em          timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (chat_id, etiqueta_id)
      );
      CREATE INDEX IF NOT EXISTS crm_contato_etiqueta_etq ON crm_contato_etiqueta (etiqueta_id);

      -- Interesse detectado automaticamente a partir da conversa e dos
      -- produtos que a loja já ofertou àquele cliente.
      CREATE TABLE IF NOT EXISTS crm_interesse (
        chat_id   text NOT NULL,
        interesse text NOT NULL,
        pontos    int  NOT NULL DEFAULT 0,
        ultima_em timestamptz,
        PRIMARY KEY (chat_id, interesse)
      );
      CREATE INDEX IF NOT EXISTS crm_interesse_tipo ON crm_interesse (interesse, pontos DESC);

      -- Consentimento, para a LGPD. Guarda o que foi aceito, quando, por onde
      -- e com que texto — é isto que se mostra numa fiscalização.
      CREATE TABLE IF NOT EXISTS crm_consentimento (
        id         bigserial PRIMARY KEY,
        chat_id    text NOT NULL,
        acao       text NOT NULL CHECK (acao IN ('opt_in','opt_out')),
        canal      text NOT NULL,
        texto      text,
        finalidade text,
        por        text,
        em         timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS crm_consentimento_chat ON crm_consentimento (chat_id, em DESC);

      -- Linha do tempo da operação. É daqui que sai o painel.
      CREATE TABLE IF NOT EXISTS crm_evento (
        id          bigserial PRIMARY KEY,
        em          timestamptz NOT NULL DEFAULT now(),
        tipo        text NOT NULL,
        chat_id     text,
        vendedor_id text,
        detalhes    jsonb NOT NULL DEFAULT '{}'::jsonb
      );
      CREATE INDEX IF NOT EXISTS crm_evento_em ON crm_evento (em DESC);
      CREATE INDEX IF NOT EXISTS crm_evento_tipo ON crm_evento (tipo, em DESC);

      -- Notas internas sobre o cliente (hoje só no navegador).
      CREATE TABLE IF NOT EXISTS crm_nota (
        id      bigserial PRIMARY KEY,
        chat_id text NOT NULL,
        texto   text NOT NULL,
        autor   text,
        em      timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS crm_nota_chat ON crm_nota (chat_id, em DESC);

      -- Respostas rápidas da equipe (hoje cada navegador tem as suas).
      CREATE TABLE IF NOT EXISTS crm_resposta_rapida (
        id        text PRIMARY KEY,
        atalho    text,
        titulo    text NOT NULL,
        texto     text NOT NULL,
        categoria text,
        usos      int NOT NULL DEFAULT 0,
        criado_por text,
        criado_em timestamptz NOT NULL DEFAULT now(),
        atualizado_em timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS crm_config (
        chave text PRIMARY KEY,
        valor jsonb NOT NULL,
        atualizado_em timestamptz NOT NULL DEFAULT now(),
        atualizado_por text
      );
    `,
  },
  {
    id: "crm_002_busca",
    sql: `
      -- Busca por conteúdo da conversa ("quem falou em placa de vídeo?").
      CREATE INDEX IF NOT EXISTS crm_mensagem_texto
        ON crm_mensagem USING gin (to_tsvector('portuguese', corpo));
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
  const nome = decodeURIComponent(new URL(url).pathname.replace(/^\//, "")) || "balao";
  if (urlAdmin) await garantirBanco(urlAdmin, nome);
  const pool = new Pool({ connectionString: url, max: 6 });
  pool.on("error", (e) => registrar("[crm/db] erro no pool:", e.message));

  await pool.query(`CREATE TABLE IF NOT EXISTS migracao (id text PRIMARY KEY, em timestamptz NOT NULL DEFAULT now())`);
  for (const m of MIGRACOES) {
    const cliente = await pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query(`SELECT pg_advisory_xact_lock(${TRAVA_MIGRACAO})`);
      const ja = await cliente.query("SELECT 1 FROM migracao WHERE id = $1", [m.id]);
      if (!ja.rowCount) {
        await cliente.query(m.sql);
        await cliente.query("INSERT INTO migracao (id) VALUES ($1)", [m.id]);
        registrar(`[crm/db] migração ${m.id} aplicada`);
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

module.exports = { abrirBanco, MIGRACOES };
