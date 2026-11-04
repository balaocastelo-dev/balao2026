# Landing do app MyBots (`/mybots-app`)

Página de divulgação do aplicativo **MyBots** (bots de IA no celular). O app e o uso são grátis.
O visual segue o mockup aprovado: fundo roxo/ciano, botão verde de APK e o comercial.
A página explica as funções com telas reais do produto (dados de exemplo, sem cliente e sem chave)
e repete dois caminhos: baixar o APK e chamar no WhatsApp (19) 98751-0267.

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
- `public/mybots-app/comercial.mp4` — comercial com a narração atual (cerca de 57 s). O player
  (`app/mybots-app/PlayerDoComercial.tsx`) tem `controls` e `playsinline`. A primeira
  passagem toca com som, quando a pessoa dá play. Ao terminar, volta sozinho, em loop e sem som.
- `public/mybots-app/poster.jpg` — quadro do comercial, antes de dar play.
- `public/mybots-app/logo.png` — logo oficial do app (ameba de cartola), copiado de
  `packages/ui/public/icon-256.png` do repositório Mybots. O favicon da rota usa o mesmo desenho
  (`app/mybots-app/icon.png` e `apple-icon.png`).
- `public/mybots-app/telas/` — prints da interface real (`packages/ui`), com bots de exemplo
  (Pixel, Ana, Heitor, Gerente Geral). Para refazer, rode a UI com dados fictícios e substitua
  o jpg de mesmo nome.

Para trocar o APK ou o vídeo, substitua esses arquivos (mesmo nome) e publique. O caminho do vídeo
está nas constantes `VIDEO` e `POSTER` de `app/mybots-app/page.tsx`. Não aponte o botão para `/mybots`.

## soubots.com

`soubots.com` e `www.soubots.com`, quando ligados neste projeto da Vercel, abrem esta landing
na raiz `/`. A regra está em `proxy.ts` (`ehHostSoubots` em `lib/soubots.ts`): só esses dois
hosts, e só o caminho `/`. www.balao.info continua a loja na raiz e a landing em `/mybots-app`.
O menu, o rodapé e o WhatsApp da loja não aparecem nessa raiz (`html.soubots-raiz` em
`app/globals.css`).

O vídeo, as imagens e o APK usam caminho a partir da raiz (`/mybots-app/comercial.mp4`,
`/mybots-app/poster.jpg`, `/mybots-app/telas/…`, `/downloads/MyBots.apk`). Por isso carregam
no soubots.com sem um endereço diferente. Esses caminhos não são reescritos.
