#!/usr/bin/env bash
#
# Troca o WhatsApp da loja para a Evolution API (ou atualiza, se já trocou).
#
# Uso, como root na VPS:
#   bash deploy-evo.sh           # sobe/atualiza a Evolution e o servidor novo
#   REF=<commit> bash deploy-evo.sh   # sobe um commit ESPECÍFICO (é assim que se desfaz um deploy)
#   bash deploy-evo.sh voltar    # NÃO use para desfazer: liga o servidor ANTIGO (whatsapp-web.js, pré-Evolution)
#   bash deploy-evo.sh logs      # últimas linhas dos logs
#   bash deploy-evo.sh importar  # copia o histórico da Evolution para o banco da loja (uma vez)
#   bash deploy-evo.sh diagnostico   # raio-X do banco (só leitura, sem dado de cliente)
#
# O que fica onde:
#   /var/lib/balao-evo/segredos.env   senhas geradas aqui (nunca vão para o git)
#   /var/lib/balao-evo/postgres       banco da Evolution (conversas e histórico)
#   /var/lib/balao-evo/evolution      sessões do WhatsApp
#   /var/lib/balao-evo/painel         vendedores, funil, preferências, mídia
#
# O servidor antigo NÃO é apagado: fica parado, para dar para voltar.

set -euo pipefail

# Este script troca o código de /opt/balao2026 no meio do caminho (git reset).
# O bash lê o script aos pedaços enquanto roda; se o arquivo mudar por baixo,
# ele pode executar metade de uma linha velha e metade de uma nova. Por isso a
# primeira coisa é rodar a partir de uma cópia que ninguém mexe.
if [ -z "${BALAO_DEPLOY_COPIA:-}" ]; then
  copia="$(mktemp /tmp/deploy-evo.XXXXXX.sh)"
  cp "$0" "$copia"
  BALAO_DEPLOY_COPIA=1 exec bash "$copia" "$@"
fi
trap 'rm -f -- "$0"' EXIT

REPO="${REPO:-https://github.com/balaocastelo-dev/balao2026.git}"
# Qual commit subir. Padrão: o que está no main. Para desfazer um deploy,
# REF=<commit anterior> — o código, o compose e os Dockerfiles passam a ser os
# daquele commit, e o build sobe exatamente o que estava no ar antes.
REF="${REF:-origin/main}"
CODIGO="${CODIGO:-/opt/balao2026}"
DADOS="${DADOS:-/var/lib/balao-evo}"
DADOS_ANTIGOS="${DADOS_ANTIGOS:-/var/lib/balao-whats}"
PORTA="${PORTA:-4100}"
PROJETO="balaoevo"
ANTIGOS=(balao-whats beto)

msg() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
aviso() { printf '\033[1;33m%s\033[0m\n' "$1"; }
erro() { printf '\n\033[1;31m[ERRO] %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || erro "Rode como root."

compose() {
  DADOS="$DADOS" PORTA="$PORTA" VERSAO="${VERSAO:-dev}" \
    docker compose -p "$PROJETO" -f "$CODIGO/whatsapp-server/docker-compose.evo.yml" \
    --env-file "$DADOS/segredos.env" "$@"
}

case "${1:-}" in
  voltar)
    msg "Voltando para o servidor antigo"
    compose stop balao-whats || true
    for c in "${ANTIGOS[@]}"; do docker start "$c" 2>/dev/null && echo "iniciado: $c" || true; done
    echo "A Evolution continua ligada (sem porta pública). Para parar tudo: docker compose -p $PROJETO stop"
    exit 0
    ;;
  logs)
    compose logs --tail 60 balao-whats evolution
    exit 0
    ;;
  importar)
    # Copia o histórico da Evolution para o banco da loja (uma vez, depois do
    # deploy da fase 1). Idempotente; só imprime contagens. Ver
    # crm/importar-da-evolution.js e docs/whatsapp-fase1.md.
    shift
    compose exec -T balao-whats node crm/importar-da-evolution.js "$@"
    exit $?
    ;;
  diagnostico)
    exec bash "$CODIGO/whatsapp-server/diagnostico-banco.sh"
    ;;
esac

