# Landing do MyBots (`/mybots-app`, www.soubots.com)

Página de apresentação do **MyBots**. O endereço oficial é **https://www.soubots.com**.
`soubots.com` (sem www) e `www.soubots.com` abrem esta landing na raiz `/`. A regra está em
`proxy.ts` (`ehHostSoubots` em `lib/soubots.ts`): os dois hosts, e só o caminho `/`.
www.balao.info continua a loja na raiz e a mesma landing em `/mybots-app`, com o canonical
apontando para o www.

Não confundir com:

- `/mybots` — Hub MyBots, via rewrite para o túnel Cloudflare (`next.config.ts`, `afterFiles`).
  Essa rota não tem página neste repositório. Não criar `app/mybots/` nem `public/mybots/`.
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
- **Windows:** ainda **não há** instalador publicado. Conferido em 04/11/2026 nos repositórios
  `balaocastelo-dev/balao2026` (public/, releases, workflows) e `balaocastelo-dev/Mybots`
  (releases, public/, workflows). A release `app-build-3` deste repo é o APK da loja
  (`balao-da-informatica.apk`), não o MyBots. No MyBots, `android-apk.yml` só gera APK de debug
  como artefato, e `scripts/install-hub.ps1` é script local. O botão aponta para a constante
  `URL_INSTALADOR_WINDOWS` (`/downloads/MyBots-Setup.exe`). Quando o arquivo existir, troque só
  essa constante — se for um caminho em `public/`, a página passa a oferecer o download e tira
  o aviso. Enquanto o arquivo não está lá, o botão continua no mesmo endereço e a página avisa
  que o instalador ainda não foi publicado.

## Vídeos

Componente leve: `app/mybots-app/VideoLeve.tsx` (mp4 e webm, mudo, `playsinline`, `preload="none"`,
poster, fonte só quando o quadro chega perto da tela). O fundo do hero é
`app/mybots-app/VideoFundoHero.tsx`: loop, mudo, `playsinline`, poster `00_hero_poster.jpg`.
`prefers-reduced-motion` não dá play sozinho.

Coloque os arquivos em `public/mybots-app/videos/` (pode ser só mp4, só webm, ou os dois):

| Ordem | Onde | Arquivos |
| --- | --- | --- |
| 1 | Fundo do hero | `00_hero_loop.mp4`, `00_hero_loop.webm`, `00_hero_poster.jpg` |
| 2 | Logo abaixo do hero | `01_documentario.mp4`, `01_documentario.webm`, `01_documentario_poster.jpg` |
| 3 | Seção Conheça os bots | `02_equipe_de_bolso.mp4`, `02_equipe_de_bolso.webm`, `02_equipe_de_bolso_poster.jpg` |
| 4 | Seção O dia que sobrou | `03_dia_que_sobrou.mp4`, `03_dia_que_sobrou.webm`, `03_dia_que_sobrou_poster.jpg` |
| 5 | Perto dos downloads | `04_antes_e_depois.mp4`, `04_antes_e_depois.webm`, `04_antes_e_depois_poster.jpg` |

Enquanto o mp4/webm não existe, a seção mostra um quadro (“Vídeo em preparação”). O comercial
antigo continua em `public/mybots-app/comercial.mp4` e não entra nesses slots.

## Amebas e parallax

As quatro figuras em `public/mybots-app/amebas/` são as amebas oficiais do MyBots
(`packages/ui/public/amebas/v2/`, números 001, 042, 065 e 092), reduzidas para WebP.
No computador elas acompanham a rolagem nas bordas (`app/mybots-app/Cenario.tsx`).
No celular ficam duas no hero. O parallax é a variável CSS `--rolagem`.
Com `prefers-reduced-motion: reduce`, nada disso se move.

## Onde está o código

- `app/mybots-app/page.tsx` — a página. Fonte Outfit em arquivo
  (`outfit-latin-wght-normal.woff2`, via `next/font/local`). Não usar `next/font/google`.
- `lib/mybots-landing.ts` — textos, slots, botões e JSON-LD.
- `lib/mybots-arquivos.ts` — confere se o arquivo já está em `public/`.
- `lib/soubots.ts` — hosts, `URL_PAINEL` e o rewrite de `/app`.
