# Deploy do Painel de WhatsApp

O painel `www.balao.info/whatsapp` depende de um servidor Node continuo.

## Por que o QR Code nao aparece na Vercel

O site em Next.js abre normalmente na Vercel, mas o QR Code so aparece quando o servidor do WhatsApp esta rodando em separado com:

- `whatsapp-web.js`
- `LocalAuth`
- `Socket.IO`
- processo Node permanente
- armazenamento local de sessao

Sem esse servidor, a tela mostra apenas `Aguardando servidor`.

## Estrutura

- Site Next: `www.balao.info/whatsapp`
- Servidor WhatsApp: pasta `whatsapp-server`

## Variaveis necessarias no site

```env
NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL=https://SEU-SERVIDOR-WHATSAPP.onrender.com
```

## Variaveis necessarias no servidor WhatsApp

```env
WHATSAPP_PANEL_PORT=4100
WHATSAPP_PANEL_ALLOWED_ORIGIN=https://www.balao.info
```

## Opcao 1: Render

O projeto ja tem um arquivo `render.yaml` pronto para subir o servico `whatsapp-server`.

Depois de subir no Render:

1. ajuste `WHATSAPP_PANEL_ALLOWED_ORIGIN`
2. pegue a URL publica do servico
3. configure `NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL` na Vercel
4. redeploy do site

## Opcao 2: VPS / Node

Na pasta `whatsapp-server`:

```bash
npm install
npm run start
```

## Gerar novo QR Code

Dentro da tela `/whatsapp` existe o botao:

- `Gerar novo QR`

Ele limpa a sessao local e reinicia a conexao para emitir um novo QR Code.

## Observacao importante

Para manter a sessao do WhatsApp viva, o servidor precisa ter disco persistente para a pasta:

- `.wwebjs_auth`

Sem persistencia, a sessao pode se perder a cada reinicio.
