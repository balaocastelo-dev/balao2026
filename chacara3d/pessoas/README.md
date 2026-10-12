# Pessoas da Chácara 3D

Gerador das pessoas animadas do passeio (`/chacara3d`): homem, mulher e criança,
cada uma num GLB com o mesmo esqueleto, vários visuais (roupas) e 33 animações.
Servem para encher as cenas de aniversário, cineminha, trabalho na chácara,
piscina com churrasco e rave.

Saída em `public/chacara3d/pessoas/`:

| Arquivo | O que é |
|---|---|
| `homem.glb` | ~1,76 m; visuais `casual`, `camisa`, `regata`, `praia`, `praia_2`, `trabalho`, `noite` |
| `mulher.glb` | ~1,63 m; visuais `casual`, `vestido`, `praia`, `praia_2`, `trabalho`, `noite` |
| `crianca.glb` | 8–9 anos, ~1,30 m; visuais `menino`, `menina`, `praia_menino`, `praia_menina` |
| `pessoas.json` | convenções, máscaras de cor, pegas, medidas, visuais (triângulos, categorias) e animações (duração, velocidade, notas com as medidas de cada cena) |

O `pessoas.json` é a documentação para quem usa: leia `convencoes`, `mascaras`
e `pegas` antes de mexer no motor.

## Como refazer

Precisa do Python com o Blender como módulo (`bpy` 5.0, usado só para reduzir a
malha), `numpy`, `scipy` e `pillow` — o mesmo ambiente de `../bichos` e
`../modelo`. Não usa rede: lê só `makehuman/` e `cmu/` desta pasta.

```bash
cd chacara3d/pessoas
python pessoas.py                          # os três (~1,5 min), em ../../public/chacara3d/pessoas/
python pessoas.py mulher                   # só um (o pessoas.json mantém os outros)
python pessoas.py homem --anims parado,dj  # só algumas animações (para testar; não publique assim)
python pessoas.py --saida /tmp/teste       # outra pasta
python verificar.py                        # confere os GLB (não precisa do Blender)
```

Conferência visual (Chromium sem tela pelo Playwright, three.js r170 da página):

```bash
cd previa
python folhas.py /tmp/folhas               # visuais_*.png (frente/lado/costas) e anim_*_N.png (quadros-chave)
python folhas.py /tmp/folhas mulher --so animacoes --anims sentado,dj
python multidao.py /tmp/multidao.png       # 20 pessoas clonadas (SkeletonUtils), animações diferentes
```

Se tiver o MakeHuman ou a CMU completos em outro lugar, `MH_DADOS=.../makehuman/data`
e `CMU_DADOS=.../cmu-mocap/data` trocam as pastas de entrada.

## De onde vêm os dados

- **`makehuman/`** — só os arquivos usados do MakeHuman 1.x (licença CC0, ver
  `makehuman/LICENSE.ASSETS.md`), comprimidos em `.gz`: malha base (`3dobjs/base.obj`),
  esqueleto de 163 ossos e pesos (`rigs/default.mhskel`, `default_weights.mhw`), os
  alvos macro de gênero/idade/etnia usados (`targets/macrodetails/`), olho de poucos
  polígonos (`eyes/low-poly/`) e a textura do olho castanho (reduzida para 512²).
  Origem: github.com/makehumancommunity/makehuman, commit `a8bc2d5`.
- **`cmu/`** — trechos das capturas da CMU Graphics Lab Motion Capture Database
  na conversão para BVH de Bruce Hahne (cgspeed; cópia em
  github.com/una-dinosauria/cmu-mocap, commit `09a07f5`). Cada arquivo guarda o
  quadro 0 (pose T) e só os quadros até o fim do trecho usado. Uso livre, inclusive
  comercial; a CMU pede o crédito: *The data used in this project was obtained from
  mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.*

