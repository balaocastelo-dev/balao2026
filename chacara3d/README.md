# Chácara 3D — fonte da página `/chacara3d`

Passeio em 3D pelo terreno do Thiago (60 × 10 m) como ele fica pronto: a
vilinha de três casas container com terraço coberto no teto (dá para entrar nelas e
subir pela escada reta de fora até o terraço), o gramado com o pomar, a
piscina com a hidro e a cascata, a churrasqueira coberta, o deck com o laguinho
das carpas e o cineminha no muro. Anda-se com W A S D; tem dia e noite, foto,
gravação da caminhada com vídeo renderizado e o cineminha passando vídeo do
computador ou do YouTube. Cachorros, galinhas, galo, carpas, passarinhos,
borboletas e vaga-lumes se mexem sozinhos. No menu há **cenários com gente**
(festa de aniversário, reunião no cineminha à noite, trabalhadores, festa na
piscina com churrasco, rave lotada) e o **plano de iluminação noturna** com
projeção mapeada nas árvores, no muro da piscina, nos portões e nas paredes
laterais das casas container.

Não é página da loja: é um projeto pessoal dele hospedado no site. Por isso
leva `noindex` e não entra no sitemap nem no menu.

## Como está publicada

Arquivos prontos em `public/chacara3d/` e uma linha no `next.config.ts`
apontando `/chacara3d` para `public/chacara3d/index.html` (mesmo esquema do
Office 3D, `/3d`). Não usa o layout da loja nem o React.

| Onde | O que é |
|---|---|
| `index.html` | A interface (cartão de entrada, menu, avisos) e o mapa de importação do three.js. |
| `js/principal.js` | Liga tudo: carregamento, laço de quadros, caminhada, teclas, foto, vídeo, qualidade. |
| `js/pipeline.js` | O caminho da imagem: cena em HDR com antisserrilhado, oclusão de ambiente (SSAO), água, brilho e o tom de filme (AgX) com saturação e vinheta. |
| `js/ceu.js` | Céu físico (espalhamento de Preetham) com nuvens, estrelas e lua; posição do sol para Campinas em outubro; sol/luar com sombra; luz de ambiente refeita quando o sol anda. |
| `js/materiais.js` | Materiais físicos com as texturas, e os remendos de shader: vento nas plantas, translucidez das folhas, sombra das nuvens, cáusticas no fundo da água, luz de ambiente menor dentro das casinhas. |
| `js/mundo.js` | Lê o modelo exportado, monta as malhas, o chão de fora, o que barra a passagem e a altura do chão. |
| `js/grama.js` | Grama de verdade (folhinhas desenhadas pela placa de vídeo em volta de quem anda), com vento e pisadas. |
| `js/agua.js` | Piscina, hidro e laguinho (ondinhas, refração, cor pela profundidade, reflexo, brilho do sol, espuma), cascata, respingos, bolhas e ninfeias. |
| `js/casas.js` | Portas de entrada das casas (de vidro com caixilho branco; abrem quando se chega perto ou com E), ventiladores de teto (se o modelo tiver) e luzes de dentro e do terraço: são ~27 pontos de luz, então 6 luzes de verdade revezam entre os mais próximos e o resto da casa recebe um brilho quente no shader (`uLuzCasa`). |
| `js/projecoes.js` | Plano de iluminação noturna: 10 projetores (mangueira, jabuticabeira, coqueiros, amendoeira, muro da piscina, os dois portões e as paredes lisas das três casas container) lançam um ladrilho de um atlas 2048×1536 sobre o que estiver no tronco de visão de cada um (bloco `PROJECAO` em `materiais.js`). Em superfície plana o tronco é fora do eixo, encaixado na parede. Menu por lugar: animação, cor de luz, vídeo do computador ou YouTube (só nos planos, por um "furo" como no cineminha). Também fornece as telas de LED/cinema dos cenários e um projetor de palco. |
| `js/projecoes_anim.js` | As animações dos projetores (26: carpas, ondas, fogo, aurora, galáxia, folhas, borboletas, neon, chuva de luz, cachoeira, mandala, vaga-lumes, aniversário, boas-vindas, equalizador, flashes, fogos, corações e oito cores de luz de jardim), todas procedurais. |
| `js/cenarios.js` | Os cinco cenários: pessoas (`pessoas/`), adereços (`cenarios/`), comportamento (rodas de conversa, passeio, dança no tempo da música, trabalho), hora do dia, luzes de palco (fachos das cabeças móveis, lasers), fumaça da grelha, burburinho e motor do cortador. Carrega os 9 MB de pessoas e adereços só na primeira vez que se escolhe um cenário. |
| `js/musica.js` | Música gerada no navegador e tocada pelas caixas de som do cenário: techno 128 bpm (rave), house tropical (piscina), pop alegre (aniversário) e a melodia do "Parabéns" com palmas e coro. Informa a batida para a dança, as luzes e as projeções. |
| `js/bichos.js` | Cachorros, galinhas e galo (modelos em `bichos/`), carpas, passarinhos, borboletas e vaga-lumes, cada um com seu comportamento. |
| `js/som.js` | Som gerado no navegador: água, passarinhos, grilos, sapos, fogueira, passos, galinhas, galo, latido. |
| `js/cinema.js` | Tela do cineminha (vídeo do computador ou YouTube atrás de um "furo" na imagem). |
| `vendor/three/` | three.js r170 (licença MIT) e os complementos usados (GLTFLoader, SkeletonUtils). |
| `dados/terreno.json` + `terreno.txt` | O modelo do terreno (formato 2, ver `modelo/export_rt.py`), a geometria em base64. |
| `tex/` | Texturas em WebP: superfícies (`superficies.json`), folhas e cascas (`folhas.json`). |
| `bichos/` | `cachorro.glb`, `galinha.glb`, `galo.glb` e `bichos.json` (animações, medidas, convenções). |
| `cenarios/` | `aderecos.glb` (2,75 MB) e `aderecos.json`: os 50 adereços dos cinco cenários (aniversário, cineminha, trabalho, piscina com churrasco, rave), um nó raiz por adereço. |
| `pessoas/` | `homem.glb`, `mulher.glb`, `crianca.glb` (6,1 MB juntos) e `pessoas.json`: corpos do MakeHuman (CC0) com 17 visuais de roupa, 33 animações e cores por máscara. Fonte em `chacara3d/pessoas/`. |

