# WhatsApp Panel Server

Servidor Node.js separado para o painel `www.balao.info/whatsapp`.

## Stack

- Node.js
- Express
- Socket.IO
- whatsapp-web.js
- qrcode
- LocalAuth

## Como usar

1. Instale as dependencias:

```bash
npm install
```

2. Configure as variaveis:

```bash
WHATSAPP_PANEL_PORT=4100
WHATSAPP_PANEL_ALLOWED_ORIGIN=http://localhost:3000
```

3. Rode o servidor:

```bash
npm run dev
```

4. No projeto Next, configure:

```bash
NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL=http://localhost:4100
```

## Observacao importante

Esse servidor precisa rodar em processo Node continuo para manter:

- sessao LocalAuth
- QR Code
- WebSocket / Socket.IO
- recebimento de mensagens em tempo real
- agendamento

Nao e uma implementacao pensada para rodar dentro de funcoes serverless da Vercel.
