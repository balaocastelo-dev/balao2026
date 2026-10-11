#!/usr/bin/env bash
#
# Raio-X do banco do WhatsApp da loja. Só LÊ: nada aqui escreve, apaga ou
# reinicia coisa alguma.
#
# Uso, como root na VPS (leva de 1 a 4 minutos — a consulta 6 lê a tabela
# inteira, de propósito, para medir o custo da lista completa):
#
#   bash /opt/balao2026/whatsapp-server/diagnostico-banco.sh
#
# O que mostra:
#   - memória da VPS e de cada container;
#   - tamanho das tabelas da Evolution e do banco da loja ("balao");
#   - quantas mensagens há em "Message", e por instância;
#   - os índices que existem em "Message" (e se algum ficou inválido);
#   - EXPLAIN (ANALYZE, BUFFERS) das consultas quentes (evo/consultas-quentes.sql).
#
# Dado de cliente NÃO sai na tela. Os parâmetros das consultas (id de
# mensagem, conversa) são escolhidos pelo próprio psql com \gset, que não
# imprime nada; e o que o EXPLAIN mostra de volta passa por um filtro que
# troca qualquer texto entre aspas com número ou @ por '<oculto>'. Nenhum
# SELECT daqui devolve texto, nome ou número de cliente — só contagens,
# tamanhos e planos.

set -euo pipefail

CODIGO="${CODIGO:-/opt/balao2026}"
DADOS="${DADOS:-/var/lib/balao-evo}"
PROJETO="${PROJETO:-balaoevo}"
INSTANCIA="${INSTANCIA:-loja}"

[ "$(id -u)" -eq 0 ] || { echo "Rode como root." >&2; exit 1; }

compose() {
  DADOS="$DADOS" docker compose -p "$PROJETO" -f "$CODIGO/whatsapp-server/docker-compose.evo.yml" \
    --env-file "$DADOS/segredos.env" "$@"
}
psql_em() {
  local banco="$1"
  shift
  compose exec -T postgres psql -U evolution -d "$banco" -X -q -v ON_ERROR_STOP=1 -P pager=off "$@"
}
# Qualquer literal entre aspas simples que tenha dígito ou @ (id de mensagem,
# telefone, jid, id de instância) vira '<oculto>'. Nomes de campo como
# 'remoteJid' passam, porque não têm nem dígito nem @.
mascarar() { sed -E "s/'[^']*[0-9@][^']*'/'<oculto>'/g"; }

titulo() { printf '\n\033[1;36m### %s\033[0m\n' "$1"; }

titulo "Memória da VPS"
free -h
titulo "Memória de cada container"
docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}' | grep -E "NAME|$PROJETO" || true

titulo "Configuração do Postgres em uso"
psql_em evolution -c "SELECT name, setting, unit FROM pg_settings WHERE name IN ('shared_buffers','effective_cache_size','work_mem','maintenance_work_mem','max_connections') ORDER BY name;"

titulo "Tabelas da Evolution (banco evolution), das maiores para as menores"
psql_em evolution -c "
SELECT c.relname AS tabela,
       pg_size_pretty(pg_total_relation_size(c.oid)) AS total,
       pg_size_pretty(pg_relation_size(c.oid))       AS dados,
       pg_size_pretty(pg_indexes_size(c.oid))        AS indices,
       c.reltuples::bigint                           AS linhas_estimadas
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 15;"

titulo "Mensagens em \"Message\" (contagem exata) e por instância"
psql_em evolution -c "
SELECT coalesce(i.name, '(sem instância)') AS instancia, count(*) AS mensagens,
       to_char(to_timestamp(min(m.\"messageTimestamp\")), 'YYYY-MM-DD') AS desde,
       to_char(to_timestamp(max(m.\"messageTimestamp\")), 'YYYY-MM-DD HH24:MI') AS ate
FROM \"Message\" m LEFT JOIN \"Instance\" i ON i.id = m.\"instanceId\"
GROUP BY 1 ORDER BY 2 DESC;"

titulo "Índices de \"Message\""
psql_em evolution -c "
SELECT c.relname AS indice, pg_size_pretty(pg_relation_size(c.oid)) AS tamanho,
       x.indisvalid AS valido, pg_get_indexdef(c.oid) AS definicao
FROM pg_index x JOIN pg_class c ON c.oid = x.indexrelid
WHERE x.indrelid = '\"Message\"'::regclass ORDER BY c.relname;" | mascarar

titulo "Banco da loja (balao): tabelas do CRM"
psql_em balao -c "
SELECT c.relname AS tabela, pg_size_pretty(pg_total_relation_size(c.oid)) AS total, c.reltuples::bigint AS linhas_estimadas
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname LIKE 'crm\_%'
ORDER BY pg_total_relation_size(c.oid) DESC;" || echo "(banco balao indisponível)"

titulo "Consultas quentes — EXPLAIN (ANALYZE, BUFFERS)"
echo "Parâmetros escolhidos sozinhos (a mensagem mais recente da instância \"$INSTANCIA\" e a conversa dela)."
echo "Nada de cliente aparece: o que o plano mostra entre aspas sai como '<oculto>'."
{
  cat <<SQL
\set iid ''
\set msgid ''
\set jid ''
SELECT id AS iid FROM "Instance" WHERE name = '$INSTANCIA' LIMIT 1 \gset
SELECT "key"->>'id' AS msgid, "key"->>'remoteJid' AS jid
FROM "Message" WHERE "instanceId" = :'iid'
ORDER BY "messageTimestamp" DESC LIMIT 1 \gset
SET statement_timeout = '240s';
SQL
  cat "$CODIGO/whatsapp-server/evo/consultas-quentes.sql"
} | psql_em evolution 2>&1 | mascarar

titulo "Pronto"
echo "Copie esta saída inteira e mande para o Claude (não tem dado de cliente)."
