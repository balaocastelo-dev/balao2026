# Chácara 3D — fonte da página `/chacara3d`

Passeio em 3D pelo terreno do Thiago (60 × 10 m) como ele fica pronto: a
vilinha de três tiny houses (dá para entrar nelas), o gramado com o pomar, a
piscina com a hidro e a cascata, a churrasqueira coberta, o deck com o laguinho
das carpas e o cineminha no muro. Anda-se com W A S D; tem dia e noite, foto,
gravação da caminhada com vídeo renderizado e o cineminha passando vídeo do
computador ou do YouTube. Cachorros, galinhas, galo, carpas, passarinhos,
borboletas e vaga-lumes se mexem sozinhos.

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
| `js/casas.js` | Portas das casinhas (abrem quando se chega perto ou com E), ventiladores de teto e luzes de dentro. |
| `js/bichos.js` | Cachorros, galinhas e galo (modelos em `bichos/`), carpas, passarinhos, borboletas e vaga-lumes, cada um com seu comportamento. |
| `js/som.js` | Som gerado no navegador: água, passarinhos, grilos, sapos, fogueira, passos, galinhas, galo, latido. |
| `js/cinema.js` | Tela do cineminha (vídeo do computador ou YouTube atrás de um "furo" na imagem). |
| `vendor/three/` | three.js r170 (licença MIT) e os complementos usados (GLTFLoader, SkeletonUtils). |
| `dados/terreno.json` + `terreno.txt` | O modelo do terreno (formato 2, ver `modelo/export_rt.py`), a geometria em base64. |
| `tex/` | Texturas em WebP: superfícies (`superficies.json`), folhas e cascas (`folhas.json`). |
| `bichos/` | `cachorro.glb`, `galinha.glb`, `galo.glb` e `bichos.json` (animações, medidas, convenções). |

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
  `z` para cima; o quintal de baixo fica em `z = -1`. As tiny houses (função
  `tiny_house`) são ocas, com banheiro, cama (beliche na verde), copa, mesinha,
  ventilador e luzes; o que barra a passagem, os pisos, as portas, as luzes e os
  lugares de entrada saem em `EXTRA` e vão para o `terreno.json`.
- `export_rt.py` — versão leve para o navegador: copas de "cachos" de folhas
  com textura, folhas em tira e frondes dos coqueiros com coordenadas de textura,
  troncos com casca; sem as galinhas e carpas de enfeite (no passeio elas são animadas).
- `render.py` e `annotate.py` — as imagens do álbum (`python build.py`, que salva
  `chacara.blend`, e depois `python render.py piscina_tropical --res 1440 --samples 24 --out ../saida`).

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

## O que vale saber

- **Medidas estimadas por foto.** Só são exatas as que o Thiago passou: terreno
  60 × 10 m, faixa do jardim com 80 cm, deck de 2 × 3 m a 1 m do chão.
- **Interior das casinhas** é proposta (azul e amarela: suíte de casal; verde:
  beliche); muda em `tiny_house` no `build.py`.
- **Lado do sol**: ainda não informado. Na página dá para escolher em
  "O sol nasce do lado"; o padrão é o muro da churrasqueira.
- **YouTube no cineminha** aparece ao vivo na tela do muro, mas não sai nas
  fotos nem no vídeo renderizado. Vídeo do computador sai nos dois.
- **Peso**: uns 30 MB na primeira visita (texturas 18 MB, terreno 10 MB, bichos 1,6 MB).
- **Placa de vídeo**: na qualidade alta, pede uma placa de computador razoável;
  no celular a página começa na baixa (sem grama 3D, sem oclusão e sem pelo).
