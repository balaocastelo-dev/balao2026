# Evolution API 2.3.7 com dois ajustes, e só estes.
#
# 1. Baileys 7.0.0-rc13 no lugar do 7.0.0-rc.9 da imagem oficial. O rc.9 não
#    manda o tctoken; o recibo do WhatsApp volta com erro 463 e o CRM marca
#    "Falhou" (Baileys #2441, Evolution #2638). O rc13 manda.
# 2. O remendo da fila offline (apagão de 29/09, remendar-baileys.cjs). No
#    rc13 a correção já está em lib/Utils/offline-node-processor.js, então o
#    script vira no-op. Se a cópia ainda for o rc.9, ele aplica o catch. Se
#    não achar nem o trecho vulnerável nem o catch, o build falha e o
#    container que está no ar não é trocado.
#
# Quem recria o container é o dono, depois do merge. Este arquivo não faz deploy.
FROM evoapicloud/evolution-api:v2.3.7

WORKDIR /evolution
RUN npm install baileys@7.0.0-rc13 --no-save --no-audit --no-fund

COPY remendar-baileys.cjs /tmp/remendar-baileys.cjs
RUN node /tmp/remendar-baileys.cjs /evolution && rm /tmp/remendar-baileys.cjs

LABEL balao.baileys="7.0.0-rc13"
LABEL balao.remendo="fila offline: aplica no rc.9, no-op quando o catch já existe"
