# App do Balão (Android) + 15% a mais no Pix pelo app

Casca **Capacitor** que abre `https://www.balao.info` ao vivo. Não tem conteúdo
embutido: o que muda no site já aparece no app, sem reenviar nada.

## Como o app dá os 15%

- O app injeta `BalaoApp` no User-Agent (`app-mobile/capacitor.config.json` →
  `appendUserAgent`). É assim que a loja sabe, no navegador e no servidor, que a
  pessoa está dentro do app.
- O desconto **de verdade** é aplicado **no servidor**, no checkout
  (`app/api/checkout/route.ts`), lendo o header `User-Agent` — igual ao truque
  que a loja já usa para reconhecer o cron da Vercel. Mantém a regra de nunca
  confiar no preço vindo do cliente.
- Lógica central: **`lib/app-balao.ts`** (`MARCA_APP`, `DESCONTO_APP_PIX = 0.15`,
  `pedidoVeioDoApp`, `comDescontoApp`). Hook de cliente: `lib/useEhApp.ts`.
- Vitrine mostra o preço com −15% **só dentro do app**: `components/ProductCard.tsx`,
  página do produto (`components/SeloAppPix.tsx`) e resumo do carrinho
  (`app/cart/page.tsx`). Fora do app, nada muda.
- Regra do desconto: 15% sobre o preço Pix de cada produto (`preço × 0,85`), e
  **soma** com cupom, se houver. Piso em 0 e recálculo pelo banco garantem que
  nunca saia total negativo nem o valor que o cliente mandou. No pedido, quando
  é do app sem cupom, fica gravado `coupon_code = "APP15"`.

## Página de download

`/apk` (`app/apk/page.tsx`) — landing no padrão do DESIGN.md (carbono + vermelho
Balão) com o botão de baixar e a explicação do benefício. O botão aponta sempre
para a release mais nova:
`https://github.com/balaocastelo-dev/balao2026/releases/latest/download/balao-da-informatica.apk`

## Como o APK é gerado

GitHub Actions: **`.github/workflows/apk.yml`**. Roda ao mexer em `app-mobile/**`
na `main` (ou manualmente em Actions → "Build APK do app" → Run workflow).
Compila na nuvem e publica numa release com o arquivo `balao-da-informatica.apk`.
Usa o Android SDK pré-instalado do runner e o `capacitor.config.json` (sem
depender de TypeScript). O APK sai **assinado como debug** (instala por download;
dá pra fazer release assinado depois, se for para a Play Store).

Projeto do app: pasta `app-mobile/` (isolada do build do site via `tsconfig.json`
e `eslint.config.mjs`). Detalhes de build local em `app-mobile/README.md`.

## Limitações conhecidas

- A marca `BalaoApp` no User-Agent é tecnicamente burlável por alguém
  determinado — ótimo para desconto de marketing; dá para blindar mais no
  servidor depois, se precisar.
- Primeira instalação pede "permitir instalar deste app" no Android (normal para
  APK fora da Play Store).

Entregue em 2026-10-27 (PR #100). Commits de correção de CI depois do merge:
`754f8e7` (SDK do runner) e `b9227b0` (config .json).
