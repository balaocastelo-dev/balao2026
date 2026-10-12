# Chácara 3D (`/chacara3d`)

Passeio em 3D pelo terreno do Thiago, publicado em
<https://www.balao.info/chacara3d>. Projeto pessoal dele (paisagismo da
chácara), hospedado no site; não faz parte da loja.

- **Onde mora**: página pronta em `public/chacara3d/`, aberta pelo endereço
  `/chacara3d` por uma linha em `rewrites()` no `next.config.ts` (mesmo
  esquema do Office 3D em `/3d`).
- **Fonte e como refazer**: `chacara3d/README.md`. A página se edita direto em
  `public/chacara3d/index.html`; o modelo do terreno sai dos scripts de
  `chacara3d/modelo/` (Blender em Python).
- **Busca**: a página leva `noindex, follow` e não está no sitemap.
- **Peso**: cerca de 7 MB no disco (o terreno em texto e o three.js); o
  servidor envia comprimido.
- **De onde veio**: projeto "Contrução " no Claude, docs
  `claude/diagnostico-e-ideias-terreno.md` e `claude/album-chacara-pronta.md`
  (álbum de imagens, planta numerada, posição de cada coisa e pendências).

Pendências que dependem do Thiago: de que lado o sol nasce, e duas medidas
(borda da piscina até o poço, poço até o tronco da amendoeira) para acertar o
deck e o laguinho.
