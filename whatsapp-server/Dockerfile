FROM node:20-bookworm-slim

# O whatsapp-web.js controla um Chrome de verdade (via Puppeteer). A imagem do
# Node nao traz navegador nem as bibliotecas de sistema que ele precisa, entao
# instalamos o Chromium do proprio Debian: e mais leve e mais estavel do que
# deixar o Puppeteer baixar o dele, e o server.js ja sabe usa-lo pelo CHROME_PATH.
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      ca-certificates \
      fonts-liberation \
      fonts-noto-color-emoji \
      tini \
    && rm -rf /var/lib/apt/lists/* \
    # Falha o build aqui se o navegador nao veio. Sem esta checagem, a imagem
    # subia "com sucesso" e o painel ficava em "disconnected" pra sempre, sem
    # QR Code e sem dizer o motivo — o erro so aparecia nos logs do container.
    && (test -x /usr/bin/chromium \
        || test -x /usr/bin/chromium-browser \
        || (echo "ERRO: nenhum Chromium instalado nesta imagem" >&2 && exit 1))

# Sem isso o npm install baixaria um segundo Chrome (~150 MB) que nao seria usado.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# Pasta da sessao do WhatsApp. Precisa de disco persistente: sem isso, todo
# restart do container pede QR Code novo.
RUN mkdir -p /app/.wwebjs_auth

ENV WHATSAPP_PANEL_PORT=4100
EXPOSE 4100

# tini garante que o processo do Chrome seja encerrado junto com o container,
# em vez de virar processo zumbi e comer a memoria da maquina.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