Endereço com `?q=0`, `?q=1` ou `?q=2` força a qualidade baixa, média ou alta
(sem isso: alta no computador, baixa no celular; se ficar lento ela baixa sozinha).

## Para refazer cada parte

### O terreno (medidas, plantas, casas)

Os scripts de `modelo/` rodam com o Blender como módulo de Python (`bpy`).

```bash
cd chacara3d/modelo
uv venv --python 3.11 ../.venv && . ../.venv/bin/activate
uv pip install bpy numpy pillow

python export_rt.py ../saida          # gera ../saida/terreno.bin e terreno.json
base64 -w0 ../saida/terreno.bin > ../../public/chacara3d/dados/terreno.txt
cp ../saida/terreno.json ../../public/chacara3d/dados/terreno.json
```

- `build.py` — o terreno inteiro. Medidas em metros: `x` do portão do gramado (0)
  ao portão de baixo (60), `y` do muro da piscina (0) ao muro da churrasqueira (10),
  `z` para cima; o quintal de baixo fica em `z = -1`. As casas container da vilinha (função
  `container`, ver abaixo) são ocas e mobiliadas; o que barra a passagem, os pisos, a
  escada de fora, as portas, as luzes, os ventiladores, os lugares de entrada e as
  paredes de projeção saem em `EXTRA` e vão para o `terreno.json` (chave `extra`).
- `teste_casas.py` — conferência rápida do `terreno.json` publicado, sem Blender
  (`python3 teste_casas.py [terreno.json]`): degraus da escada de fora (espelho até 0,20,
  um encostado no outro, o último no patamar) e os caminhos porta → hall → sala, cozinha,
  banheiro e quarto (raio de 0,20, como o passeio anda dentro de casa) e pé da escada →
  patamar → terraço (raio de 0,27), numa grade de 5 cm.
