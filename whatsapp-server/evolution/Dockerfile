# Evolution API 2.3.7 com o remendo da fila offline do Baileys.
#
# É a MESMA imagem oficial, com uma linha trocada dentro do Baileys 7.0.0-rc.9
# (o que travou o recebimento em 29/09 — remendar-baileys.cjs explica). Nada
# mais muda: mesmas variáveis, mesmos volumes, mesmo comando de partida.
#
# Conferido na imagem oficial (camadas baixadas do Docker Hub em 11/10/2026):
# o Dockerfile da tag 2.3.7 copia node_modules para /evolution/node_modules, o
# Baileys mora em /evolution/node_modules/baileys (uma cópia só) e o dist/ da
# Evolution faz require("baileys") — não embute o código. O script confere
# tudo isso de novo a cada build e FALHA se algo mudar.
FROM evoapicloud/evolution-api:v2.3.7

COPY remendar-baileys.cjs /tmp/remendar-baileys.cjs
RUN node /tmp/remendar-baileys.cjs /evolution && rm /tmp/remendar-baileys.cjs

LABEL balao.remendo="baileys-7.0.0-rc.9 fila offline com catch (igual ao rc10)"