| Captura | Usada em |
|---|---|
| `18_08` (conversa, sujeito A, trecho calmo) | `parado`, `parado_2`, `conversando`, `ouvindo`, base de `acenando`, `batendo_palmas`, `bebendo` |
| `35_01` (andar) | `andando` |
| `07_04` (andar devagar) | `andando_devagar`, `cortando_grama`, `carregando_cesto` |
| `35_17` (correr) | `correndo` |
| `111_37` (acenar) | braço de `acenando` |
| `80_44` (rir) | `rindo` |

As demais animações (sentadas, danças, pulos, DJ, parabéns, água e trabalho) são
feitas por código em cima das medidas de cada pessoa.

## Como funciona

| Arquivo | Papel |
|---|---|
| `pessoas.py` | Programa principal: corpo → visuais → textura → animações → GLB e `pessoas.json` |
| `mh.py` | Lê o MakeHuman: malha base, alvos macro (mistura por gênero/idade/peso), esqueleto e pesos, olhos |
| `corpo.py` | Monta cada corpo (altura, mãos relaxadas, origem no chão), reduz a malha (Blender) e acha marcos (boca, olhos, pés) |
| `ossos.py` | O esqueleto de 25 ossos (nomes, pais) e a redução dos 163 ossos do MakeHuman (soma dos pesos), quadro das pegas |
| `malha.py` | Malha com UV por canto: cortes por campo, separação, redução interna que preserva bordas e costuras |
| `roupas.py`, `visuais.py` | Roupas como cascas sobre a pele (camiseta, regata, bermuda, calça, sunga, biquíni, maiô, vestido, saia, uniforme), barras, saias com pesos próprios; a lista de visuais |
| `cabelo.py`, `calcado.py` | Cabelos (casca opaca com relevo, rabo, coque, comprido), boné e chapéu; tênis, sapatênis, botina, bota, chinelo, sandália e pé descalço |
| `textura.py`, `raster.py` | Atlas de detalhe 1024² (dobras, costuras, sobrancelhas, lábios, oclusão) e a máscara COLOR_0 |
| `bvh.py`, `retarget.py`, `captura.py` | Leitura dos BVH, transferência para o nosso esqueleto (IK das pernas, pés no chão, laço emendado, pernas esticadas no parado) |
| `pose.py`, `humano.py` | Cinemática, IK de braço e perna, montador de poses por código, ruídos de laço |
| `animacoes.py`, `anim_sentado.py`, `anim_festa.py`, `anim_agua.py`, `anim_trabalho.py` | As 33 animações (a lista está em `animacoes.todas()`) |
| `gltf.py`, `exportar.py` | Escrita do GLB (sem o exportador do Blender): quantização, pesos uint8, chaves reduzidas |
| `verificar.py` | Conferência automática (nomes, pesos, laços, pés, assento, triângulos, tamanho) |
| `previa/` | Página de conferência (mesmo shader de máscara que o motor deve usar) e os scripts das folhas e da multidão |

Para criar um visual: acrescente em `visuais.visuais()` (peças com `Peca`, máscara
`CIMA`/`BAIXO`/`PELE`/`CABELO`/`ACESS`). Para criar uma animação: uma função que recebe
o `Ctx` e devolve `dict(poses=[(Rw, pos_quadril), ...], notas=...)`, registrada na
lista do módulo. Depois rode `pessoas.py`, `verificar.py` e as folhas, e olhe as imagens.

## Limitações conhecidas

- Saia e vestido não têm simulação de pano: os pesos repartem o tecido entre quadril,
  coxas e canelas. Sentada, a barra fica nos joelhos com um vão entre eles e aparecem
  pequenas falhas de pele no quadril; nadando de vestido a saia abre demais.
- Alças de vestido, maiô e regata têm "pontinhas" na cava; o cabelo é uma casca
  simples (sem fios); o rosto é neutro (sem expressões nem boca animada).
- A criança usa as mesmas medidas de cena dos adultos onde a cena é fixa: na cadeira
  de 0,45 m os pés ficam pendurados (de propósito) e na bancada de 0,90 m (`grelhando`)
  ela fica na ponta dos braços — melhor não usar a criança grelhando.
- O `rindo` da mulher tem um momento com os dois pés ~3 cm acima do chão (captura).
