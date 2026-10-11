-- As consultas quentes da Evolution 2.3.7 sobre "Message", com EXPLAIN
-- (ANALYZE, BUFFERS). Usado pelo diagnostico-banco.sh (na VPS) e pela bancada
-- de índices (local, com carga falsa).
--
-- O SQL é o MESMO que a Evolution manda — o do Prisma copiado do log de
-- consultas da própria imagem v2.3.7, só com os parâmetros no lugar dos $n
-- (é o que o Postgres faz no plano de cada execução).
--
-- Precisa das variáveis do psql: iid (id da instância), msgid (id de uma
-- mensagem) e jid (remoteJid de uma conversa). O diagnostico-banco.sh as
-- escolhe sozinho com \gset, sem imprimir, e mascara o que sair no plano.
--
-- Só SELECT: nada aqui escreve no banco.

\echo
\echo '== 1) Recibo (messages.update) e getMessage: a mensagem pelo id'
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM "Message"
WHERE "instanceId" = :'iid'
AND "key"->>'id' = :'msgid'
LIMIT 1;

\echo
\echo '== 2) findMessages de uma conversa (caminho JSON do Prisma), 80 mais recentes'
EXPLAIN (ANALYZE, BUFFERS)
SELECT "public"."Message"."id", "public"."Message"."key", "public"."Message"."pushName", "public"."Message"."messageType",
       "public"."Message"."message", "public"."Message"."messageTimestamp", "public"."Message"."instanceId",
       "public"."Message"."source"::text, "public"."Message"."contextInfo"
FROM "public"."Message"
WHERE ("public"."Message"."instanceId" = :'iid'
       AND ("public"."Message"."key"#>ARRAY['remoteJid']::text[])::jsonb::jsonb = to_jsonb(:'jid'::text))
ORDER BY "public"."Message"."messageTimestamp" DESC LIMIT 80 OFFSET 0;

\echo
\echo '== 2b) ... e o count(*) que o findMessages faz antes'
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) AS "_count$_all" FROM (
  SELECT "public"."Message"."id" FROM "public"."Message"
  WHERE ("public"."Message"."instanceId" = :'iid'
         AND ("public"."Message"."key"#>ARRAY['remoteJid']::text[])::jsonb::jsonb = to_jsonb(:'jid'::text))
  OFFSET 0) AS "sub";

\echo
\echo '== 3) Varredura: findMessages sem filtro, 40 mais recentes'
EXPLAIN (ANALYZE, BUFFERS)
SELECT "public"."Message"."id", "public"."Message"."key", "public"."Message"."pushName", "public"."Message"."messageType",
       "public"."Message"."message", "public"."Message"."messageTimestamp", "public"."Message"."instanceId",
       "public"."Message"."source"::text, "public"."Message"."contextInfo"
FROM "public"."Message"
WHERE "public"."Message"."instanceId" = :'iid'
ORDER BY "public"."Message"."messageTimestamp" DESC LIMIT 40 OFFSET 0;

\echo
\echo '== 4) Não lidas da conversa (a cada mensagem que entra: updateChatUnreadMessages)'
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*)::int as count FROM "Message"
WHERE "instanceId" = :'iid'
AND "key"->>'remoteJid' = :'jid'
AND ("key"->>'fromMe')::boolean = false
AND "status" = 'DELIVERY_ACK';

\echo
\echo '== 5) findChats só da última hora (a rede de segurança nova, a cada 5 min)'
EXPLAIN (ANALYZE, BUFFERS)
WITH rankedMessages AS (
  SELECT DISTINCT ON ("Message"."key"->>'remoteJid')
    "Contact"."id" as "contactId", "Message"."key"->>'remoteJid' as "remoteJid",
    "Chat"."name" as "pushName", "Chat"."unreadMessages" as "unreadMessages",
    "Message"."id" AS "lastMessageId", "Message"."messageTimestamp" AS "lastMessageMessageTimestamp",
    COALESCE(to_timestamp("Message"."messageTimestamp"::double precision), "Contact"."updatedAt") as "updatedAt"
  FROM "Message"
  LEFT JOIN "Contact" ON "Contact"."remoteJid" = "Message"."key"->>'remoteJid' AND "Contact"."instanceId" = "Message"."instanceId"
  LEFT JOIN "Chat" ON "Chat"."remoteJid" = "Message"."key"->>'remoteJid' AND "Chat"."instanceId" = "Message"."instanceId"
  WHERE "Message"."instanceId" = :'iid'
    AND "Message"."messageTimestamp" >= extract(epoch FROM now() - interval '1 hour')::int
    AND "Message"."messageTimestamp" <= extract(epoch FROM now() + interval '1 minute')::int
  ORDER BY "Message"."key"->>'remoteJid', "Message"."messageTimestamp" DESC
)
SELECT * FROM rankedMessages ORDER BY "updatedAt" DESC NULLS LAST;

\echo
\echo '== 6) findChats da lista INTEIRA (no boot e às 03h30; antes era a cada 5 min)'
EXPLAIN (ANALYZE, BUFFERS)
WITH rankedMessages AS (
  SELECT DISTINCT ON ("Message"."key"->>'remoteJid')
    "Contact"."id" as "contactId", "Message"."key"->>'remoteJid' as "remoteJid",
    "Chat"."name" as "pushName", "Chat"."unreadMessages" as "unreadMessages",
    "Message"."id" AS "lastMessageId", "Message"."key" AS "lastMessage_key", "Message"."message" AS "lastMessageMessage",
    "Message"."messageTimestamp" AS "lastMessageMessageTimestamp",
    COALESCE(to_timestamp("Message"."messageTimestamp"::double precision), "Contact"."updatedAt") as "updatedAt"
  FROM "Message"
  LEFT JOIN "Contact" ON "Contact"."remoteJid" = "Message"."key"->>'remoteJid' AND "Contact"."instanceId" = "Message"."instanceId"
  LEFT JOIN "Chat" ON "Chat"."remoteJid" = "Message"."key"->>'remoteJid' AND "Chat"."instanceId" = "Message"."instanceId"
  WHERE "Message"."instanceId" = :'iid'
  ORDER BY "Message"."key"->>'remoteJid', "Message"."messageTimestamp" DESC
)
SELECT * FROM rankedMessages ORDER BY "updatedAt" DESC NULLS LAST;