- `export_rt.py` — versão leve para o navegador: copas de "cachos" de folhas
  com textura, folhas em tira e frondes dos coqueiros com coordenadas de textura,
  troncos com casca; sem as galinhas e carpas de enfeite (no passeio elas são animadas).
- `render.py` e `annotate.py` — as imagens do álbum (`python build.py`, que salva
  `chacara.blend`, e depois `python render.py piscina_tropical --res 1440 --samples 24 --out ../saida`).

### As casas container da vilinha

Pedido do Thiago (15/10/2026, com a foto de uma "casa container com terraço"): as três casas no
modelo container de um piso, com sala, cozinha, banheiro e quarto, e em cima um terraço todo
coberto por telhado metálico sobre pilares, a que se sobe por uma escada reta do lado de fora.
Antes (12/10) eram sobrados de 42 m² com mirante de teto verde e escada caracol; o histórico
está no git.

- **Medidas**: 7 × 3 m (a medida que ele deu para a vilinha; o container da foto tem 5,5 m),
  2,60 m de altura sobre sapatas de concreto de 10 cm. Piso de dentro a 0,25, forro a 2,55
  (pé-direito de 2,30), terraço a 2,76, guarda-corpo de 1,10 (o da foto tem 0,80, abaixo da
  norma), telhado a uns 5 m (face de baixo de 5,05 no muro a 4,95 na frente), beiral de 0,50 na
  frente e na ponta lisa. Escada de 0,80 (a da foto tem 0,60): 14 espelhos de 0,197 e pisada de
  0,23, sobe da frente para o fundo encostada na ponta da casa e chega a um patamar de 0,85 junto
  ao muro, no nível do terraço; o pé fica 0,84 à frente da fachada.
- **Onde**: azul em x 4,5–11,5 × y 0–3 (escada a oeste), amarela em x 16,5–23,5 × y 0–3 (escada a
  leste), verde em x 8,5–15,5 × y 7–10 (escada a leste). A ponta sem escada ("ponta lisa", sem
  abertura) da azul e da amarela dá para a pracinha (x 11,5–16,5, jabuticabeira em (14,0; 2,2) e
  banco de cumaru no muro); as três estão em `EXTRA['paredes_projecao']` para a projeção mapeada.
- **Coordenadas locais** (`Casa` no `build.py`): `u` ao longo do muro, 0 na ponta lisa e 7 na
  ponta da escada; `d` do muro (0) à fachada (3). A azul é espelhada (X = 11,5 − u). Dentro,
  `iu`/`id` contam da face interna das paredes (u = iu + 0,12).
- **Cores**: chapa ondulada trapezoidal de verdade (`Casa.chapa`, passo de 0,28 e 3,5 cm de
  fundo, crista no plano da parede para a projeção e o YouTube não ficarem atrás das ondas);
  colunas de canto, longarinas, corrimãos e testeira do telhado em outra cor. Azul = azul-marinho
  com amarelo (como na foto), amarela = amarelo com azul-marinho, verde = verde com amarelo.
  Janelas de 1,00 × 1,00 e porta de vidro de 0,80 × 2,00 com caixilho e requadro brancos.
- **Dentro** (proposta): hall na porta; quarto de casal na ponta lisa (cama 1,38 × 1,88 com
  cabeceira estofada, criado-mudo suspenso com pendente, guarda-roupa, split); banheiro no fundo
  (box de 1,42 × 0,85 com vidro fixo, bacia suspensa, bancada estreita com cuba e espelho redondo,
  porta de correr embutida); sala com painel ripado, TV e rack suspenso, sofá de dois lugares
  sob a janela e mesa de centro; cozinha linear na parede da escada (geladeira, cuba, cooktop de
  duas bocas, aéreos com LED, despenseiro). Sem ventilador de teto (o forro é baixo): split no
  quarto e na sala.
- **Terraço**: réguas de cumaru, guarda-corpo de barras horizontais pretas com corrimão na cor
  das quinas, mesa com quatro cadeiras (o lado da frente fica livre para passar), duas
  espreguiçadeiras na ponta lisa viradas para o gramado, vasos com areca, moreia, bromélia e
  xanadu, spots embaixo das terças.
