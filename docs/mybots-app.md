# Landing do app MyBots (`/mybots-app`)

Página de divulgação do aplicativo **MyBots** (bots de IA no celular). O app e o uso são grátis.
O visual segue o mockup aprovado: fundo roxo/ciano, botão verde de APK, celular, comercial e três cards.

Não confundir com:

- `/mybots` — Hub MyBots no PC do Thiago, via rewrite para o túnel Cloudflare (`next.config.ts`,
  `afterFiles`). Essa rota não tem página neste repositório. Não criar `app/mybots/` nem
  `public/mybots/`, senão o arquivo local passa na frente do rewrite.
- `/apk` — outro aplicativo, o da loja (desconto no Pix). Ver `docs/app-mobile.md`.

## Onde está

- `app/mybots-app/page.tsx` — a página. Fica fora do menu, do rodapé e do WhatsApp da loja
  (`isPaginaDeVendas` em `components/LayoutWrapper.tsx`).
- `public/downloads/MyBots.apk` — o aplicativo. O botão usa `<a href="/downloads/MyBots.apk" download="MyBots.apk">`.
  O cabeçalho desse arquivo (`Content-Type` de APK e `Content-Disposition`) está em `next.config.ts`.
- `public/mybots-app/comercial.mp4` — comercial das amebas (narração atual). O player
  (`app/mybots-app/PlayerDoComercial.tsx`) tem `controls` e `playsinline`. A primeira
  passagem toca com som, quando a pessoa dá play. Ao terminar, volta sozinho, em loop e sem som.
- `public/mybots-app/poster.jpg` — quadro do comercial, antes de dar play.

Para trocar o APK ou o vídeo, substitua esses arquivos (mesmo nome) e publique. Não aponte o botão
para `/mybots`.
