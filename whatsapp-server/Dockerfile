FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV WHATSAPP_PANEL_PORT=4100
EXPOSE 4100

CMD ["npm", "run", "start"]
