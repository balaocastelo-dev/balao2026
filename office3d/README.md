# Office 3D — fonte da página `/3d`

O escritório virtual 3D da Balão da Informática. A página publicada mora em
`public/3d/` (arquivos prontos) e o `next.config.ts` aponta o endereço `/3d`
para `public/3d/index.html`. Ela não usa o layout da loja nem o React: é uma
página só, com o motor em three.js.

Esta pasta guarda o código de onde aqueles arquivos saem.

## Para mudar algo e republicar

```bash
cd office3d
npm install
npm run site        # recompila e copia o resultado para ../public/3d
```

Depois é só enviar a alteração (commit) — a Vercel publica.
Os modelos 3D (pessoas, animações, texturas) já estão compilados no arquivo
`public/3d/assets.<hash>.pack` e são reaproveitados; não é preciso refazê-los
para mexer em cenário, luz, câmeras, comportamento ou textos.

Outros comandos: `npm run dev` (página de desenvolvimento em
`http://localhost:8765/app/dev.html?pack=/caminho/do/assets.pack`, servindo a
pasta com os modelos) e `npm run desktop` (versão que abre por duplo clique,
sem servidor, em `dist/`).

## Onde está cada coisa

- `src/main.js` app: câmeras (visão geral, andar, tour, CFTV, maquete, cinemática da reunião), painéis, hora do dia, qualidade, eventos.
- `src/world.js` prédio, salas, móveis, postos, luminárias, impressora, rack. `src/furniture.js` móveis e objetos. `src/tex.js` texturas desenhadas.
- `src/agents.js` pessoas e rotinas (mãos no teclado e no mouse, olhar para a câmera). `src/nav.js` caminhos.
- `src/post.js` pós-processamento (HDR, oclusão de ambiente, brilho só das telas e LEDs, tom ACES, cor, tilt-shift, filtro CFTV).
- `src/daylight.js` luz por hora do dia. `src/audio.js` som ambiente gerado no navegador.
- `src/config.js` pessoas, cargos e textos. `src/manifest.js` animações usadas.
- `app/template.html` a página; `app/ui.css` o visual; `app/font.css` a fonte Inter embutida.
- `tools/build.mjs` builds (`dev`, `prod`, `web`). `tools/conv.mjs`, `tools/convert.html`, `tools/tex.py`, `tools/bundle.mjs` refazem o pacote de modelos a partir dos FBX do Microsoft Rocketbox (só se for trocar pessoas ou animações).
- `tools/multi.mjs`, `tools/soak2.mjs`, `tools/interact2.mjs`, `tools/mobile.mjs` testes em Chromium sem tela.

## É uma simulação

O que as pessoas fazem, os status e o conteúdo das telas são encenados. A
página já sabe receber avisos reais:

```js
window.Office3D.event({ type: "pedido", titulo: "#1234 · Notebook" })
window.Office3D.event({ type: "servidor", carga: 0.95 })   // ou { status: "ok" }
window.Office3D.event({ type: "mensagem", agente: "julia", texto: "..." })
```

ou por `postMessage({ office3d: {...} })`, ou consultando de tempos em tempos
um endereço que devolva uma lista desses avisos (`config.events = { url, intervalo }`).
Esse endereço ainda não existe: precisa ser uma rota do lado do servidor, que
fale com o Bling e com a VPS guardando as credenciais lá — nunca nesta página,
que é pública.

## Convenções

Metros, Y para cima, norte = −Z; yaw 0 olha para +Z. Assento = posição do
quadril sentado; a mesa fica 0,34 m à frente; as cadeiras rolam 0,5 m para trás
antes de a pessoa levantar.

## Créditos

Pessoas e animações: Microsoft Rocketbox Avatar Library (MIT). Motor: three.js
(MIT). Fonte Inter (SIL OFL). Nota de 100 dólares: domínio público (Wikimedia
Commons).
