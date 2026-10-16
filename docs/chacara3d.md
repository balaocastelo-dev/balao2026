# Chácara 3D (`/chacara3d`)

Passeio em 3D pelo terreno do Thiago, publicado em
<https://www.balao.info/chacara3d>. Projeto pessoal dele (paisagismo da
chácara), hospedado no site; não faz parte da loja.

- **Onde mora**: página pronta em `public/chacara3d/`, aberta pelo endereço
  `/chacara3d` por uma linha em `rewrites()` no `next.config.ts` (mesmo
  esquema do Office 3D em `/3d`).
- **Fonte e como refazer**: `chacara3d/README.md`. A página é `public/chacara3d/index.html`
  com os módulos em `public/chacara3d/js/` (three.js r170); o modelo do terreno sai dos
  scripts de `chacara3d/modelo/` (Blender em Python), as texturas de `chacara3d/texturas/`
  e os bichos animados de `chacara3d/bichos/`.
- **Versão realista (12/10/2026)**: céu físico com nuvens e sombra delas, sombras macias,
  oclusão de ambiente, materiais com textura de verdade, grama 3D, vento nas plantas,
  água com reflexo e refração, cascata, bolhas, carpas, cachorros, galinhas, galo,
  passarinhos, borboletas, vaga-lumes, e a vilinha mobiliada por dentro.
- **Vilinha (15/10/2026)**: as três casas viraram **casas container** no modelo da foto que o
  Thiago mandou ("casa container com terraço"): um container de 7 × 3 m por casa (sala, cozinha,
  banheiro e quarto de casal), chapa ondulada pintada com quinas de outra cor (azul-marinho com
  amarelo, amarelo com azul-marinho, verde com amarelo), janelas e porta de vidro com caixilho
  branco; em cima, terraço de cumaru aberto para o céu (o telhado metálico da foto saiu a pedido dele),
  com guarda-corpo, mesa, cadeiras, espreguiçadeiras e vasos; escada metálica reta de fora, na lateral. Azul em x 4,5–11,5
  e amarela em x 16,5–23,5 no muro y = 0, verde em x 8,5–15,5 no muro y = 10. Antes (12/10) eram
  sobrados com mirante e escada caracol. Detalhes e o formato do `extra`: seção "As casas container
  da vilinha" do `chacara3d/README.md`; conferência sem Blender em `chacara3d/modelo/teste_casas.py`.
- **Cenários (12/10/2026)**: botão no menu liga um de cinco, com gente animada (corpos
  MakeHuman CC0, movimentos da captura da CMU), música gerada no navegador e a hora certa:
  festa de aniversário (18h36), reunião no cineminha (20h48), trabalhadores limpando,
  colhendo fruta e cortando grama (8h36), festa na piscina com churrasqueira lotada (13h12)
  e rave lotada (22h36, palco do DJ, cabeças móveis, lasers, painel de LED, até 70 pessoas
  dançando na batida). Código em `js/cenarios.js` e `js/musica.js`; adereços em
  `chacara3d/cenarios/`, pessoas em `chacara3d/pessoas/`.
- **Projeção mapeada (12/10/2026)**: plano de iluminação noturna com 10 projetores
  (mangueira, jabuticabeira, coqueiros, amendoeira, muro da piscina, os dois portões e a
  parede lateral de cada casa container). No menu, "Iluminação e projeções" escolhe por lugar:
  26 animações (carpas, fogo, aurora, galáxia, mandala, fogos...), luz de jardim, vídeo do
  computador ou YouTube (só nas superfícies planas, em 16:9, como no cineminha). Atalhos
  "Luz de jardim", "Show de projeções" e "Desligar tudo"; a escolha fica guardada no navegador.
- **Abertura**: fica pronta em ~8 s no Chrome com placa de vídeo (58 programas de
  sombreamento compilados em paralelo, texturas decodificadas fora da linha principal).
  Os tempos de cada etapa ficam em `window.__chacara.tempos`. Antes de mexer em material,
  ver "Para não travar" no `chacara3d/README.md`.
- **Build do site**: `app/globals.css` tem `@source not` para `public/chacara3d` e
  `chacara3d/`; sem isso o Tailwind lê o modelo em base64 e o `next build` estoura o tempo.
- **Busca**: a página leva `noindex, follow` e não está no sitemap.
- **Peso**: cerca de 31 MB para abrir (texturas WebP 18 MB, terreno 11 MB, bichos 1,6 MB,
  three.js 0,8 MB) e mais 8,6 MB (pessoas e adereços) só quando se liga o primeiro cenário.
- **Desempenho medido (RTX 4090, 1920×912, quadro forçado com leitura da placa)**: passeio
  ~16 ms, festa na piscina ~20 ms, rave ~17 ms, aniversário ~13 ms, cineminha ~11 ms.
- **De onde veio**: projeto "Contrução " no Claude, docs
  `claude/diagnostico-e-ideias-terreno.md` e `claude/album-chacara-pronta.md`
  (álbum de imagens, planta numerada, posição de cada coisa e pendências).

Pendências que dependem do Thiago: de que lado o sol nasce, e duas medidas
(borda da piscina até o poço, poço até o tronco da amendoeira) para acertar o
deck e o laguinho.
