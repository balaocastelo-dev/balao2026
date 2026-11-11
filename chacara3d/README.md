# Chácara 3D — fonte da página `/chacara3d`

Passeio em 3D pelo terreno do Thiago (60 × 10 m) como ele fica pronto: a
vilinha de três casas de dois andares (dá para entrar nelas, subir a escada e sair na
varanda), o gramado com o pomar, a
piscina com a hidro e a cascata, a churrasqueira coberta, o laguinho de pedras com
cascata no pé do muro de arrimo do quintal de baixo e o cineminha no muro. Anda-se com W A S D; tem dia e noite, foto,
gravação da caminhada com vídeo renderizado e o cineminha passando vídeo do
computador ou do YouTube. Cachorros, galinhas, galo, carpas, passarinhos,
borboletas e vaga-lumes se mexem sozinhos. No menu há **cenários com gente**
(festa de aniversário, reunião no cineminha à noite, trabalhadores, festa na
piscina com churrasco, rave lotada) e o **plano de iluminação noturna** com
projeção mapeada nas árvores, no muro da piscina, nos portões e nas paredes
cegos (oitões) das casas da vilinha.

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
| `js/projecoes.js` | Plano de iluminação noturna: 10 projetores (mangueira, jabuticabeira, coqueiros, amendoeira, muro da piscina, os dois portões e os oitões cegos das três casas da vilinha) lançam um ladrilho de um atlas 2048×1536 sobre o que estiver no tronco de visão de cada um (bloco `PROJECAO` em `materiais.js`). Em superfície plana o tronco é fora do eixo, encaixado na parede. Menu por lugar: animação, cor de luz, vídeo do computador ou YouTube (só nos planos, por um "furo" como no cineminha). Também fornece as telas de LED/cinema dos cenários e um projetor de palco. |
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
  `z` para cima; o quintal de baixo fica em `z = -1`. As casas da vilinha (função
  `casa`, ver abaixo) são ocas e mobiliadas nos dois andares; o que barra a passagem, os
  pisos, os degraus da escada, as portas, as luzes, os lugares de entrada e as paredes de
  projeção saem em `EXTRA` e vão para o `terreno.json` (chave `extra`).
- `teste_casas.py` — conferência rápida do `terreno.json` publicado, sem Blender
  (`python3 teste_casas.py [terreno.json]`): a escada interna (14 degraus com espelho até
  0,20, um encostado no outro, o último encostado no piso de cima) e os caminhos da porta de
  entrada até a sala, a cozinha, o lavabo, o patamar, o quarto, o banheiro e a varanda,
  numa grade de 5 cm com o raio de 0,20 que o passeio usa dentro de casa.
- `export_rt.py` — versão leve para o navegador: copas de "cachos" de folhas
  com textura, folhas em tira e frondes dos coqueiros com coordenadas de textura,
  troncos com casca; sem as galinhas e carpas de enfeite (no passeio elas são animadas).
- `render.py` e `annotate.py` — as imagens do álbum (`python build.py`, que salva
  `chacara.blend`, e depois `python render.py piscina_tropical --res 1440 --samples 24 --out ../saida`).

### As casas da vilinha

Pedido do Thiago (09 a 10/11/2026): no lugar das três casas container, **três casas de dois andares**,
uma para cada filho, boas para hospedagem. Ele escolheu crescer de 20 para **24,8 m² por piso**
(6,20 × 4,00 m, ~50 m² por casa) para o quarto passar dos 9 m² que um dormitório precisa ter.
O histórico (tiny houses em 11/10, sobrados com mirante em 12/10, containers com terraço em 15/10)
está no git.

- **Orientação**: em 10/11 ele disse que o sol nasce no portão de baixo e se põe no portão do gramado.
  Logo o terreno corre leste–oeste e o muro `y = 0` é o sul. Por isso as três ficam **em fita nesse
  muro**: as fachadas olham para o norte (sol o dia inteiro) e a sombra cai no próprio muro, deixando
  o gramado livre. O passeio já abre com "o sol nasce do lado do portão de baixo".
- **Onde**: recuadas 1,50 m da divisa (dois pavimentos não encostam no muro) e com 1,80 m entre uma e
  outra — azul em x 3,0–9,2, verde em x 11,0–17,2, amarela em x 19,0–25,2, todas em y 1,5–5,5. Sobram
  os 6,4 m do fim do gramado (x 25,2–31,6), onde foram a pracinha da jabuticabeira com o banco de
  cumaru e o fogo de chão, e a faixa de 4,5 m na frente das casas, por onde passa a trilha de pisantes.
