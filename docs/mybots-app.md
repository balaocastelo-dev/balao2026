# Landing do MyBots (`/mybots-app`, www.soubots.com)

Página de apresentação do **MyBots**. O endereço oficial é **https://www.soubots.com**.
`soubots.com` (sem www) e `www.soubots.com` abrem esta landing na raiz `/`. A regra está em
`proxy.ts` (`ehHostSoubots` em `lib/soubots.ts`): os dois hosts, e só o caminho `/`.
www.balao.info continua a loja na raiz e a mesma landing em `/mybots-app`, com o canonical
apontando para o www.

Não confundir com:

- `/mybots` — Hub MyBots, via rewrite para o túnel Cloudflare (`next.config.ts`, `afterFiles`).
  Essa rota não tem página neste repositório. Não criar `app/mybots/` nem `public/mybots/index.html`.
  A única exceção é `public/mybots/videos/`: os mp4 e os pôsteres da landing. Um arquivo
  solto nessa pasta não cobre o endereço `/mybots` do Hub.
- `/app` — o mesmo Hub, só nos hosts `soubots.com` e `www.soubots.com` (`rewritesDoPainel` em
  `lib/soubots.ts`, `beforeFiles`). O Hub não recebe o prefixo `/app`. Não redirecionar `/app`.
- `/apk` — outro aplicativo, o da loja. Ver `docs/app-mobile.md`.

A página não leva menu, rodapé nem botão da loja (`isPaginaDeVendas` em
`components/LayoutWrapper.tsx`, e `html.soubots-raiz` em `app/globals.css`).
Não há telefone nesta landing.

## Textos

Title, description, H1 e seções vêm de `lib/mybots-landing.ts` (primeira opção de title e de
meta description). O JSON-LD é `SoftwareApplication` + `FAQPage`, **sem** `offers` e sem valor.
A pergunta de valor não entra no FAQ. O title da página é absoluto, para não ganhar o sufixo
da loja (`| Balão da Informática`).

O botão **Entrar** (topo) e **Entrar com Google** vão para `URL_PAINEL`
(`https://www.soubots.com/app`).

## Downloads

- **Android:** `public/downloads/MyBots.apk` (pacote `info.balao.mybots`). O botão usa
  `URL_APK` (`/downloads/MyBots.apk`). O cabeçalho `Content-Type` de APK está em `next.config.ts`.
- **Windows:** o botão usa `URL_INSTALADOR_WINDOWS` (`/downloads/MyBots-Setup.exe`).
  Esse caminho redireciona (307) para `URL_RELEASE_WINDOWS`, a Release
  `mybots-windows-1.0.0` deste repositório, arquivo `MyBots-Setup.exe`. A URL está em
  `ARQUIVOS_PUBLICADOS`, então a página oferece o download. O `.exe` não fica em `public/`:
  o instalador do Electron é grande e o file tracer já levou `public/` para dentro da função
  `/mybots-app` (limite de 250 MB). A release `app-build-3` continua sendo o APK da loja
  (`balao-da-informatica.apk`), outra coisa.

  O app em si está em `mybots-desktop/`. Conferido em 04/11/2026: `balaocastelo-dev/Mybots`
  não tem Electron, Tauri nem NSIS. Lá existem o app Android (WebView) e os scripts
  `scripts/open-mybots.ps1` / `abrir-mybots.ps1`, que abrem o Chrome ou o Edge com `--app`.
  Por isso o instalador novo é uma janela Electron (alvo NSIS do electron-builder) que abre
  `https://www.soubots.com/app`, com o ícone do MyBots (`public/mybots-app/logo.png`) na
  barra de tarefas e atalhos na área de trabalho e no menu Iniciar. Não entra segredo,
  chave nem variável de ambiente no pacote. Para gerar de novo, no Linux com Wine:
  `cd mybots-desktop && npm ci && npm run dist:win`. O arquivo sai em
  `mybots-desktop/dist/MyBots-Setup.exe`. Publicar é subir esse arquivo na Release
  `mybots-windows-1.0.0` (ou apontar `URL_RELEASE_WINDOWS` para a Release nova).

## Vídeos

Componente leve: `app/mybots-app/VideoLeve.tsx` (mp4 e webm, mudo, `playsinline`, `preload="none"`,
poster, fonte só quando o quadro chega perto da tela). O fundo do hero é
`app/mybots-app/VideoFundoHero.tsx`: loop, mudo, `playsinline`, poster `00_hero_poster.jpg`.
`prefers-reduced-motion` não dá play sozinho.