- **Poda**: no fim do `build.py`, `podar()` tira folhas e galhos das árvores grandes que
  entrariam no volume de cada casa com o telhado e no da escada.
- **`extra` no `terreno.json`**: `pisos` `[x0, x1, y0, y1, z]` (dentro, soleira, degrau da porta,
  terraço, patamar e cada degrau); `colisores` `[x0, x1, y0, y1, z0, z1]` (barram quando cruzam a
  faixa [pé + 0,35; pé + 1,7]); `portas` (as três de entrada, com `estilo: 'vidro'`); `luzes`
  `{p, cor, forca, alcance, casa, andar (0 dentro, 2 terraço), comodo}`; `ventiladores` (vazio);
  `lugares` `[nome, x, y, rumo, z do pé]` (entrada e terraço de cada casa); `casas`
  `{nome, x, y, piso, teto, deck, frente, telhado}`; `escadas` `{casa, x, y}` (para o "onde
  estou"); `paredes_projecao` `{nome, x0, x1, y0, y1, z0, z1, normal}`; `espirais` (vazio).
- **Como o passeio usa isso** (`js/`): `mundo.js` escolhe o chão como o piso mais alto que não
  passe de pé + 0,5 (assim a escada reta sobe sozinha, degrau a degrau); dentro das casas o raio de
  quem anda cai para 0,20 m. `casas.js` desenha a porta de vidro e reveza 6 luzes de verdade entre
  os pontos de luz; `principal.js` faz a luz de ambiente baixar dentro das casas só até o forro
  (`uTopoCasa` = teto + 0,05), para o terraço em cima ficar com a luz de fora.

### As texturas

```bash
cd chacara3d/texturas
python3 superficies.py        # pedra mineira, tijolinho, madeira, reboco, pastilha, grama...
python3 folhagem.py           # cachos de folhas, folhas em tira, frondes, cascas
python3 converter_webp.py     # converte para WebP (a página só lê .webp) e apaga os JPG/PNG
```

Tudo é desenhado por código (nada baixado), com sementes fixas. `--revisao PASTA`
no `superficies.py` gera folhas de conferência.

### Os bichos

```bash
cd chacara3d/bichos
<python do Blender> bichos.py           # cachorro, galinha e galo -> public/chacara3d/bichos/
```

Corpo por campos de distância, esqueleto, pesos e animações próprios; as cores
vêm de máscaras (`COLOR_0`) que a página pinta (o segundo cachorro é preto e
branco com o mesmo modelo). Detalhes em `public/chacara3d/bichos/bichos.json`.

### As pessoas

Fonte, licenças (MakeHuman CC0 e captura de movimento da CMU) e como refazer em
`chacara3d/pessoas/README.md`.

### Os cenários e as projeções (conferir sem tela)

Pelo console da página (ou pelo Playwright), com `window.__chacara`:

```js
await __chacara.cenarios.ativar('rave')       // aniversario, cinema, trabalho, piscina, rave; null desliga
__chacara.cenarios.atual.pessoas.length        // quantas pessoas montou (a qualidade média põe 70%, a baixa 40%)
__chacara.projecoes.escolher('parede_azul', 'galaxia')   // id do lugar e da animação; 'youtube' com {url}
__chacara.irPara([x, y, rumo, altura]); __chacara.quadro(1); __chacara.snap()
```

Cada cenário escolhe a hora, a vista de entrada (`cn.vista`, longe de quem está parado), a música e
as projeções. Na rave, o projetor de palco (`projetorPalco`) só acende a face voltada para ele e
troca de cor a cada compasso; os fachos das cabeças móveis são aditivos e fracos de propósito
(fortes, viram cones sólidos). As pessoas ficam na camada 3 da câmera, fora do reflexo da piscina:
com elas no reflexo a festa na piscina custava o dobro.

### Os adereços dos cenários

```bash
cd chacara3d/cenarios
<python do Blender> aderecos.py                          # -> ../../public/chacara3d/cenarios/
<python do Blender> aderecos.py --so bolo,cabine_dj --saida /tmp/x   # só alguns
python3 conferir.py --saida PASTA                        # folha de contato, cenas e closes (Chromium sem tela)
```

- `base.py` (malhas por código: torno, tubo, fita, grade, caixa chanfrada), `materiais.py` (materiais e as
  texturas pequenas, desenhadas com PIL), um arquivo por cenário (`aniversario.py`, `cinema.py`, `trabalho.py`,
  `piscina.py`, `rave.py`) e `aderecos.py`, que exporta, enxuga o GLB (normais em 8 bits com
  `KHR_mesh_quantization`, sem UV onde não há textura) e escreve o `aderecos.json`.
- Convenções (também no json): metros, Y para cima, frente para +Z, origem no chão no centro da base;
  objetos de mão com a origem na pega e o eixo em +Y; filhos vazios `pega_d`/`pega_e`, `apoio`, `saida`,
  `lente`, `ponta_e`/`ponta_d`; cabeças móveis da treliça em `cabeca_movel_1..6` (pan) com `inclina_1..6` (tilt).
- Emissivos que o motor acende: `chama`, `led_som`, `led_cabine`, `lente_movel`, `tela_led` (UV de 0 a 1 na
  tela; textura de vídeo com `flipY = false`), `neon`. Cada cor de balão é um material (`balao_*`).
- `conferir.html` é a página de teste (GLTFLoader do three r170 de `public/chacara3d/vendor/three/`);
  `conferir.py` serve o repositório, abre no Chromium sem tela e falha se houver erro no console.

## Para não travar

No Windows o Chrome traduz os sombreadores para Direct3D, e cada programa demora.
A primeira versão realista tinha 201 programas e a página ficava minutos parada.
Hoje são 58, e todos ficam prontos antes do botão "Entrar" (nenhum novo ao andar):

- a chave do programa (`customProgramCacheKey` em `remendar`) leva só as opções que
  mudam o código; o que varia por material (força do vento, translucidez, cor) vai em
  `uniform`. Não pôr nome de textura nem número na chave;
- a sombra das nuvens é calculada uma vez por pixel, só no laço do sol;
- `prepararProgramas()` (em `principal.js`) compila com `compileAsync` já com o alvo HDR
  ligado e também a versão de sombra de cada objeto; bichos e água passam por ela;
- o reflexo da piscina corta pelo plano oblíquo da câmera (sem `clippingPlanes`, que
  dobraria os programas);
- texturas vêm pelo `ImageBitmapLoader` e sobem para a placa aos poucos (`initTexture`).

Para conferir: `window.__chacara.renderer.info.programs.length` e `window.__chacara.tempos`.

## O que vale saber

- **Medidas estimadas por foto.** Só são exatas as que o Thiago passou: terreno
  60 × 10 m, faixa do jardim com 80 cm, deck de 2 × 3 m a 1 m do chão.
- **Interior das casas** segue o pedido do Thiago (sala, cozinha, banheiro e quarto num
  container de 7 × 3 m); os móveis são proposta e mudam em `container` no `build.py`.
- **Lado do sol**: ainda não informado. Na página dá para escolher em
  "O sol nasce do lado"; o padrão é o muro da churrasqueira.
- **YouTube no cineminha e nas projeções** aparece ao vivo, mas não sai nas
  fotos nem no vídeo renderizado, fica sem som e não recebe a luz da cena. Vídeo do
  computador sai nos dois. Nas paredes, muro e portões o YouTube ocupa um retângulo 16:9
  centrado no projetor, na altura dos olhos (o YouTube não pode ser esticado como as
  animações); nas árvores só dá animação ou vídeo do computador.
- **Peso**: uns 31 MB na primeira visita (texturas 18 MB, terreno 11 MB, bichos 1,6 MB),
  mais 8,6 MB de pessoas e adereços na primeira vez que se liga um cenário.
- **Placa de vídeo**: na qualidade alta, pede uma placa de computador razoável;
  no celular a página começa na baixa (sem grama 3D, sem oclusão e sem pelo).
