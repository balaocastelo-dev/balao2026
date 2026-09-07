#!/usr/bin/env bash
#
# Poe HTTPS na frente do servidor de WhatsApp usando Caddy.
#
# O Caddy pede e renova o certificado (Let's Encrypt) sozinho, e ja repassa
# WebSocket — que e o que o painel usa para o chat em tempo real.
#
# Uso, como root na VPS:
#   bash configurar-https.sh                      # usa o hostname da propria VPS
#   DOMINIO=whats.balao.info bash configurar-https.sh
#
# O dominio informado PRECISA apontar para o IP desta VPS antes de rodar,
# senao a Let's Encrypt nao consegue validar e o certificado falha.

set -euo pipefail

DOMINIO="${DOMINIO:-$(hostname -f)}"
DESTINO="${DESTINO:-127.0.0.1:4100}"

msg() { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
erro() { printf '\n\033[1;31m[ERRO] %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || erro "Rode como root (use: sudo bash configurar-https.sh)"

msg "Dominio: $DOMINIO  ->  $DESTINO"

msg "Conferindo para onde o dominio aponta"
ip_servidor="$(curl -fsS -m 10 https://api.ipify.org || true)"
ip_dominio="$(getent hosts "$DOMINIO" | awk '{print $1}' | head -1 || true)"
echo "IP desta VPS:      ${ip_servidor:-nao consegui descobrir}"
echo "IP do dominio:     ${ip_dominio:-nao resolve}"

if [ -z "$ip_dominio" ]; then
  erro "$DOMINIO nao resolve. Crie o registro DNS apontando para $ip_servidor e tente de novo."
fi
if [ -n "$ip_servidor" ] && [ "$ip_dominio" != "$ip_servidor" ]; then
  echo
  echo "AVISO: o dominio aponta para outro IP. Se o DNS acabou de mudar, espere"
  echo "a propagacao — a Let's Encrypt vai recusar o certificado ate la."
  read -r -p "Continuar mesmo assim? (s/N) " resposta
  [ "$resposta" = "s" ] || [ "$resposta" = "S" ] || exit 1
fi

msg "Instalando o Caddy"
if ! command -v caddy >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl gnupg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -qq
  apt-get install -y -qq caddy
fi
caddy version

msg "Abrindo as portas 80 e 443"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  echo "ufw liberado"
else
  echo "ufw inativo — nada a fazer aqui"
fi
echo "Se a Hostinger tiver firewall no painel, libere 80 e 443 la tambem."

msg "Escrevendo a configuracao"
cat > /etc/caddy/Caddyfile <<CADDY
$DOMINIO {
	reverse_proxy $DESTINO
}
CADDY
cat /etc/caddy/Caddyfile

msg "Subindo o Caddy"
systemctl enable caddy >/dev/null 2>&1 || true
systemctl restart caddy
sleep 5

msg "Testando"
if curl -sf -m 20 "https://$DOMINIO/status" >/dev/null 2>&1; then
  echo "HTTPS no ar:"
  curl -s "https://$DOMINIO/status" | head -c 300
  echo
  echo
  echo "Agora configure no site (Vercel):"
  echo "  NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL=https://$DOMINIO"
  echo
  echo "Publique o site e abra /crm para ler o QR Code."
else
  echo "Ainda nao respondeu. O certificado pode levar ate um minuto na primeira vez."
  echo "Veja o que esta acontecendo:  journalctl -u caddy -n 40 --no-pager"
fi