Os arquivos finais estão em `public/mybots/videos/`. O hero usa o mp4 em loop, mudo e
`playsinline`, com o pôster `00_hero_poster.jpg`. Os quatro de baixo usam `preload="none"`,
o pôster e só baixam a fonte quando o quadro chega perto da tela. Webm entra se a URL
(`slot.webm`) estiver em `ARQUIVOS_PUBLICADOS`. Sem o mp4 e sem o webm, a seção mostra o
quadro “Vídeo em preparação”.

| Ordem | Onde | Arquivos |
| --- | --- | --- |
| 1 | Fundo do hero | `00_hero_loop.mp4`, `00_hero_poster.jpg` |
| 2 | Logo abaixo do hero | `01_documentario.mp4`, `01_documentario_poster.jpg` |
| 3 | Seção Conheça os bots | `02_equipe_de_bolso.mp4`, `02_equipe_de_bolso_poster.jpg` |
| 4 | Seção O dia que sobrou | `03_dia_que_sobrou.mp4`, `03_dia_que_sobrou_poster.jpg` |
| 5 | Perto dos downloads | `04_antes_e_depois.mp4`, `04_antes_e_depois_poster.jpg` |

O comercial antigo continua em `public/mybots-app/comercial.mp4` e não entra nesses slots.

## Amebas e parallax

As quatro figuras em `public/mybots-app/amebas/` são as amebas oficiais do MyBots
(`packages/ui/public/amebas/v2/`, números 001, 042, 065 e 092), reduzidas para WebP.
No computador elas acompanham a rolagem nas bordas (`app/mybots-app/Cenario.tsx`).
No celular ficam duas no hero. O parallax é a variável CSS `--rolagem`.
Com `prefers-reduced-motion: reduce`, nada disso se move.

## Onde está o código

- `app/mybots-app/page.tsx` — a página. Fonte Outfit em arquivo
  (`outfit-latin-wght-normal.woff2`, via `next/font/local`). Não usar `next/font/google`.
- `lib/mybots-landing.ts` — textos, slots, botões e JSON-LD. Reexporta os endereços
  do instalador.
- `lib/mybots-windows.ts` — `URL_INSTALADOR_WINDOWS` e `URL_RELEASE_WINDOWS`. Sem alias,
  porque o `next.config.ts` importa daqui.
- `lib/mybots-arquivos.ts` — lista fechada (`ARQUIVOS_PUBLICADOS`) do que a landing pode
  citar. Não usa `fs` nem `process.cwd()`: isso puxava `public/` inteira para a função.
- `mybots-desktop/` — app Electron e o alvo NSIS. O `.exe` gerado não entra no Git.
- `lib/soubots.ts` — hosts, `URL_PAINEL` e o rewrite de `/app`.

## Tamanho da função na Vercel

O deploy de produção depois do merge do PR #122 falhou: a função `mybots-app` ficou com
282,07 MB descompactados, acima do limite de 250 MB. A causa era
`existsSync(path.join(process.cwd(), "public", url))` em `lib/mybots-arquivos.ts`. O
caminho variável faz o file tracer incluir a pasta `public/` (vídeos, apk, imagens).

A correção tem duas partes, sem `VERCEL_SUPPORT_LARGE_FUNCTIONS`:

1. A landing não lê mais o disco. Os mp4, pôsteres e o APK continuam em `public/` e são
   servidos como arquivos estáticos.
2. `outputFileTracingExcludes` em `next.config.ts` tira `./public/**/*` da rota
   `/mybots-app`.

Medido em `npx next build --webpack`, somando os arquivos de
`.next/server/app/mybots-app/page.js.nft.json`:

| | Total | De `public/` | Arquivos de `public/` |
| --- | ---: | ---: | ---: |
| Antes | 294,96 MB | 289,62 MB | 1212 |
| Depois | 5,34 MB | 0 | 0 |

O número que a Vercel mostrou no deploy (282,07 MB) é a mesma função, medida por eles.
Os vídeos e o APK continuam no HTML da página, servidos de `public/`.

A landing não publica telefone nem link de conversa. O botão flutuante da loja não entra em `/mybots-app`.
