# Chácara 3D — fonte da página `/chacara3d`

Passeio em 3D pelo terreno do Thiago (60 × 10 m) como ele fica pronto: a
vilinha de três sobrados com mirante no teto (dá para entrar neles e subir pela
escada caracol de fora até o deck), o gramado com o pomar, a
piscina com a hidro e a cascata, a churrasqueira coberta, o deck com o laguinho
das carpas e o cineminha no muro. Anda-se com W A S D; tem dia e noite, foto,
gravação da caminhada com vídeo renderizado e o cineminha passando vídeo do
computador ou do YouTube. Cachorros, galinhas, galo, carpas, passarinhos,
borboletas e vaga-lumes se mexem sozinhos. No menu há **cenários com gente**
(festa de aniversário, reunião no cineminha à noite, trabalhadores, festa na
piscina com churrasco, rave lotada) e o **plano de iluminação noturna** com
projeção mapeada nas árvores, no muro da piscina, nos portões e nas paredes
laterais dos sobrados.

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
| `js/casas.js` | Portas de entrada dos sobrados (abrem quando se chega perto ou com E), ventiladores de teto e luzes de dentro: são ~45 pontos de luz, então 6 luzes de verdade revezam entre os mais próximos e o resto da casa recebe um brilho quente no shader (`uLuzCasa`). |
| `js/projecoes.js` | Plano de iluminação noturna: 10 projetores (mangueira, jabuticabeira, coqueiros, amendoeira, muro da piscina, os dois portões e as paredes lisas dos três sobrados) lançam um ladrilho de um atlas 2048×1536 sobre o que estiver no tronco de visão de cada um (bloco `PROJECAO` em `materiais.js`). Em superfície plana o tronco é fora do eixo, encaixado na parede. Menu por lugar: animação, cor de luz, vídeo do computador ou YouTube (só nos planos, por um "furo" como no cineminha). Também fornece as telas de LED/cinema dos cenários e um projetor de palco. |
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
  `z` para cima; o quintal de baixo fica em `z = -1`. Os sobrados da vilinha (função
  `sobrado`, ver abaixo) são ocos e mobiliados; o que barra a passagem, os pisos, a
  escada caracol, as portas, as luzes, os ventiladores, os lugares de entrada e as
  paredes de projeção saem em `EXTRA` e vão para o `terreno.json` (chave `extra`).
- `teste_sobrados.py` — conferência rápida do `terreno.json` publicado, sem Blender
  (`python3 teste_sobrados.py [terreno.json]`): degraus da escada de dentro, vão da
  laje, caracol no nível do deck e o caminho porta → sala → escada → hall → quartos e
  banheiros (grade de 5 cm, raio de 0,27, como o passeio anda).
- `export_rt.py` — versão leve para o navegador: copas de "cachos" de folhas
  com textura, folhas em tira e frondes dos coqueiros com coordenadas de textura,
  troncos com casca; sem as galinhas e carpas de enfeite (no passeio elas são animadas).
- `render.py` e `annotate.py` — as imagens do álbum (`python build.py`, que salva
  `chacara.blend`, e depois `python render.py piscina_tropical --res 1440 --samples 24 --out ../saida`).

### Os sobrados da vilinha

Pedido do Thiago: casas de 42 m², 7 × 3 m embaixo e 7 × 3 m em cima; embaixo sala,
cozinha e banheiro; em cima um quarto de casal, um com beliche e um banheiro para os
dois; tudo moderno; e no lugar do telhado um mirante (deck com teto verde para ver as
estrelas) a que se sobe por uma escada do lado de fora.

- **Onde**: azul em x 4,5–11,5 × y 0–3 (caracol a oeste), amarela em x 16,5–23,5 × y 0–3
  (caracol a leste), verde em x 8,5–15,5 × y 7–10 (caracol a leste). A ponta sem
  caracol ("ponta lisa", sem nenhuma abertura) da azul e da amarela dá para a pracinha
  (x 11,5–16,5, jabuticabeira em (14,0; 2,2) e banco de cumaru no muro em x 11,95–13,45);
  as três estão em `EXTRA['paredes_projecao']` para a projeção mapeada.
- **Coordenadas locais** (`Casa` no `build.py`): `u` ao longo do muro, 0 na ponta lisa e 7 na
  ponta do caracol; `d` do muro (0) à fachada (3). A azul é espelhada (X = 11,5 − u).
  Dentro, `iu`/`id` contam da face interna das paredes (u = iu + 0,12).
- **Níveis**: piso do térreo 0,10; laje 2,72–2,90; piso de cima 2,90; forro 5,45; laje do
  teto até 5,63; deck 5,75; platibanda até 5,90; guarda-corpo de vidro até 6,85.
  Paredes de fora 0,12, divisórias 0,08.
- **Térreo**: sala (painel ripado com TV de 58" e rack suspenso debaixo do lance 2,
  sofá compacto de 1,37 m sob a janela, mesa de centro baixa, tapete, luminária em arco,
  ventilador), hall da porta pivotante (0,95 × 2,25, na cor da casa), banheiro
  (box de vidro com perfil preto, chuveiro de teto, nicho, bacia suspensa, cuba de apoio
  em bancada de carvalho, espelho redondo com LED, exaustor, porta de correr aberta) e
  cozinha em L sem puxador (laca grafite e quartzo, torre de forno e micro-ondas,
  cooktop de vidro com depurador, aéreos de carvalho com LED, cuba sob a janela da ponta,
  torneira gourmet preta, geladeira inox, mesa redonda de 0,90 com três cadeiras).