msg "Conferindo o Docker"
command -v docker >/dev/null || { curl -fsSL https://get.docker.com | sh; systemctl enable --now docker; }
if ! docker compose version >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq docker-compose-plugin
fi
docker compose version

msg "Baixando o código"
if [ -d "$CODIGO/.git" ]; then
  # Profundidade 100: o bastante para achar o commit anterior quando REF aponta
  # para trás (com --depth=1 só o último commit do main existiria aqui).
  git -C "$CODIGO" fetch origin main --depth=100
  git -C "$CODIGO" reset --hard "$REF"
else
  rm -rf "$CODIGO"
  git clone --depth=100 "$REPO" "$CODIGO"
  git -C "$CODIGO" reset --hard "$REF"
fi
VERSAO="$(git -C "$CODIGO" log --format=%h -1)"
export VERSAO
echo "Commit: $(git -C "$CODIGO" log --oneline -1)"

msg "Pastas e senhas"
mkdir -p "$DADOS"/{postgres,redis,evolution,painel/data}
chmod 700 "$DADOS"
if [ ! -f "$DADOS/segredos.env" ]; then
  umask 077
  {
    echo "EVOLUTION_CHAVE=$(openssl rand -hex 32)"
    echo "POSTGRES_SENHA=$(openssl rand -hex 24)"
  } > "$DADOS/segredos.env"
  echo "Senhas novas geradas em $DADOS/segredos.env"
else
  echo "Usando as senhas que já existem"
fi

# Vendedores, funil e preferências vêm do servidor antigo na primeira vez.
if [ ! -f "$DADOS/painel/data/panel-data.json" ] && [ -f "$DADOS_ANTIGOS/data/panel-data.json" ]; then
  cp "$DADOS_ANTIGOS/data/panel-data.json" "$DADOS/painel/data/panel-data.json"
  echo "Dados do painel copiados do servidor antigo (vendedores, funil, preferências)"
fi

msg "Memória livre"
free -h | sed -n 1,2p
# Os tetos do compose somam ~3,5 GB (Postgres 1 GB, Evolution 1,5 GB,
# servidor 768 MB, Redis 256 MB) e foram pensados para a KVM 2 (8 GB). Numa
# máquina menor eles ainda sobem, mas o Linux pode matar um container.
total_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
if [ "${total_mb:-0}" -lt 4000 ]; then
  aviso "ATENÇÃO: esta VPS tem ${total_mb} MB de memória. O compose foi dimensionado para 8 GB (KVM 2)."
  aviso "Ajuste mem_limit/shared_buffers no docker-compose.evo.yml antes de seguir, ou aceite o risco."
fi

msg "Construindo e subindo a Evolution (o servidor antigo continua no ar por enquanto)"
compose pull postgres redis
# A Evolution não é mais baixada pronta: é a imagem oficial 2.3.7 com o
# remendo do Baileys (evolution/Dockerfile). Se o remendo não encaixar, o
# build falha AQUI, antes de qualquer container ser trocado.
compose build evolution balao-whats
compose up -d postgres redis evolution

echo -n "Esperando a Evolution responder"
for _ in $(seq 1 60); do
  if compose exec -T evolution wget -qO- http://localhost:8080/ >/dev/null 2>&1; then echo " ok"; break; fi
  echo -n "."; sleep 3
done

# Índices que a Evolution não cria (evo/indices.sql explica). Roda depois de
# ela subir porque é ela quem cria a tabela "Message" no primeiro boot. É
# idempotente e não trava a escrita (CONCURRENTLY): a loja continua recebendo
# enquanto o índice é montado. Se falhar, o deploy segue — tudo funciona,
# só que lento como antes.
INDICES="$CODIGO/whatsapp-server/evo/indices.sql"
if [ -f "$INDICES" ]; then
  msg "Índices na tabela de mensagens da Evolution"
  for _ in $(seq 1 40); do
    if compose exec -T postgres psql -U evolution -d evolution -tAc \
      "SELECT to_regclass('public.\"Message\"') IS NOT NULL" 2>/dev/null | grep -q t; then
      break
    fi
    sleep 3
  done
  if compose exec -T postgres psql -U evolution -d evolution -X -q -v ON_ERROR_STOP=1 < "$INDICES"; then
    echo "Índices conferidos."
  else
    aviso "Não consegui aplicar os índices agora. O WhatsApp funciona sem eles; rode o deploy de novo depois."
  fi
fi

msg "Trocando: para o servidor antigo e liga o novo na porta $PORTA"
for c in "${ANTIGOS[@]}"; do
  if docker ps --format '{{.Names}}' | grep -qx "$c"; then
    docker stop -t 20 "$c" >/dev/null && echo "parado (não apagado): $c"
  fi
done
compose up -d balao-whats

ok=0
for _ in $(seq 1 40); do
  if curl -sf -m 3 "http://127.0.0.1:$PORTA/status" >/dev/null; then ok=1; break; fi
  sleep 2
done
[ "$ok" -eq 1 ] || {
  compose logs --tail 40 balao-whats
  erro "O servidor novo não respondeu. Para desfazer, suba o commit anterior: REF=<commit> bash $CODIGO/whatsapp-server/deploy-evo.sh (docs/whatsapp-fase1.md). NÃO use 'voltar'."
}

msg "No ar"
curl -s "http://127.0.0.1:$PORTA/status"; echo
echo
echo "Agora abra www.balao.info/crm e leia o QR Code com o celular da LOJA."
echo "Teste cruzado (depois de conectar):  www.balao.info/api/crm/teste-cruzado"
echo
echo "Logs:     bash $CODIGO/whatsapp-server/deploy-evo.sh logs"
echo "Desfazer: REF=<commit anterior> bash $CODIGO/whatsapp-server/deploy-evo.sh   (docs/whatsapp-fase1.md)"
docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}' | grep -E "NAME|$PROJETO" || true
