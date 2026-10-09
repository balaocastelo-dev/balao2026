# Conteúdo do blog da Balão da Informática

Este ramo **não é código**. Ele guarda os artigos que a rotina diária publica
em https://www.balao.info/blog — um arquivo por artigo.

| Arquivo | O que é |
|---|---|
| `indice.json` | A lista dos artigos publicados, com o que os cartões do blog mostram |
| `artigos/<endereço>.json` | O artigo inteiro |
| `ROTINA.md` | O passo a passo e as regras que a rotina segue todo dia |
| `pauta.md` | A fila de assuntos |
| `vercel.json` | Diz à Vercel para não montar o site a partir deste ramo |

O site lê este ramo de tempos em tempos. Publicar ou retirar um artigo é só
mudar arquivos aqui: o site não é refeito e o ramo principal não é tocado.

Ninguém edita estes arquivos à mão. Tudo passa por
`node scripts/blog-publicar.mjs` (que fica no ramo principal), porque é ele que
confere o artigo antes de enviar — e o site confere de novo antes de mostrar.

Para tirar um artigo do ar: `node scripts/blog-publicar.mjs retirar <endereço>`.