- **Medidas**: parede externa de 0,15 e divisória de 0,10 (interno 5,90 × 3,70). Piso do térreo a 0,20
  com pé-direito de 2,62; laje de 0,14; piso de cima a 2,96 com forro a 5,26. Telhado de duas águas,
  cumeeira paralela ao muro a 5,80, caimento de 27%, beiral de 0,60 (0,30 nos oitões), telha de barro.
- **Coordenadas locais** (`Casa` no `build.py`): `u` ao longo do muro, 0 na ponta da cozinha e 6,20 na
  ponta da entrada; `d` do muro de fundo (0) à fachada (4,00), já contando o recuo. Dentro, `iu`/`id`
  contam da face interna das paredes (u = iu + 0,15).
- **Térreo**: lavabo de 1,60 × 1,65 no canto do fundo (embaixo do banheiro de cima: uma prumada só);
  mini cozinha ao fundo, com bancada de 1,62 m na parede de topo, cuba, cooktop de duas bocas, aéreos
  e geladeira na parede do fundo; mesa de quatro lugares; sala com painel ripado de cumaru, TV e sofá
  de dois lugares; hall da entrada; **escada reta de 14 degraus** (espelho de 0,184, pisada de 0,232,
  0,90 de largura) encostada na parede do fundo, fechada por uma parede com o vão de entrada ao lado
  do hall, subindo de iu 5,88 para iu 2,63.
- **Superior**: patamar na chegada da escada; banheiro de 1,45 × 2,80 (box no fundo com a janela da
  fachada, bancada com cuba e espelho redondo, bacia suspensa); suíte de 11,1 m² com cama de casal
  encostada na parede da escada, guarda-roupa, criado-mudo suspenso e banco no pé da cama; porta de
  correr de 1,60 para a varanda.
- **Varanda**: laje em balanço de 3,40 × 1,20 sobre a entrada (que fica coberta), piso e corrimão de
  cumaru, guarda-corpo de 1,10 com barras horizontais, banco com almofada, mesinha, dois vasos e fita
  de LED. O beiral da fachada cobre boa parte dela.
- **Cores**: fachada em reboco pintado (`reboco_azul`, `reboco_verde`, `reboco_amarelo`), oitões em
  `reboco_claro` (é neles que cai a projeção), faixa de tijolinho no pé da fachada, brise de cumaru
  sobre o janelão, caixilhos brancos.
- **Projeção mapeada**: cada casa tem um oitão cego na lista `paredes_projecao` — o da azul vira para o
  portão do gramado, o da verde e o da amarela para o leste. O oitão da verde dá para o vão de 1,80 m
  entre ela e a amarela, então a parede traz um campo `dist` (1,45) com a distância do projetor;
  o `projecoes.js` usa esse campo quando ele existe.
- **Poda**: no fim do `build.py`, `podar()` tira folhas e galhos das árvores grandes que entrariam em
  cada casa (a caixa da casa com os beirais) e na frente da varanda.
- **`extra` no `terreno.json`**: `pisos` `[x0, x1, y0, y1, z]` (térreo, cada degrau, o piso de cima sem
  o vão da escada, a varanda, a soleira e o degrau da entrada); `colisores`
  `[x0, x1, y0, y1, z0, z1]` (barram quando cruzam a faixa [pé + 0,35; pé + 1,7]); `portas` (as três de
  entrada, com `estilo: 'vidro'`); `luzes` `{p, cor, forca, alcance, casa, andar (0 térreo, 1 superior),
  comodo}`; `ventiladores` (vazio); `lugares` `[nome, x, y, rumo, z do pé]` (entrada e varanda de cada
  casa); `casas` `{nome, x, y, piso, teto, z1, frente, volume}` (`z1` é o piso de cima, `teto` o forro
  do superior e `volume` a caixa da poda); `escadas` `{casa, x, y}` (para o "onde estou");
  `paredes_projecao` `{nome, x0, x1, y0, y1, z0, z1, normal, dist}`; `espirais` (vazio).
- **Como o passeio usa isso** (`js/`): `mundo.js` escolhe o chão como o piso mais alto que não passe de
  pé + 0,5 (assim a escada sobe sozinha, degrau a degrau, e a varanda fica um degrau acima do quarto);
  dentro das casas o raio de quem anda cai para 0,20 m. `casas.js` desenha a porta de vidro e reveza
  6 luzes de verdade entre os pontos de luz; `principal.js` faz a luz de ambiente baixar dentro das
  casas até o forro do andar de cima (`uTopoCasa` = teto + 0,05) e usa o campo `frente` da casa.

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
  60 × 10 m, faixa do jardim com 80 cm, desnível de 1 m da laje ao quintal de baixo e as
  medidas do quintal de baixo tiradas com tijolinho de 18 cm em 19/10/2026 (veja abaixo).
