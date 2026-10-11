# Chácara 3D — fonte da página `/chacara3d`

Passeio em 3D pelo terreno do Thiago (60 × 10 m) como ele fica pronto: a
vilinha de três tiny houses, o gramado com o pomar, a piscina com a hidro, a
churrasqueira coberta, o deck com o laguinho das carpas e o cineminha no muro.
Anda-se com W A S D, dá para tirar foto, gravar a caminhada e renderizar o
vídeo, trocar dia e noite e passar um vídeo (do computador ou do YouTube) na
tela do cineminha.

Não é página da loja: é um projeto pessoal dele hospedado no site. Por isso
leva `noindex` e não entra no sitemap nem no menu.

## Como está publicada

Segue o esquema do Office 3D (`/3d`): arquivos prontos em `public/chacara3d/`
e uma linha no `next.config.ts` apontando o endereço `/chacara3d` para
`public/chacara3d/index.html`. Não usa o layout da loja nem o React.

| Arquivo | O que é |
|---|---|
| `public/chacara3d/index.html` | A página inteira: visual, interface, caminhada, som, foto, vídeo e cineminha. **É a fonte**: mexe-se nela direto. |
| `public/chacara3d/terreno.json` | Lista de peças do modelo e a tabela de materiais. |
| `public/chacara3d/terreno.txt` | A geometria (posições e índices) em base64. Em texto porque assim o servidor comprime no envio. |
| `public/chacara3d/three.r128.min.js` | three.js r128 (licença MIT), servido daqui para não depender de site de fora. |
| `public/chacara3d/capa.jpg` | Imagem que aparece ao compartilhar o link. |

Mudar texto, tecla, som, luz, colisão ou o cineminha: editar
`public/chacara3d/index.html` e enviar (commit). A Vercel publica.

## Para refazer o modelo (mudar o terreno)

O terreno sai dos scripts em `modelo/`, que rodam com o Blender como módulo de
Python (`bpy`). Tudo é construído por código, sem arquivo `.blend` guardado.

```bash
cd chacara3d/modelo
uv venv --python 3.11 ../.venv && . ../.venv/bin/activate
uv pip install bpy numpy pillow

python export_rt.py ../saida          # gera ../saida/terreno.bin e terreno.json
base64 -w0 ../saida/terreno.bin > ../../public/chacara3d/terreno.txt
cp ../saida/terreno.json ../../public/chacara3d/terreno.json
```

- `build.py` — o terreno inteiro: muros, piscina, churrasqueira, deck, laguinho,
  poço, garagem, pergolado, árvores, jardim tropical, tiny houses, objetos.
  As medidas estão em metros: `x` do portão do gramado (0) ao portão de baixo
  (60), `y` do muro da piscina (0) ao muro da churrasqueira (10), `z` para cima;
  o quintal de baixo fica em `z = -1`.
- `geo.py` — peças básicas (caixa, viga, tubo, telhado) e materiais.
- `plants.py` — a vegetação (mangueira, amendoeira, jabuticabeira, goiabeira,
  coqueiro, bananeira, helicônia e as demais).
- `export_rt.py` — versão leve para o navegador (menos folhas, mesmas medidas).
- `render.py` e `annotate.py` — as imagens do álbum e a planta numerada
  (`python build.py`, que salva `chacara.blend` nesta pasta, e depois
  `python render.py piscina_tropical --res 1440 --samples 24 --out ../saida`).

Se uma peça mudar de lugar no `build.py`, conferir na página as listas que
dependem das medidas: `BOX` e `CIR` (o que barra a passagem), `groundAt`
(altura do chão), `PLACES` (os atalhos de "Ir para"), `SCR` (a tela do
cineminha) e os pontos de som e de luz.

## O que vale saber

- **Medidas estimadas por foto.** Só são exatas as que o Thiago passou: terreno
  60 × 10 m, faixa do jardim com 80 cm, deck de 2 × 3 m a 1 m do chão.
- **Lado do sol**: ainda não informado. Na página dá para escolher em
  "O sol nasce do lado"; o padrão é o muro da churrasqueira.
- **YouTube no cineminha** aparece ao vivo na tela do muro, mas não sai nas
  fotos nem no vídeo renderizado (o navegador não deixa copiar a imagem de
  outro site). Vídeo do computador sai nos dois.
- **Vídeo renderizado**: MP4 onde o navegador grava MP4 (Chrome e Edge
  recentes, Safari); nos outros sai WebM.
