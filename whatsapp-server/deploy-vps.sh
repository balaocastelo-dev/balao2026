#!/usr/bin/env bash
#
# Sobe (ou atualiza) o servidor de WhatsApp numa VPS Ubuntu com Docker.
#
# Uso, como root na VPS:
#   bash deploy-vps.sh
#
# Rodar de novo depois de mudar o codigo: baixa o que ha de novo, reconstroi a
# imagem e troca o container. A sessao do WhatsApp e o funil de vendas ficam no
# volume, entao NAO se perdem — nao precisa ler o QR Code de novo.

set -euo pipefail

REPO="${REPO:-https://github.com/balaocastelo-dev/balao2026.git}"
CODIGO="${CODIGO:-/opt/balao2026}"
# Tudo que precisa sobreviver a um restart mora aqui: sessao do WhatsApp,
# etiquetas, kanban de cada vendedor, notas de cliente e midia.
DADOS="${DADOS:-/var/lib/balao-whats}"
CONTAINER="${CONTAINER:-balao-whats}"
PORTA="${PORTA:-4100}"
ORIGENS="${ORIGENS:-https://www.balao.info,https://balao.info}"

# Teto de memoria do container.
#
# A primeira sincronizacao do WhatsApp Web e o momento mais pesado: o Chromium
# carrega o historico de conversas de uma vez e passa facil de 3 GB numa conta
# de loja. Se o teto for baixo, o kernel mata o navegador no meio — a sessao
# recem-lida cai e o painel volta a pedir QR Code, parecendo que a leitura
# "nao pegou".
#
# Numa VPS de 8 GB, 6 GB aqui deixam folga para o sistema. /dev/shm entra
# nessa conta e o Chromium usa bastante: 2 GB evita travar so por causa disso.
MEMORIA="${MEMORIA:-6g}"
SHM="${SHM:-2g}"

msg() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
erro() { printf '\n\033[1;31m[ERRO] %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || erro "Rode como root (use: sudo bash deploy-vps.sh)"

msg "Conferindo o Docker"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nao encontrado. Instalando..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi
docker --version

msg "Baixando o codigo"
if [ -d "$CODIGO/.git" ]; then
  git -C "$CODIGO" fetch origin main --depth=1
  git -C "$CODIGO" reset --hard origin/main
else
  rm -rf "$CODIGO"
  git clone --depth=1 "$REPO" "$CODIGO"
fi
echo "Commit: $(git -C "$CODIGO" log --oneline -1)"

msg "Preparando a pasta de dados"
mkdir -p "$DADOS"
echo "$DADOS"

msg "Construindo a imagem"
docker build -t "$CONTAINER" "$CODIGO/whatsapp-server"

msg "Trocando o container"
# Para com calma antes de remover: 'docker rm -f' mata o Chromium na hora, e ele
# deixa a trava do perfil para tras — no boot seguinte o navegador se recusa a
# abrir e o painel fica sem QR Code. O servidor tambem limpa essas travas ao
# subir, mas encerrar direito evita o problema na origem.
if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  # Antes de descartar, olha se o container anterior morreu por falta de
  # memoria — e o motivo mais comum de a sessao cair no meio da primeira
  # sincronizacao, e some sem deixar rastro quando o container e removido.
  if [ "$(docker inspect -f '{{.State.OOMKilled}}' "$CONTAINER" 2>/dev/null)" = "true" ]; then
    echo
    echo "  ATENCAO: o container anterior foi morto por falta de memoria."
    echo "  Subindo agora com MEMORIA=$MEMORIA. Se repetir, aumente:"
    echo "    MEMORIA=7g bash deploy-vps.sh"
    echo
  fi
  docker stop -t 20 "$CONTAINER" >/dev/null 2>&1 || true
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
fi
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p "127.0.0.1:$PORTA:4100" \
  -v "$DADOS:/dados" \
  -e DATA_ROOT=/dados \
  -e WHATSAPP_PANEL_ALLOWED_ORIGIN="$ORIGENS" \
  -e TZ=America/Sao_Paulo \
  --memory="$MEMORIA" \
  --shm-size="$SHM" \
  "$CONTAINER"

msg "Esperando o servidor responder"
ok=0
for _ in $(seq 1 30); do
  if curl -sf -m 2 "http://127.0.0.1:$PORTA/status" >/dev/null 2>&1; then ok=1; break; fi
  sleep 2
done

if [ "$ok" -eq 1 ]; then
  msg "No ar"
  curl -s "http://127.0.0.1:$PORTA/status" | head -c 400
  echo
  echo
  echo "A porta esta publicada so em 127.0.0.1 de proposito: quem expoe para a"
  echo "internet com HTTPS e o Cloudflare Tunnel (ou o Nginx). Sem isso, o site"
  echo "nao alcanca este servidor."
  echo
  echo "Memoria:   teto de $MEMORIA (/dev/shm: $SHM)"
  echo
  echo "Logs:      docker logs -f $CONTAINER"
  echo "Reiniciar: docker restart $CONTAINER"
  echo "Uso agora: docker stats --no-stream $CONTAINER"
else
  erro "O servidor nao respondeu. Veja: docker logs $CONTAINER"
fi