- **Escada de dentro** em L, degraus flutuantes de cumaru (5 cm) com LED embaixo, espelho
  de 0,175 e pisada de 0,264: lance 1 junto à ponta lisa (sobe da frente para o fundo,
  primeiro degrau maciço e comprido para subir de lado pela sala), patamar no canto do
  fundo a 1,50 e lance 2 junto ao fundo, chegando a 2,90 em iu 2,70. Vidro no lado aberto
  (o do lance 2 morre no forro da sala), corrimão de inox na parede.
- **Em cima**: o vão da escada é fechado por drywall e por um vidro fixo do lado da
  beliche. Quarto da beliche (beliche de aço preto e carvalho, guarda-roupa,
  escrivaninha suspensa sob a janela), hall com pendente, banheiro dos dois quartos
  (box no canto da frente, bacia, bancada com cuba e espelho redondo, janelinha alta
  jateada) e quarto de casal (painel ripado do piso ao forro, cabeceira estofada, cama
  com colchão de 1,38 × 1,88, criados-mudos suspensos com pendentes, split, guarda-roupa,
  TV na parede do banheiro, porta-janela com guarda-corpo de vidro e cortinas,
  janela na ponta, ventilador). Portas de dentro de correr, abertas.
- **Mirante**: deck de cumaru, canteiros de aço corten de 0,45 m no fundo e na ponta lisa
  (moreia, xanadu, alpínia, bromélia, florzinhas; trepadeira pendendo pela frente e pelo
  fundo), fita de LED na base dos canteiros, duas espreguiçadeiras viradas para a frente,
  mesinha, pufes, tapete e uma luneta no canto da frente do lado do caracol.
- **Escada caracol** de aço preto com degraus de cumaru: centro a 1,05 m da ponta, raio de
  0,08 a 0,98, 33 degraus de 30° e espelho 5,75/33. O último fica no nível do deck,
  apontando para a casa, e o primeiro fica virado para o gramado; para isso o giro é
  horário na amarela e anti-horário na azul e na verde (as duas são espelhadas).
  Corrimão helicoidal com balaústres, aberto só na entrada e na saída, e uma grade no
  fim do último degrau. A colisão do caracol é do passeio (`EXTRA['espirais']`), sem caixas.
- **Fachada**: reboco branco, pórtico na cor da casa em volta da porta, moldura saliente
  na cor da casa em volta da porta-janela do casal, brise de ripas de cumaru no andar de
  cima, caixilhos pretos, floreira de metal sob a janela da sala, arandela, friso preto
  na altura da laje. Varal de luzes em zigue-zague entre as fachadas a 2,6 m.
- **Poda**: no fim do `build.py`, `podar()` tira as folhas e os galhos das árvores grandes
  (mangueira, coqueiro, goiabeira, bananeira…) que entrariam no cilindro de cada caracol
  ou no volume de cada casa, e as folhas de trepadeira que atravessariam as paredes.
- **`extra` no `terreno.json`**: `pisos` `[x0, x1, y0, y1, z]` (toda superfície onde se pisa,
  com os degraus e o patamar da escada de dentro; os do caracol não); `espirais`
  `{casa, cx, cy, r0, r1, n, espelho, z0, ang0, passo}` (degrau i de `ang0 + i·passo` a
  `ang0 + (i+1)·passo`, topo em `z0 + (i+1)·espelho`); `colisores` `[x0, x1, y0, y1, z0, z1]`
  (barram quando cruzam a faixa [pé + 0,35; pé + 1,7]); `portas` (só as três de entrada);
  `luzes` `{p, cor, forca, alcance, casa, andar (0, 1, 2), comodo}`; `ventiladores`;
  `lugares` `[nome, x, y, rumo, z do pé]` (entrada e mirante de cada casa); `casas`
  `{nome, x, y, piso, z1, teto, deck, frente}`; `paredes_projecao`
  `{nome, x0, x1, y0, y1, z0, z1, normal}`.
- **O que o passeio ainda precisa acompanhar** (`js/`): o chão em vários níveis (escolher o
  piso mais alto que não passe de pé + 0,5, em vez do primeiro da lista); a colisão e o
  chão do caracol a partir de `espirais`; a luz de ambiente menor dentro das casas
  (`materiais.js` só baixa abaixo de 3,35 m de altura; agora vai até o forro, 5,45); os
  círculos e caixas fixos de `mundo.js` que ficaram nas posições antigas (jabuticabeira
  em (11,3; 2,3), goiabeira em (16,9; 8,0), limoeiro em (22,6; 1,9) e o banco em
  x 12,6–14,1), que agora caem dentro da casa azul, no primeiro degrau do caracol da verde e
  na cozinha da amarela (os troncos e o banco novos já vão em `colisores`), e os passarinhos
  de `som.js`, que cantam nessas mesmas posições antigas; e a porta de
  entrada, que o `casas.js` desenha com dobradiça e almofadas (o modelo pede pivotante lisa).

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
- **Interior dos sobrados** segue o pedido do Thiago (sala, cozinha e banheiro embaixo;
  casal, beliche e banheiro em cima); os móveis são proposta e mudam em `sobrado` no `build.py`.
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
