# Blog da Balão — como funciona e como publicar

O blog fica em `www.balao.info/blog`. O objetivo dele é um só: trazer do Google
quem está pesquisando sobre computador, notebook, peça ou conserto, e levar
essa pessoa até a loja.

## De onde vêm os artigos

| Origem | Onde fica | Como entra no site |
|---|---|---|
| **Soro** (a ferramenta que escreve os guias) | No Soro; cópia de reserva em `content/blog/soro/snapshot.json` e capas em `public/blog/capas` | Sozinho. O site consulta o Soro de hora em hora; artigo novo ganha página em `/blog/<endereço>` sem ninguém publicar nada |
| **Artigos escritos aqui** (análises, notícias, guias com tabela e gráfico) | `content/blog/artigos/`, um arquivo por artigo | Quando o arquivo é enviado ao repositório |
| **Rotina diária** (um artigo por dia, escrito e publicado sozinho) | No ramo `claude/blog-conteudo` deste repositório, um arquivo JSON por artigo | Sozinho. O site lê esse ramo a cada 15 minutos; ver [publicacao-diaria.md](publicacao-diaria.md) |

Se o Soro sair do ar, o blog continua abrindo com a cópia de reserva. Para
atualizar essa cópia: `npm run blog:soro` (uma vez por mês é suficiente).

### O que mudou em relação ao blog anterior

- **Os artigos do Soro tinham um problema sério de SEO.** Eles apareciam por um
  script, todos no mesmo endereço (`/blog?post=...`), e o texto só existia depois
  que o navegador rodava JavaScript. Para o Google eram uma página só. Agora
  cada um tem endereço próprio, texto na página, sumário e dados estruturados.
  O endereço antigo redireciona para o novo.
- **Saíram os posts "Vale a pena: <produto>".** Eram a ficha do produto com um
  texto genérico em volta — e os links da lista já davam em "Post não
  encontrado".
- **Saíram as notícias copiadas de outros sites.** O robô republicava o texto
  inteiro de matérias do Canaltech e do G1. Isso é conteúdo duplicado (o Google
  ignora ou penaliza) e uso de texto de terceiros sem autorização. Notícia agora
  é texto próprio, curto, com a fonte citada e o que ela muda para quem compra.
- Os três robôs (`/api/cron/blog-rss`, `blog-product`, `blog-balao-item`) foram
  removidos, junto com seus agendamentos no `vercel.json`. A tabela `blog_posts`
  do banco não é mais lida pelo blog.

## Como o código está organizado

```
content/blog/
  artigos/                 um arquivo .ts por artigo escrito aqui + index.ts (a lista)
  soro/snapshot.json       cópia de reserva dos artigos do Soro

lib/blog/
  tipos.ts                 o formato de um artigo: uma lista de blocos tipados
  repositorio.ts           a única porta de entrada: junta as três origens, ordena, escolhe destaques
  fontes/soro.ts           busca e converte os artigos do Soro
  fontes/diario.ts         lê os artigos da rotina diária, no ramo de conteúdo
  validar.ts               confere o formato de um artigo que chega em JSON
  fundo.ts                 a capa desenhada para o artigo que não tem foto
  html-para-blocos.ts      transforma o HTML do Soro nos mesmos blocos dos artigos daqui
  regua.ts                 a régua editorial em código (o que reprova e o que só avisa)
  seo.ts                   metadados, Open Graph e JSON-LD, calculados do artigo
  chamadas.ts              as chamadas contextuais (qual serviço combina com qual assunto)
  categorias.ts            Guias, Hardware, Análises, Notícias, Assistência
  texto.ts                 marcação mínima, contagem de palavras, tempo de leitura, sumário

components/blog/
  Vitrine.tsx              os quatro destaques do topo, em grade assimétrica
  ListaDeArtigos.tsx       busca, filtro por categoria e carregamento ao rolar
  CartaoArtigo.tsx         o cartão da lista
  BlocosDoArtigo.tsx       desenha cada bloco: tabela, gráfico, prós e contras, citação, chamada…
  FechoDoArtigo.tsx        veredito, perguntas frequentes, fontes e método
  Sumario.tsx              sumário lateral fixo, versão recolhível no celular, barra de leitura

app/blog/
  page.tsx                 a página principal
  [slug]/page.tsx          a página do artigo
  categoria/[categoria]/   uma página por categoria
  rss.xml, feed.xml        o feed
  api/og                   a capa com o título (para compartilhar) e a capa desenhada (?fundo=1)

scripts/
  blog-novo.mjs            cria o rascunho de um artigo escrito aqui
  blog-soro.mjs            atualiza a cópia de reserva do Soro
  blog-publicar.mjs        confere e publica um artigo no ramo de conteúdo (a rotina diária)
```