- **Interior das casas** segue o pedido do Thiago (embaixo sala e cozinha ao fundo, em cima
  quarto com banheiro, tudo aberto e moderno); a divisão e os móveis são proposta e mudam em
  `casa` no `build.py`.
- **Lado do sol**: o Thiago informou em 10/11/2026 — nasce no portão de baixo e se põe no
  portão do gramado. É o padrão da página; dá para trocar em "O sol nasce do lado".
- **Três casas no mesmo lote** tem regra própria de zoneamento em Campinas, e dois pavimentos
  perto da divisa têm recuo e altura máxima a conferir na prefeitura. O modelo já desenha com
  1,50 m de recuo, mas isso é hipótese, não consulta.
- **YouTube no cineminha e nas projeções** aparece ao vivo, mas não sai nas
  fotos nem no vídeo renderizado, fica sem som e não recebe a luz da cena. Vídeo do
  computador sai nos dois. Nas paredes, muro e portões o YouTube ocupa um retângulo 16:9
  centrado no projetor, na altura dos olhos (o YouTube não pode ser esticado como as
  animações); nas árvores só dá animação ou vídeo do computador.
- **Peso**: uns 31 MB na primeira visita (texturas 18 MB, terreno 11 MB, bichos 1,6 MB),
  mais 8,6 MB de pessoas e adereços na primeira vez que se liga um cenário.
- **Placa de vídeo**: na qualidade alta, pede uma placa de computador razoável;
  no celular a página começa na baixa (sem grama 3D, sem oclusão e sem pelo).

## Quintal de baixo: laguinho, muro de pedras e banheiro (19/10, 08/11 e 10/11/2026)

Todas as medidas da obra ficam em `modelo/obra.py`, a fonte única do `build.py` (maquete e passeio), das folhas
para o pedreiro e dos números da ficha. Eixos: u a partir da beira da laje (`EDGE` = 46), v a partir do muro lateral do
lado da amendoeira.

- **Medidas reais** (Thiago, tijolinho em 19/10 e trena do celular em 10/11): pé da escada a 1,60 da beira; escada de
  6,11 a 7,51 do muro da amendoeira; do degrau de baixo até a boca do poço 1,11; tronco da amendoeira na beira da laje
  (trena: 5,04 do muro; pelas fotos parece 3–4 m, **conferir**); da boca do poço até o pé do tronco 2,21; da beira da
  laje até o portão de baixo 13,88. Diâmetro do poço (1,25) e o centro do tronco são estimados.
- **Redesenho de 10/11/2026** (pelas duas fotos de referência do Thiago; ele respondeu "Perfeito"):
  - **muro de pedras empilhadas** do muro da amendoeira até a escada (`MURO_PE`, `muro_pe`, `muro_frente`): pedras
    arredondadas de 25 a 50 cm, inclinado (o topo fica até 40 cm para trás do pé), 0,96 de altura, pé a 0,50 da beira
    no trecho reto e uma barriga em volta do pé da amendoeira (pé a 1,12 da beira na frente do tronco), sem vala nem
    fundação perto da árvore; terra e plantas no topo. O muro reto revestido (bloco + pedra) ficou só do outro lado
    da escada (`MURO_TRECHOS`), para a obra do banheiro;
  - **lago de 11,4 m²** (uns 6.300 L), de 0,64 a 6,02 da beira (5,38 de ponta a ponta) e de 0,91 a 4,04 do muro,
    1,84 da boca do poço e 1,76 do centro do tronco; 0,90 na parte funda, prateleira de plantas a 25 cm, só 30 cm de
    água a menos de 2,10 do tronco (`ARVORE_RASO`) e no máximo 50 cm junto ao pé do muro;
  - **cascata de uma queda só** (`CASCATA`): laje de pedra encaixada no muro, lâmina de 50 cm de 2,00 a 2,50 do muro,
    topo a +0,80; a manta do lago sobe atrás das pedras nesse trecho;
  - **canteiro** em volta (`CANTEIRO`; `GRAMA` ficou como apelido) e o **pergolado do cineminha 1,20 m mais para o
    portão** (`PERGOLADO_DX`);
  - **guarda-corpo** no piso da laje, 10 cm antes da beira, contornando o tronco da amendoeira pelo lado da laje
    (`GUARDA_LINHA`, a 0,45 da beira na volta do tronco);
  - caixa do filtro em 6,05 / 0,30 (no canteiro, antes do pergolado), sumidouro em 7,70 / 0,38 (enterrado debaixo do
    futuro piso do pergolado) e tomada com DR no muro lateral em 11,30, depois da tela do cineminha (5,5 m da água).
