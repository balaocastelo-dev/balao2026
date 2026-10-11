-- Carga FALSA para medir as consultas da Evolution 2.3.7 (nada de cliente).
--
-- Gera :conversas conversas e :mensagens mensagens na instância :'instancia',
-- com números inventados (5500000xxxxxx), espalhadas pelo último ano e com
-- algumas conversas muito mais movimentadas que outras — como na loja.
--
-- Uso (psql): \set instancia '<id da instância>'  \set conversas 12754  \set mensagens 200000
--             \i carga-falsa.sql

\set ON_ERROR_STOP on

DELETE FROM "Message" WHERE "instanceId" = :'instancia';
DELETE FROM "Chat" WHERE "instanceId" = :'instancia';
DELETE FROM "Contact" WHERE "instanceId" = :'instancia';

CREATE TEMP TABLE conversa_falsa AS
SELECT i AS n, ('5500000' || lpad(i::text, 6, '0') || '@s.whatsapp.net') AS jid
FROM generate_series(1, :conversas) AS i;

INSERT INTO "Contact" ("id", "remoteJid", "pushName", "instanceId", "updatedAt")
SELECT 'ct' || md5('c' || n), jid, 'Cliente ' || n, :'instancia', now() FROM conversa_falsa;

INSERT INTO "Chat" ("id", "remoteJid", "name", "instanceId", "unreadMessages", "updatedAt")
SELECT 'ch' || md5('h' || n), jid, NULL, :'instancia', (n % 4), now() FROM conversa_falsa;

-- Mensagens: a conversa de cada uma é sorteada com viés (random()^3 concentra
-- o movimento em poucas conversas), e o horário anda junto com n.
INSERT INTO "Message" ("id", "key", "pushName", "messageType", "message", "source",
                       "messageTimestamp", "instanceId", "status")
SELECT
  'cm' || md5('m' || m.n),
  jsonb_build_object(
    'id', upper(substr(md5('k' || m.n), 1, 20)),
    'fromMe', (m.n % 3 = 0),
    'remoteJid', c.jid
  ),
  CASE WHEN m.n % 3 = 0 THEN NULL ELSE 'Cliente ' || c.n END,
  'conversation',
  jsonb_build_object('conversation', 'mensagem de teste número ' || m.n),
  'android',
  (extract(epoch FROM now())::int - 365 * 86400) + (m.n::bigint * 365 * 86400 / :mensagens)::int,
  :'instancia',
  CASE WHEN m.n % 3 = 0 THEN 'READ' WHEN m.n % 7 = 0 THEN 'DELIVERY_ACK' ELSE 'READ' END
FROM (
  SELECT n, 1 + floor(:conversas * power(random(), 3))::int AS conversa
  FROM generate_series(1, :mensagens) AS n
) m
JOIN conversa_falsa c ON c.n = m.conversa;

ANALYZE "Message";
ANALYZE "Chat";
ANALYZE "Contact";

SELECT count(*) AS mensagens_falsas FROM "Message" WHERE "instanceId" = :'instancia';