Um artigo **não é um HTML solto**: é uma lista de blocos (`paragrafo`, `titulo`,
`tabela`, `benchmark`, `pros-contras`, `citacao`, `chamada`…). É isso que deixa
a página montar sozinha o sumário, o tempo de leitura e os dados estruturados.
Texto corrido aceita só três marcações: `**negrito**`, `*itálico*` e
`[texto do link](/caminho)`.

## Publicar um artigo novo

```
npm run blog:novo -- "Título do artigo" --categoria guias
```

Categorias: `guias`, `hardware`, `analises`, `noticias`, `assistencia`.

O comando cria o arquivo em `content/blog/artigos/` já com o roteiro do padrão
editorial e registra na lista. O artigo nasce como **rascunho** (não aparece no
site). Depois:

1. Preencha os trechos marcados com `ESCREVER`.
2. Apague a linha `rascunho: true`.
3. Rode `npm run blog:conferir`. A régua diz, em português, o que falta.
4. Envie. O artigo aparece em `/blog/<endereço>`, na lista, no sitemap e no feed.

**Artigo reprovado na régua não aparece no site**, mesmo que seja enviado. O
pior que acontece com um texto pela metade é ele não entrar.

Para um artigo abrir a vitrine do topo, ponha `destaque: 10` (número maior
aparece primeiro). Sem nenhum marcado, a vitrine mostra os quatro mais recentes.

### Capa

- Sem `capa`, o cartão usa a capa gerada com o título — funciona, mas uma imagem
  própria chama mais atenção.
- Com capa: arquivo `.webp` de 1536 × 1024 em `public/blog/capas/`.
- Ao **trocar** uma capa, use outro nome de arquivo: o site guarda a imagem
  antiga por 30 dias.
- `pronta: true` é para capa desenhada nas cores do blog, com o assunto na faixa
  de cima (o título é escrito sobre a parte de baixo). Foto comum não leva.

## O que cada artigo gera para o Google

| No artigo | Sai automaticamente |
|---|---|
| Qualquer artigo | `BlogPosting` (ou `NewsArticle` em Notícias), trilha de navegação, Open Graph, cartão do Twitter/X, endereço canônico |
| Campo `analise` (veredito com nota) | `Review`, com o produto avaliado, a nota e os prós e contras |
| Campo `perguntas` | `FAQPage` |
| Campo `fontes` | as citações dentro do `BlogPosting` |

## Ajustes sem mexer em código de página

- **Chamadas** (o texto e o destino de cada tema): `lib/blog/chamadas.ts`.
  Preço, prazo e percentual de desconto ficam de fora de propósito — mudam, e
  artigo antigo com número velho vira promessa quebrada.
- **Links que morreram** em artigos importados (categoria que mudou de endereço):
  `LINKS_CORRIGIDOS` em `lib/blog/html-para-blocos.ts`.
- **Categoria de um artigo do Soro**: a regra fica em `classificarPorTitulo`,
  em `lib/blog/categorias.ts`.
- **Desligar a busca no Soro**: variável `BLOG_SORO_SYNC=false`.

## Testes

`npm test` roda tudo; `npm run blog:conferir` roda só o blog: conversão do HTML
importado, links, categorias, chamadas, a régua em cada artigo e os dados
estruturados.

## Limite conhecido

Endereço de artigo que não existe mostra a página "Este artigo saiu do ar" com
a marca de não indexar, mas o servidor responde 200 em vez de 404 — é como o
resto do site se comporta hoje (acontece o mesmo em produto inexistente), por
causa da tela de carregamento global. Para o Google o efeito é o mesmo: a
página sai do índice.