- **Scripts**: `quantidades_lago.py` (todos os números e quantidades da ficha: área, volume, escavação, manta, pedras,
  guarda-corpo, canos); `desenhos_obra.py PASTA` (3 folhas A3 + PDF: locação com os piquetes P do lago e M do pé do
  muro; cortes A–A pela cascata e B–B até o poço; detalhes do muro, corte C–C pela amendoeira, cascata e
  guarda-corpo); `render_deck.py PASTA --vistas referencia,quintal,cascata,laje,planta` (fotos Cycles só da área).
- **Passeio**: o `extra.quintal` do `terreno.json` leva escada, lago (contorno, nível, grade onde as carpas nadam) e
  lugares; `mundo.js` tira daí o chão, a colisão do lago, do poço e da amendoeira (`extra.circulos`); o muro de pedras
  e o guarda-corpo entram como colisores. Posições escritas à mão no passeio que acompanham o pergolado: `cinema.js`,
  `cenarios.js`, `mundo.js` (sofá e lugar "Cineminha"), `principal.js`, `som.js`, `bichos.js` e `projecoes.js`.
- **Versão anterior (08/11/2026)**: muro de arrimo reto revestido na frente da beira (sapata 75 × 20), lago de 5,75 m²,
  cascata de 3 lajes e guarda-corpo no topo do muro (PR #126); trocada pelo redesenho.
- **Banheiro duplo externo** (pedido em 08/11/2026; **no passeio desde 10/11/2026**): dois banheiros com a pia
  lavabo central do lado de fora, **modelo 2** (tijolinho e telha). Em 10/11 passou por três versões (PRs #136, #137 e
  o desta seção); a que vale, pedida pelo Thiago às 23h:
  - **tamanho padrão, sem acessibilidade para cadeirante**: banheiros de 1,30 × 2,00 m livres com box de 0,90 × 0,85 e
    vaso, portas de 0,70 abrindo para o nicho, nicho da pia de 1,50 m com bancada de 2 cubas a 0,90 m; total 4,62 ×
    2,28 m;
  - encostado no muro do barracão de **4,20 a 8,82 m da beira da laje**, a 1,12 m da boca do poço: o poço fica livre,
    na frente de um canteiro junto ao muro (alpínias, helicônia, moréia e xanadu) no vão entre a escada e o banheiro;
    a pitangueira e o barracão saem;
  - **estacionamento coberto ao lado**, junto ao muro do barracão até o muro do portão: 5,03 × 2,71 m, frente aberta
    (pilares só nas pontas); **um telhado só, de uma água**, telha de barro com 35%, alto no muro do barracão (3,27 m,
    viga em pilares encostados no muro, que tem 2,30) e caindo para o quintal até o beiral (2,32 m), com calha;
  - **dois carros de referência** (`carros.py`, pedido dele para ter noção do espaço): um carro normal de 4,30 × 1,75
    na vaga coberta e uma caminhonete de cabine dupla de 5,33 × 1,86 (tipo Hilux/S10) na linha do portão — ela não
    cabe na vaga coberta; os dois têm colisão no passeio;
  - no passeio: lugar "Banheiros", áreas "Banheiros" e "Estacionamento"; pisantes entre o poço e o canteiro do lago e
    pela frente da pia até o portão; no cenário do cinema o projetor e a vista de entrada saíram do lugar da caminhonete.
  - Medidas no `banheiro.py` (o `build.py` chama `banheiro.construir(..., 2)`; os outros 4 modelos continuam lá; a
    pitangueira sai por `_so_sorteios`, que gasta os mesmos sorteios para o resto da cena não mudar).
    Fotos: `render_banheiro.py PASTA --vistas frente` (uma vista por vez) + `legenda_banheiro.py PASTA`;
    planta A3: `desenho_banheiro.py PASTA`.
- **Ficha técnica para o pedreiro**: doc "Ficha técnica do laguinho" no Claude (materiais, quantidades, ordem da obra),
  refeita em 10/11/2026 para o redesenho.

