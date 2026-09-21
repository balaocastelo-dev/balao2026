#!/usr/bin/env bash
#
# Troca o WhatsApp da loja para a Evolution API (ou atualiza, se já trocou).
#
# Uso, como root na VPS:
#   bash deploy-evo.sh           # sobe/atualiza a Evolution e o servidor novo
#   bash deploy-evo.sh voltar    # volta para o servidor antigo (whatsapp-web.js)
#   bash deploy-evo.sh logs      # últimas linhas dos logs
#
# O que fica onde:
#   /var/lib/balao-evo/segredos.env   senhas geradas aqui (nunca vão para o git)
#   /var/lib/balao-evo/postgres       banco da Evolution (conversas e histórico)
#   /var/lib/balao-evo/evolution      sessões do WhatsApp
#   /var/lib/balao-evo/painel         vendedores, funil, preferências, mídia
#
# O servidor antigo NÃO é apagado: fica parado, para dar para voltar.

set -euo pipefail

REPO="${REPO:-https://github.com/balaocastelo-dev/balao2026.git}"
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
esac

msg "Conferindo o Docker"
command -v docker >/dev/null || { curl -fsSL https://get.docker.com | sh; systemctl enable --now docker; }
if ! docker compose version >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq docker-compose-plugin
fi
docker compose version

msg "Baixando o código"
if [ -d "$CODIGO/.git" ]; then
  git -C "$CODIGO" fetch origin main --depth=1
  git -C "$CODIGO" reset --hard origin/main
else
  rm -rf "$CODIGO"
  git clone --depth=1 "$REPO" "$CODIGO"
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

msg "Construindo e subindo a Evolution (o servidor antigo continua no ar por enquanto)"
compose pull postgres redis evolution
compose build balao-whats
compose up -d postgres redis evolution

echo -n "Esperando a Evolution responder"
for _ in $(seq 1 60); do
  if compose exec -T evolution wget -qO- http://localhost:8080/ >/dev/null 2>&1; then echo " ok"; break; fi
  echo -n "."; sleep 3
done

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
[ "$ok" -eq 1 ] || { compose logs --tail 40 balao-whats; erro "O servidor novo não respondeu. Para voltar: bash $0 voltar"; }

msg "No ar"
curl -s "http://127.0.0.1:$PORTA/status"; echo
echo
echo "Agora abra www.balao.info/crm e leia o QR Code com o celular da LOJA."
echo "Teste cruzado (depois de conectar):  www.balao.info/api/crm/teste-cruzado"
echo
echo "Logs:    bash $0 logs"
echo "Voltar:  bash $0 voltar"
docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}' | grep -E "NAME|$PROJETO" || true
