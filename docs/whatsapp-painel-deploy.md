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
WHATSAPP_PANEL_ALLOWED_ORIGIN=https://www.balao.info,https://balao.info
```

`WHATSAPP_PANEL_ALLOWED_ORIGIN` aceita mais de uma origem separada por virgula
(o site responde em `balao.info` e `www.balao.info`).

## Onde hospedar (custo e passo a passo)

**Isso nao roda no plano gratuito do Render** — ele hiberna, nao tem disco
persistente e nao tem RAM para o Chrome. A opcao sem custo e rodar no PC da
loja com Cloudflare Tunnel.

As tres opcoes, com preco e passo a passo, estao em
**[hospedar-whatsapp-server.md](./hospedar-whatsapp-server.md)**:

- **PC da loja + Cloudflare Tunnel** — R$ 0, recomendada
- **Render** — plano `starter`, cerca de US$ 7/mes (o `render.yaml` ja esta pronto)
- **VPS** — cerca de R$ 25 a 40/mes

Para ligar no PC da loja, use o atalho `whatsapp-server/iniciar-servidor.bat`.

## Gerar novo QR Code

Dentro da tela `/whatsapp` existe o botao:

- `Gerar novo QR`

Ele limpa a sessao local e reinicia a conexao para emitir um novo QR Code.

## Observacao importante

Para manter a sessao do WhatsApp viva, o servidor precisa ter disco persistente para a pasta:

- `.wwebjs_auth`

Sem persistencia, a sessao pode se perder a cada reinicio.
