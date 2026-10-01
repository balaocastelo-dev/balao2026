#!/bin/bash
# Bancada completa: Evolution falsa + servidor real + site real.
# Tudo local, nenhum dado de cliente, nenhuma conexão com a loja.
set -e
R=/tmp/claude-0/bancada
SENHA=teste123
rm -rf $R && mkdir -p $R/dados
cp /tmp/claude-0/-home-claude/7190d527-2f1c-59f4-b4eb-89b05f406470/scratchpad/rig2309/fakes.js $R/
cp /tmp/claude-0/-home-claude/7190d527-2f1c-59f4-b4eb-89b05f406470/scratchpad/rig2309/dados2/webhook.segredo $R/dados/
ln -sfn /home/claude/balao2026/whatsapp-server/node_modules $R/node_modules

# 1. Evolution falsa (portas 4598/4599)
cd $R && nohup node fakes.js > $R/fakes.log 2>&1 &
sleep 1

# 2. Servidor real do WhatsApp (porta 4100), falando com a Evolution falsa
DATA_ROOT=$R/dados WHATSAPP_PANEL_PORT=4100 \
EVOLUTION_URL=http://localhost:4598 EVOLUTION_API_KEY=teste EVOLUTION_INSTANCIA=loja \
SITE_URL=http://localhost:3100 WHATSAPP_PANEL_ALLOWED_ORIGIN=http://localhost:3100 \
VERSAO=bancada \
nohup node /home/claude/balao2026/whatsapp-server/servidor.js > $R/servidor.log 2>&1 &

# 3. Site real (porta 3100), apontando para o servidor local
cd /home/claude/balao2026
PAINEL_PASSWORD=$SENHA \
NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL=http://localhost:4100 \
nohup npx next start -p 3100 > $R/site.log 2>&1 &

sleep 8
echo "servidor: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4100/health)"
echo "site    : $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/crm)"
