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
- `tools/unpack.mjs` abre o pacote publicado de volta em `build/pack/`. `tools/thiago/` refaz o avatar do presidente a partir de uma foto.
- `tools/multi.mjs`, `tools/soak2.mjs`, `tools/interact2.mjs`, `tools/mobile.mjs` testes em Chromium sem tela.

## O avatar do Thiago Herrera

O presidente não é um avatar de prateleira: é o `Business_Male_02` do Rocketbox
refeito a partir de uma foto de referência dele (`tools/thiago/`):

- rosto da foto projetado na textura da cabeça, tom de pele do rosto levado para
  pescoço, orelhas e mãos, barba continuada nas laterais e sob o queixo;
- formato da cabeça pelo contorno da foto (parte de baixo do rosto mais larga,
  cabelo mais baixo), pescoço mais grosso, porte mais forte;
- terno marinho mais vivo e gravata marinho lisa.

Para refazer (trocar a foto, ajustar o porte):

```bash
cd office3d
npm install
node tools/unpack.mjs                 # abre o pacote publicado em build/pack/
mkdir -p build/thiago/model
# foto frontal, boca fechada, luz uniforme -> build/thiago/foto.png
# (a usada veio de C:\Users\user\balao-content-factory\avatar\figurinos\12_terno_marinho.png)
# modelo de pontos do rosto (MediaPipe) -> build/thiago/model/face_landmarker.task
#   https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
pip install mediapipe opencv-python scipy numpy
sh tools/thiago/build.sh 1.0 1.18     # 1º número: quanto do formato do rosto; 2º: quanto do porte
ONLY='^(img/|an/|av/(Thiago_Herrera|Business_Male_0[2567]|Business_Female_0[1234]|Male_Adult_04|Female_Adult_15|Female_Adult_02)/)' node tools/bundle.mjs build/assets.bin
npm run site
```

A foto de referência não fica no repositório; o que vai para o site é só a
textura já aplicada, dentro do pacote de modelos.

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
