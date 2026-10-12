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
  passarinhos, borboletas, vaga-lumes, e as três tiny houses mobiliadas por dentro.
- **Busca**: a página leva `noindex, follow` e não está no sitemap.
- **Peso**: cerca de 30 MB (texturas WebP 18 MB, terreno 10 MB, bichos 1,6 MB, three.js 0,8 MB).
- **De onde veio**: projeto "Contrução " no Claude, docs
  `claude/diagnostico-e-ideias-terreno.md` e `claude/album-chacara-pronta.md`
  (álbum de imagens, planta numerada, posição de cada coisa e pendências).

Pendências que dependem do Thiago: de que lado o sol nasce, e duas medidas
(borda da piscina até o poço, poço até o tronco da amendoeira) para acertar o
deck e o laguinho.
