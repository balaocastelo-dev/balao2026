-- Índices na tabela "Message" da Evolution 2.3.7.
--
-- Por que existem: a única coisa indexada em "Message" é "instanceId" (a
-- migração 20241017144950_create_index da Evolution) — e a loja tem UMA
-- instância, então esse índice não separa nada. Toda consulta quente lê a
-- tabela inteira:
--
--   * a cada recibo (messages.update: entregue, lida, tocada), a Evolution
--     procura a mensagem original com
--       SELECT * FROM "Message" WHERE "instanceId" = $1 AND "key"->>'id' = $2
--     (e o mesmo em getMessage, ao editar/apagar/votar);
--   * o findChats é um DISTINCT ON ("key"->>'remoteJid') sobre todas as
--     mensagens; e cada mensagem que entra recalcula as não lidas da conversa
--     com "key"->>'remoteJid' = $2 (updateChatUnreadMessages);
--   * o findMessages filtra pelo caminho JSON do Prisma e ordena por
--     "messageTimestamp" — o SQL exato que o Prisma 6.19.0 (o da Evolution
--     2.3.7) gera, capturado com log de consultas, é:
--       WHERE ("instanceId" = $1
--              AND ("key"#>ARRAY[$2]::text[])::jsonb::jsonb = $3)   -- $2 = 'remoteJid'
--       ORDER BY "messageTimestamp" DESC LIMIT $4 OFFSET $5
--     O operador é #> (caminho, devolve jsonb) — NÃO é ->>. Um índice em
--     ("key"->>'remoteJid') não serve para esta consulta; ela precisa de um
--     índice na MESMA expressão ("key" #> '{remoteJid}'). O Postgres casa a
--     expressão porque, no plano de cada execução, $2 vira a constante
--     'remoteJid' e ARRAY['remoteJid']::text[] é simplificado para
--     '{remoteJid}'::text[] dos dois lados (os ::jsonb repetidos são no-op).
--
-- Nomes com prefixo balao_msg_ para nunca colidir com um índice que uma
-- versão futura da Evolution venha a criar.
--
-- Como roda: deploy-evo.sh, depois de a Evolution subir (é ela quem cria a
-- tabela), via `docker compose exec -T postgres psql`. CONCURRENTLY não trava
-- a escrita: a loja continua recebendo enquanto o índice é montado. E é
-- idempotente: IF NOT EXISTS pula o que já existe.
--
-- Uma armadilha do CONCURRENTLY: se a montagem for interrompida (deploy
-- cancelado, container reiniciado), sobra um índice INVÁLIDO com o nome — e
-- o IF NOT EXISTS o pularia para sempre, deixando a consulta lenta. Por isso
-- o primeiro passo remove qualquer balao_msg_* inválido antes de criar.

\set ON_ERROR_STOP on
SET maintenance_work_mem = '64MB';

SELECT format('DROP INDEX CONCURRENTLY IF EXISTS %I.%I', n.nspname, c.relname)
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT i.indisvalid AND c.relname LIKE 'balao\_msg\_%'
\gexec

-- Recibos e getMessage: "key"->>'id' = $2
CREATE INDEX CONCURRENTLY IF NOT EXISTS balao_msg_key_id
  ON "Message" (("key"->>'id'));

-- findChats de uma conversa, não lidas, "lidas até": "key"->>'remoteJid' = $2
-- (e o DISTINCT ON ("key"->>'remoteJid') ... ORDER BY ..., "messageTimestamp" DESC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS balao_msg_jid_ts
  ON "Message" (("key"->>'remoteJid'), "messageTimestamp" DESC);

-- Varredura (findMessages sem filtro, as N mais recentes) e a janela de tempo
-- do findChats/findMessages ("messageTimestamp" >= $2 AND <= $3).
CREATE INDEX CONCURRENTLY IF NOT EXISTS balao_msg_inst_ts
  ON "Message" ("instanceId", "messageTimestamp" DESC);

-- findMessages de uma conversa, no SQL exato do Prisma (caminho JSON com #>).
CREATE INDEX CONCURRENTLY IF NOT EXISTS balao_msg_jidjson_ts
  ON "Message" (("key" #> '{remoteJid}'::text[]), "messageTimestamp" DESC);

-- O mesmo para key.remoteJidAlt: o fetchMessages da 2.3.7 (o de
-- whatsapp.baileys.service, que é o que roda) aceita remoteJid OU
-- remoteJidAlt, e o histórico de conversa @lid procura pelos dois. Parcial:
-- só a minoria das mensagens tem remoteJidAlt, então o índice fica pequeno; o
-- Postgres usa mesmo assim, porque `expr = valor` já garante `expr IS NOT NULL`.
CREATE INDEX CONCURRENTLY IF NOT EXISTS balao_msg_jidalt_ts
  ON "Message" (("key" #> '{remoteJidAlt}'::text[]), "messageTimestamp" DESC)
  WHERE ("key" #> '{remoteJidAlt}'::text[]) IS NOT NULL;

ANALYZE "Message";

-- O que ficou, para o log do deploy (só nomes e tamanhos; nada de cliente).
SELECT c.relname AS indice,
       pg_size_pretty(pg_relation_size(c.oid)) AS tamanho,
       i.indisvalid AS valido
FROM pg_index i
JOIN pg_class c ON c.oid = i.indexrelid
WHERE i.indrelid = '"Message"'::regclass
ORDER BY c.relname;
